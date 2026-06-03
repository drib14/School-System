import { useState, useEffect } from 'react';
import {
  Shield, UserCheck, FileText, AlertTriangle, Plus, Search,
  Clock, CheckCircle, XCircle, Eye, Edit2, X, QrCode, Car
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const SEVERITY_COLOR = { minor: 'badge-blue', moderate: 'badge-yellow', major: 'badge-red', critical: 'badge-red' };
const STATUS_COLOR = { open: 'badge-yellow', under_investigation: 'badge-blue', resolved: 'badge-green', closed: 'badge-gray' };
const GATE_STATUS_COLOR = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', returned: 'badge-gray' };

function VisitorModal({ onClose, onSave }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', purpose: '', personToVisit: '', department: '', idType: 'Government ID', idNumber: '', vehiclePlate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/security/visitors', form);
      toast.success('Visitor registered');
      onSave(data.visitor);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">Register Visitor</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Person to Visit *</label>
                <input className="form-input" value={form.personToVisit} onChange={e => setForm(f => ({ ...f, personToVisit: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Department / Office</label>
                <input className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">ID Type</label>
                <select className="form-input" value={form.idType} onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}>
                  {['Government ID', 'Driver\'s License', 'Passport', 'SSS ID', 'PhilHealth ID', 'Voter\'s ID', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ID Number</label>
                <input className="form-input" value={form.idNumber} onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Plate (optional)</label>
                <input className="form-input" value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))} placeholder="ABC-1234" />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Purpose of Visit *</label>
              <textarea className="form-input" rows={2} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Registering...' : 'Register & Generate Pass'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IncidentModal({ incident, onClose, onSave }) {
  const [form, setForm] = useState(incident || {
    type: 'behavioral', severity: 'minor', description: '', student: '', location: '', witnesses: [], actionTaken: '',
  });
  const [witnessInput, setWitnessInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (incident?._id) {
        await api.put(`/security/incidents/${incident._id}`, form);
        toast.success('Incident updated');
      } else {
        await api.post('/security/incidents', form);
        toast.success('Incident reported');
      }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">{incident?._id ? 'Edit Incident' : 'Report Incident'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Incident Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['behavioral', 'academic', 'physical', 'cyberbullying', 'vandalism', 'theft', 'drug', 'other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-input" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                  {['minor', 'moderate', 'major', 'critical'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Corridor 2" />
              </div>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input className="form-input" type="datetime-local" value={form.dateTime?.slice(0, 16) || ''} onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Description *</label>
              <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Action Taken</label>
              <textarea className="form-input" rows={2} value={form.actionTaken} onChange={e => setForm(f => ({ ...f, actionTaken: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Witnesses</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" value={witnessInput} onChange={e => setWitnessInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), witnessInput.trim() && (setForm(f => ({ ...f, witnesses: [...f.witnesses, witnessInput.trim()] })), setWitnessInput('')))}
                  placeholder="Enter witness name and press Enter..." style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(form.witnesses || []).map((w, i) => (
                  <span key={i} className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {w}
                    <button type="button" onClick={() => setForm(f => ({ ...f, witnesses: f.witnesses.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : incident?._id ? 'Update' : 'Report Incident'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VisitorsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('visitors');
  const [visitors, setVisitors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [editIncident, setEditIncident] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const canManage = ['registrar', 'principal', 'super_admin', 'school_owner', 'hr_staff', 'guidance_counselor'].includes(user?.role);

  useEffect(() => { fetchData(); }, [activeTab, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'visitors') {
        const [vRes, sRes] = await Promise.all([
          api.get(`/security/visitors${filterStatus ? `?status=${filterStatus}` : ''}`),
          api.get('/security/security/summary').catch(() => ({ data: null })),
        ]);
        setVisitors(vRes.data.visitors || []);
        setSummary(sRes.data);
      } else if (activeTab === 'incidents') {
        const { data } = await api.get(`/security/incidents${filterStatus ? `?status=${filterStatus}` : ''}`);
        setIncidents(data.incidents || []);
      } else {
        const { data } = await api.get(`/security/gate-pass${filterStatus ? `?status=${filterStatus}` : ''}`);
        setGatePasses(data.passes || []);
      }
    } catch { } finally { setLoading(false); }
  };

  const checkoutVisitor = async (id) => {
    try {
      await api.put(`/security/visitors/${id}/checkout`);
      toast.success('Visitor checked out');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const approvePass = async (id) => {
    try {
      await api.put(`/security/gate-pass/${id}/approve`);
      toast.success('Gate pass approved');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const filteredVisitors = visitors.filter(v => {
    const s = search.toLowerCase();
    return !s || `${v.firstName} ${v.lastName}`.toLowerCase().includes(s) || v.purpose?.toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Security Management</h1>
          <p className="page-sub">Visitors, Gate Passes, Incident Reports</p>
        </div>
        <div className="page-actions">
          <button className={`btn btn-sm ${activeTab === 'visitors' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('visitors')}><Shield size={14} /> Visitors</button>
          <button className={`btn btn-sm ${activeTab === 'gate-pass' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('gate-pass')}><QrCode size={14} /> Gate Pass</button>
          <button className={`btn btn-sm ${activeTab === 'incidents' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('incidents')}><AlertTriangle size={14} /> Incidents</button>
          {canManage && activeTab === 'visitors' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowVisitorModal(true)}><Plus size={14} /> Register Visitor</button>
          )}
          {activeTab === 'incidents' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setEditIncident(null); setShowIncidentModal(true); }}><Plus size={14} /> Report Incident</button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && activeTab === 'visitors' && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card green" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.visitorsToday || 0}</div>
            <div className="stat-label">Visitors Today</div>
          </div>
          <div className="stat-card blue" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.pendingPasses || 0}</div>
            <div className="stat-label">Pending Passes</div>
          </div>
          <div className="stat-card red" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.openIncidents || 0}</div>
            <div className="stat-label">Open Incidents</div>
          </div>
          <div className="stat-card gold" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{(summary.incidentsByType || []).reduce((s, i) => s + i.count, 0)}</div>
            <div className="stat-label">Incidents This Month</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {activeTab === 'visitors' && (
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
          </select>
        )}
        {activeTab === 'incidents' && (
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        )}
      </div>

      {/* VISITORS TABLE */}
      {activeTab === 'visitors' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Visitor</th><th>Purpose</th><th>Visit To</th><th>Time In</th><th>Time Out</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                  filteredVisitors.length === 0 ? <tr><td colSpan={7} className="table-empty">No visitors today</td></tr> :
                    filteredVisitors.map(v => (
                      <tr key={v._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.firstName} {v.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.idType}: {v.idNumber}</div>
                          {v.vehiclePlate && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}><Car size={10} style={{ display: 'inline' }} /> {v.vehiclePlate}</div>}
                        </td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.purpose}</td>
                        <td>
                          <div>{v.personToVisit}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.department}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{v.timeIn ? format(new Date(v.timeIn), 'h:mm a') : '—'}</td>
                        <td style={{ fontSize: 12 }}>{v.timeOut ? format(new Date(v.timeOut), 'h:mm a') : '—'}</td>
                        <td><span className={`badge ${v.status === 'checked_in' ? 'badge-green' : 'badge-gray'}`}>{v.status?.replace(/_/g, ' ')}</span></td>
                        <td>
                          {v.status === 'checked_in' && canManage && (
                            <button className="btn btn-secondary btn-sm" onClick={() => checkoutVisitor(v._id)}>Check Out</button>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INCIDENTS TABLE */}
      {activeTab === 'incidents' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Report #</th><th>Type</th><th>Severity</th><th>Location</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                  incidents.length === 0 ? <tr><td colSpan={7} className="table-empty">No incidents found</td></tr> :
                    incidents.map(inc => (
                      <tr key={inc._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedIncident(inc)}>
                        <td><code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{inc.reportNumber}</code></td>
                        <td><span className="badge badge-blue">{inc.type}</span></td>
                        <td><span className={`badge ${SEVERITY_COLOR[inc.severity]}`}>{inc.severity}</span></td>
                        <td>{inc.location || '—'}</td>
                        <td><span className={`badge ${STATUS_COLOR[inc.status]}`}>{inc.status?.replace(/_/g, ' ')}</span></td>
                        <td style={{ fontSize: 12 }}>{inc.dateTime ? format(new Date(inc.dateTime), 'MMM d, yyyy h:mm a') : '—'}</td>
                        <td onClick={e => e.stopPropagation()}>
                          {canManage && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditIncident(inc); setShowIncidentModal(true); }}><Edit2 size={13} /></button>}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GATE PASS TABLE */}
      {activeTab === 'gate-pass' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Pass #</th><th>Person</th><th>Type</th><th>Reason</th><th>Destination</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                  gatePasses.length === 0 ? <tr><td colSpan={7} className="table-empty">No gate passes</td></tr> :
                    gatePasses.map(gp => (
                      <tr key={gp._id}>
                        <td><code style={{ fontSize: 11 }}>{gp.passNumber}</code></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{gp.person?.firstName} {gp.person?.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{gp.person?.role}</div>
                        </td>
                        <td><span className="badge badge-blue">{gp.personType}</span></td>
                        <td>{gp.reason}</td>
                        <td>{gp.destination || '—'}</td>
                        <td><span className={`badge ${GATE_STATUS_COLOR[gp.status]}`}>{gp.status}</span></td>
                        <td>
                          {gp.status === 'pending' && canManage && (
                            <button className="btn btn-primary btn-sm" onClick={() => approvePass(gp._id)}>Approve</button>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal for Incident */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal modal-lg animate-slide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Incident Report — {selectedIncident.reportNumber}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedIncident(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className={`badge ${SEVERITY_COLOR[selectedIncident.severity]}`}>{selectedIncident.severity}</span>
                <span className={`badge ${STATUS_COLOR[selectedIncident.status]}`}>{selectedIncident.status?.replace(/_/g, ' ')}</span>
                <span className="badge badge-blue">{selectedIncident.type}</span>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11 }}>Description</label>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{selectedIncident.description}</p>
              </div>
              {selectedIncident.actionTaken && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11 }}>Action Taken</label>
                  <p style={{ color: 'var(--text-secondary)' }}>{selectedIncident.actionTaken}</p>
                </div>
              )}
              {selectedIncident.witnesses?.length > 0 && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11 }}>Witnesses</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedIncident.witnesses.map((w, i) => <span key={i} className="badge badge-gray">{w}</span>)}
                  </div>
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Reported by {selectedIncident.reportedBy?.firstName} {selectedIncident.reportedBy?.lastName} ·{' '}
                {selectedIncident.dateTime ? format(new Date(selectedIncident.dateTime), 'MMM d, yyyy h:mm a') : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {showVisitorModal && <VisitorModal onClose={() => setShowVisitorModal(false)} onSave={(v) => { setShowVisitorModal(false); setVisitors(prev => [v, ...prev]); }} />}
      {showIncidentModal && <IncidentModal incident={editIncident} onClose={() => { setShowIncidentModal(false); setEditIncident(null); }} onSave={() => { setShowIncidentModal(false); setEditIncident(null); fetchData(); }} />}
    </div>
  );
}
