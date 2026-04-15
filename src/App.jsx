import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, ChevronLeft, AlertTriangle, Activity, Bell, MapPin, Camera, User, Building, CheckCircle } from 'lucide-react';
import './App.css';

// Mock AI Scoring function
const scoreComplaint = (complaint) => {
  let baseScore = Math.floor(Math.random() * 40) + 10;
  let severity = 'low';
  
  const description = complaint.description.toLowerCase();
  if (description.includes('danger') || description.includes('accident') || description.includes('huge') || description.includes('blood') || description.includes('fire')) {
    baseScore += 50;
  } else if (description.includes('pothole') || description.includes('broken')) {
    baseScore += 30;
  }
  
  if (complaint.category === 'Water Leak') baseScore += 20;
  if (complaint.category === 'Road Hazard') baseScore += 35;
  
  baseScore = Math.min(99, baseScore); // Cap at 99 for realism
  
  if (baseScore >= 80) severity = 'high';
  else if (baseScore >= 50) severity = 'medium';
  else severity = 'low';

  const aiNotes = severity === 'high' 
    ? 'Immediate action recommended. Potential safety hazard detected.'
    : severity === 'medium'
    ? 'Schedule for routine maintenance.'
    : 'Minor issue. Monitor for worsening.';

  return {
    score: baseScore,
    severity,
    aiNotes
  };
};

function App() {
  const [role, setRole] = useState(null); // 'citizen' or 'agency'
  const [complaints, setComplaints] = useState([
    {
      id: 1001,
      date: new Date(Date.now() - 86400000).toLocaleString(),
      category: 'Road Hazard',
      description: 'Massive pothole on Main St, damaged my tire.',
      location: '123 Main St, Cityville',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
      status: 'assigned',
      aiAnalysis: { score: 92, severity: 'high', aiNotes: 'Immediate action recommended. Potential safety hazard detected.' }
    },
    {
      id: 1002,
      date: new Date(Date.now() - 172800000).toLocaleString(),
      category: 'Street Light',
      description: 'Street light is out at the intersection.',
      location: '4th and Elm St',
      imageUrl: null,
      status: 'pending',
      aiAnalysis: { score: 45, severity: 'low', aiNotes: 'Minor issue. Monitor for worsening.' }
    }
  ]);
  
  const [notifications, setNotifications] = useState([]);

  // --- Citizen View State ---
  const [citizenView, setCitizenView] = useState('form'); // form, success
  const [formData, setFormData] = useState({ category: 'Road Hazard', description: '', location: '', image: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCitizenSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const aiAnalysis = scoreComplaint(formData);
      
      const newComplaint = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        category: formData.category,
        description: formData.description,
        location: formData.location,
        imageUrl: formData.image ? URL.createObjectURL(formData.image) : null,
        status: 'pending',
        aiAnalysis
      };
      
      setComplaints(prev => [newComplaint, ...prev]);
      
      // Notify agency if high priority
      if (aiAnalysis.severity === 'high') {
        const notif = { id: Date.now(), message: `URGENT: New High Priority Issue (${aiAnalysis.score}/100) reported at ${formData.location}` };
        setNotifications(prev => [notif, ...prev]);
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }, 5000); // 5 seconds notification
      }
      
      setIsSubmitting(false);
      setCitizenView('success');
    }, 2000);
  };

  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'var(--danger)';
    if (severity === 'medium') return 'var(--warning)';
    return 'var(--success)';
  };

  // --- Views ---

  if (!role) {
    return (
      <div className="app-container split-screen">
        <div className="role-selector">
          <Activity size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ marginBottom: '2rem' }}>Welcome to Infrascan</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Select your portal to continue</p>
          
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="glass-panel role-card" onClick={() => setRole('citizen')}>
              <User size={40} color="var(--success)" />
              <h3>Citizen Portal</h3>
              <p>Report issues in your city</p>
            </div>
            
            <div className="glass-panel role-card" onClick={() => setRole('agency')}>
              <Building size={40} color="var(--primary)" />
              <h3>Agency Dashboard</h3>
              <p>Manage and track infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'citizen') {
    return (
      <div className="mobile-container">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setRole(null)}>
            <ChevronLeft size={24} />
          </button>
          <h2>Report Issue</h2>
          <div style={{ width: 24 }}></div>
        </header>

        {citizenView === 'success' ? (
          <div className="success-view">
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h2>Report Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
              Your complaint has been securely transmitted and is being analyzed by our AI system. The city agency has been notified.
            </p>
            <button className="primary-button" onClick={() => { setCitizenView('form'); setFormData({ category: 'Road Hazard', description: '', location: '', image: null }); }}>
              Report Another Issue
            </button>
          </div>
        ) : (
          <form className="report-form" onSubmit={handleCitizenSubmit}>
            <div className="form-group">
              <label>Take or Upload Photo (Optional)</label>
              <label className="photo-upload">
                {formData.image ? (
                  <span style={{ color: 'var(--primary)' }}>Image Selected</span>
                ) : (
                  <>
                    <Camera size={32} />
                    <span>Tap to open camera</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option>Road Hazard</option>
                <option>Water Leak</option>
                <option>Street Light</option>
                <option>Signage Down</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <input required type="text" className="form-input" placeholder="e.g. 123 Main St" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea required className="form-input" rows="4" placeholder="Describe the issue..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            <button type="submit" className="primary-button submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Activity className="spin" size={20} /> Analyzing & Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Agency View
  const sortedComplaints = [...complaints].sort((a, b) => b.aiAnalysis.score - a.aiAnalysis.score);

  return (
    <div className="app-container">
      <header>
        <div className="logo" onClick={() => setRole(null)} style={{ cursor: 'pointer' }}>
          <Building color="var(--primary)" size={28} />
          Infrascan Agency
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="notification-bell">
            <Bell size={20} />
            {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
          </div>
          <button className="glass-button" onClick={() => setRole(null)}>Sign Out</button>
        </div>
      </header>

      {/* Floating Notifications */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className="notification-toast glass-panel">
            <AlertTriangle color="var(--danger)" size={24} />
            <div>{n.message}</div>
          </div>
        ))}
      </div>
      
      <main>
        <div className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2>Active Incidents</h2>
            <p style={{ color: 'var(--text-muted)' }}>AI-Prioritized List of Citizen Complaints</p>
          </div>
        </div>

        <div className="agency-grid">
          {sortedComplaints.map(comp => (
            <div key={comp.id} className="glass-panel complaint-card" style={{ borderLeft: `4px solid ${getSeverityColor(comp.aiAnalysis.severity)}` }}>
              <div className="complaint-header">
                <div>
                  <span className="complaint-id">#{comp.id}</span>
                  <span className="complaint-date">{comp.date}</span>
                </div>
                <div className={`severity-badge severity-${comp.aiAnalysis.severity}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {comp.aiAnalysis.severity === 'high' && <AlertTriangle size={14} />}
                  {comp.aiAnalysis.score} Priority Score
                </div>
              </div>
              
              <div className="complaint-body">
                <div className="complaint-details">
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{comp.category}</h3>
                  <div className="location-line">
                    <MapPin size={16} /> {comp.location}
                  </div>
                  <p className="description-text">{comp.description}</p>
                  
                  <div className="ai-insight">
                    <strong>AI Insight:</strong> {comp.aiAnalysis.aiNotes}
                  </div>
                </div>
                {comp.imageUrl && (
                  <div className="complaint-image">
                    <img src={comp.imageUrl} alt="Complaint" />
                  </div>
                )}
              </div>
              
              <div className="complaint-actions">
                <button className="glass-button">Update Status</button>
                <button className="primary-button" style={{ padding: '0.5rem 1rem' }}>Assign Crew</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
