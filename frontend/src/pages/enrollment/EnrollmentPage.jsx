import { useState, useEffect } from 'react';
import { Plus, Eye, CheckCircle, Clock, XCircle, ArrowRight, BookOpen, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const STATUS_COLORS = {
  pending: 'badge-yellow', under_review: 'badge-blue', for_assessment: 'badge-blue',
  assessed: 'badge-purple', for_payment: 'badge-yellow', payment_pending: 'badge-yellow',
  enrolled: 'badge-green', cancelled: 'badge-red', rejected: 'badge-red',
};

const WORKFLOW_STEPS = ['application','verification','assessment','payment','subject_assignment','confirmation'];

function EnrollmentCard({ enrollment, onClick }) {
  const student = enrollment.student;
  const completedSteps = enrollment.steps?.filter(s => s.status === 'completed').length || 0;
  const progress = (completedSteps / WORKFLOW_STEPS.length) * 100;

  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(23, 27, 43, 0.4)', backdropFilter: 'blur(12px)' }}
      onClick={() => onClick(enrollment)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {student?.firstName} {student?.lastName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {enrollment.enrollmentNumber} · {student?.studentId}
          </div>
        </div>
        <span className={`badge ${STATUS_COLORS[enrollment.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
          {enrollment.status?.replace(/_/g, ' ')}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
        {enrollment.program?.name || enrollment.gradeLevel} · {enrollment.semester} Sem · {enrollment.academicYear}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{completedSteps}/{WORKFLOW_STEPS.length}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: enrollment.status === 'enrolled' ? 'var(--success)' : 'var(--primary-light)', borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
}

function EnrollmentDetailModal({ enrollment, onClose, onUpdate, isStudent }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(enrollment.status);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    api.get('/academics/subjects').then(({ data }) => setAvailableSubjects(data.subjects || []));
  }, []);

  const updateStatus = async (newStatus, step) => {
    setLoading(true);
    try {
      await api.put(`/enrollment/${enrollment._id}/status`, { status: newStatus, step });
      setStatus(newStatus);
      toast.success('Enrollment updated');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const student = enrollment.student;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl animate-slide" style={{ background: 'rgba(15, 17, 26, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Enrollment Details</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {enrollment.enrollmentNumber} · {student?.firstName} {student?.lastName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge ${STATUS_COLORS[status] || 'badge-gray'}`}>{status?.replace(/_/g, ' ')}</span>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="steps" style={{ marginBottom: 28 }}>
          {WORKFLOW_STEPS.map((step, i) => {
            const stepData = enrollment.steps?.find(s => s.step === step);
            const isCompleted = stepData?.status === 'completed';
            const isCurrent = !isCompleted && enrollment.steps?.filter(s => s.status === 'completed').length === i;
            return (
              <div key={step} className={`step ${isCompleted ? 'completed' : isCurrent ? 'active' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? <CheckCircle size={14} /> : i + 1}
                </div>
                <div className="step-label" style={{ textTransform: 'capitalize', fontSize: 9 }}>
                  {step.replace(/_/g, ' ')}
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <div className="step-line" />}
              </div>
            );
          })}
        </div>

        <div className="grid-2">
          {/* Student Info */}
          <div className="card" style={{ padding: 14, background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--blue-400)', fontSize: 13 }}>Student Information</div>
            {[
              ['Name', `${student?.firstName} ${student?.lastName}`],
              ['Student ID', student?.studentId],
              ['Email', student?.email],
              ['Program', enrollment.program?.name],
              ['Year Level', enrollment.yearLevel],
              ['Section', enrollment.section],
              ['Enrollment Type', enrollment.type],
              ['Total Units', enrollment.totalUnits],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{l}:</span>
                <span style={{ fontWeight: 600 }}>{v || '—'}</span>
              </div>
            ))}
          </div>

          {/* Enrolled Subjects */}
          <div className="card" style={{ padding: 14, background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--blue-400)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} /> Enrolled Subjects ({enrollment.subjects?.length || 0})
            </div>
            {enrollment.subjects?.length === 0 ? (
              <div className="text-muted text-sm">No subjects assigned yet</div>
            ) : enrollment.subjects?.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span>{s.subject?.name || s.subject}</span>
                <span style={{ color: 'var(--text-muted)' }}>{s.units} units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Hidden for Students */}
        {!isStudent && (
          <div style={{ marginTop: 16, padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>
              Update enrollment status:
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowDocs(true)}>
              <FileText size={13} /> View Documents
            </button>
            {status === 'pending' && (
              <button className="btn btn-secondary btn-sm" onClick={() => updateStatus('under_review', 'verification')} disabled={loading}>
                <Eye size={13} /> Start Review
              </button>
            )}
            {status === 'under_review' && (
              <button className="btn btn-secondary btn-sm" onClick={() => updateStatus('for_assessment', 'assessment')} disabled={loading}>
                <ArrowRight size={13} /> For Assessment
              </button>
            )}
            {(status === 'for_assessment' || status === 'assessed') && (
              <button className="btn btn-primary btn-sm" onClick={() => updateStatus('for_payment', 'payment')} disabled={loading}>
                <ArrowRight size={13} /> For Payment
              </button>
            )}
            {(status === 'for_payment' || status === 'under_review') && (
              <button className="btn btn-success btn-sm" onClick={() => updateStatus('enrolled', 'confirmation')} disabled={loading}>
                <CheckCircle size={13} /> Confirm Enrollment
              </button>
            )}
            {!['enrolled','cancelled','rejected'].includes(status) && (
              <button className="btn btn-danger btn-sm" onClick={() => updateStatus('rejected')} disabled={loading}>
                <XCircle size={13} /> Reject
              </button>
            )}
          </div>
        )}
      </div>

      {showDocs && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={e => { e.stopPropagation(); e.target === e.currentTarget && setShowDocs(false); }}>
          <div className="modal animate-slide" style={{ background: 'rgba(15, 17, 26, 0.98)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">Student Documents</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDocs(false)}>✕</button>
            </div>
            <div style={{ padding: '0 0 20px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Review the documents submitted by {student?.firstName} for enrollment.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {['Form 138 (Report Card)', 'Certificate of Good Moral Character', 'PSA / NSO Birth Certificate', '2x2 ID Picture'].map(doc => (
                  <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={16} style={{ color: 'var(--blue-400)' }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{doc}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast.success(`Viewing ${doc}`)}>
                      <Eye size={12} /> View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EnrollmentPage() {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ status: '', semester: '', academicYear: '' });
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('cards'); // 'cards' | 'table'

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const endpoint = isStudent ? '/enrollment/me' : '/enrollment';
      const params = new URLSearchParams({ limit: 30, ...filter });
      const { data } = await api.get(`${endpoint}?${params}`);
      if (isStudent) {
        setEnrollments(data.enrollment ? [data.enrollment] : []);
        setTotal(data.enrollment ? 1 : 0);
      } else {
        setEnrollments(data.enrollments || []);
        setTotal(data.total || 0);
      }
    } catch {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, [filter]);

  const statusCounts = {
    all: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    enrolled: enrollments.filter(e => e.status === 'enrolled').length,
    for_payment: enrollments.filter(e => ['for_payment','payment_pending'].includes(e.status)).length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isStudent ? 'My Enrollment Status' : 'Enrollment Management'}</h1>
          <p className="page-sub">{total} enrollment records</p>
        </div>
        {!isStudent && (
          <div className="page-actions">
            <button className="btn btn-primary">
              <Plus size={15} /> New Enrollment
            </button>
          </div>
        )}
      </div>

      {/* Status Summary Cards - Hidden for Students */}
      {!isStudent && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total', value: statusCounts.all, color: 'blue' },
            { label: 'Pending Review', value: statusCounts.pending, color: 'gold' },
            { label: 'For Payment', value: statusCounts.for_payment, color: 'purple' },
            { label: 'Enrolled', value: statusCounts.enrolled, color: 'green' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`stat-card ${color}`} style={{ padding: '14px 16px' }}>
              <div className="stat-value" style={{ fontSize: 24 }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters - Hidden for Students */}
      {!isStudent && (
        <div className="filter-bar">
          <select className="filter-select" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            {['pending','under_review','for_assessment','assessed','for_payment','enrolled','cancelled','rejected'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select className="filter-select" value={filter.semester} onChange={e => setFilter(p => ({ ...p, semester: e.target.value }))}>
            <option value="">All Semesters</option>
            <option value="1st">1st Semester</option>
            <option value="2nd">2nd Semester</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
      )}

      {/* Cards/Table */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 4, borderRadius: 2 }} />
            </div>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <CheckCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
          <div style={{ color: 'var(--text-muted)' }}>No enrollments found</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {enrollments.map(e => (
            <EnrollmentCard key={e._id} enrollment={e} onClick={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <EnrollmentDetailModal
          enrollment={selected}
          onClose={() => setSelected(null)}
          onUpdate={fetchEnrollments}
        />
      )}
    </div>
  );
}
