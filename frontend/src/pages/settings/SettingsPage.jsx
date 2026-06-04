import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Building, Calendar, Lock, Shield, Plus, RefreshCw, 
  Search, Eye, FileText, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

export default function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, school } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  // Determine active tab based on path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/settings/academic')) return 'academic';
    if (path.includes('/settings/system')) return 'system';
    if (path.includes('/settings/audit')) return 'audit';
    return 'school';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [schools, setSchools] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // Campus Registration Form State
  const [showAddCampus, setShowAddCampus] = useState(false);
  const [campusForm, setCampusForm] = useState({
    name: '',
    abbreviation: '',
    tagline: 'Filipinos Sultus Es',
    logo: '/iscp-logo.jpg',
    address: { city: '', province: '', country: 'Philippines' },
    contact: { email: '', phone: '', website: '' },
    plan: 'starter'
  });

  // School Settings Fields (for single campus edit)
  const [schoolSettings, setSchoolSettings] = useState({
    name: school?.name || '',
    tagline: school?.tagline || '',
    logo: school?.logo || '',
    email: school?.contact?.email || '',
    phone: school?.contact?.phone || '',
  });

  // Academic Settings Fields
  const [academicSettings, setAcademicSettings] = useState({
    academicYear: school?.settings?.academicYear || '2025-2026',
    currentSemester: school?.settings?.currentSemester || '1st',
    gradingSystem: school?.settings?.gradingSystem || 'percentage',
    passingGrade: school?.settings?.passingGrade || 75
  });

  // System Settings Fields
  const [systemSettings, setSystemSettings] = useState({
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    sessionTimeout: 30, // minutes
    twoFactorRequired: false
  });

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab === 'school' && isSuperAdmin) {
      fetchCampuses();
    }
    if (activeTab === 'audit' && isSuperAdmin) {
      fetchAuditLogs();
    }
  }, [activeTab, logsPage]);

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/schools');
      setSchools(data.schools || []);
    } catch (err) {
      toast.error('Failed to load campuses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/audit-logs?page=${logsPage}&limit=${logsLimit}`);
      setLogs(data.logs || []);
      setLogsTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCampus = async (e) => {
    e.preventDefault();
    if (!campusForm.name || !campusForm.abbreviation) {
      toast.error('Name and Abbreviation are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/schools', campusForm);
      toast.success('New campus registered successfully!');
      setShowAddCampus(false);
      // Reset form
      setCampusForm({
        name: '',
        abbreviation: '',
        tagline: 'Filipinos Sultus Es',
        logo: '/iscp-logo.jpg',
        address: { city: '', province: '', country: 'Philippines' },
        contact: { email: '', phone: '', website: '' },
        plan: 'starter'
      });
      fetchCampuses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Campus registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchoolSettings = async (e) => {
    e.preventDefault();
    toast.success('School settings updated successfully!');
  };

  const handleSaveAcademicSettings = async (e) => {
    e.preventDefault();
    toast.success('Academic settings updated!');
  };

  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    toast.success('Security configurations applied!');
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    navigate(`/settings/${tab}`);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }} className="animate-fade">
      {/* Title */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-sub">Configure branches, academics, security policies, and monitor system activities.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'school', label: 'School Settings', icon: Building },
          { id: 'academic', label: 'Academic Settings', icon: Calendar },
          { id: 'system', label: 'System & Security', icon: Lock },
          ...(isSuperAdmin ? [{ id: 'audit', label: 'Audit Logs', icon: Shield }] : [])
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => selectTab(t.id)} 
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontWeight: 600, fontSize: 13 }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: School Settings */}
      {activeTab === 'school' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isSuperAdmin ? (
            <>
              {/* Campus Management Panel */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 className="card-title">School Branches / Campuses</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Manage multi-branch tenant schools all over the Philippines.</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddCampus(true)}>
                    <Plus size={14} /> Register New Campus
                  </button>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Logo</th>
                        <th>Campus / Branch Name</th>
                        <th>Abbrev</th>
                        <th>City / Location</th>
                        <th>Students</th>
                        <th>Teachers</th>
                        <th>Plan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j}><div className="skeleton" style={{ height: 16 }} /></td>
                            ))}
                          </tr>
                        ))
                      ) : schools.length === 0 ? (
                        <tr><td colSpan={8} className="table-empty">No campuses registered</td></tr>
                      ) : (
                        schools.map(s => (
                          <tr key={s._id}>
                            <td>
                              <img src={s.logo || '/iscp-logo.jpg'} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', background: 'rgba(255,255,255,0.05)' }} />
                            </td>
                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                            <td><span className="badge badge-gray">{s.abbreviation}</span></td>
                            <td>{s.address?.city || 'N/A'}, {s.address?.province || 'Philippines'}</td>
                            <td style={{ fontWeight: 600 }}>{(s.students || 0).toLocaleString()}</td>
                            <td style={{ fontWeight: 600 }}>{(s.teachers || 0).toLocaleString()}</td>
                            <td>
                              <span className={`badge ${s.plan === 'enterprise' ? 'badge-blue' : s.plan === 'professional' ? 'badge-green' : 'badge-yellow'}`} style={{ textTransform: 'capitalize' }}>
                                {s.plan || 'Starter'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>
                                {s.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Single Campus Settings Edit */
            <div className="card" style={{ maxWidth: 650 }}>
              <h3 className="card-title" style={{ marginBottom: 16 }}>Campus Information</h3>
              <form onSubmit={handleSaveSchoolSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>School / Campus Name</label>
                  <input className="form-input" value={schoolSettings.name} onChange={e => setSchoolSettings({ ...schoolSettings, name: e.target.value })} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Tagline</label>
                  <input className="form-input" value={schoolSettings.tagline} onChange={e => setSchoolSettings({ ...schoolSettings, tagline: e.target.value })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Logo Path / URL</label>
                  <input className="form-input" value={schoolSettings.logo} onChange={e => setSchoolSettings({ ...schoolSettings, logo: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Email</label>
                    <input className="form-input" value={schoolSettings.email} onChange={e => setSchoolSettings({ ...schoolSettings, email: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Phone</label>
                    <input className="form-input" value={schoolSettings.phone} onChange={e => setSchoolSettings({ ...schoolSettings, phone: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  Save School Details
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Academic Settings */}
      {activeTab === 'academic' && (
        <div className="card" style={{ maxWidth: 650 }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>Academic Control Panel</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>Configure current terms, schedules, and grading standards for this academic branch.</p>
          <form onSubmit={handleSaveAcademicSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Active Academic Year</label>
                <select className="form-select" value={academicSettings.academicYear} onChange={e => setAcademicSettings({ ...academicSettings, academicYear: e.target.value })}>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Current Active Semester</label>
                <select className="form-select" value={academicSettings.currentSemester} onChange={e => setAcademicSettings({ ...academicSettings, currentSemester: e.target.value })}>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="Summer">Summer Term</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Grading System</label>
                <select className="form-select" value={academicSettings.gradingSystem} onChange={e => setAcademicSettings({ ...academicSettings, gradingSystem: e.target.value })}>
                  <option value="percentage">Percentage (e.g. 75 - 100)</option>
                  <option value="gpa">GPA (e.g. 1.0 - 5.0)</option>
                  <option value="letter">Letter Grades (A, B, C, D, F)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Minimum Passing Grade</label>
                <input type="number" className="form-input" value={academicSettings.passingGrade} onChange={e => setAcademicSettings({ ...academicSettings, passingGrade: Number(e.target.value) })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              Apply Academic Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: System Settings */}
      {activeTab === 'system' && (
        <div className="card" style={{ maxWidth: 650 }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>Security & Policies</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>Configure system security constraints, session management, and authentication policies.</p>
          <form onSubmit={handleSaveSystemSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Minimum Password Length</label>
              <input type="number" className="form-input" value={systemSettings.minPasswordLength} onChange={e => setSystemSettings({ ...systemSettings, minPasswordLength: Number(e.target.value) })} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={systemSettings.requireUppercase} onChange={e => setSystemSettings({ ...systemSettings, requireUppercase: e.target.checked })} />
                Require at least one uppercase letter in passwords
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={systemSettings.requireNumbers} onChange={e => setSystemSettings({ ...systemSettings, requireNumbers: e.target.checked })} />
                Require at least one numeric digit in passwords
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={systemSettings.twoFactorRequired} onChange={e => setSystemSettings({ ...systemSettings, twoFactorRequired: e.target.checked })} />
                Enforce Two-Factor Authentication (2FA) for administrators
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Session Idle Timeout (minutes)</label>
              <input type="number" className="form-input" value={systemSettings.sessionTimeout} onChange={e => setSystemSettings({ ...systemSettings, sessionTimeout: Number(e.target.value) })} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 12 }}>
              Save Security Policies
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: Audit Logs */}
      {activeTab === 'audit' && isSuperAdmin && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 className="card-title">System Audit Logs</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Monitor administrative actions, user logins, and database operations.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchAuditLogs} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Logs
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User / Email</th>
                  <th>Action</th>
                  <th>Module / Operation</th>
                  <th>Campus</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr><td colSpan={6} className="table-empty">No activity logs found</td></tr>
                ) : (
                  logs.map((l, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: 12 }}>{l.userEmail || 'System / Public'}</td>
                      <td>
                        <span className={`badge ${
                          ['LOGIN', 'LOGIN_SUCCESS'].includes(l.action) ? 'badge-blue' : 
                          l.action?.includes('CREATE') ? 'badge-green' : 
                          l.action?.includes('DELETE') ? 'badge-red' : 
                          'badge-yellow'
                        }`} style={{ fontSize: 10 }}>
                          {l.action?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{l.resource || l.description}</td>
                      <td>{l.schoolName || 'Global'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.ip || '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {l.createdAt ? format(new Date(l.createdAt), 'MMM dd, yyyy · hh:mm a') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logsTotal > logsLimit && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={logsPage === 1 || loading} 
                onClick={() => setLogsPage(p => p - 1)}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                Page {logsPage} of {Math.ceil(logsTotal / logsLimit)}
              </span>
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={logsPage >= Math.ceil(logsTotal / logsLimit) || loading} 
                onClick={() => setLogsPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Register New School/Campus */}
      {showAddCampus && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddCampus(false)}>
          <div className="modal modal-md animate-slide" style={{ background: 'rgba(15, 17, 26, 0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Campus</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddCampus(false)}>✕</button>
            </div>
            <form onSubmit={handleRegisterCampus} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 10px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CAMPUS NAME *</label>
                  <input className="form-input" placeholder="e.g. ISCP Davao" value={campusForm.name} onChange={e => setCampusForm({ ...campusForm, name: e.target.value })} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>ABBREVIATION *</label>
                  <input className="form-input" placeholder="e.g. ISCP-DVO" value={campusForm.abbreviation} onChange={e => setCampusForm({ ...campusForm, abbreviation: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>TAGLINE</label>
                  <input className="form-input" value={campusForm.tagline} onChange={e => setCampusForm({ ...campusForm, tagline: e.target.value })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CAMPUS LOGO URL</label>
                  <input className="form-input" value={campusForm.logo} onChange={e => setCampusForm({ ...campusForm, logo: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CITY</label>
                  <input className="form-input" placeholder="e.g. Davao City" value={campusForm.address.city} onChange={e => setCampusForm({ ...campusForm, address: { ...campusForm.address, city: e.target.value } })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PROVINCE</label>
                  <input className="form-input" placeholder="e.g. Davao del Sur" value={campusForm.address.province} onChange={e => setCampusForm({ ...campusForm, address: { ...campusForm.address, province: e.target.value } })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CONTACT EMAIL</label>
                  <input type="email" className="form-input" placeholder="e.g. davao@iscp.edu.ph" value={campusForm.contact.email} onChange={e => setCampusForm({ ...campusForm, contact: { ...campusForm.contact, email: e.target.value } })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CONTACT PHONE</label>
                  <input className="form-input" placeholder="e.g. +63-82-8888-0003" value={campusForm.contact.phone} onChange={e => setCampusForm({ ...campusForm, contact: { ...campusForm.contact, phone: e.target.value } })} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>SUBSCRIPTION PLAN</label>
                <select className="form-select" value={campusForm.plan} onChange={e => setCampusForm({ ...campusForm, plan: e.target.value })}>
                  <option value="starter">Starter Plan</option>
                  <option value="professional">Professional Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCampus(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
