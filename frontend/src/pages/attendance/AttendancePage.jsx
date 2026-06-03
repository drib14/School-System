import { useState, useEffect, useRef } from 'react';
import { UserCheck, QrCode, Calendar, BarChart3, Check, X, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const STATUS_CONFIG = {
  present: { color: 'badge-green', icon: Check },
  absent: { color: 'badge-red', icon: X },
  late: { color: 'badge-yellow', icon: Clock },
  excused: { color: 'badge-blue', icon: Check },
  half_day: { color: 'badge-purple', icon: Check },
};

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState({ date: format(new Date(), 'yyyy-MM-dd') });
  const [activeTab, setActiveTab] = useState('records');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [showQR, setShowQR] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchData();
    if (isTeacher) fetchClasses();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filter);
      if (isStudent) params.set('studentId', user._id);
      const [attRes, sumRes] = await Promise.all([
        api.get(`/attendance?${params}`),
        api.get(`/attendance/summary?${params}`),
      ]);
      setRecords(attRes.data.records || []);
      setSummary(sumRes.data.summary);
    } catch { } finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/academics/schedules');
      setClasses(data.schedules || []);
      if (data.schedules?.length > 0) setSelectedClass(data.schedules[0]._id);
    } catch { }
  };

  const loadStudentsForClass = async (scheduleId) => {
    try {
      const { data } = await api.get(`/academics/schedules`);
      const sched = data.schedules?.find(s => s._id === scheduleId);
      if (sched?.enrolledStudents) {
        setAttendanceList(sched.enrolledStudents.map(s => ({
          student: s, status: 'present',
        })));
      }
    } catch { }
  };

  useEffect(() => { if (selectedClass) loadStudentsForClass(selectedClass); }, [selectedClass]);

  const submitAttendance = async () => {
    if (!selectedClass) return toast.error('Select a class first');
    try {
      await api.post('/attendance', {
        scheduleId: selectedClass,
        date: filter.date,
        attendanceRecords: attendanceList.map(a => ({ student: a.student._id || a.student, status: a.status })),
        method: 'manual',
      });
      toast.success('Attendance saved!');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Attendance</h1></div>
        <div className="page-actions">
          {isTeacher && (
            <>
              <button className={`btn btn-sm ${activeTab === 'take' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('take')}>
                <UserCheck size={14} /> Take Attendance
              </button>
              <button className={`btn btn-sm ${activeTab === 'qr' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('qr')}>
                <QrCode size={14} /> QR Scan
              </button>
            </>
          )}
          <button className={`btn btn-sm ${activeTab === 'records' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('records')}>
            <Calendar size={14} /> Records
          </button>
          <button className={`btn btn-sm ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('summary')}>
            <BarChart3 size={14} /> Summary
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {[
            { label: 'Present', value: summary.present, color: 'green' },
            { label: 'Absent', value: summary.absent, color: 'red' },
            { label: 'Late', value: summary.late, color: 'gold' },
            { label: 'Rate', value: `${summary.attendanceRate}%`, color: 'blue' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`stat-card ${color}`} style={{ padding: '14px 16px' }}>
              <div className="stat-value" style={{ fontSize: 22 }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Date Filter */}
      <div className="filter-bar">
        <input type="date" className="filter-select" value={filter.date} onChange={e => setFilter(p => ({ ...p, date: e.target.value }))} />
        {isTeacher && (
          <select className="filter-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.subject?.name} - {c.section}</option>)}
          </select>
        )}
      </div>

      {/* Take Attendance Tab */}
      {activeTab === 'take' && isTeacher && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Mark Attendance — {format(new Date(filter.date), 'MMMM d, yyyy')}</div>
            <button className="btn btn-primary btn-sm" onClick={submitAttendance}>Save Attendance</button>
          </div>
          {attendanceList.length === 0 ? (
            <div className="table-empty">Select a class to load students</div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th></tr></thead>
                <tbody>
                  {attendanceList.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{typeof a.student === 'object' ? `${a.student.firstName} ${a.student.lastName}` : a.student}</td>
                      {['present','absent','late','excused'].map(s => (
                        <td key={s} style={{ textAlign: 'center' }}>
                          <input type="radio" name={`status-${i}`} checked={a.status === s} onChange={() => setAttendanceList(l => l.map((item, idx) => idx === i ? { ...item, status: s } : item))}
                            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: s === 'present' ? 'var(--success)' : s === 'absent' ? 'var(--danger)' : 'var(--warning)' }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Student</th><th>Subject</th><th>Date</th><th>Status</th><th>Time In</th><th>Method</th></tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j}><div className="skeleton" style={{height:14}} /></td>)}</tr>) :
                records.length === 0 ? <tr><td colSpan={6} className="table-empty">No attendance records</td></tr> :
                records.map(r => (
                  <tr key={r._id}>
                    <td><div style={{fontWeight:600}}>{r.student?.firstName} {r.student?.lastName}</div></td>
                    <td>{r.subject?.name || '—'}</td>
                    <td style={{fontSize:12}}>{format(new Date(r.date), 'MMM d, yyyy')}</td>
                    <td><span className={`badge ${STATUS_CONFIG[r.status]?.color || 'badge-gray'}`}>{r.status}</span></td>
                    <td style={{fontSize:12}}>{r.timeIn ? format(new Date(r.timeIn), 'h:mm a') : '—'}</td>
                    <td><span className="badge badge-gray">{r.method?.replace(/_/g,' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
