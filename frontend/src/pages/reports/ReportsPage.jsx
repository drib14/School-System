import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, DollarSign, CheckSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  return (
    <div className={`stat-card ${color}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label" style={{ fontSize: 12, marginBottom: 4 }}>{title}</div>
          <div className="stat-value" style={{ fontSize: 26, letterSpacing: '-0.5px' }}>{value}</div>
          {subtitle && <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>{subtitle}</div>}
        </div>
        <div style={{ opacity: 0.15, position: 'absolute', right: 16, top: 16 }}>
          <Icon size={40} />
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [enrollmentByProgram, setEnrollmentByProgram] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => { fetchAll(); }, [year]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [enrollRes, progRes, finRes, demRes, perfRes, attRes] = await Promise.all([
        api.get('/analytics/enrollment-trends?years=5'),
        api.get('/analytics/enrollment-by-program'),
        api.get(`/analytics/financial?year=${year}`),
        api.get('/analytics/demographics'),
        api.get('/analytics/student-performance'),
        api.get('/analytics/attendance').catch(() => ({ data: null })),
      ]);

      setEnrollmentTrends(enrollRes.data.trends || []);
      setEnrollmentByProgram(progRes.data.data || []);
      setFinancialData(finRes.data);
      setDemographics(demRes.data);
      setPerformance(perfRes.data);
      setAttendanceData(attRes.data);
    } catch { } finally { setLoading(false); }
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'enrollment', label: 'Enrollment' },
    { id: 'financial', label: 'Financial' },
    { id: 'performance', label: 'Academic' },
    { id: 'attendance', label: 'Attendance' },
  ];

  const canViewFinancial = ['cashier', 'accountant', 'principal', 'super_admin', 'school_owner'].includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-sub">School-wide data insights and trends</p>
        </div>
        <div className="page-actions">
          <select className="filter-select" value={year} onChange={e => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
        {TABS.filter(t => t.id !== 'financial' || canViewFinancial).map(tab => (
          <button key={tab.id} className="btn btn-ghost btn-sm"
            style={{ borderRadius: '6px 6px 0 0', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === tab.id ? 600 : 400 }}
            onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-4">
            <StatCard title="Total Students" icon={Users} color="blue"
              value={loading ? '—' : `${demographics?.byRole?.find(r => r._id === 'student')?.count || 0}`}
              subtitle="Active users" />
            <StatCard title="Total Revenue" icon={DollarSign} color="green"
              value={loading || !financialData ? '—' : `₱${(financialData.totalRevenue || 0).toLocaleString()}`}
              subtitle="All time" />
            <StatCard title="Pending Balance" icon={AlertCircle} color="gold"
              value={loading || !financialData ? '—' : `₱${(financialData.pendingBalance || 0).toLocaleString()}`}
              subtitle={`${financialData?.outstandingCount || 0} outstanding`} />
            <StatCard title="Attendance Rate" icon={CheckSquare} color="purple"
              value={loading || !attendanceData ? '—' : `${attendanceData.attendanceRate || 0}%`}
              subtitle="School-wide" />
          </div>

          {demographics && (
            <div className="grid-2">
              <div className="card">
                <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Users by Role</div>
                <div style={{ padding: '0 16px 16px' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={demographics.byRole || []} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Gender Distribution</div>
                <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center' }}>
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={demographics.byGender || []} cx="50%" cy="50%" outerRadius={70} dataKey="count" nameKey="_id">
                        {(demographics.byGender || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {(demographics.byGender || []).map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        <span style={{ fontSize: 13 }}>{g._id || 'N/A'}</span>
                        <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{g.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ENROLLMENT TAB */}
      {activeTab === 'enrollment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Enrollment Trends (5 Years)</div>
            <div style={{ padding: '0 16px 20px' }}>
              {loading ? <div className="skeleton" style={{ height: 250, borderRadius: 8 }} /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={enrollmentTrends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="var(--primary)" fill="url(#enrollGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="card">
            <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Enrollment by Program</div>
            <div style={{ padding: '0 16px 20px' }}>
              {loading ? <div className="skeleton" style={{ height: 250, borderRadius: 8 }} /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={enrollmentByProgram} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="code" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {enrollmentByProgram.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL TAB */}
      {activeTab === 'financial' && canViewFinancial && financialData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-3">
            <div className="stat-card green" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value" style={{ fontSize: 22 }}>₱{(financialData.totalRevenue || 0).toLocaleString()}</div>
            </div>
            <div className="stat-card gold" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Pending Balance</div>
              <div className="stat-value" style={{ fontSize: 22 }}>₱{(financialData.pendingBalance || 0).toLocaleString()}</div>
            </div>
            <div className="stat-card red" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Outstanding Accounts</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{financialData.outstandingCount || 0}</div>
            </div>
          </div>
          <div className="card">
            <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Monthly Revenue — {year}</div>
            <div style={{ padding: '0 16px 20px' }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={financialData.revenueByMonth || []} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`₱${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {financialData.byMethod?.length > 0 && (
            <div className="card">
              <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Payment Methods</div>
              <div style={{ padding: '0 16px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
                <ResponsiveContainer width="40%" height={200}>
                  <PieChart>
                    <Pie data={financialData.byMethod} cx="50%" cy="50%" outerRadius={75} dataKey="total" nameKey="_id">
                      {financialData.byMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`₱${v.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {financialData.byMethod.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, flex: 1 }}>{m._id}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>₱{m.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACADEMIC PERFORMANCE TAB */}
      {activeTab === 'performance' && performance && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-3">
            <div className="stat-card green" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Pass Rate</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{performance.passRate}%</div>
            </div>
            <div className="stat-card red" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Fail Rate</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{performance.failRate}%</div>
            </div>
            <div className="stat-card blue" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Total Graded</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{(performance.totalGraded || 0).toLocaleString()}</div>
            </div>
          </div>
          {(performance.gpaDistribution || []).length > 0 && (
            <div className="card">
              <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Grade Distribution</div>
              <div style={{ padding: '0 16px 20px' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performance.gpaDistribution.map(d => ({ ...d, range: `${d._id}+` }))} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {performance.gpaDistribution.map((d, i) => (
                        <Cell key={i} fill={d._id >= 80 ? '#10b981' : d._id >= 70 ? '#3b82f6' : d._id >= 60 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && attendanceData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-3">
            <div className="stat-card green" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Attendance Rate</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{attendanceData.attendanceRate}%</div>
            </div>
            <div className="stat-card blue" style={{ padding: '14px 16px' }}>
              <div className="stat-label">Total Records</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{(attendanceData.totalRecords || 0).toLocaleString()}</div>
            </div>
          </div>
          {(attendanceData.byDate || []).length > 0 && (
            <div className="card">
              <div style={{ padding: '16px 16px 8px', fontWeight: 600, fontSize: 14 }}>Daily Attendance Trend</div>
              <div style={{ padding: '0 16px 20px' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={attendanceData.byDate} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={false} name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={false} name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
