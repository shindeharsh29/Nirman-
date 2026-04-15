import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { AlertCircle, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6" style={{ justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#111827', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.3px' }}>InfraScan</span>
        </div>

        <div className="auth-card">
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create your account</h1>
          <p className="text-secondary mb-5" style={{ fontSize: 14 }}>Join to report and track infrastructure issues</p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="John Doe" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-dark" style={{ width: '100%', padding: '10px', marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account...' : <>Create account <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="divider" />

          {/* First user tip */}
          <div style={{ background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14 }}>
            <ShieldCheck size={15} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#15803D', lineHeight: 1.5 }}>
              <strong>First user = Admin.</strong> The first registered account automatically gets full administrative access.
            </p>
          </div>

          <p className="text-center text-secondary" style={{ fontSize: 13 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
