import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, UserCheck, ClipboardList, Bell, Calendar, Award } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { format } from 'date-fns';

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

export default function DashboardPage() {
  const { user, school } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.stats);

        // Fetch financial data
        try {
          const { data: fin } = await api.get('/financial/summary');
          setRevenueData(fin.dailyRevenue?.map(d => ({ date: d._id, amount: d.total })) || []);
        } catch (_) {}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const enrollmentData = [
    { name: 'New', value: 120, color: '#3b82f6' },
    { name: 'Returning', value: 380, color: '#10b981' },
    { name: 'Transferees', value: 45, color: '#f59e0b' },
    { name: 'Others', value: 20, color: '#8b5cf6' },
  ];

  const attendanceData = [
    { day: 'Mon', present: 95, absent: 5, late: 8 },
    { day: 'Tue', present: 88, absent: 12, late: 6 },
    { day: 'Wed', present: 92, absent: 8, late: 10 },
    { day: 'Thu', present: 90, absent: 10, late: 7 },
    { day: 'Fri', present: 85, absent: 15, late: 9 },
  ];

  const gradeDistribution = [
    { grade: '1.0-1.5', count: 45 },
    { grade: '1.5-2.0', count: 120 },
    { grade: '2.0-2.5', count: 180 },
    { grade: '2.5-3.0', count: 95 },
    { grade: '3.0+', count: 60 },
    { grade: 'Failed', count: 30 },
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

      {/* Stats Grid */}
      <div className="grid-stat" style={{ marginBottom: 24 }}>
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
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-sub">Last 30 days</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
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

        {/* Enrollment Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Enrollment Types</div>
              <div className="card-sub">Current semester</div>
            </div>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%">
              <PieChart>
                <Pie data={enrollmentData} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {enrollmentData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {enrollmentData.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i] }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 13 }}>{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Attendance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Weekly Attendance Rate</div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={attendanceData}>
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
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Grade Distribution</div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={gradeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="grade" width={50} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Students" radius={[0,4,4,0]}>
                  {gradeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
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
