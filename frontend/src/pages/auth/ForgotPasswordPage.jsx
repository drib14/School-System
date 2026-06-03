import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern">
        <div className="auth-bg-circle" style={{ width: 300, height: 300, background: '#1e40af', top: -100, left: -100 }} />
      </div>
      <div className="auth-card" style={{ maxWidth: 400, margin: 'auto' }}>
        {!sent ? (
          <>
            <div className="auth-logo">
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Forgot Password</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Enter your email to reset your password</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" style={{ paddingLeft: 38 }} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ height: 44 }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Email Sent!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              We've sent a password reset link to <strong>{email}</strong>. Check your inbox.
            </p>
          </div>
        )}
        <div className="auth-links">
          <Link to="/login" style={{ color: 'var(--blue-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
