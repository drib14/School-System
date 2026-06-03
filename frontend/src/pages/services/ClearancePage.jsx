import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, ChevronDown, Plus, X, Check, FileCheck, Building2, BookOpen } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const OFFICES = [
  { id: 'registrar', label: 'Registrar', icon: FileCheck },
  { id: 'accounting', label: 'Accounting', icon: Building2 },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'clinic', label: 'Clinic', icon: FileCheck },
  { id: 'guidance', label: 'Guidance', icon: FileCheck },
  { id: 'property', label: 'Property', icon: Building2 },
];

const STEP_COLOR = {
  pending: { border: '#d1d5db', bg: '#f9fafb', icon: Clock, color: '#6b7280' },
  cleared: { border: '#10b981', bg: '#d1fae5', icon: CheckCircle, color: '#059669' },
  with_concern: { border: '#f59e0b', bg: '#fef3c7', icon: AlertCircle, color: '#d97706' },
  rejected: { border: '#ef4444', bg: '#fee2e2', icon: X, color: '#dc2626' },
};

const OFFICE_MAP = { registrar: 'guidance_counselor', accounting: 'cashier', library: 'librarian', clinic: 'nurse', guidance: 'guidance_counselor', property: 'registrar', principal: 'principal' };

export default function ClearancePage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ type: 'semester', academicYear: '2025-2026', semester: '1st', purpose: '' });
  const [requesting, setRequesting] = useState(false);
  const [stepAction, setStepAction] = useState(null); // { office, status, concern, remarks }

  const isAdmin = ['registrar', 'principal', 'super_admin', 'cashier', 'librarian', 'nurse', 'guidance_counselor', 'school_owner'].includes(user?.role);
  const isStudent = user?.role === 'student';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/services/clearance');
      setRequests(data.requests || []);
      if (selected) {
        const updated = (data.requests || []).find(r => r._id === selected._id);
        if (updated) setSelected(updated);
      }
    } catch { } finally { setLoading(false); }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setRequesting(true);
    try {
      await api.post('/services/clearance', requestForm);
      toast.success('Clearance request submitted');
      setShowRequestModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setRequesting(false); }
  };

  const handleStepAction = async (requestId, office, status) => {
    const concern = status === 'with_concern' ? prompt('Enter concern/remarks:') : '';
    if (status === 'with_concern' && !concern) return;
    try {
      await api.put(`/services/clearance/${requestId}/step/${office}`, { status, concern, remarks: concern });
      toast.success(`Step ${status}`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // Determine which offices the current user can sign off
  const canClearOffice = (office) => {
    if (['super_admin', 'principal'].includes(user?.role)) return true;
    if (user?.role === 'registrar' && ['registrar', 'principal', 'property', 'department'].includes(office)) return true;
    if (user?.role === 'cashier' && office === 'accounting') return true;
    if (user?.role === 'librarian' && office === 'library') return true;
    if (user?.role === 'nurse' && office === 'clinic') return true;
    if (user?.role === 'guidance_counselor' && office === 'guidance') return true;
    return false;
  };

  const overallStatusColor = {
    pending: 'badge-yellow', in_progress: 'badge-blue', cleared: 'badge-green', rejected: 'badge-red',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clearance System</h1>
          <p className="page-sub">{isStudent ? 'Your clearance requests' : 'Manage student clearances'}</p>
        </div>
        {isStudent && (
          <div className="page-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowRequestModal(true)}><Plus size={14} /> Request Clearance</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '360px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '80%' }} />
            </div>
          )) : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
              <FileText size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No clearance requests</div>
              {isStudent && <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowRequestModal(true)}>Request Clearance</button>}
            </div>
          ) : requests.map(req => {
            const totalSteps = req.steps?.length || 0;
            const clearedSteps = req.steps?.filter(s => s.status === 'cleared').length || 0;
            const progress = totalSteps > 0 ? (clearedSteps / totalSteps) * 100 : 0;

            return (
              <div key={req._id} className="card" style={{ padding: '14px 16px', cursor: 'pointer', borderLeft: `3px solid ${req.overallStatus === 'cleared' ? '#10b981' : req.overallStatus === 'rejected' ? '#ef4444' : '#3b82f6'}`, background: selected?._id === req._id ? 'var(--bg-secondary)' : undefined }} onClick={() => setSelected(req)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{req.requestNumber}</div>
                    {isAdmin && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.student?.firstName} {req.student?.lastName}</div>}
                  </div>
                  <span className={`badge ${overallStatusColor[req.overallStatus]}`}>{req.overallStatus?.replace(/_/g, ' ')}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {req.type} · {req.academicYear} {req.semester && `· ${req.semester} Semester`}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Progress</span><span>{clearedSteps}/{totalSteps} offices</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--border-color)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: req.overallStatus === 'cleared' ? '#10b981' : '#3b82f6', width: `${progress}%`, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clearance Detail */}
        {selected && (
          <div className="card">
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{selected.requestNumber}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {selected.student?.firstName} {selected.student?.lastName} · {selected.type} clearance · AY {selected.academicYear}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}><X size={14} /></button>
              </div>

              {selected.purpose && (
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <strong>Purpose:</strong> {selected.purpose}
                </div>
              )}
            </div>

            {/* Step-by-step Progress */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(selected.steps || []).map((step, i) => {
                  const config = STEP_COLOR[step.status] || STEP_COLOR.pending;
                  const Icon = config.icon;
                  const canSign = canClearOffice(step.office) && step.status === 'pending';

                  return (
                    <div key={i} style={{ border: `1px solid ${config.border}`, borderRadius: 10, padding: '12px 14px', background: config.bg }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${config.border}` }}>
                            <Icon size={14} style={{ color: config.color }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{step.label || step.office.charAt(0).toUpperCase() + step.office.slice(1)}</div>
                            {step.status === 'cleared' && step.clearedBy && (
                              <div style={{ fontSize: 11, color: config.color }}>Cleared by {step.clearedBy?.firstName} {step.clearedBy?.lastName} · {step.clearedAt ? format(new Date(step.clearedAt), 'MMM d') : ''}</div>
                            )}
                            {step.concern && <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>⚠️ {step.concern}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={`badge ${step.status === 'cleared' ? 'badge-green' : step.status === 'with_concern' ? 'badge-yellow' : step.status === 'rejected' ? 'badge-red' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                            {step.status?.replace(/_/g, ' ')}
                          </span>
                          {canSign && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => handleStepAction(selected._id, step.office, 'cleared')}>
                                <Check size={11} /> Clear
                              </button>
                              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => handleStepAction(selected._id, step.office, 'with_concern')}>
                                Concern
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selected.overallStatus === 'cleared' && (
                <div style={{ textAlign: 'center', padding: '24px 0 8px', borderTop: '1px solid var(--border-color)', marginTop: 16 }}>
                  <CheckCircle size={40} style={{ color: '#10b981', display: 'block', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#10b981' }}>FULLY CLEARED</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed {selected.completedAt ? format(new Date(selected.completedAt), 'MMMM d, yyyy') : ''}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRequestModal(false)}>
          <div className="modal animate-slide">
            <div className="modal-header">
              <h3 className="modal-title">Request Clearance</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowRequestModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={submitRequest}>
              <div className="modal-body">
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-input" value={requestForm.type} onChange={e => setRequestForm(f => ({ ...f, type: e.target.value }))}>
                      {['semester', 'graduation', 'transfer', 'withdrawal', 'other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year *</label>
                    <input className="form-input" value={requestForm.academicYear} onChange={e => setRequestForm(f => ({ ...f, academicYear: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-input" value={requestForm.semester} onChange={e => setRequestForm(f => ({ ...f, semester: e.target.value }))}>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <textarea className="form-input" rows={2} value={requestForm.purpose} onChange={e => setRequestForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Optional: Reason for clearance request..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={requesting}>{requesting ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
