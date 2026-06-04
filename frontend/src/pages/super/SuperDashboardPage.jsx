import { useState, useEffect } from 'react';
import { Users, School, TrendingUp, Shield, Monitor, BarChart3, RefreshCw, Plus, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import CustomSelect from '../../components/forms/CustomSelect';

export default function SuperDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, schoolsRes, auditRes] = await Promise.allSettled([
        api.get('/admin/dashboard/super'),
        api.get('/admin/schools'),
        api.get('/admin/audit-logs?limit=8'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (schoolsRes.status === 'fulfilled') setSchools(schoolsRes.value.data.schools || []);
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data.logs || []);

      // Build activity chart from stats
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.activityByDay) {
        setActivityData(statsRes.value.data.activityByDay);
      } else {
        // Fallback: generate from days
        setActivityData(Array.from({ length: 7 }, (_, i) => ({
          date: `Day ${i + 1}`,
          logins: stats?.dailyLogins?.[i] || 0,
          actions: stats?.dailyActions?.[i] || 0,
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Schools', value: loading ? '—' : (stats?.totalSchools ?? schools.length ?? 0), icon: School, color: 'blue' },
    { label: 'Total Students', value: loading ? '—' : (stats?.totalStudents ?? 0).toLocaleString(), icon: Users, color: 'green' },
    { label: 'Monthly Revenue', value: loading ? '—' : `₱${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'gold' },
    { label: 'System Health', value: loading ? '—' : `${stats?.systemHealth ?? 99.9}%`, icon: Monitor, color: 'purple' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin Console</h1>
          <p className="page-sub">Multi-school SaaS management</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setFormData({}); setShowAddSchool(true); }}>
            <Plus size={14} /> Add School
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className={`stat-icon ${color}`}><Icon size={20} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>System Activity</div>
          <div style={{ height: 200 }}>
            {loading ? (
              <div className="skeleton" style={{ height: '100%', borderRadius: 8 }} />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="logins" stroke="#3b82f6" fill="url(#ag)" name="Logins" />
                  <Area type="monotone" dataKey="actions" stroke="#10b981" fill="none" name="Actions" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Schools</div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>School</th><th>Students</th><th>Plan</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                  ))}</tr>
                )) : schools.length === 0 ? (
                  <tr><td colSpan={4} className="table-empty">No schools registered</td></tr>
                ) : schools.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{(s.studentCount || s.students || 0).toLocaleString()}</td>
                    <td><span className={`badge ${s.plan === 'enterprise' ? 'badge-blue' : s.plan === 'professional' ? 'badge-green' : 'badge-yellow'}`} style={{ textTransform: 'capitalize' }}>{s.plan || 'starter'}</span></td>
                    <td><span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{s.status || 'active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} /> Recent Audit Log
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>User</th><th>Action</th><th>Resource</th><th>School</th><th>IP</th><th>Time</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j}><div className="skeleton" style={{ height: 12 }} /></td>
                ))}</tr>
              )) : auditLogs.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">No audit logs found</td></tr>
              ) : auditLogs.map((log, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12 }}>{log.user?.email || log.userEmail || '—'}</td>
                  <td>
                    <span className={`badge ${log.action === 'LOGIN' ? 'badge-blue' : log.action === 'CREATE' ? 'badge-green' : log.action === 'DELETE' ? 'badge-red' : 'badge-yellow'}`}>
                      {log.action || 'ACTION'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{log.resource || '—'}</td>
                  <td style={{ fontSize: 12 }}>{log.school?.name || log.schoolName || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.ip || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/super/audit-logs')}>
            View All Audit Logs
          </button>
        </div>
      </div>

      {showAddSchool && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddSchool(false)}>
          <div className="modal animate-slide">
            <div className="modal-header">
              <h3 className="modal-title">Onboard New School</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddSchool(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">School Name</label>
                <input className="form-input" placeholder="e.g. International School of Asia" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Abbreviation</label>
                <input className="form-input" placeholder="e.g. ISA" value={formData.abbreviation || ''} onChange={e => setFormData({ ...formData, abbreviation: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Plan</label>
                <CustomSelect
                  value={formData.plan || 'starter'}
                  onChange={val => setFormData({ ...formData, plan: val })}
                  options={[
                    { value: 'starter', label: 'Starter' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'enterprise', label: 'Enterprise' }
                  ]}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddSchool(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  await api.post('/admin/schools', formData);
                  toast.success('School added successfully');
                  setShowAddSchool(false);
                  fetchData();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to add school');
                }
              }}>Save School</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
