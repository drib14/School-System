import { useState, useEffect } from 'react';
import { Users, School, TrendingUp, Shield, Monitor, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useLocation } from 'react-router-dom';

const mockSchools = [
  { _id: '1', name: 'ISCP Manila', status: 'active', students: 1245, plan: 'enterprise' },
  { _id: '2', name: 'ISCP Cebu', status: 'active', students: 890, plan: 'professional' },
  { _id: '3', name: 'ISCP Davao', status: 'trial', students: 320, plan: 'starter' },
];

const activityData = Array.from({ length: 10 }, (_, i) => ({
  date: `Day ${i+1}`, logins: Math.floor(Math.random() * 200 + 50), actions: Math.floor(Math.random() * 500 + 100),
}));

export default function SuperDashboardPage() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Super Admin Console</h1><p className="page-sub">Multi-school SaaS management</p></div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Schools', value: 3, icon: School, color: 'blue' },
          { label: 'Total Students', value: '2,455', icon: Users, color: 'green' },
          { label: 'Monthly Revenue', value: '₱89K', icon: TrendingUp, color: 'gold' },
          { label: 'System Health', value: '99.8%', icon: Monitor, color: 'purple' },
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
          <div className="card-title" style={{ marginBottom: 16 }}>System Activity</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={activityData}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="logins" stroke="#3b82f6" fill="url(#ag)" name="Logins" />
                <Area type="monotone" dataKey="actions" stroke="#10b981" fill="none" name="Actions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Schools</div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>School</th><th>Students</th><th>Plan</th><th>Status</th></tr></thead>
              <tbody>
                {mockSchools.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.students.toLocaleString()}</td>
                    <td><span className={`badge ${s.plan === 'enterprise' ? 'badge-blue' : s.plan === 'professional' ? 'badge-green' : 'badge-yellow'}`} style={{ textTransform: 'capitalize' }}>{s.plan}</span></td>
                    <td><span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={16} /> Recent Audit Log</div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>User</th><th>Action</th><th>Resource</th><th>School</th><th>IP</th><th>Time</th></tr></thead>
            <tbody>
              {[
                { user: 'superadmin@iscp.edu.ph', action: 'LOGIN', resource: 'Auth', school: 'ISCP Manila', ip: '192.168.1.1', time: '2 min ago' },
                { user: 'principal@iscp.edu.ph', action: 'CREATE', resource: 'Announcement', school: 'ISCP Manila', ip: '192.168.1.50', time: '15 min ago' },
                { user: 'cashier@iscp.edu.ph', action: 'PAYMENT', resource: 'Financial', school: 'ISCP Cebu', ip: '10.0.0.5', time: '1 hr ago' },
              ].map((log, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12 }}>{log.user}</td>
                  <td><span className={`badge ${log.action === 'LOGIN' ? 'badge-blue' : log.action === 'CREATE' ? 'badge-green' : 'badge-yellow'}`}>{log.action}</span></td>
                  <td style={{ fontSize: 12 }}>{log.resource}</td>
                  <td style={{ fontSize: 12 }}>{log.school}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.ip}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
