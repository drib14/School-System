import { useState, useEffect } from 'react';
import { BookOpen, ClipboardList, MessageSquare, Plus, Search, Play, CheckCircle, Clock, X, Eye, Upload, Edit2, BarChart2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const TYPE_COLOR = { quiz: 'badge-blue', exam: 'badge-red', activity: 'badge-green', assignment: 'badge-yellow' };

export default function LMSPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('lessons');
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('lesson');

  const isTeacher = ['teacher', 'registrar', 'principal', 'super_admin'].includes(user?.role);
  const isStudent = user?.role === 'student';

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'lessons') {
        const { data } = await api.get('/lms/lessons');
        setLessons(data.lessons || []);
      } else if (activeTab === 'quizzes') {
        const { data } = await api.get('/lms/quizzes');
        setQuizzes(data.quizzes || []);
      } else if (activeTab === 'assignments') {
        const { data } = await api.get('/lms/assignments');
        setAssignments(data.assignments || []);
      } else if (activeTab === 'discussions') {
        const { data } = await api.get('/lms/discussions');
        setDiscussions(data.discussions || []);
      }
    } catch { } finally { setLoading(false); }
  };

  const publishLesson = async (id) => {
    try {
      await api.put(`/lms/lessons/${id}/publish`);
      toast.success('Lesson published');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const markLessonComplete = async (id) => {
    try {
      await api.post(`/lms/lessons/${id}/complete`);
      toast.success('Lesson marked complete');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const TABS = [
    { id: 'lessons', label: '📚 Lessons', count: lessons.length },
    { id: 'quizzes', label: '📝 Quizzes', count: quizzes.length },
    { id: 'assignments', label: '📋 Assignments', count: assignments.length },
    { id: 'discussions', label: '💬 Discussions', count: discussions.length },
  ];

  const filtered = {
    lessons: lessons.filter(l => !search || l.title?.toLowerCase().includes(search.toLowerCase())),
    quizzes: quizzes.filter(q => !search || q.title?.toLowerCase().includes(search.toLowerCase())),
    assignments: assignments.filter(a => !search || a.title?.toLowerCase().includes(search.toLowerCase())),
    discussions: discussions.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase())),
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Learning Management System</h1>
          <p className="page-sub">Lessons, Quizzes, Assignments & Discussions</p>
        </div>
        {isTeacher && (
          <div className="page-actions">
            <button className="btn btn-primary btn-sm" onClick={() => { setModalType(activeTab.slice(0, -1)); setShowModal(true); }}>
              <Plus size={14} /> New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab.id} className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label} {tab.count > 0 && <span className="badge badge-gray" style={{ marginLeft: 4, fontSize: 10 }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder={`Search ${activeTab}...`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* LESSONS */}
      {activeTab === 'lessons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="card"><div style={{ padding: 16 }}><div className="skeleton" style={{ height: 120, borderRadius: 8, marginBottom: 12 }} /><div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} /><div className="skeleton" style={{ height: 12, width: '90%' }} /></div></div>) :
            filtered.lessons.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
                <BookOpen size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
                <div style={{ color: 'var(--text-muted)' }}>No lessons yet</div>
              </div>
            ) : filtered.lessons.map(lesson => (
              <div key={lesson._id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelected(lesson)}>
                <div style={{ height: 8, background: lesson.isPublished ? 'var(--primary)' : 'var(--border-color)' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="badge badge-blue">{lesson.type}</span>
                    {lesson.isPublished ? <span className="badge badge-green">Published</span> : <span className="badge badge-gray">Draft</span>}
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>{lesson.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lesson.description}</p>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{lesson.teacher?.firstName} {lesson.teacher?.lastName}</span>
                    <span><Eye size={11} style={{ display: 'inline' }} /> {lesson.views || 0}</span>
                  </div>
                  {(lesson.attachments || []).length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>{lesson.attachments.length} attachment(s)</div>
                  )}
                  {isTeacher && !lesson.isPublished && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={e => { e.stopPropagation(); publishLesson(lesson._id); }}>
                      Publish
                    </button>
                  )}
                  {isStudent && (
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={e => { e.stopPropagation(); markLessonComplete(lesson._id); }}>
                      {lesson.completions?.some(c => c.student === user._id) ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* QUIZZES */}
      {activeTab === 'quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card" style={{ padding: 16 }}><div className="skeleton" style={{ height: 60 }} /></div>) :
            filtered.quizzes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ color: 'var(--text-muted)' }}>No quizzes yet</div>
              </div>
            ) : filtered.quizzes.map(quiz => (
              <div key={quiz._id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span className={`badge ${TYPE_COLOR[quiz.type] || 'badge-blue'}`}>{quiz.type}</span>
                      {quiz.isPublished ? <span className="badge badge-green">Open</span> : <span className="badge badge-gray">Draft</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{quiz.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {quiz.questions?.length || 0} questions · {quiz.totalPoints || 0} pts · Passing: {quiz.passingScore}%
                      {quiz.timeLimit && ` · ${quiz.timeLimit} min`}
                    </div>
                    {quiz.openAt && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Opens: {format(new Date(quiz.openAt), 'MMM d, h:mm a')}</div>}
                    {quiz.closeAt && <div style={{ fontSize: 11, color: quiz.closeAt < new Date() ? 'var(--danger)' : 'var(--text-muted)', marginTop: 2 }}>Closes: {format(new Date(quiz.closeAt), 'MMM d, h:mm a')}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(quiz)}><Eye size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card" style={{ padding: 16 }}><div className="skeleton" style={{ height: 60 }} /></div>) :
            filtered.assignments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ color: 'var(--text-muted)' }}>No assignments yet</div></div>
            ) : filtered.assignments.map(asgn => {
              const isPastDue = asgn.dueDate && new Date(asgn.dueDate) < new Date();
              return (
                <div key={asgn._id} className="card" style={{ padding: '14px 16px', borderLeft: isPastDue ? '3px solid var(--danger)' : '3px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        {asgn.isPublished ? <span className="badge badge-green">Open</span> : <span className="badge badge-gray">Draft</span>}
                        {isPastDue && <span className="badge badge-red">Past Due</span>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{asgn.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Max Score: {asgn.maxScore} pts · Due: {asgn.dueDate ? format(new Date(asgn.dueDate), 'MMM d, yyyy h:mm a') : 'No deadline'}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-icon"><Eye size={13} /></button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* DISCUSSIONS */}
      {activeTab === 'discussions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card" style={{ padding: 16 }}><div className="skeleton" style={{ height: 60 }} /></div>) :
            filtered.discussions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ color: 'var(--text-muted)' }}>No discussions yet</div></div>
            ) : filtered.discussions.map(disc => (
              <div key={disc._id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      {disc.isPinned && <span className="badge badge-yellow">📌 Pinned</span>}
                      {disc.isClosed && <span className="badge badge-gray">Closed</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{disc.title}</div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{disc.content}</p>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      {disc.author?.firstName} {disc.author?.lastName} · {disc.replies?.length || 0} replies · {disc.views || 0} views
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(disc)}>View</button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
