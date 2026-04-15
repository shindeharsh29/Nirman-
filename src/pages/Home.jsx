import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ShieldCheck, Activity, Map, ArrowRight, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17 }}>
          <div style={{ width: 32, height: 32, background: '#111827', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={18} color="white" />
          </div>
          InfraScan
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" style={{ padding: '7px 18px', border: '1px solid #E5E7EB', borderRadius: 8, color: '#111827', fontWeight: 600, fontSize: 14 }}>Sign in</Link>
          <Link to="/register" style={{ padding: '7px 18px', background: '#111827', borderRadius: 8, color: 'white', fontWeight: 600, fontSize: 14 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 9999, padding: '6px 16px', marginBottom: 24, fontSize: 13, color: '#16A34A', fontWeight: 600 }}>
          <Zap size={13} /> AI-powered Damage Detection
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, color: '#111827', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          Safer Cities,<br />Smarter Infrastructure
        </h1>
        <p style={{ fontSize: 18, color: '#6B7280', maxWidth: 560, lineHeight: 1.6, marginBottom: 36 }}>
          Report potholes, cracks and structural damage. Our YOLOv8 AI engine scores severity, filters duplicates, and dispatches drone verification — automatically.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/register" style={{ padding: '12px 28px', background: '#111827', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={16} />
          </Link>
          <Link to="/login" style={{ padding: '12px 28px', border: '1px solid #E5E7EB', color: '#111827', borderRadius: 10, fontWeight: 600, fontSize: 15, background: 'white' }}>
            Sign In
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 900, marginTop: 64, textAlign: 'left' }}>
          {[
            { icon: <Activity size={22} />, title: 'AI Detection', desc: 'YOLOv8 vision model detects cracks, potholes and structural damage with bounding boxes and confidence scores.', color: '#2563EB', bg: '#EFF6FF' },
            { icon: <ShieldCheck size={22} />, title: 'Fake Filtering', desc: 'Perceptual image hashing detects duplicate uploads, preventing system abuse and reward manipulation.', color: '#7C3AED', bg: '#F5F3FF' },
            { icon: <Map size={22} />, title: 'Drone Dispatch', desc: 'Admins deploy drone units to physically verify high-priority incidents, powered by AI re-analysis.', color: '#D97706', bg: '#FFFBEB' },
          ].map(({ icon, title, desc, color, bg }) => (
            <div key={title} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
              <div style={{ width: 44, height: 44, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 14 }}>{icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{title}</h3>
              <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
