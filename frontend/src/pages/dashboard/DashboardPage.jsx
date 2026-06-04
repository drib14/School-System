import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, UserCheck, ClipboardList, Bell, Calendar, Award } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { format } from 'date-fns';
import CustomSelect from '../../components/forms/CustomSelect';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ icon: Icon, value, label, color = 'blue', change }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-glow" />
      <div className={`stat-icon ${color}`}><Icon size={22} /></div>
      <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="stat-label">{label}</div>
      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
          <TrendingUp size={12} />
          <span>{change >= 0 ? '+' : ''}{change}% this month</span>
        </div>
      )}
    </div>
  );
}


function StudentEnrollmentTracker() {
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    // Fetch courses/sections
    api.get('/academics/programs').then(res => setCourses(res.data.programs || [])).catch(console.error);
    api.get('/academics/schedules').then(res => setSections(res.data.schedules || [])).catch(console.error);
  }, []);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <div className="card-title">Enrollment Status Tracker</div>
        <div className="card-sub">Follow the steps to complete your enrollment</div>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          {['Application', 'Select Section', 'Payment', 'Study Load'].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', opacity: step >= i + 1 ? 1 : 0.4 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: step > i + 1 ? '#10b981' : step === i + 1 ? '#3b82f6' : '#475569', color: '#fff', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p>Your application is approved. You are ready to enroll for this semester.</p>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Continue to Section Selection</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 15 }}>
              <label className="form-label">Select Course/Program</label>
              <select className="form-control" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Select...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            {selectedCourse && (
              <div style={{ marginBottom: 15 }}>
                <label className="form-label">Available Sections</label>
                <select className="form-control" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                  <option value="">Select...</option>
                  {sections.filter(s => s.program === selectedCourse).map(s => <option key={s._id} value={s._id}>{s.name} ({s.capacity - (s.enrolledCount||0)} slots left)</option>)}
                </select>
              </div>
            )}
            <button className="btn btn-primary" disabled={!selectedSection} onClick={() => setStep(3)}>Proceed to Payment</button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p>Please complete your payment to finalize enrollment.</p>
            <button className="btn btn-success" onClick={() => setStep(4)}>Simulate Payment</button>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
            <img src="/iscp-logo.jpg" alt="Watermark" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, width: 200, height: 200, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 40, color: '#10b981', marginBottom: 10 }}>🎉</div>
              <p style={{ fontWeight: 600, fontSize: 16 }}>Enrollment Successful!</p>
              <button className="btn btn-primary" onClick={() => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                  <html><head><title>Study Load</title></head><body style="font-family: Arial, sans-serif; padding: 40px; position: relative;">
                    <img src="/iscp-logo.jpg" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; width: 400px; pointerEvents: none;" />
                    <div style="position: relative; z-index: 1;">
                      <h1 style="text-align: center;">International State Colleges of the Philippines</h1>
                      <h3 style="text-align: center;">Official Study Load</h3>
                      <p><strong>Student:</strong> ${user?.firstName || 'Student'} ${user?.lastName || ''}</p>
                      <hr style="margin: 20px 0;" />
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f3f4f6;">
                          <th style="padding: 10px; border: 1px solid #e5e7eb;">Code</th>
                          <th style="padding: 10px; border: 1px solid #e5e7eb;">Description</th>
                          <th style="padding: 10px; border: 1px solid #e5e7eb;">Units</th>
                        </tr>
                        <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">SYS101</td><td style="padding: 10px; border: 1px solid #e5e7eb;">System Demo</td><td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">3</td></tr>
                      </table>
                    </div>
                  </body></html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); }, 250);
              }} style={{ marginTop: 10 }}>Download Study Load</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, school } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [enrollmentByProgram, setEnrollmentByProgram] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.stats);

        if (user?.role !== 'student') {
          // Fetch additional analytics in parallel
          const [finRes, enrollRes, attRes, perfRes] = await Promise.allSettled([
            api.get('/financial/summary'),
            api.get('/analytics/enrollment-by-program'),
            api.get('/analytics/attendance'),
            api.get('/analytics/student-performance'),
          ]);

          if (finRes.status === 'fulfilled') {
            setRevenueData(finRes.value.data.dailyRevenue?.map(d => ({ date: d._id, amount: d.total })) || []);
          }
          if (enrollRes.status === 'fulfilled') {
            setEnrollmentByProgram(enrollRes.value.data.data || []);
          }
          if (attRes.status === 'fulfilled' && attRes.value.data?.byDate) {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const rawDays = attRes.value.data.byDate.slice(-5);
            setAttendanceData(rawDays.map((d, i) => ({
              day: days[i] || d._id,
              present: d.present || 0,
              absent: d.absent || 0,
              late: d.late || 0,
            })));
          }
          if (perfRes.status === 'fulfilled' && perfRes.value.data?.gpaDistribution) {
            setGradeDistribution(
              perfRes.value.data.gpaDistribution.map(d => ({ grade: `${d._id}+`, count: d.count }))
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Fallback placeholder enrollment data if API returns nothing
  const enrollData = enrollmentByProgram.length > 0
    ? enrollmentByProgram.slice(0, 4).map((p, i) => ({ name: p.code || p._id || 'Unknown', value: p.count || 0, color: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'][i % 4] }))
    : [
        { name: 'New', value: 0, color: '#3b82f6' },
        { name: 'Returning', value: 0, color: '#10b981' },
      ];

  // Fallback placeholder attendance
  const attData = attendanceData.length > 0 ? attendanceData : [
    { day: 'Mon', present: 0, absent: 0, late: 0 },
    { day: 'Tue', present: 0, absent: 0, late: 0 },
    { day: 'Wed', present: 0, absent: 0, late: 0 },
    { day: 'Thu', present: 0, absent: 0, late: 0 },
    { day: 'Fri', present: 0, absent: 0, late: 0 },
  ];

  // Fallback grade distribution
  const gradeData = gradeDistribution.length > 0 ? gradeDistribution : [
    { grade: '90+', count: 0 },
    { grade: '80+', count: 0 },
    { grade: '75+', count: 0 },
    { grade: '<75', count: 0 },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      {/* Welcome */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}! 👋
          </h1>
          <p className="text-muted" style={{ marginTop: 4, fontSize: 13 }}>
            {format(new Date(), 'EEEE, MMMM do, yyyy')} · {school?.name || 'ISCP School System'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-blue" style={{ padding: '6px 14px', fontSize: 12 }}>
            A.Y. {school?.settings?.academicYear || '2025-2026'}
          </span>
          <span className="badge badge-green" style={{ padding: '6px 14px', fontSize: 12 }}>
            {school?.settings?.currentSemester || '1st'} Semester
          </span>
        </div>
      </div>

      {user?.role === 'student' && <StudentEnrollmentTracker />}
      {/* Stats Grid */}
      <div className="grid-stat" style={{ marginBottom: 24, display: user?.role === 'student' ? 'none' : 'grid' }}>
        <StatCard icon={GraduationCap} value={stats?.totalStudents || 0} label="Active Students" color="blue" change={5} />
        <StatCard icon={Users} value={stats?.totalTeachers || 0} label="Teachers" color="green" change={2} />
        <StatCard icon={UserCheck} value={stats?.enrolledThisSem || 0} label="Enrolled This Sem" color="purple" change={8} />
        <StatCard icon={ClipboardList} value={stats?.pendingEnrollments || 0} label="Pending Enrollments" color="gold" />
        {(user?.role !== 'teacher' && user?.role !== 'student') && (
          <>
            <StatCard icon={DollarSign} value={`₱${((stats?.totalRevenue || 0) / 1000).toFixed(0)}K`} label="Total Revenue" color="green" change={12} />
            <StatCard icon={Users} value={stats?.totalStaff || 0} label="Staff Members" color="blue" />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 24, display: user?.role === 'student' ? 'none' : 'grid' }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-sub">Last 30 days</div>
            </div>
          </div>
          <div className="chart-container" style={{ height: 300, minWidth: 0 }}>
            {user?.role !== 'student' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.length > 0 ? revenueData : Array.from({ length: 10 }, (_, i) => ({ date: `Day ${i+1}`, amount: Math.random() * 50000 + 10000 }))}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={v => `₱${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [`₱${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Enrollment Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Enrollment by Program</div>
              <div className="card-sub">Current semester</div>
            </div>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', height: 300, minWidth: 0 }}>
            {user?.role !== 'student' && (
              <>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={enrollData} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {enrollData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {enrollData.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.name}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 13 }}>{e.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom: 24, display: user?.role === 'student' ? 'none' : 'grid' }}>
        {/* Attendance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Weekly Attendance Rate</div>
          </div>
          <div className="chart-container" style={{ height: 300, minWidth: 0 }}>
            {user?.role !== 'student' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present" radius={[4,4,0,0]} />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4,4,0,0]} />
                  <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Grade Distribution</div>
          </div>
          <div className="chart-container" style={{ height: 300, minWidth: 0 }}>
            {user?.role !== 'student' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="grade" width={50} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" name="Students" radius={[0,4,4,0]}>
                    {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ display: user?.role === 'student' ? 'none' : 'block' }}>
        <div className="card-header">
          <div className="card-title">Quick Actions</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Enroll Student', icon: ClipboardList, to: '/enrollment', color: '#3b82f6' },
            { label: 'Record Grades', icon: Award, to: '/grades', color: '#8b5cf6' },
            { label: 'Take Attendance', icon: UserCheck, to: '/attendance', color: '#10b981' },
            { label: 'Post Announcement', icon: Bell, to: '/announcements', color: '#f59e0b' },
            { label: 'Process Payment', icon: DollarSign, to: '/financial/payments', color: '#06b6d4' },
            { label: 'View Schedule', icon: Calendar, to: '/academics/schedules', color: '#ef4444' },
          ].map(({ label, icon: Icon, to, color }) => (
            <a key={to} href={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 'var(--radius-md)', color, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.target.style.background = `${color}25`; }}
              onMouseLeave={e => { e.target.style.background = `${color}15`; }}>
              <Icon size={16} />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
