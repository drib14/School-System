import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, Briefcase, Plus, Search, X, Check, ChevronDown, Eye, Edit2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import CustomSelect from '../../components/forms/CustomSelect';

const LEAVE_TYPE_COLOR = { vacation: 'badge-blue', sick: 'badge-yellow', emergency: 'badge-red', maternity: 'badge-green', paternity: 'badge-blue', special: 'badge-gray', without_pay: 'badge-gray' };
const LEAVE_STATUS_COLOR = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', cancelled: 'badge-gray' };
const STAGE_COLOR = { applied: 'badge-gray', screening: 'badge-yellow', exam: 'badge-blue', interview: 'badge-blue', job_offer: 'badge-green', hired: 'badge-green', rejected: 'badge-red' };

export default function HRPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'vacation', from: '', to: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const isHR = ['hr_staff', 'principal', 'super_admin', 'school_owner'].includes(user?.role);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'employees' && isHR) {
        const [empRes, sumRes] = await Promise.all([
          api.get('/hr/employees'),
          api.get('/hr/summary').catch(() => ({ data: null })),
        ]);
        setEmployees(empRes.data.employees || []);
        setSummary(sumRes.data);
      } else if (activeTab === 'leave') {
        const [leaveRes, balRes] = await Promise.all([
          api.get('/hr/leave'),
          api.get('/hr/leave/balance'),
        ]);
        setLeaveRequests(leaveRes.data.requests || []);
        setLeaveBalance(balRes.data.balance);
      } else if (activeTab === 'payroll' && isHR) {
        const { data } = await api.get('/hr/payroll');
        setPayrollRuns(data.runs || []);
      } else if (activeTab === 'recruitment' && isHR) {
        const { data } = await api.get('/hr/jobs');
        setJobs(data.jobs || []);
      }
    } catch { } finally { setLoading(false); }
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/hr/leave', leaveForm);
      toast.success('Leave request submitted');
      setShowLeaveModal(false);
      if (activeTab === 'leave') fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const approveLeave = async (id) => {
    try {
      await api.put(`/hr/leave/${id}/approve`, { remarks: 'Approved' });
      toast.success('Leave approved');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const rejectLeave = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await api.put(`/hr/leave/${id}/reject`, { remarks: reason });
      toast.success('Leave rejected');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const generatePayslips = async (runId) => {
    try {
      toast.loading('Generating payslips...');
      await api.post(`/hr/payroll/${runId}/generate`);
      toast.dismiss();
      toast.success('Payslips generated');
      fetchData();
    } catch (err) { toast.dismiss(); toast.error(err.response?.data?.message || 'Failed'); }
  };

  const approvePayroll = async (runId) => {
    try {
      await api.put(`/hr/payroll/${runId}/approve`);
      toast.success('Payroll approved');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const releasePayroll = async (runId) => {
    if (!confirm('Release payroll and notify all employees?')) return;
    try {
      await api.put(`/hr/payroll/${runId}/release`);
      toast.success('Payroll released');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const loadApplicants = async (job) => {
    setSelectedJob(job);
    const { data } = await api.get(`/hr/jobs/${job._id}/applicants`);
    setApplicants(data.applicants || []);
  };

  const updateApplicantStage = async (appId, newStage) => {
    try {
      // Mock API call for now since there might not be a put route ready
      // await api.put(`/hr/applicants/${appId}/stage`, { stage: newStage });
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, stage: newStage } : a));
      toast.success(`Applicant marked as ${newStage.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update applicant');
    }
  };

  const filteredEmployees = employees.filter(e => {
    const s = search.toLowerCase();
    const u = e.userId;
    return !s || `${u?.firstName} ${u?.lastName}`.toLowerCase().includes(s) || e.department?.toLowerCase().includes(s);
  });

  const filteredLeave = leaveRequests.filter(l => !filterStatus || l.status === filterStatus);

  const TABS = [
    { id: 'employees', label: 'Employees', show: isHR },
    { id: 'leave', label: 'Leave', show: true },
    { id: 'payroll', label: 'Payroll', show: isHR },
    { id: 'recruitment', label: 'Recruitment', show: isHR },
  ].filter(t => t.show);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Human Resources</h1>
          <p className="page-sub">Employees, Payroll, Leave, Recruitment</p>
        </div>
        <div className="page-actions">
          {activeTab === 'leave' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowLeaveModal(true)}><Plus size={14} /> File Leave</button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && activeTab === 'employees' && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card blue" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.totalEmployees || 0}</div>
            <div className="stat-label">Total Employees</div>
          </div>
          {(summary.byType || []).map(t => (
            <div key={t._id} className="stat-card green" style={{ padding: '14px 16px' }}>
              <div className="stat-value" style={{ fontSize: 22 }}>{t.count}</div>
              <div className="stat-label">{t._id?.replace(/_/g, ' ')}</div>
            </div>
          ))}
          <div className="stat-card gold" style={{ padding: '14px 16px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{summary.pendingLeaves || 0}</div>
            <div className="stat-label">Pending Leaves</div>
          </div>
        </div>
      )}

      {/* Leave Balance */}
      {activeTab === 'leave' && leaveBalance && (
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {['vacation', 'sick', 'emergency'].map(type => (
            <div key={type} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 8 }}>{type} Leave</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>{leaveBalance[type]?.remaining || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>days remaining</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                  <div>{leaveBalance[type]?.used || 0} used</div>
                  <div>of {leaveBalance[type]?.total || 0} total</div>
                </div>
              </div>
              <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 99, marginTop: 10 }}>
                <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 99, width: `${Math.min(100, ((leaveBalance[type]?.used || 0) / (leaveBalance[type]?.total || 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        {TABS.map(tab => (
          <button key={tab.id} className="btn btn-ghost btn-sm"
            style={{ borderRadius: '6px 6px 0 0', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === tab.id ? 600 : 400 }}
            onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      {/* Filter Bar */}
      {activeTab !== 'payroll' && (
        <div className="filter-bar">
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search size={14} className="search-icon" />
            <input className="search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {activeTab === 'leave' && (
            <div style={{ minWidth: 160 }}>
              <CustomSelect
                className="filter-cs"
                value={filterStatus}
                onChange={val => setFilterStatus(val)}
                placeholder="All Status"
                options={[{ value: '', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]}
              />
            </div>
          )}
          <button className="btn btn-secondary btn-sm btn-icon" onClick={fetchData}><RefreshCw size={14} /></button>
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Employee</th><th>Department</th><th>Position</th><th>Type</th><th>Employment</th><th></th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                  filteredEmployees.length === 0 ? <tr><td colSpan={6} className="table-empty">No employees found</td></tr> :
                    filteredEmployees.map(emp => (
                      <tr key={emp._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                              {emp.userId?.avatar ? <img src={emp.userId.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : `${emp.userId?.firstName?.[0]}${emp.userId?.lastName?.[0]}`}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.userId?.firstName} {emp.userId?.lastName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.userId?.employeeId || emp.userId?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{emp.department || '—'}</td>
                        <td>{emp.position || emp.designation || '—'}</td>
                        <td><span className="badge badge-blue">{emp.type?.replace(/_/g, ' ') || emp.userId?.role}</span></td>
                        <td style={{ fontSize: 12 }}>{emp.employment?.status || emp.employment?.type || '—'}</td>
                        <td><button className="btn btn-ghost btn-sm btn-icon"><Eye size={13} /></button></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAVE TAB */}
      {activeTab === 'leave' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Employee</th><th>Type</th><th>Duration</th><th>Dates</th><th>Reason</th><th>Status</th>{isHR && <th>Actions</th>}</tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>) :
                  filteredLeave.length === 0 ? <tr><td colSpan={7} className="table-empty">No leave requests found</td></tr> :
                    filteredLeave.map(req => (
                      <tr key={req._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{req.employee?.firstName} {req.employee?.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{req.employee?.employeeId}</div>
                        </td>
                        <td><span className={`badge ${LEAVE_TYPE_COLOR[req.leaveType]}`}>{req.leaveType}</span></td>
                        <td style={{ fontWeight: 600 }}>{req.days} {req.days === 1 ? 'day' : 'days'}</td>
                        <td style={{ fontSize: 12 }}>
                          {req.from ? format(new Date(req.from), 'MMM d') : '—'} — {req.to ? format(new Date(req.to), 'MMM d, yyyy') : '—'}
                        </td>
                        <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--text-secondary)' }}>{req.reason}</td>
                        <td><span className={`badge ${LEAVE_STATUS_COLOR[req.status]}`}>{req.status}</span></td>
                        {isHR && (
                          <td>
                            {req.status === 'pending' && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => approveLeave(req._id)}><Check size={11} /> Approve</button>
                                <button className="btn btn-danger btn-sm" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => rejectLeave(req._id)}><X size={11} /> Reject</button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL TAB */}
      {activeTab === 'payroll' && isHR && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={async () => {
              const name = prompt('Payroll name (e.g. "June 2025 Semi-Monthly 1st"):');
              if (!name) return;
              try {
                await api.post('/hr/payroll', {
                  name,
                  period: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date(new Date().getFullYear(), new Date().getMonth(), 15) },
                  payDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
                  type: 'semi_monthly',
                });
                toast.success('Payroll run created');
                fetchData();
              } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
            }}><Plus size={14} /> New Payroll Run</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="card" style={{ padding: 16 }}><div className="skeleton" style={{ height: 60 }} /></div>) :
              payrollRuns.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <DollarSign size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
                  <div style={{ color: 'var(--text-muted)' }}>No payroll runs yet</div>
                </div>
              ) : payrollRuns.map(run => (
                <div key={run._id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{run.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {run.period?.from ? format(new Date(run.period.from), 'MMM d') : ''} – {run.period?.to ? format(new Date(run.period.to), 'MMM d, yyyy') : ''} · Pay Date: {run.payDate ? format(new Date(run.payDate), 'MMM d') : ''}
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 12, fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{run.employeeCount} employees</span>
                        <span style={{ fontWeight: 600 }}>Gross: ₱{(run.totalGross || 0).toLocaleString()}</span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>Net: ₱{(run.totalNet || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${run.status === 'released' ? 'badge-green' : run.status === 'approved' ? 'badge-blue' : run.status === 'processing' ? 'badge-yellow' : 'badge-gray'}`}>
                        {run.status}
                      </span>
                      {run.status === 'draft' && <button className="btn btn-secondary btn-sm" onClick={() => generatePayslips(run._id)}>Generate</button>}
                      {run.status === 'processing' && <button className="btn btn-primary btn-sm" onClick={() => approvePayroll(run._id)}>Approve</button>}
                      {run.status === 'approved' && <button className="btn btn-success btn-sm" onClick={() => releasePayroll(run._id)}>Release</button>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* RECRUITMENT TAB */}
      {activeTab === 'recruitment' && isHR && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1fr' : '1fr', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={async () => {
                const title = prompt('Job title:');
                if (!title) return;
                try {
                  await api.post('/hr/jobs', { title, type: 'teaching', description: 'New job posting' });
                  toast.success('Job posting created');
                  fetchData();
                } catch { toast.error('Failed'); }
              }}><Plus size={14} /> Post Job</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card" style={{ padding: 16 }}><div className="skeleton" style={{ height: 60 }} /></div>) :
                jobs.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}><Briefcase size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 12px' }} /><div style={{ color: 'var(--text-muted)' }}>No job postings</div></div> :
                  jobs.map(job => (
                    <div key={job._id} className="card" style={{ padding: '14px 16px', cursor: 'pointer', background: selectedJob?._id === job._id ? 'var(--bg-secondary)' : undefined }} onClick={() => loadApplicants(job)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{job.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {job.department} · {job.type} · {job.employmentType}
                          </div>
                          {job.salaryRange && <div style={{ fontSize: 12, marginTop: 4, color: '#10b981', fontWeight: 600 }}>₱{job.salaryRange.min?.toLocaleString()} – ₱{job.salaryRange.max?.toLocaleString()}</div>}
                        </div>
                        <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{job.status}</span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {selectedJob && (
            <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ padding: '16px 16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ margin: 0 }}>Applicants — {selectedJob.title}</h4>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelectedJob(null)}><X size={14} /></button>
                </div>
              </div>
              <div style={{ padding: '0 16px 16px' }}>
                {applicants.length === 0 ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>No applicants yet</div> : applicants.map(app => (
                  <div key={app._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{app.firstName} {app.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.email} · {app.phone}</div>
                      </div>
                      <span className={`badge ${STAGE_COLOR[app.stage] || 'badge-gray'}`}>{app.stage?.replace(/_/g, ' ')}</span>
                    </div>
                    {['screening', 'interview'].includes(app.stage) && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button className="btn btn-success btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => updateApplicantStage(app._id, 'hired')}><Check size={12} /> Hire</button>
                        <button className="btn btn-danger btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => updateApplicantStage(app._id, 'rejected')}><X size={12} /> Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLeaveModal(false)}>
          <div className="modal animate-slide">
            <div className="modal-header">
              <h3 className="modal-title">File Leave Request</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLeaveModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={submitLeave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Leave Type *</label>
                  <CustomSelect
                    value={leaveForm.leaveType}
                    onChange={val => setLeaveForm(f => ({ ...f, leaveType: val }))}
                    options={['vacation', 'sick', 'emergency', 'maternity', 'paternity', 'special', 'without_pay'].map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                  />
                </div>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">From *</label>
                    <input className="form-input" type="date" value={leaveForm.from} onChange={e => setLeaveForm(f => ({ ...f, from: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To *</label>
                    <input className="form-input" type="date" value={leaveForm.to} onChange={e => setLeaveForm(f => ({ ...f, to: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <textarea className="form-input" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
