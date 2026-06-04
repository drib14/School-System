import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Building2, BookOpen, Shield, Lock, Plus, Search, RefreshCw, Layers, Edit2, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import CustomSelect from '../../components/forms/CustomSelect';
import CustomCheckbox from '../../components/forms/CustomCheckbox';
import { useAuthStore } from '../../store/authStore';

export default function SettingsPage() {
  const location = useLocation();
  const path = location.pathname;
  const [activeTab, setActiveTab] = useState('school');
  
  const { user, school, setSchool } = useAuthStore();

  useEffect(() => {
    if (path.includes('/settings/school')) {
      setActiveTab('school');
    } else if (path.includes('/settings/academic')) {
      setActiveTab('academic');
    } else if (path.includes('/settings/system') || path.includes('/settings/security')) {
      setActiveTab('system');
    } else if (path.includes('/super/audit-logs')) {
      setActiveTab('audit');
    }
  }, [path]);

  const [campuses, setCampuses] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration Form
  const [campusForm, setCampusForm] = useState({
    name: '', abbreviation: '', tagline: '', logo: '',
    address: { street: '', city: '', province: '', country: 'Philippines' },
    contact: { phone: '', email: '' }
  });

  // Academic Settings Form
  const [academicForm, setAcademicForm] = useState({
    academicYear: '2025-2026',
    currentSemester: '1st',
    gradingSystem: 'percentage',
    passingGrade: 75
  });

  // System Settings Form
  const [systemForm, setSystemForm] = useState({
    enableRegistration: true,
    requireEmailVerification: true,
    enableLMS: true,
    passwordLength: 8,
    sessionTimeout: 30
  });

  // Campus Editing State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);

  // Sync settings when school loads
  useEffect(() => {
    if (school && school.settings) {
      setAcademicForm({
        academicYear: school.settings.academicYear || '2025-2026',
        currentSemester: school.settings.currentSemester || '1st',
        gradingSystem: school.settings.gradingSystem || 'percentage',
        passingGrade: school.settings.passingGrade || 75
      });
      setSystemForm({
        enableRegistration: school.settings.enableOnlineEnrollment ?? true,
        requireEmailVerification: school.settings.enableParentPortal ?? true,
        enableLMS: school.settings.enableLMS ?? true,
        passwordLength: 8,
        sessionTimeout: 30
      });
    }
  }, [school]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'school') {
        const { data } = await api.get('/admin/schools');
        setCampuses(data.schools || []);
      } else if (activeTab === 'audit') {
        const { data } = await api.get('/admin/audit-logs');
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCampus = async (e) => {
    e.preventDefault();
    if (!campusForm.name || !campusForm.abbreviation) {
      toast.error('School name and abbreviation are required.');
      return;
    }
    try {
      await api.post('/admin/schools', campusForm);
      toast.success('New school campus registered successfully!');
      setCampusForm({
        name: '', abbreviation: '', tagline: '', logo: '',
        address: { street: '', city: '', province: '', country: 'Philippines' },
        contact: { phone: '', email: '' }
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register campus.');
    }
  };

  const handleDeleteCampus = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus and all its associated accounts? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/admin/schools/${id}`);
      toast.success('Campus deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete campus.');
    }
  };


  const handleSaveAcademic = async (e) => {
    e.preventDefault();
    if (!school?._id) {
      toast.error('No active school context found.');
      return;
    }
    try {
      const payload = {
        settings: {
          academicYear: academicForm.academicYear,
          currentSemester: academicForm.currentSemester,
          gradingSystem: academicForm.gradingSystem,
          passingGrade: academicForm.passingGrade
        }
      };
      const { data } = await api.put(`/admin/schools/${school._id}`, payload);
      setSchool(data.school);
      toast.success('Academic settings updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update academic settings.');
    }
  };

  const handleSaveSystem = async (e) => {
    e.preventDefault();
    if (!school?._id) {
      toast.error('No active school context found.');
      return;
    }
    try {
      const payload = {
        settings: {
          enableOnlineEnrollment: systemForm.enableRegistration,
          enableParentPortal: systemForm.requireEmailVerification,
          enableLMS: systemForm.enableLMS
        }
      };
      const { data } = await api.put(`/admin/schools/${school._id}`, payload);
      setSchool(data.school);
      toast.success('System security policies updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update security policies.');
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(query) ||
      log.module?.toLowerCase().includes(query) ||
      log.description?.toLowerCase().includes(query) ||
      log.user?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">System Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Configure multi-campus parameters, academic years, security, and monitor audit trails.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 24 }}>
        {[
          { id: 'school', label: 'School Settings', icon: Building2 },
          { id: 'academic', label: 'Academic Settings', icon: BookOpen },
          { id: 'system', label: 'System Settings', icon: Shield },
          { id: 'audit', label: 'Audit Logs', icon: Lock }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 4px', background: 'none', border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === t.id ? '#3b82f6' : 'var(--text-muted)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      
      {/* 1. School Settings */}
      {activeTab === 'school' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
          {/* Campuses List Grid */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Registered Campuses</h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
              </div>
            ) : campuses.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Building2 size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                <p>No school campuses registered.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {campuses.map(c => (
                  <div key={c._id} style={{ display: 'flex', gap: 16, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 14, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#3b82f615', border: '1px solid #3b82f630', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={20} style={{ color: '#3b82f6' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                        <span className="badge badge-blue">{c.abbreviation}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {c.address?.city || 'City'}, {c.address?.province || 'Province'} · {c.studentCount || 0} students
                      </div>
                      {c.tagline && <div style={{ fontSize: 11, fontStyle: 'italic', color: '#64748b', marginTop: 4 }}>"{c.tagline}"</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditingCampus(JSON.parse(JSON.stringify(c))); setShowEditModal(true); }} title="Edit Campus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm btn-icon" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }} onClick={() => handleDeleteCampus(c._id)} disabled={c.abbreviation === 'ISCP'} title="Delete Campus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Register New Campus Form */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={16} /> Register Campus</h3>
            <form onSubmit={handleRegisterCampus} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">School Name *</label>
                <input className="form-input" placeholder="e.g. ISCP Manila Campus" value={campusForm.name} onChange={e => setCampusForm({ ...campusForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Abbreviation *</label>
                <input className="form-input" placeholder="e.g. ISCP-MNL" value={campusForm.abbreviation} onChange={e => setCampusForm({ ...campusForm, abbreviation: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input className="form-input" placeholder="e.g. Filipinos Sultus Es" value={campusForm.tagline} onChange={e => setCampusForm({ ...campusForm, tagline: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g. Manila" value={campusForm.address.city} onChange={e => setCampusForm({ ...campusForm, address: { ...campusForm.address, city: e.target.value } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Province</label>
                <input className="form-input" placeholder="e.g. Metro Manila" value={campusForm.address.province} onChange={e => setCampusForm({ ...campusForm, address: { ...campusForm.address, province: e.target.value } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="e.g. info@iscp.edu.ph" value={campusForm.contact.email} onChange={e => setCampusForm({ ...campusForm, contact: { ...campusForm.contact, email: e.target.value } })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>Register Campus</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Academic Settings */}
      {activeTab === 'academic' && (
        <div className="card" style={{ maxWidth: 600, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Academic Control Center</h3>
          <form onSubmit={handleSaveAcademic} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <CustomSelect
                value={academicForm.academicYear}
                onChange={val => setAcademicForm({ ...academicForm, academicYear: val })}
                options={[
                  { value: '2025-2026', label: 'A.Y. 2025-2026' },
                  { value: '2026-2027', label: 'A.Y. 2026-2027' }
                ]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Semester</label>
              <CustomSelect
                value={academicForm.currentSemester}
                onChange={val => setAcademicForm({ ...academicForm, currentSemester: val })}
                options={[
                  { value: '1st', label: '1st Semester' },
                  { value: '2nd', label: '2nd Semester' },
                  { value: 'Summer', label: 'Summer Term' }
                ]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Grading System</label>
              <CustomSelect
                value={academicForm.gradingSystem}
                onChange={val => setAcademicForm({ ...academicForm, gradingSystem: val })}
                options={[
                  { value: 'percentage', label: 'Percentage System (e.g. 75 - 100)' },
                  { value: 'gpa', label: 'GPA Scale (e.g. 1.0 - 5.0)' },
                  { value: 'letter', label: 'Letter Grade (e.g. A, B, C)' }
                ]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passing Grade Threshold (%)</label>
              <input type="number" className="form-input" value={academicForm.passingGrade} onChange={e => setAcademicForm({ ...academicForm, passingGrade: Number(e.target.value) })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Save Academic Settings</button>
          </form>
        </div>
      )}

      {/* 3. System Settings */}
      {activeTab === 'system' && (
        <div className="card" style={{ maxWidth: 600, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Security & System Policies</h3>
          <form onSubmit={handleSaveSystem} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <CustomCheckbox
                checked={systemForm.enableRegistration}
                onChange={e => setSystemForm({ ...systemForm, enableRegistration: e.target.checked })}
                label="Allow Public Student Enrollment / Registration"
              />
              <CustomCheckbox
                checked={systemForm.requireEmailVerification}
                onChange={e => setSystemForm({ ...systemForm, requireEmailVerification: e.target.checked })}
                label="Require Email Verification on Student Sign Up"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Password Length</label>
              <CustomSelect
                value={String(systemForm.passwordLength)}
                onChange={val => setSystemForm({ ...systemForm, passwordLength: Number(val) })}
                options={[
                  { value: '8', label: '8 Characters (Standard)' },
                  { value: '10', label: '10 Characters (Secure)' },
                  { value: '12', label: '12 Characters (Strong)' }
                ]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Idle Session Duration (Minutes)</label>
              <input type="number" className="form-input" value={systemForm.sessionTimeout} onChange={e => setSystemForm({ ...systemForm, sessionTimeout: Number(e.target.value) })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Save Security Policies</button>
          </form>
        </div>
      )}

      {/* 4. Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
            <div className="search-wrapper" style={{ flex: 1, maxWidth: 400 }}>
              <Search size={14} className="search-icon" />
              <input className="search-input" placeholder="Search audit logs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th>Time</th>
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
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={6} className="table-empty">No activity logs match your search.</td></tr>
                ) : (
                  filteredLogs.map((log, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{log.user?.email || 'System'}</td>
                      <td>
                        <span className={`badge ${log.action === 'LOGIN' ? 'badge-blue' : log.action === 'CREATE' ? 'badge-green' : log.action === 'DELETE' ? 'badge-red' : 'badge-yellow'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{log.module}</td>
                      <td style={{ fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}><code>{log.ip || '—'}</code></td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCampus && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditModal(false)}>
          <div className="modal animate-slide">
            <div className="modal-header">
              <h3 className="modal-title">Edit Campus: {editingCampus.name}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">School Name *</label>
                <input className="form-input" value={editingCampus.name || ''} onChange={e => setEditingCampus({ ...editingCampus, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Abbreviation *</label>
                <input className="form-input" value={editingCampus.abbreviation || ''} onChange={e => setEditingCampus({ ...editingCampus, abbreviation: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input className="form-input" value={editingCampus.tagline || ''} onChange={e => setEditingCampus({ ...editingCampus, tagline: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={editingCampus.address?.city || ''} onChange={e => setEditingCampus({ ...editingCampus, address: { ...editingCampus.address, city: e.target.value } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Province</label>
                <input className="form-input" value={editingCampus.address?.province || ''} onChange={e => setEditingCampus({ ...editingCampus, address: { ...editingCampus.address, province: e.target.value } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={editingCampus.contact?.email || ''} onChange={e => setEditingCampus({ ...editingCampus, contact: { ...editingCampus.contact, email: e.target.value } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Plan</label>
                <CustomSelect
                  value={editingCampus.plan || 'starter'}
                  onChange={val => setEditingCampus({ ...editingCampus, plan: val })}
                  options={[
                    { value: 'starter', label: 'Starter' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'enterprise', label: 'Enterprise' }
                  ]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <CustomSelect
                  value={editingCampus.isActive !== false ? 'active' : 'suspended'}
                  onChange={val => setEditingCampus({ ...editingCampus, isActive: val === 'active' })}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'suspended', label: 'Suspended' }
                  ]}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                if (!editingCampus.name || !editingCampus.abbreviation) {
                  toast.error('School name and abbreviation are required.');
                  return;
                }
                try {
                  const payload = {
                    name: editingCampus.name,
                    abbreviation: editingCampus.abbreviation,
                    tagline: editingCampus.tagline,
                    address: editingCampus.address,
                    contact: editingCampus.contact,
                    plan: editingCampus.plan,
                    status: editingCampus.isActive ? 'active' : 'suspended'
                  };
                  await api.put(`/admin/schools/${editingCampus._id}`, payload);
                  toast.success('Campus details updated successfully');
                  setShowEditModal(false);
                  fetchData();
                  if (school?._id === editingCampus._id) {
                    const { data } = await api.get('/auth/me');
                    setSchool(data.user.schoolId);
                  }
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to update campus.');
                }
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
