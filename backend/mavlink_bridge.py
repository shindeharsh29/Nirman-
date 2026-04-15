"""
InfraScan MAVLink Bridge — backend/mavlink_bridge.py
Runs on port 8001. Connects to ArduPilot SITL (or real drone) via MAVLink UDP.

Start this AFTER starting your SITL or connecting your drone:
    cd backend && source venv/bin/activate
    python mavlink_bridge.py

SITL Docker command (run first in a separate terminal):
    docker run -it --rm -p 14550:14550/udp -p 14551:14551/udp \\
      ardupilot/ardupilot-dev-ros \\
      bash -c "cd /ardupilot && python Tools/autotest/sim_vehicle.py \\
      -v ArduCopter \\
      --out=udp:host.docker.internal:14550 \\
      --out=udp:host.docker.internal:14551 --console"

APM Planner 2  → connects to UDP 127.0.0.1:14550
This bridge      → connects to UDP 127.0.0.1:14551 (no conflict)

For a PHYSICAL drone via USB:
    Change CONNECTION_STRING = 'serial:/dev/tty.usbmodem1:57600'
"""

import threading
import time
import math
import logging
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

logging.basicConfig(level=logging.INFO, format='%(asctime)s [DRONE] %(message)s')
log = logging.getLogger(__name__)

# ── Config ──────────────────────────────────────────────────────────────────
CONNECTION_STRING = "udpin:0.0.0.0:14551"   # SITL output on port 14551
# CONNECTION_STRING = "serial:/dev/tty.usbmodem1:57600"  # Physical drone via USB
BRIDGE_PORT       = 8001
HOME_LAT          = 20.5937   # Default SITL home (India)
HOME_LNG          = 78.9629
HOME_ALT          = 10.0

# ── Shared state (updated by MAVLink reader thread) ─────────────────────────
drone_state = {
    "lat":     HOME_LAT,
    "lng":     HOME_LNG,
    "alt":     0.0,
    "speed":   0.0,
    "heading": 0.0,
    "armed":   False,
    "mode":    "UNKNOWN",
    "battery": 100,
    "connected": False,
    "last_update": 0,
}
state_lock = threading.Lock()
mavlink_conn = None   # global MAVLink connection object


# ── MAVLink reader thread ────────────────────────────────────────────────────
def mavlink_reader():
    global mavlink_conn
    from pymavlink import mavutil

    log.info(f"Connecting to {CONNECTION_STRING} ...")
    while True:
        try:
            mavlink_conn = mavutil.mavlink_connection(CONNECTION_STRING)
            log.info("Waiting for MAVLink heartbeat ...")
            mavlink_conn.wait_heartbeat(timeout=30)
            log.info(f"Heartbeat received! System {mavlink_conn.target_system} Component {mavlink_conn.target_component}")
            with state_lock:
                drone_state["connected"] = True

            while True:
                msg = mavlink_conn.recv_match(
                    type=['GLOBAL_POSITION_INT', 'HEARTBEAT', 'VFR_HUD',
                          'SYS_STATUS', 'BATTERY_STATUS'],
                    blocking=True, timeout=5
                )
                if msg is None:
                    continue

                mtype = msg.get_type()
                with state_lock:
                    if mtype == 'GLOBAL_POSITION_INT':
                        drone_state["lat"]     = msg.lat / 1e7
                        drone_state["lng"]     = msg.lon / 1e7
                        drone_state["alt"]     = round(msg.relative_alt / 1000.0, 1)
                        drone_state["heading"] = msg.hdg / 100.0 if msg.hdg != 65535 else drone_state["heading"]
                        drone_state["last_update"] = time.time()

                    elif mtype == 'VFR_HUD':
                        drone_state["speed"] = round(msg.groundspeed, 1)

                    elif mtype == 'HEARTBEAT':
                        from pymavlink import mavutil as mu
                        drone_state["armed"] = bool(msg.base_mode & mu.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
                        drone_state["mode"]  = mavlink_conn.flightmode or "UNKNOWN"

                    elif mtype == 'BATTERY_STATUS':
                        if msg.battery_remaining >= 0:
                            drone_state["battery"] = msg.battery_remaining

        except Exception as e:
            log.error(f"MAVLink error: {e}. Reconnecting in 5s ...")
            with state_lock:
                drone_state["connected"] = False
            mavlink_conn = None
            time.sleep(5)


# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(title="InfraScan MAVLink Bridge", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    return {"service": "InfraScan MAVLink Bridge", "port": BRIDGE_PORT}


@app.get("/telemetry")
def get_telemetry():
    """Return latest drone telemetry snapshot."""
    with state_lock:
        snap = dict(drone_state)
    stale = (time.time() - snap["last_update"]) > 10 if snap["last_update"] else True
    snap["stale"] = stale
    return snap


class WaypointRequest(BaseModel):
    lat: float
    lng: float
    alt: float = 30.0   # default mission altitude in metres


@app.post("/waypoint")
def send_waypoint(wp: WaypointRequest):
    """Arm drone, switch to GUIDED mode, fly to waypoint."""
    global mavlink_conn
    if mavlink_conn is None:
        return {"success": False, "error": "Drone not connected"}

    try:
        from pymavlink import mavutil

        # 1. Switch to GUIDED
        mavlink_conn.set_mode("GUIDED")
        time.sleep(0.5)

        # 2. Arm if disarmed
        with state_lock:
            is_armed = drone_state["armed"]
        if not is_armed:
            mavlink_conn.arducopter_arm()
            log.info("Arming drone ...")
            time.sleep(2)

        # 3. Send TAKEOFF command if on ground (alt == 0)
        with state_lock:
            current_alt = drone_state["alt"]
        if current_alt < 2.0:
            mavlink_conn.mav.command_long_send(
                mavlink_conn.target_system,
                mavlink_conn.target_component,
                mavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
                0, 0, 0, 0, 0, 0, 0, wp.alt
            )
            log.info(f"Taking off to {wp.alt}m ...")
            time.sleep(3)

        # 4. Send GUIDED waypoint
        mavlink_conn.mav.mission_item_send(
            mavlink_conn.target_system,
            mavlink_conn.target_component,
            0,                                        # sequence
            mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,
            mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
            2, 1,                                     # current=2 (guided), autocontinue
            0, 0, 0, 0,                               # params 1–4
            wp.lat, wp.lng, wp.alt
        )
        log.info(f"Waypoint sent → lat={wp.lat}, lng={wp.lng}, alt={wp.alt}m")
        return {"success": True, "waypoint": {"lat": wp.lat, "lng": wp.lng, "alt": wp.alt}}

    except Exception as e:
        log.error(f"Waypoint error: {e}")
        return {"success": False, "error": str(e)}


@app.post("/return-home")
def return_to_launch():
    """Send RTL command."""
    global mavlink_conn
    if mavlink_conn is None:
        return {"success": False, "error": "Drone not connected"}
    try:
        mavlink_conn.set_mode("RTL")
        return {"success": True, "action": "RTL commanded"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/land")
def land_drone():
    global mavlink_conn
    if mavlink_conn is None:
        return {"success": False, "error": "Drone not connected"}
    try:
        mavlink_conn.set_mode("LAND")
        return {"success": True, "action": "LAND commanded"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Start MAVLink reader in background thread
    reader = threading.Thread(target=mavlink_reader, daemon=True, name="mavlink-reader")
    reader.start()
    log.info(f"Bridge REST API starting on http://0.0.0.0:{BRIDGE_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=BRIDGE_PORT, log_level="warning")
