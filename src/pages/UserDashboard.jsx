import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { FileText, Send, Clock, CheckCircle, AlertTriangle, MapPin, ChevronRight, Image } from 'lucide-react';

const STATUS_STYLE = {
  'Pending':          { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' },
  'Under Review':     { bg: '#F5F3FF', color: '#7C3AED', dot: '#7C3AED' },
  'Drone Dispatched': { bg: '#EFF6FF', color: '#2563EB', dot: '#2563EB' },
  'Verified':         { bg: '#ECFEFF', color: '#0891B2', dot: '#0891B2' },
  'Resolved':         { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' },
  'Rejected (Duplicate)': { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' },
};

const PRIORITY_COLOR = { Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#22C55E' };

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: s.color, marginRight: 5 }} />
      {status}
    </span>
  );
}

export default function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:8000/api/users/my-complaints')
      .then(r => setComplaints(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const verified = complaints.filter(c => c.status === 'Verified').length;

  if (loading) return <div className="text-secondary" style={{ padding: 40, textAlign: 'center' }}>Loading your reports...</div>;

  return (
    <div className="animate-in">
      {/* Welcome Banner */}
      <div className="hero-banner hero-banner-dark mb-5" style={{ marginBottom: 24 }}>
        <div>
          <p className="text-sm" style={{ color: '#9CA3AF', marginBottom: 6 }}>Welcome back 👋</p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>{user?.username}</h2>
          <p style={{ color: '#D1D5DB', fontSize: 13, marginBottom: 16 }}>Track your infrastructure reports and their status below.</p>
          <Link to="/report" className="btn" style={{ background: 'white', color: '#111827', padding: '8px 18px', fontSize: 13 }}>
            Submit New Report <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ fontSize: 80, opacity: 0.1, fontWeight: 900, letterSpacing: -4 }}>IS</div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4 mb-6" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Reports', value: total, icon: <FileText size={18} />, bg: '#F3F4F6', color: '#111827' },
          { label: 'Pending', value: pending, icon: <Clock size={18} />, bg: '#FFFBEB', color: '#D97706' },
          { label: 'Verified', value: verified, icon: <AlertTriangle size={18} />, bg: '#ECFEFF', color: '#0891B2' },
          { label: 'Resolved', value: resolved, icon: <CheckCircle size={18} />, bg: '#F0FDF4', color: '#16A34A' },
        ].map(({ label, value, icon, bg, color }) => (
          <div key={label} className="stat-card">
            <div className="flex justify-between items-center mb-3">
              <span className="text-secondary text-sm">{label}</span>
              <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
            </div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">My Reports</h3>
          <Link to="/report" className="btn btn-dark btn-sm">+ New Report</Link>
        </div>

        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <Send size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p className="font-medium" style={{ marginBottom: 4 }}>No reports yet</p>
            <p className="text-sm" style={{ marginBottom: 16 }}>Start by submitting your first damage report.</p>
            <Link to="/report" className="btn btn-dark btn-sm">Submit a Report</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Image</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>AI Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--blue)' }}>#{c.id}</div>
                      <div className="text-xs text-muted ellipsis" style={{ maxWidth: 180 }} title={c.description}>
                        {c.description || 'No description'}
                      </div>
                    </td>
                    <td>
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={`http://localhost:8000${c.image_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={13} color="var(--text-muted)" />
                        <span className="ellipsis" style={{ maxWidth: 160 }} title={c.location_name}>
                          {c.location_name || (c.latitude ? `${c.latitude?.toFixed(3)}, ${c.longitude?.toFixed(3)}` : '—')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: PRIORITY_COLOR[c.priority_level] || 'var(--text-muted)' }}>
                        {c.priority_level}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.priority_score?.toFixed(1)}</div>
                      <div className="progress-bar mt-1" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${Math.min(c.priority_score, 100)}%`, background: PRIORITY_COLOR[c.priority_level] }} />
                      </div>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-secondary text-sm">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
