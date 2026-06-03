import { BarChart3, TrendingUp, Users, GraduationCap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];

const enrollmentByMonth = [
  { month: 'Jun', count: 45 }, { month: 'Jul', count: 120 }, { month: 'Aug', count: 280 },
  { month: 'Sep', count: 40 }, { month: 'Oct', count: 15 }, { month: 'Nov', count: 8 },
];

const revenueByCategory = [
  { name: 'Tuition', value: 450000 }, { name: 'Misc Fees', value: 85000 },
  { name: 'Lab Fees', value: 65000 }, { name: 'Other', value: 30000 },
];

const gradeData = [
  { subject: 'Math', avg: 82 }, { subject: 'English', avg: 88 }, { subject: 'Science', avg: 79 },
  { subject: 'Filipino', avg: 85 }, { subject: 'ComSci', avg: 87 }, { subject: 'PE', avg: 91 },
];

export default function ReportsPage() {
  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="page-sub">Academic Year 2025-2026 Overview</p></div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: '1,245', icon: GraduationCap, color: 'blue' },
          { label: 'Total Revenue', value: '₱630K', icon: TrendingUp, color: 'green' },
          { label: 'Avg Grade', value: '85.3', icon: BarChart3, color: 'purple' },
          { label: 'Attendance Rate', value: '91.2%', icon: Users, color: 'gold' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className={`stat-icon ${color}`}><Icon size={20} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Enrollment by Month</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={enrollmentByMonth}>
                <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                <Tooltip /><Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Revenue by Category</div>
          <div style={{ height: 250, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%">
              <PieChart>
                <Pie data={revenueByCategory} innerRadius={50} outerRadius={80} dataKey="value">
                  {revenueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={v => [`₱${v.toLocaleString()}`]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {revenueByCategory.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i] }} />
                  <span style={{ fontSize: 12, flex: 1 }}>{r.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>₱{(r.value/1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Average Grades by Subject</div>
        <div style={{ height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="subject" /><YAxis domain={[60,100]} />
              <Tooltip /><Bar dataKey="avg" fill="#8b5cf6" radius={[6,6,0,0]} name="Average Grade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
