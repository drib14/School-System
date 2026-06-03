import { useState, useEffect } from 'react';
import { Plus, Users, Edit2, UserX, UserCheck, Mail } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const ROLES = ['super_admin','school_owner','principal','registrar','teacher','student','parent','cashier','accountant','librarian','nurse','guidance_counselor','hr_staff','employee','alumni'];
const ROLE_COLORS = {
  super_admin: 'badge-purple', school_owner: 'badge-yellow', principal: 'badge-blue',
  registrar: 'badge-blue', teacher: 'badge-green', student: 'badge-blue',
  parent: 'badge-yellow', cashier: 'badge-green', accountant: 'badge-green',
  default: 'badge-gray',
};

function InviteUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'teacher', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/users', form);
      toast.success('User created successfully!');
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">Create New User</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-row cols-2">
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Temporary Password *</label><input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, role: roleFilter, search });
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const toggleStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      toast.success(isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">User Management</h1><p className="page-sub">{total} total users</p></div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create User</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex: 1 }}>
          <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>2FA</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j}><div className="skeleton" style={{height:14}} /></td>)}</tr>) :
              users.length === 0 ? <tr><td colSpan={6} className="table-empty">No users found</td></tr> :
              users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatar ? <img src={u.avatar} className="avatar avatar-sm" alt="" /> : <div className="avatar avatar-sm">{u.firstName?.[0]}{u.lastName?.[0]}</div>}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${ROLE_COLORS[u.role] || ROLE_COLORS.default}`} style={{ textTransform: 'capitalize' }}>{u.role?.replace(/_/g,' ')}</span></td>
                  <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td><span className={`badge ${u.twoFactorEnabled ? 'badge-green' : 'badge-gray'}`}>{u.twoFactorEnabled ? 'Enabled' : 'Off'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, h:mm a') : 'Never'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" title="Edit"><Edit2 size={13} /></button>
                      <button className="btn btn-ghost btn-sm" title="Send email"><Mail size={13} /></button>
                      {u._id !== currentUser?._id && (
                        <button className="btn btn-ghost btn-sm" title={u.isActive ? 'Deactivate' : 'Activate'}
                          style={{ color: u.isActive ? 'var(--danger)' : 'var(--success)' }}
                          onClick={() => toggleStatus(u._id, u.isActive)}>
                          {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <InviteUserModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchUsers(); }} />}
    </div>
  );
}
