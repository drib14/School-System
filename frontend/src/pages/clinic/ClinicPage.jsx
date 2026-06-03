import { useState, useEffect } from 'react';
import {
  Heart, Plus, Search, X, AlertCircle, User, Thermometer,
  Activity, Clock, ChevronDown, FileText, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const DISPOSITION_COLOR = {
  monitored: 'badge-blue',
  medication_given: 'badge-yellow',
  sent_home: 'badge-red',
  hospitalized: 'badge-red',
  referred: 'badge-yellow',
  released: 'badge-green',
};

function ClinicVisitModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    student: '', studentName: '',
    chiefComplaint: '', vitalSigns: { bp: '', temp: '', hr: '', rr: '', o2sat: '', weight: '', height: '' },
    diagnosis: '', treatment: '', medicationsGiven: [], disposition: 'monitored', notes: '',
    isFollowUp: false,
  });
  const [medInput, setMedInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addMed = () => { if (medInput.trim()) { setForm(f => ({ ...f, medicationsGiven: [...f.medicationsGiven, medInput.trim()] })); setMedInput(''); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clinic/records', { ...form, visitDate: new Date() });
      toast.success('Visit recorded');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">Record Clinic Visit</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Patient Name *</label>
              <input className="form-input" value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} required placeholder="Enter student/employee name" />
            </div>
            <div className="form-group">
              <label className="form-label">Chief Complaint *</label>
              <input className="form-input" value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} required />
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Vital Signs</div>
              <div className="grid-3" style={{ gap: 12 }}>
                {[
                  ['bp', 'Blood Pressure (mmHg)', '120/80'],
                  ['temp', 'Temperature (°C)', '36.5'],
                  ['hr', 'Heart Rate (bpm)', '75'],
                  ['rr', 'Resp. Rate (bpm)', '18'],
                  ['o2sat', 'O₂ Saturation (%)', '98'],
                  ['weight', 'Weight (kg)', '60'],
                ].map(([key, label, placeholder]) => (
                  <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>{label}</label>
                    <input className="form-input" value={form.vitalSigns[key]} onChange={e => setForm(f => ({ ...f, vitalSigns: { ...f.vitalSigns, [key]: e.target.value } }))} placeholder={placeholder} style={{ fontSize: 13 }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input className="form-input" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Disposition *</label>
                <select className="form-input" value={form.disposition} onChange={e => setForm(f => ({ ...f, disposition: e.target.value }))}>
                  {['monitored', 'medication_given', 'sent_home', 'hospitalized', 'referred', 'released'].map(d => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Treatment</label>
              <textarea className="form-input" rows={2} value={form.treatment} onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Medications Given</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" style={{ flex: 1 }} value={medInput} onChange={e => setMedInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMed())} placeholder="Type medication and press Enter..." />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addMed}>Add</button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {form.medicationsGiven.map((m, i) => (
                  <span key={i} className="badge badge-blue" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {m}
                    <button type="button" onClick={() => setForm(f => ({ ...f, medicationsGiven: f.medicationsGiven.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>✕</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Record Visit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClinicPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('visits');
  const [records, setRecords] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterDisp, setFilterDisp] = useState('');

  const isNurse = ['nurse', 'principal', 'super_admin', 'school_owner'].includes(user?.role);

  useEffect(() => { fetchData(); }, [activeTab, filterDate, filterDisp]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isNurse) {
        const params = new URLSearchParams();
        if (filterDate) params.set('date', filterDate);
        if (filterDisp) params.set('disposition', filterDisp);
        const [recRes, sumRes] = await Promise.all([
          api.get(`/clinic/records?${params}`),
          api.get('/clinic/summary').catch(() => ({ data: null })),
        ]);
        setRecords(recRes.data.records || []);
        setSummary(sumRes.data);
      } else {
        const { data } = await api.get('/clinic/records/my');
        setMyRecords(data.records || []);
      }
    } catch { } finally { setLoading(false); }
  };

  const list = isNurse ? records.filter(r => {
    const s = search.toLowerCase();
    return !s || `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase().includes(s) || r.chiefComplaint?.toLowerCase().includes(s);
  }) : myRecords;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={24} style={{ color: 'var(--danger)' }} />
            School Clinic
          </h1>
          <p className="page-sub">{isNurse ? 'Health records and visit management' : 'Your health records'}</p>
        </div>
        {isNurse && (
          <div className="page-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Record Visit</button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {isNurse && summary && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card green" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.todayVisits || 0}</div>
            <div className="stat-label">Visits Today</div>
          </div>
          <div className="stat-card blue" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.monthVisits || 0}</div>
            <div className="stat-label">This Month</div>
          </div>
          {(summary.byDisposition || []).slice(0, 2).map(d => (
            <div key={d._id} className="stat-card gold" style={{ padding: '14px 16px' }}>
              <div className="stat-value" style={{ fontSize: 22 }}>{d.count}</div>
              <div className="stat-label">{d._id?.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      {isNurse && (
        <div className="filter-bar">
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search size={14} className="search-icon" />
            <input className="search-input" placeholder="Search by patient, complaint..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input className="filter-select" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <select className="filter-select" value={filterDisp} onChange={e => setFilterDisp(e.target.value)}>
            <option value="">All Dispositions</option>
            {['monitored', 'medication_given', 'sent_home', 'hospitalized', 'referred', 'released'].map(d => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={fetchData}><RefreshCw size={14} /></button>
        </div>
      )}

      {/* Records Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {isNurse && <th>Patient</th>}
                <th>Chief Complaint</th>
                <th>Vital Signs</th>
                <th>Diagnosis</th>
                <th>Disposition</th>
                <th>Medications</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: isNurse ? 8 : 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
              )) : list.length === 0 ? (
                <tr><td colSpan={isNurse ? 8 : 7} className="table-empty">
                  <Heart size={36} style={{ opacity: 0.15, display: 'block', margin: '0 auto 8px', color: 'var(--danger)' }} />
                  No clinic records found
                </td></tr>
              ) : list.map(record => (
                <tr key={record._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?._id === record._id ? null : record)}>
                  {isNurse && <td>
                    <div style={{ fontWeight: 600 }}>{record.student?.firstName} {record.student?.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{record.student?.studentId || record.student?.role}</div>
                  </td>}
                  <td>{record.chiefComplaint}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {record.vitalSigns?.temp && <div><Thermometer size={9} style={{ display: 'inline' }} /> {record.vitalSigns.temp}°C</div>}
                    {record.vitalSigns?.bp && <div><Activity size={9} style={{ display: 'inline' }} /> {record.vitalSigns.bp} mmHg</div>}
                  </td>
                  <td>{record.diagnosis || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td><span className={`badge ${DISPOSITION_COLOR[record.disposition] || 'badge-gray'}`}>{record.disposition?.replace(/_/g, ' ')}</span></td>
                  <td>
                    {(record.medicationsGiven || []).length > 0 ? (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {record.medicationsGiven.slice(0, 2).map((m, i) => <span key={i} className="badge badge-blue" style={{ fontSize: 10 }}>{m}</span>)}
                        {record.medicationsGiven.length > 2 && <span className="badge badge-gray" style={{ fontSize: 10 }}>+{record.medicationsGiven.length - 2}</span>}
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{record.visitDate ? format(new Date(record.visitDate), 'MMM d, h:mm a') : '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{record.attendedBy?.firstName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="card" style={{ marginTop: 12, borderLeft: '3px solid var(--danger)' }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 15 }}>Visit Details</h4>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div className="grid-3" style={{ gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>VITAL SIGNS</div>
                {Object.entries(selected.vitalSigns || {}).map(([k, v]) => v && <div key={k} style={{ fontSize: 13 }}>{k.toUpperCase()}: {v}</div>)}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>TREATMENT</div>
                <div style={{ fontSize: 13 }}>{selected.treatment || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>NOTES</div>
                <div style={{ fontSize: 13 }}>{selected.notes || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && <ClinicVisitModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchData(); }} />}
    </div>
  );
}
