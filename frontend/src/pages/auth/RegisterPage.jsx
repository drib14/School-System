import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'student', label: '🎓 Student' },
  { value: 'teacher', label: '📚 Teacher' },
  { value: 'parent', label: '👨‍👩‍👦 Parent/Guardian' },
  { value: 'employee', label: '💼 Employee' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to ISCP.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern">
        <div className="auth-bg-circle" style={{ width: 400, height: 400, background: '#7c3aed', top: -100, right: -100 }} />
        <div className="auth-bg-circle" style={{ width: 300, height: 300, background: '#1e40af', bottom: -100, left: -50 }} />
      </div>
      <div className="auth-card" style={{ maxWidth: 460, margin: 'auto' }}>
        <div className="auth-logo">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <GraduationCap size={28} style={{ color: 'white' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Join the ISCP School System</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" placeholder="Juan" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" placeholder="Dela Cruz" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="juan@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" style={{ paddingRight: 40 }} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ height: 44 }} disabled={loading}>
            {loading ? 'Creating Account...' : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>
        <div className="auth-links">Already have an account? <Link to="/login" style={{ color: 'var(--blue-400)', fontWeight: 600 }}>Sign in</Link></div>
      </div>
    </div>
  );
}
