import { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Search, X, ChevronRight, Clock, Flag, User, MessageSquare, CheckCircle, AlertCircle, Clipboard } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import CustomSelect from '../../components/forms/CustomSelect';
import CustomCheckbox from '../../components/forms/CustomCheckbox';

const STATUS_COLOR = { open: 'badge-yellow', in_progress: 'badge-blue', closed: 'badge-green', referred: 'badge-gray' };
const PRIORITY_COLOR = { low: 'badge-gray', medium: 'badge-blue', high: 'badge-yellow', critical: 'badge-red' };
const PRIORITY_DOT = { low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };

function CaseModal({ onClose, onSave }) {
  const [form, setForm] = useState({ student: '', caseType: 'academic', concern: '', background: '', priority: 'medium', isConfidential: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/guidance/cases', form);
      toast.success('Case created');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">Open Guidance Case</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Case Type *</label>
                <CustomSelect
                  value={form.caseType}
                  onChange={val => setForm(f => ({ ...f, caseType: val }))}
                  options={['academic', 'behavioral', 'personal', 'career', 'family', 'crisis', 'other'].map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <CustomSelect
                  value={form.priority}
                  onChange={val => setForm(f => ({ ...f, priority: val }))}
                  options={['low', 'medium', 'high', 'critical'].map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Student ID or Name *</label>
              <input className="form-input" value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))} required placeholder="Enter student User ID" />
            </div>
            <div className="form-group">
              <label className="form-label">Concern / Presenting Problem *</label>
              <textarea className="form-input" rows={3} value={form.concern} onChange={e => setForm(f => ({ ...f, concern: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Background Information</label>
              <textarea className="form-input" rows={3} value={form.background} onChange={e => setForm(f => ({ ...f, background: e.target.value }))} />
            </div>
            <div className="form-group">
              <CustomCheckbox
                checked={form.isConfidential}
                onChange={e => setForm(f => ({ ...f, isConfidential: e.target.checked }))}
                label="Confidential Case (student will not be notified)"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Open Case'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SessionModal({ caseId, onClose, onSave }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 16), duration: 60, notes: '', interventions: [], nextSession: '' });
  const [intInput, setIntInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/guidance/cases/${caseId}/session`, { ...form, date: new Date(form.date) });
      toast.success('Session recorded');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">Record Counseling Session</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input className="form-input" type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" min={15} step={15} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Session Notes *</label>
              <textarea className="form-input" rows={5} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} required placeholder="Document session observations, client responses, progress..." />
            </div>
            <div className="form-group">
              <label className="form-label">Interventions Used</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" style={{ flex: 1 }} value={intInput} onChange={e => setIntInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), intInput.trim() && (setForm(f => ({ ...f, interventions: [...f.interventions, intInput.trim()] })), setIntInput('')))}
                  placeholder="e.g. CBT, Active Listening, Referral..." />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {form.interventions.map((int, i) => (
                  <span key={i} className="badge badge-blue" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {int}
                    <button type="button" onClick={() => setForm(f => ({ ...f, interventions: f.interventions.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>✕</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Next Session Date</label>
              <input className="form-input" type="datetime-local" value={form.nextSession} onChange={e => setForm(f => ({ ...f, nextSession: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Record Session'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GuidancePage() {
  const { user } = useAuthStore();
  const [cases, setCases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => { fetchData(); }, [filterStatus, filterPriority, filterType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      if (filterType) params.set('caseType', filterType);
      const [casesRes, sumRes] = await Promise.all([
        api.get(`/guidance/cases?${params}`),
        api.get('/guidance/summary').catch(() => ({ data: null })),
      ]);
      setCases(casesRes.data.cases || []);
      setSummary(sumRes.data);
    } catch { } finally { setLoading(false); }
  };

  const closeCase = async (id) => {
    const notes = prompt('Closing notes (optional):');
    if (notes === null) return;
    try {
      await api.put(`/guidance/cases/${id}/close`, { closingNotes: notes });
      toast.success('Case closed');
      setSelected(null);
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const notifyParent = async (id) => {
    const msg = prompt('Message to parent:');
    if (!msg) return;
    try {
      await api.post(`/guidance/cases/${id}/notify-parent`, { message: msg });
      toast.success('Parents notified');
    } catch { toast.error('Failed'); }
  };

  const filtered = cases.filter(c => {
    const s = search.toLowerCase();
    return !s || c.caseNumber?.toLowerCase().includes(s) || `${c.student?.firstName} ${c.student?.lastName}`.toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HeartHandshake size={24} style={{ color: '#8b5cf6' }} />
            Guidance & Counseling
          </h1>
          <p className="page-sub">Student counseling cases and interventions</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCaseModal(true)}><Plus size={14} /> Open Case</button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card gold" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.totalOpen || 0}</div>
            <div className="stat-label">Open Cases</div>
          </div>
          <div className="stat-card blue" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.totalInProgress || 0}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card green" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.totalClosed || 0}</div>
            <div className="stat-label">Closed</div>
          </div>
          {summary.byPriority?.find(p => p._id === 'critical') && (
            <div className="stat-card red" style={{ padding: '14px 16px' }}>
              <div className="stat-value" style={{ fontSize: 22 }}>{summary.byPriority.find(p => p._id === 'critical')?.count || 0}</div>
              <div className="stat-label">Critical Priority</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Cases List */}
        <div>
          <div className="filter-bar">
            <div className="search-wrapper" style={{ flex: 1 }}>
              <Search size={14} className="search-icon" />
              <input className="search-input" placeholder="Search case #, student name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ minWidth: 160 }}>
              <CustomSelect
                className="filter-cs"
                value={filterStatus}
                onChange={val => setFilterStatus(val)}
                placeholder="All Status"
                options={[{ value: '', label: 'All Status' }, ...['open', 'in_progress', 'closed', 'referred'].map(s => ({ value: s, label: s.replace(/_/g, ' ') }))]}
              />
            </div>
            <div style={{ minWidth: 150 }}>
              <CustomSelect
                className="filter-cs"
                value={filterPriority}
                onChange={val => setFilterPriority(val)}
                placeholder="All Priority"
                options={[{ value: '', label: 'All Priority' }, ...['low', 'medium', 'high', 'critical'].map(p => ({ value: p, label: p }))]}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
              </div>
            )) : filtered.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                <HeartHandshake size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 12px', color: '#8b5cf6' }} />
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No cases found</div>
              </div>
            ) : filtered.map(c => (
              <div
                key={c._id}
                className="card"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${PRIORITY_DOT[c.priority]}`,
                  background: selected?._id === c._id ? 'var(--bg-secondary)' : undefined,
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setSelected(c)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{c.caseNumber}</code>
                      <span className={`badge ${STATUS_COLOR[c.status]}`}>{c.status?.replace(/_/g, ' ')}</span>
                      <span className={`badge ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
                      <span className="badge badge-blue">{c.caseType}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                      {c.student?.firstName} {c.student?.lastName}
                      {c.isConfidential && <span style={{ fontSize: 10, background: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: 3, marginLeft: 6 }}>CONFIDENTIAL</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.concern}</p>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', gap: 12 }}>
                      <span><MessageSquare size={10} style={{ display: 'inline' }} /> {c.sessions?.length || 0} sessions</span>
                      <span><Clock size={10} style={{ display: 'inline' }} /> {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : ''}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Detail */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: 20 }}>
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>{selected.caseNumber}</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowSessionModal(true)}><Plus size={12} /> Session</button>
                  {selected.student && <button className="btn btn-secondary btn-sm" onClick={() => notifyParent(selected._id)}><MessageSquare size={12} /> Parent</button>}
                  {selected.status !== 'closed' && <button className="btn btn-danger btn-sm" onClick={() => closeCase(selected._id)}><CheckCircle size={12} /> Close</button>}
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}><X size={14} /></button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                <span className={`badge ${STATUS_COLOR[selected.status]}`}>{selected.status?.replace(/_/g, ' ')}</span>
                <span className={`badge ${PRIORITY_COLOR[selected.priority]}`}>{selected.priority}</span>
                <span className="badge badge-blue">{selected.caseType}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>STUDENT</div>
                  <div style={{ fontWeight: 600 }}>{selected.student?.firstName} {selected.student?.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.student?.studentId}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>COUNSELOR</div>
                  <div style={{ fontWeight: 600 }}>{selected.counselor?.firstName} {selected.counselor?.lastName}</div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>CONCERN</div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{selected.concern}</p>
              </div>
              {selected.background && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>BACKGROUND</div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{selected.background}</p>
                </div>
              )}
            </div>

            {/* Sessions Timeline */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
                SESSIONS ({selected.sessions?.length || 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {(selected.sessions || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>No sessions recorded yet</div>
                ) : (selected.sessions || []).map((session, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>Session {i + 1}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{session.duration}min · {session.date ? format(new Date(session.date), 'MMM d, yyyy') : ''}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{session.notes}</p>
                    {(session.interventions || []).length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                        {session.interventions.map((int, j) => <span key={j} className="badge badge-blue" style={{ fontSize: 10 }}>{int}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCaseModal && <CaseModal onClose={() => setShowCaseModal(false)} onSave={() => { setShowCaseModal(false); fetchData(); }} />}
      {showSessionModal && <SessionModal caseId={selected?._id} onClose={() => setShowSessionModal(false)} onSave={() => { setShowSessionModal(false); fetchData(); }} />}
    </div>
  );
}
