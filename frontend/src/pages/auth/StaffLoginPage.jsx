import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactor, setTwoFactor] = useState({ required: false, code: '' });
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.email, form.password, twoFactor.required ? twoFactor.code : undefined);
      if (result?.requiresTwoFactor) {
        setTwoFactor(prev => ({ ...prev, required: true }));
        // Send email OTP
        await api.post('/auth/2fa/email-otp', { email: form.email });
        toast.success('2FA code sent to your email');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, pass) => { setForm({ email, password: pass }); };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg-pattern">
        <div className="auth-bg-circle" style={{ width: 600, height: 600, background: '#1e40af', top: -200, left: -200 }} />
        <div className="auth-bg-circle" style={{ width: 400, height: 400, background: '#7c3aed', bottom: -100, right: -100 }} />
        <div className="auth-bg-circle" style={{ width: 200, height: 200, background: '#0ea5e9', top: '50%', right: '30%' }} />
        {/* Grid pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{ display: 'flex', width: '100%', maxWidth: 1100, margin: 'auto', padding: '20px', gap: 40, alignItems: 'center', justifyContent: 'center' }}>
        {/* Left — Branding */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(59,130,246,0.3)', margin: '0 auto 20px' }}>
              <img src="/iscp-logo.jpg" alt="ISCP" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
            </div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
            ISCP Portal
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.7 }}>
            International State Colleges of the Philippines<br />
            <em style={{ color: 'var(--blue-400)', fontStyle: 'italic' }}>Filipinos Sultus Es</em>
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 32 }}>
            {['Student Information', 'Enrollment', 'Grading', 'Attendance', 'Financial', 'Library', 'HR Management', 'Communication'].map(f => (
              <span key={f} className="badge badge-blue" style={{ fontSize: 11, padding: '4px 12px' }}>{f}</span>
            ))}
          </div>

        </div>

        {/* Right — Form */}
        <div className="auth-card" style={{ maxWidth: 420 }}>
          {!twoFactor.required ? (
            <>
              <div className="auth-logo">
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Staff Portal</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Sign in to your staff account</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      className="form-input"
                      style={{ paddingLeft: 38 }}
                      type="text" placeholder="email@iscp.edu.ph"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label">Password</label>
                    <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--blue-400)' }}>Forgot password?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      className="form-input"
                      style={{ paddingLeft: 38, paddingRight: 40 }}
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ height: 44, fontSize: 14, marginTop: 4 }} disabled={loading}>
                  {loading ? <span className="spinner-sm" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', width: 18, height: 18, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <>Sign In <ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="auth-links">
                Looking for a career with us?{' '}
                <Link to="/apply-job" style={{ color: 'var(--blue-400)', fontWeight: 600 }}>Apply Now</Link>
              </div>
            </>
          ) : (
            /* 2FA Screen */
            <>
              <div className="auth-logo">
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid rgba(59,130,246,0.3)' }}>
                  <Shield size={28} style={{ color: 'var(--blue-400)' }} />
                </div>
                <h2>Two-Factor Authentication</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Enter the code sent to your email</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <input
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.3em', fontWeight: 700 }}
                    type="text" maxLength={6}
                    placeholder="000000"
                    value={twoFactor.code}
                    onChange={e => setTwoFactor(p => ({ ...p, code: e.target.value.replace(/\D/g, '') }))}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ height: 44 }} disabled={loading || twoFactor.code.length < 6}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button type="button" className="btn btn-secondary w-full" onClick={() => setTwoFactor({ required: false, code: '' })}>
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
