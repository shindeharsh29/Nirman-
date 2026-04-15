# 🛡️ InfraScan — AI Infrastructure Damage Detection System

> An AI-powered full-stack platform for citizen reporting, automated damage detection, priority scoring, and drone-based field verification of infrastructure damage.

![InfraScan](https://img.shields.io/badge/AI--Powered-YOLOv8-blue) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green) ![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 📸 **Citizen Reporting** | Upload damage photos with GPS auto-capture and reverse geocoding |
| 🤖 **YOLOv8 AI Detection** | Computer vision detects cracks, potholes, structural damage with bounding boxes |
| 🎯 **Priority Scoring** | Weighted score from AI confidence + location importance + duplicate frequency |
| 🧬 **Fake Filtering** | Perceptual hashing (pHash) prevents duplicate and fake complaint submissions |
| 🚁 **Drone Dispatch** | Admins dispatch drones to GPS coordinates; aerial footage re-analyzed by AI |
| 🗺️ **Live Incident Map** | Leaflet.js map with real-time drone telemetry via MAVLink bridge |
| 🔐 **Role-Based Auth** | JWT authentication; first user = Admin, subsequent = Citizen |
| 📊 **Analytics Dashboard** | Charts, status pipeline, priority distribution, KPI metrics |

---

## 🏗️ Tech Stack

**Backend**
- FastAPI (Python 3.9+)
- SQLAlchemy + SQLite (PostgreSQL-ready)
- YOLOv8 (Ultralytics) — damage detection
- Passlib + Bcrypt — password hashing
- Python-Jose — JWT tokens
- ImageHash — perceptual duplicate detection
- pymavlink — MAVLink drone protocol
- httpx — async HTTP client

**Frontend**
- React 18 + Vite
- React-Router-DOM v6
- React-Leaflet + OpenStreetMap
- Recharts — data visualization
- Axios — API client
- Lucide-React — icons
- Vanilla CSS design system

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Utkarshc8619/InfraScan.git
cd InfraScan
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> API available at http://localhost:8000  
> Swagger docs at http://localhost:8000/docs

### 4. Frontend Setup & Start
```bash
# From project root
npm install
npm run dev
```
> App available at http://localhost:5173

---

## 🔐 Authentication Flow

1. **Register** at `/register` — first user automatically becomes **Admin**
2. All subsequent registrations get **Citizen** role
3. **Admin** → accesses full Command Hub: all reports, map, analytics, drone dispatch
4. **Citizen** → accesses personal dashboard: own reports + status tracking

---

## 🚁 Drone Integration (MAVLink / SITL)

The system includes a full MAVLink bridge for connecting to real or simulated drones.

### Start MAVLink Bridge
```bash
cd backend
source venv/bin/activate
python mavlink_bridge.py
```

### SITL Simulator (Docker)
```bash
docker run -it --rm \
  -p 14550:14550/udp -p 14551:14551/udp \
  ardupilot/ardupilot-dev-ros \
  bash -c "cd /ardupilot && python Tools/autotest/sim_vehicle.py \
  -v ArduCopter \
  --out=udp:host.docker.internal:14550 \
  --out=udp:host.docker.internal:14551"
```

Connect APM Planner 2 to `UDP 127.0.0.1:14550`  
InfraScan reads from `UDP 0.0.0.0:14551`

### Drone Workflow
```
Pending → Under Review → Drone Dispatched → Verified → Resolved
```

---

## 📁 Project Structure

```
InfraScan/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── models.py            # SQLAlchemy DB models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── database.py          # DB connection + session
│   ├── auth.py              # JWT + password hashing
│   ├── ai_model.py          # YOLOv8 inference + scoring
│   ├── mavlink_bridge.py    # MAVLink drone bridge (port 8001)
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── App.jsx              # Router + sidebar shell
│   ├── index.css            # Full design system
│   ├── components/
│   │   └── AuthContext.jsx  # Auth state + JWT management
│   └── pages/
│       ├── Home.jsx         # Landing page
│       ├── Login.jsx        # Login form
│       ├── Register.jsx     # Registration form
│       ├── AdminDashboard.jsx  # Admin Command Hub
│       ├── UserDashboard.jsx   # Citizen report tracker
│       └── SubmitComplaint.jsx # Damage report form
├── start_demo.sh            # One-command demo launcher
├── package.json
└── README.md
```

---

## 🔑 Environment Variables

For production, set these in a `.env` file:
```env
SECRET_KEY=your-strong-secret-key-here
DATABASE_URL=postgresql://user:password@localhost/infrascan
```

---

## 📸 Screenshots

### Landing Page
Clean landing with feature highlights and CTA

### Admin Command Hub
- Overview with stats + charts
- All Reports with workflow buttons
- Live Incident Map with drone telemetry HUD
- Analytics with pie + bar charts

### Citizen Dashboard
- Personal report tracker
- AI score + status per report
- One-click submit new report

---

## 🗺️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Get JWT token |
| GET | `/api/users/me` | User | Current user info |
| POST | `/api/complaints` | User | Submit damage report |
| GET | `/api/users/my-complaints` | User | Get my reports |
| GET | `/api/complaints` | Admin | Get all reports |
| PUT | `/api/complaints/{id}/status` | Admin | Update status |
| POST | `/api/complaints/{id}/verify` | Admin | Upload drone footage |
| GET | `/api/drone/telemetry` | Admin | Live drone telemetry |
| POST | `/api/drone/dispatch/{id}` | Admin | Dispatch drone to complaint |
| POST | `/api/drone/return-home` | Admin | RTL command |
| POST | `/api/drone/land` | Admin | Land command |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [Utkarsh](https://github.com/Utkarshc8619)
