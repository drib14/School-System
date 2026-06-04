import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Eye, Edit2, Send, ThumbsUp } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const GRADE_REMARKS_COLOR = { Passed: 'badge-green', Failed: 'badge-red', Incomplete: 'badge-yellow', Dropped: 'badge-gray', INC: 'badge-yellow' };

function GradeRow({ grade, onEdit, onView, canEdit }) {
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{grade.student?.firstName} {grade.student?.lastName}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{grade.student?.studentId}</div>
      </td>
      <td><span style={{ fontSize: 13 }}>{grade.subject?.name}</span><br/><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{grade.subject?.code}</span></td>
      <td style={{ textAlign: 'center' }}>{grade.quizAverage?.toFixed(1) || '—'}</td>
      <td style={{ textAlign: 'center' }}>{grade.activityAverage?.toFixed(1) || '—'}</td>
      <td style={{ textAlign: 'center' }}>{grade.projectAverage?.toFixed(1) || '—'}</td>
      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, color: grade.finalRating >= 75 ? 'var(--success)' : 'var(--danger)' }}>
        {grade.finalRating?.toFixed(2) || '—'}
      </td>
      <td>
        <span className={`badge ${GRADE_REMARKS_COLOR[grade.remarks] || 'badge-gray'}`}>{grade.remarks || '—'}</span>
      </td>
      <td>
        <span className={`badge ${grade.status === 'released' ? 'badge-green' : grade.status === 'approved' ? 'badge-blue' : grade.status === 'submitted' ? 'badge-yellow' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
          {grade.status}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onView(grade)}><Eye size={13} /></button>
          {canEdit && grade.status === 'draft' && <button className="btn btn-ghost btn-sm" onClick={() => onEdit(grade)}><Edit2 size={13} /></button>}
        </div>
      </td>
    </tr>
  );
}

function GradeModal({ grade, onClose, onSave, isNew }) {
  const [components, setComponents] = useState(grade?.components || [
    { name: 'Quiz 1', category: 'quiz', score: 0, maxScore: 100, weight: 20 },
    { name: 'Midterm Exam', category: 'exam', score: 0, maxScore: 100, weight: 40 },
    { name: 'Final Exam', category: 'exam', score: 0, maxScore: 100, weight: 40 },
  ]);
  const [loading, setLoading] = useState(false);

  const addComponent = () => setComponents(c => [...c, { name: '', category: 'quiz', score: 0, maxScore: 100 }]);
  const updateComponent = (i, field, val) => setComponents(c => c.map((item, idx) => idx === i ? { ...item, [field]: field === 'score' || field === 'maxScore' ? Number(val) : val } : item));
  const removeComponent = (i) => setComponents(c => c.filter((_, idx) => idx !== i));

  const totalScore = components.reduce((sum, c) => sum + (c.maxScore > 0 ? (c.score / c.maxScore) * 100 * (c.weight || 1) : 0), 0) / (components.reduce((s, c) => s + (c.weight || 1), 0) || 1);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/grades/${grade._id}`, { components });
      toast.success('Grade updated');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">Grade Components — {grade.student?.firstName} {grade.student?.lastName}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Subject: <strong>{grade.subject?.name}</strong></span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Computed Rating: <strong style={{ color: totalScore >= 75 ? 'var(--success)' : 'var(--danger)', fontSize: 15 }}>{totalScore.toFixed(2)}</strong></span>
          <span className={`badge ${totalScore >= 75 ? 'badge-green' : 'badge-red'}`}>{totalScore >= 75 ? 'Passed' : 'Failed'}</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Category</th>
                <th>Score</th>
                <th>Max Score</th>
                <th>%</th>
                <th>Weight</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {components.map((c, i) => (
                <tr key={i}>
                  <td><input className="form-input" style={{ width: 130 }} value={c.name} onChange={e => updateComponent(i, 'name', e.target.value)} /></td>
                  <td>
                    <select className="form-input" style={{ width: 110 }} value={c.category} onChange={e => updateComponent(i, 'category', e.target.value)}>
                      {['quiz','activity','assignment','project','exam','participation'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </td>
                  <td><input className="form-input" type="number" style={{ width: 70 }} min={0} max={c.maxScore} value={c.score} onChange={e => updateComponent(i, 'score', e.target.value)} /></td>
                  <td><input className="form-input" type="number" style={{ width: 70 }} value={c.maxScore} onChange={e => updateComponent(i, 'maxScore', e.target.value)} /></td>
                  <td style={{ fontWeight: 600, color: c.maxScore > 0 ? (c.score/c.maxScore >= 0.75 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                    {c.maxScore > 0 ? ((c.score / c.maxScore) * 100).toFixed(1) : '—'}%
                  </td>
                  <td><input className="form-input" type="number" style={{ width: 60 }} value={c.weight || ''} onChange={e => updateComponent(i, 'weight', e.target.value)} /></td>
                  <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeComponent(i)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={addComponent} style={{ marginTop: 8 }}>+ Add Component</button>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Grades'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GradesPage() {
  const { user } = useAuthStore();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', semester: '1st', academicYear: '2025-2026' });
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filter);
      const endpoint = isStudent ? '/grades/me' : '/grades';
      const { data } = await api.get(`${endpoint}?${params}`);
      setGrades(data.grades || []);
    } catch { toast.error('Failed to load grades'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGrades(); }, [filter]);

  const submitGrade = async (gradeId) => {
    try {
      await api.put(`/grades/${gradeId}/submit`);
      toast.success('Grade submitted for approval');
      fetchGrades();
    } catch { toast.error('Failed to submit'); }
  };

  const approveGrade = async (gradeId) => {
    try {
      await api.put(`/grades/${gradeId}/approve`);
      toast.success('Grade approved');
      fetchGrades();
    } catch { toast.error('Failed to approve'); }
  };

  // Student view — simple grade card list
  if (isStudent) {
    return (
      <div>
        <div className="page-header">
          <div><h1 className="page-title">My Grades (Transmuted)</h1></div>
        </div>
        <div className="filter-bar">
          <select className="filter-select" value={filter.semester} onChange={e => setFilter(p => ({ ...p, semester: e.target.value }))}>
            <option value="1st">1st Semester</option><option value="2nd">2nd Semester</option><option value="Summer">Summer</option>
          </select>
          <select className="filter-select" value={filter.academicYear} onChange={e => setFilter(p => ({ ...p, academicYear: e.target.value }))}>
            <option>2025-2026</option><option>2024-2025</option>
          </select>
        </div>
        <div className="grid-3">
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: 100 }} />) :
          grades.map(g => {
            const rating = g.finalRating || 0;
            let transmuted = rating;
            if (rating >= 96) transmuted = 1.0;
            else if (rating >= 90) transmuted = 1.5;
            else if (rating >= 85) transmuted = 2.0;
            else if (rating >= 80) transmuted = 2.5;
            else if (rating >= 75) transmuted = 3.0;
            else transmuted = 5.0;

            return (
              <div key={g._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{g.subject?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.subject?.code} · {g.subject?.units} units</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Raw Grade</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>{rating.toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Transmuted Grade</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: rating >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                      {transmuted.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span className={`badge ${g.remarks === 'Passed' ? 'badge-green' : 'badge-red'}`}>{g.remarks || (rating >= 75 ? 'Passed' : 'Failed')}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Grading System</h1><p className="page-sub">{grades.length} grade records</p></div>
        <div className="page-actions">
          <select className="filter-select" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            {['draft','submitted','approved','released'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={filter.semester} onChange={e => setFilter(p => ({ ...p, semester: e.target.value }))}>
            <option value="1st">1st Sem</option><option value="2nd">2nd Sem</option><option value="Summer">Summer</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th><th>Subject</th><th>Quiz Avg</th><th>Activity Avg</th>
                <th>Project Avg</th><th>Final Rating</th><th>Remarks</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
              )) : grades.length === 0 ? (
                <tr><td colSpan={9} className="table-empty">No grade records found</td></tr>
              ) : grades.map(g => (
                <GradeRow key={g._id} grade={g} onEdit={setEditing} onView={setViewing}
                  canEdit={isTeacher || ['registrar','principal','super_admin'].includes(user?.role)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <GradeModal grade={editing} onClose={() => setEditing(null)} onSave={() => { setEditing(null); fetchGrades(); }} />}
    </div>
  );
}
