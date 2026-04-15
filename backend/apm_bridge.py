"""
Simple MAVLink TCP→UDP bridge for APM Planner 2.
Connects to SITL on TCP:5760, pushes every byte to UDP:14550.
APM Planner 2 receives it automatically since it listens on UDP:14550.

Run this in a NEW terminal:
    cd backend && source venv/bin/activate && python apm_bridge.py
"""
import socket, threading, time

SITL_HOST  = "127.0.0.1"
SITL_PORT  = 5760
APM_HOST   = "127.0.0.1"
APM_PORT   = 14550

print(f"Connecting to SITL tcp://{SITL_HOST}:{SITL_PORT} ...")
while True:
    try:
        tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        tcp.connect((SITL_HOST, SITL_PORT))
        udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        print(f"✅ Connected! Pushing MAVLink → APM Planner UDP:{APM_PORT}")
        print("Now click CONNECT in APM Planner 2 (serial port doesn't matter).")
        while True:
            data = tcp.recv(4096)
            if not data:
                break
            udp.sendto(data, (APM_HOST, APM_PORT))
    except Exception as e:
        print(f"Reconnecting in 3s... ({e})")
        time.sleep(3)
