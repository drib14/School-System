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
  const { user } = useAuthStore();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [financials, setFinancials] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/academics/my-grades'),
      api.get('/financial/assessments')
    ])
      .then(([gradesRes, finRes]) => {
        if (gradesRes.data.enrollments?.length > 0) {
          setEnrollment(gradesRes.data.enrollments[gradesRes.data.enrollments.length - 1]);
        }
        if (finRes.data.assessments?.length > 0) {
          setFinancials(finRes.data.assessments[0]); // latest assessment
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card skeleton" style={{ height: 200, marginBottom: 24 }} />;

  const isEnrolled = user?.profile?.enrollmentStatus === 'enrolled' || enrollment?.status === 'enrolled';

  if (!isEnrolled) {
    return (
      <>
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #f59e0b' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={20} style={{ color: '#f59e0b' }} />
                Admission Checklist
              </div>
              <div className="card-sub" style={{ color: '#f59e0b' }}>Your enrollment is currently pending. Please submit the following legal requirements to the Admission Office for approval.</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSubmitModal(true)}>
              Submit Requirements
            </button>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              'Original Form 138 (Report Card)',
              'Certificate of Good Moral Character',
              'PSA / NSO Birth Certificate (Photocopy)',
              '2x2 ID Pictures (2 pieces with white background)'
            ].map((req, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 16, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.5 }}>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {showSubmitModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSubmitModal(false)}>
            <div className="modal animate-slide" style={{ background: 'rgba(15, 17, 26, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="modal-header">
                <h3 className="modal-title">Submit Requirements</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowSubmitModal(false)}>✕</button>
              </div>
              <div style={{ padding: '0 0 20px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Upload your scanned documents below. Allowed formats: PDF, JPG, PNG.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Form 138', 'Good Moral', 'Birth Certificate', 'ID Picture'].map(doc => (
                    <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{doc}</span>
                      <input type="file" id={doc} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />
                      <label htmlFor={doc} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>Choose File</label>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={() => setShowSubmitModal(false)}>Submit All</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
      {/* Financial Summary */}
      <div className="grid-3">
        <div className="card" style={{ background: 'rgba(23, 27, 43, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Remaining Balance</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>₱{(financials?.balance || 0).toLocaleString()}</div>
            </div>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <a href="/financial/payments" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Pay Now</a>
          </div>
        </div>

        <div className="card" style={{ background: 'rgba(23, 27, 43, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Paid</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>₱{(financials?.totalPaid || 0).toLocaleString()}</div>
            </div>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <a href="/financial/payments" className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Billing History</a>
          </div>
        </div>
        
        <div className="card" style={{ background: 'rgba(23, 27, 43, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Term Details</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{financials?.academicYear || enrollment?.academicYear || '2025-2026'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{financials?.semester || enrollment?.semester || '1st'} Semester</div>
          <div style={{ marginTop: 12 }}>
            <span className={`badge ${financials?.status === 'paid' ? 'badge-green' : 'badge-red'}`} style={{ textTransform: 'capitalize' }}>
              {financials?.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Study Load */}
      <div className="card" style={{ 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(to right, rgba(23, 27, 43, 0.95), rgba(23, 27, 43, 0.85)), url("/seal-bg.jpg") center/cover no-repeat'
      }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <div className="card-title">Current Study Load</div>
            <div className="card-sub">{enrollment?.academicYear} · {enrollment?.semester} Semester</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
              <html><head><title>Study Load</title></head><body style="font-family: Arial, sans-serif; padding: 40px; position: relative;">
                <img src="/seal-bg.jpg" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; width: 400px; pointerEvents: none;" />
                <div style="position: relative; z-index: 1;">
                  <h1 style="text-align: center; margin-bottom: 5px;">International State Colleges of the Philippines</h1>
                  <h3 style="text-align: center; margin-top: 0; color: #555;">Official Study Load</h3>
                  <p><strong>Student:</strong> ${user?.firstName || 'Student'} ${user?.lastName || ''} <br/> <strong>Program:</strong> ${enrollment?.program?.name || 'N/A'}</p>
                  <hr style="margin: 20px 0;" />
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Code</th>
                      <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Description</th>
                      <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Units</th>
                      <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Schedule</th>
                    </tr>
                    ${enrollment?.subjects?.map(s => `
                      <tr>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">${s.subject?.code}</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">${s.subject?.name}</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${s.units}</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">
                          ${s.schedule?.schedule?.map(sch => `${sch.day} ${sch.startTime}-${sch.endTime}`).join('<br/>') || 'TBA'}
                        </td>
                      </tr>
                    `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 20px;">No subjects enrolled</td></tr>'}
                    <tr style="background: #f9fafb; font-weight: bold;">
                      <td colspan="2" style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">Total Units</td>
                      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${enrollment?.totalUnits || 0}</td>
                      <td style="padding: 10px; border: 1px solid #e5e7eb;"></td>
                    </tr>
                  </table>
                </div>
              </body></html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 250);
          }}>
            Download Study Load
          </button>
        </div>
        
        <div className="table-container" style={{ position: 'relative', zIndex: 2, background: 'rgba(23, 27, 43, 0.6)', borderRadius: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Units</th>
                <th>Schedule</th>
                <th>Instructor</th>
              </tr>
            </thead>
            <tbody>
              {enrollment?.subjects?.map(s => (
                <tr key={s._id}>
                  <td><span className="badge badge-gray">{s.subject?.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.subject?.name}</td>
                  <td>{s.units}</td>
                  <td style={{ fontSize: 13 }}>
                    {s.schedule?.schedule?.map((sch, i) => (
                      <div key={i} style={{ marginBottom: 2 }}>{sch.day} • {sch.startTime} - {sch.endTime}</div>
                    )) || <span className="text-muted">TBA</span>}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {s.schedule?.teacher ? `${s.schedule.teacher.firstName} ${s.schedule.teacher.lastName}` : <span className="text-muted">TBA</span>}
                  </td>
                </tr>
              ))}
              {!enrollment?.subjects?.length && (
                <tr><td colSpan={5} className="table-empty">No subjects enrolled</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
        {['super_admin', 'school_owner', 'principal', 'accountant', 'cashier', 'hr_staff'].includes(user?.role) && (
          <>
            <StatCard icon={DollarSign} value={`₱${((stats?.totalRevenue || 0) / 1000).toFixed(0)}K`} label="Total Revenue" color="green" change={12} />
            <StatCard icon={Users} value={stats?.totalStaff || 0} label="Staff Members" color="blue" />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 24, display: user?.role === 'student' ? 'none' : 'grid' }}>
        {/* Revenue Chart */}
        {['super_admin', 'school_owner', 'principal', 'accountant', 'cashier'].includes(user?.role) && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Revenue Trend</div>
                <div className="card-sub">Last 30 days</div>
              </div>
            </div>
            <div className="chart-container" style={{ height: 300, minWidth: 0 }}>
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
            </div>
          </div>
        )}

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
