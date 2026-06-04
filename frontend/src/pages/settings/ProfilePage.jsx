import { useState, useEffect, useRef } from 'react';
import { User, Camera, Lock, Shield, Bell, Save, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import CustomCheckbox from '../../components/forms/CustomCheckbox';

const ROLE_LABELS = {
  super_admin:'Super Admin', school_owner:'School Owner', principal:'Principal',
  registrar:'Registrar', teacher:'Teacher', student:'Student', parent:'Parent',
  cashier:'Cashier', accountant:'Accountant', librarian:'Librarian',
  nurse:'Nurse', guidance_counselor:'Guidance Counselor', hr_staff:'HR Staff',
};

export default function ProfilePage() {
  const { user, setUser, updateMe } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', phone: '', bio: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState({
    'Email notifications': true,
    'SMS notifications': true,
    'Announcements': true,
    'Grade updates': true,
    'Payment reminders': true,
  });
  const fileRef = useRef();

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName || '', middleName: user.middleName || '', lastName: user.lastName || '', phone: user.phone || '', bio: user.bio || '' });
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateMe(form);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('Image must be less than 2MB');
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          setLoading(true);
          await updateMe({ ...form, avatar: base64Image });
          toast.success('Profile photo updated!');
        } catch (err) {
          toast.error('Failed to upload image');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header Card */}
      <div className="card" style={{ marginBottom: 20, padding: '24px', display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          {user?.avatar ? (
            <img src={user.avatar} className="avatar avatar-xl" alt="Profile" style={{ width: 80, height: 80, objectFit: 'cover' }} />
          ) : (
            <div className="avatar avatar-xl" style={{ fontSize: 28, background: 'linear-gradient(135deg,#1e40af,#7c3aed)', width: 80, height: 80 }}>{initials}</div>
          )}
          <button onClick={() => fileRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Camera size={13} style={{ color: 'white' }} />
          </button>
          <input type="file" ref={fileRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span className="badge badge-blue">{ROLE_LABELS[user?.role] || user?.role}</span>
            {user?.studentId && <span className="badge badge-gray">{user.studentId}</span>}
            <span className={`badge ${user?.isActive ? 'badge-green' : 'badge-red'}`}>{user?.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['profile','Profile'], ['security','Security'], ['notifications','Notifications']].map(([t, l]) => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{l}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-row cols-3">
              {[['firstName','First Name'], ['middleName','Middle Name'], ['lastName','Last Name']].map(([n, l]) => (
                <div key={n} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={form[n]} onChange={e => setForm(p => ({ ...p, [n]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+63 9XX XXX XXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={15} /> Change Password</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['currentPassword','Current Password'], ['newPassword','New Password'], ['confirmPassword','Confirm New Password']].map(([n, l]) => (
                <div key={n} className="form-group">
                  <label className="form-label">{l}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPass ? 'text' : 'password'} value={passForm[n]} onChange={e => setPassForm(p => ({ ...p, [n]: e.target.value }))} required />
                    {n === 'newPassword' && <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}><Lock size={14} /> Change Password</button>
              </div>
            </form>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={15} /> Two-Factor Authentication</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Add an extra layer of security with 2FA</p>
            <button className="btn btn-secondary" onClick={() => toast.success('2FA Setup instructions sent to your email.')}><Shield size={14} /> Enable 2FA</button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Notification Preferences</h3>
          {[
            ['Email notifications', 'Receive alerts via email'], ['SMS notifications', 'Receive SMS for urgent alerts'],
            ['Announcements', 'School announcements and news'], ['Grade updates', 'When grades are posted'],
            ['Payment reminders', 'Fee due dates and receipts'],
          ].map(([label, desc]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div></div>
              <CustomCheckbox
                checked={notifs[label]}
                onChange={e => {
                  setNotifs(prev => ({ ...prev, [label]: e.target.checked }));
                  toast.success(`${label} turned ${e.target.checked ? 'on' : 'off'}`);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
