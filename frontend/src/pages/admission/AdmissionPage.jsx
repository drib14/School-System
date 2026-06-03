import { useState, useEffect } from 'react';
import { UserPlus, ClipboardList, BookOpen, Search, Plus, Filter, Eye, Edit2, X, ChevronRight, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const STAGE_COLOR = {
  submitted: 'badge-gray', document_review: 'badge-blue', exam_scheduled: 'badge-yellow',
  exam_done: 'badge-yellow', interview_scheduled: 'badge-blue', interview_done: 'badge-blue',
  accepted: 'badge-green', enrolled: 'badge-green', rejected: 'badge-red', waitlisted: 'badge-yellow',
};

const STAGE_ICON = {
  submitted: Clock, document_review: FileText, accepted: CheckCircle, enrolled: CheckCircle,
  rejected: XCircle, waitlisted: Clock,
};

const STAGES = ['submitted', 'document_review', 'exam_scheduled', 'exam_done', 'interview_scheduled', 'interview_done', 'accepted', 'enrolled', 'rejected'];

export default function AdmissionPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [exams, setExams] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [selected, setSelected] = useState(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [stageRemarks, setStageRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const canManage = ['registrar', 'principal', 'super_admin', 'school_owner'].includes(user?.role);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'applications') {
        const [appRes, funnelRes] = await Promise.all([
          api.get(`/admission/applications${filterStage ? `?stage=${filterStage}` : ''}`),
          api.get('/admission/funnel'),
        ]);
        setApplications(appRes.data.applications || []);
        setFunnel(funnelRes.data.funnel || []);
      } else if (activeTab === 'exams') {
        const { data } = await api.get('/admission/exams');
        setExams(data.exams || []);
      } else {
        const { data } = await api.get('/admission/interviews');
        setInterviews(data.interviews || []);
      }
    } catch { } finally { setLoading(false); }
  };

  const moveStage = async () => {
    if (!newStage || !selected) return;
    setUpdating(true);
    try {
      await api.put(`/admission/applications/${selected._id}/stage`, { stage: newStage, remarks: stageRemarks });
      toast.success(`Application moved to ${newStage}`);
      setShowStageModal(false);
      setSelected(prev => ({ ...prev, stage: newStage }));
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setUpdating(false); }
  };

  const filtered = applications.filter(a => {
    const s = search.toLowerCase();
    return (!s || `${a.firstName} ${a.lastName}`.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s) || a.applicationNumber?.toLowerCase().includes(s)) &&
      (!filterStage || a.stage === filterStage);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admission System</h1>
          <p className="page-sub">Manage applicants, exams, and interviews</p>
        </div>
        <div className="page-actions">
          <button className={`btn btn-sm ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('applications')}><ClipboardList size={14} /> Applications</button>
          <button className={`btn btn-sm ${activeTab === 'exams' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('exams')}><BookOpen size={14} /> Exams</button>
          <button className={`btn btn-sm ${activeTab === 'interviews' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('interviews')}><UserPlus size={14} /> Interviews</button>
        </div>
      </div>

      {/* Funnel Strip */}
      {activeTab === 'applications' && funnel.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {funnel.filter(f => f.count > 0).map(stage => (
            <button key={stage.stage}
              className={`btn btn-sm ${filterStage === stage.stage ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => setFilterStage(filterStage === stage.stage ? '' : stage.stage)}>
              <span className="badge badge-gray" style={{ marginRight: 4, fontSize: 10 }}>{stage.count}</span>
              {stage.stage.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 16, alignItems: 'start' }}>
        <div>
          {/* Filter Bar */}
          {activeTab === 'applications' && (
            <div className="filter-bar">
              <div className="search-wrapper" style={{ flex: 1 }}>
                <Search size={14} className="search-icon" />
                <input className="search-input" placeholder="Search by name, email, application #..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="filter-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
                <option value="">All Stages</option>
                {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          )}

          {/* APPLICATIONS TABLE */}
          {activeTab === 'applications' && (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Applicant</th><th>Contact</th><th>Program</th><th>Stage</th><th>Submitted</th>{canManage && <th></th>}</tr></thead>
                  <tbody>
                    {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                      filtered.length === 0 ? <tr><td colSpan={6} className="table-empty">No applications found</td></tr> :
                        filtered.map(app => (
                          <tr key={app._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(app)}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{app.firstName} {app.lastName}</div>
                              <code style={{ fontSize: 10, background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 3 }}>{app.applicationNumber}</code>
                            </td>
                            <td>
                              <div style={{ fontSize: 12 }}>{app.email}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.phone}</div>
                            </td>
                            <td>{app.desiredProgram?.name || app.desiredProgram || '—'}</td>
                            <td><span className={`badge ${STAGE_COLOR[app.stage] || 'badge-gray'}`}>{app.stage?.replace(/_/g, ' ')}</span></td>
                            <td style={{ fontSize: 12 }}>{app.submittedAt ? format(new Date(app.submittedAt), 'MMM d, yyyy') : '—'}</td>
                            {canManage && <td><button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); setSelected(app); }}><Eye size={13} /></button></td>}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXAMS TABLE */}
          {activeTab === 'exams' && (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Exam</th><th>Date & Time</th><th>Venue</th><th>Capacity</th><th>Status</th></tr></thead>
                  <tbody>
                    {loading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                      exams.length === 0 ? <tr><td colSpan={5} className="table-empty">No entrance exams scheduled</td></tr> :
                        exams.map(exam => (
                          <tr key={exam._id}>
                            <td><div style={{ fontWeight: 600 }}>{exam.title}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Passing: {exam.passingScore}%</div></td>
                            <td style={{ fontSize: 12 }}>{exam.examDate ? format(new Date(exam.examDate), 'MMM d, yyyy h:mm a') : '—'}</td>
                            <td>{exam.venue || '—'}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>{exam.enrolledApplicants?.length || 0}/{exam.capacity}</span>
                                <div style={{ flex: 1, height: 4, background: 'var(--border-color)', borderRadius: 99, minWidth: 50 }}>
                                  <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 99, width: `${Math.min(100, ((exam.enrolledApplicants?.length || 0) / (exam.capacity || 1)) * 100)}%` }} />
                                </div>
                              </div>
                            </td>
                            <td><span className={`badge ${exam.status === 'open' ? 'badge-green' : exam.status === 'ongoing' ? 'badge-blue' : 'badge-gray'}`}>{exam.status}</span></td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INTERVIEWS TABLE */}
          {activeTab === 'interviews' && (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Applicant</th><th>Interviewer</th><th>Schedule</th><th>Type</th><th>Status</th>{canManage && <th></th>}</tr></thead>
                  <tbody>
                    {loading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                      interviews.length === 0 ? <tr><td colSpan={6} className="table-empty">No interviews scheduled</td></tr> :
                        interviews.map(int => (
                          <tr key={int._id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{int.application?.firstName} {int.application?.lastName}</div>
                              <code style={{ fontSize: 10 }}>{int.application?.applicationNumber}</code>
                            </td>
                            <td>{int.interviewer?.firstName} {int.interviewer?.lastName}</td>
                            <td style={{ fontSize: 12 }}>{int.scheduledAt ? format(new Date(int.scheduledAt), 'MMM d, h:mm a') : '—'}</td>
                            <td><span className="badge badge-blue">{int.type || 'in_person'}</span></td>
                            <td><span className={`badge ${int.status === 'completed' ? 'badge-green' : int.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>{int.status}</span></td>
                            {canManage && int.status === 'scheduled' && (
                              <td>
                                <button className="btn btn-success btn-sm" style={{ fontSize: 11 }} onClick={async () => {
                                  const score = prompt('Interview score (0-100):');
                                  const rec = prompt('Recommendation (accept/reject/waitlist):');
                                  if (!score || !rec) return;
                                  try {
                                    await api.put(`/admission/interviews/${int._id}/complete`, { score: Number(score), recommendation: rec });
                                    toast.success('Interview recorded');
                                    fetchData();
                                  } catch { toast.error('Failed'); }
                                }}>Complete</button>
                              </td>
                            )}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Application Detail Panel */}
        {selected && activeTab === 'applications' && (
          <div className="card" style={{ position: 'sticky', top: 20, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>{selected.applicationNumber}</h4>
                <div style={{ display: 'flex', gap: 6 }}>
                  {canManage && <button className="btn btn-primary btn-sm" onClick={() => { setNewStage(selected.stage); setShowStageModal(true); }}>Move Stage</button>}
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}><X size={14} /></button>
                </div>
              </div>
              <span className={`badge ${STAGE_COLOR[selected.stage] || 'badge-gray'}`} style={{ marginBottom: 16, display: 'inline-block' }}>{selected.stage?.replace(/_/g, ' ')}</span>
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>FULL NAME</div>
                  <div style={{ fontWeight: 600 }}>{selected.firstName} {selected.middleName} {selected.lastName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>PROGRAM</div>
                  <div style={{ fontWeight: 600 }}>{selected.desiredProgram?.name || selected.desiredProgram || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>EMAIL</div>
                  <div style={{ fontSize: 13 }}>{selected.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>PHONE</div>
                  <div style={{ fontSize: 13 }}>{selected.phone || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>ADDRESS</div>
                  <div style={{ fontSize: 12 }}>{selected.address || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>PREVIOUS SCHOOL</div>
                  <div style={{ fontSize: 12 }}>{selected.previousSchool || '—'}</div>
                </div>
              </div>

              {/* Documents */}
              {(selected.documents || []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>DOCUMENTS</div>
                  {selected.documents.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                      <span>{doc.type}</span>
                      <span className={`badge ${doc.isVerified ? 'badge-green' : 'badge-yellow'}`}>{doc.isVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Exam/Interview Scores */}
              {selected.examScore !== undefined && (
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Exam Score: </span>{selected.examScore}%
                  {selected.examPassed && <span className="badge badge-green" style={{ marginLeft: 8 }}>Passed</span>}
                  {selected.examPassed === false && <span className="badge badge-red" style={{ marginLeft: 8 }}>Failed</span>}
                </div>
              )}
              {selected.interviewScore !== undefined && (
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Interview Score: </span>{selected.interviewScore}%
                </div>
              )}
              {selected.rejectionReason && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 8, marginTop: 8, fontSize: 13, color: '#b91c1c' }}>
                  Rejected: {selected.rejectionReason}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                Submitted {selected.submittedAt ? format(new Date(selected.submittedAt), 'MMMM d, yyyy') : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stage Modal */}
      {showStageModal && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowStageModal(false)}>
          <div className="modal animate-slide">
            <div className="modal-header">
              <h3 className="modal-title">Move Application Stage</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowStageModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Stage</label>
                <select className="form-input" value={newStage} onChange={e => setNewStage(e.target.value)}>
                  {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea className="form-input" rows={3} value={stageRemarks} onChange={e => setStageRemarks(e.target.value)} placeholder="Optional notes..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStageModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={moveStage} disabled={updating}>{updating ? 'Moving...' : 'Move Stage'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
