import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { DollarSign, CreditCard, TrendingUp, Plus, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const path = location.pathname;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState(path.includes('fees') ? 'fees' : path.includes('assessments') ? 'assessments' : path.includes('summary') ? 'summary' : 'payments');

  const isStudent = user?.role === 'student';

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'payments') {
        const ep = isStudent ? '/financial/payments/my' : '/financial/payments';
        const { data: res } = await api.get(ep);
        setData(res.payments || []);
      } else if (activeTab === 'fees') {
        const { data: res } = await api.get('/financial/fees');
        setData(res.fees || []);
      } else if (activeTab === 'assessments') {
        const { data: res } = await api.get('/financial/assessments');
        setData(res.assessments || []);
      } else if (activeTab === 'summary') {
        const { data: res } = await api.get('/financial/summary');
        setSummary(res);
      }
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const METHOD_BADGE = { cash: 'badge-green', bank_transfer: 'badge-blue', gcash: 'badge-purple', maya: 'badge-purple', credit_card: 'badge-yellow', paymongo: 'badge-blue' };
  const STATUS_BADGE = { completed: 'badge-green', pending: 'badge-yellow', failed: 'badge-red', refunded: 'badge-gray' };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Financial Management</h1></div>
        <div className="page-actions">
          {['payments', 'fees', 'assessments', 'summary'].filter(t => !isStudent || t === 'payments' || t === 'assessments').map(t => (
            <button key={t} className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
          {!isStudent && <button className="btn btn-primary btn-sm"><Plus size={14} /> Record Payment</button>}
        </div>
      </div>

      {/* Summary Stats */}
      {activeTab === 'summary' && summary && (
        <div>
          <div className="grid-3" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Revenue', value: `₱${(summary.totalRevenue || 0).toLocaleString()}`, color: 'green', icon: TrendingUp },
              { label: 'Pending Balance', value: `₱${(summary.pendingBalance || 0).toLocaleString()}`, color: 'gold', icon: DollarSign },
              { label: 'Transactions', value: summary.byMethod?.reduce((s, m) => s + m.count, 0) || 0, color: 'blue', icon: CreditCard },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className={`stat-card ${color}`}>
                <div className={`stat-icon ${color}`}><Icon size={22} /></div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Revenue by Payment Method</div>
              {summary.byMethod?.map(m => (
                <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-blue">{m._id?.replace(/_/g,' ')}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.count} txns</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>₱{(m.total || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Daily Revenue</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={summary.dailyRevenue?.slice(-14) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `₱${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={v => [`₱${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      {activeTab === 'payments' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Reference</th><th>Student</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j}><div className="skeleton" style={{height:14}} /></td>)}</tr>)
                : data.length === 0 ? <tr><td colSpan={6} className="table-empty">No payment records</td></tr>
                : data.map(p => (
                  <tr key={p._id}>
                    <td><code style={{fontSize:11,background:'var(--bg-secondary)',padding:'2px 8px',borderRadius:4}}>{p.referenceNumber}</code></td>
                    <td>{p.student?.firstName} {p.student?.lastName}</td>
                    <td style={{fontWeight:700,color:'var(--success)'}}>₱{(p.amount||0).toLocaleString()}</td>
                    <td><span className={`badge ${METHOD_BADGE[p.method]||'badge-gray'}`}>{p.method?.replace(/_/g,' ')}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[p.status]||'badge-gray'}`}>{p.status}</span></td>
                    <td style={{fontSize:12}}>{p.createdAt ? format(new Date(p.createdAt),'MMM d, yyyy') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fees Table */}
      {activeTab === 'fees' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Name</th><th>Category</th><th>Amount</th><th>Frequency</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:5}).map((_,j) => <td key={j}><div className="skeleton" style={{height:14}} /></td>)}</tr>)
                : data.length === 0 ? <tr><td colSpan={5} className="table-empty">No fees configured</td></tr>
                : data.map(f => (
                  <tr key={f._id}>
                    <td style={{fontWeight:600}}>{f.name}</td>
                    <td><span className="badge badge-blue">{f.category}</span></td>
                    <td style={{fontWeight:700}}>₱{(f.amount||0).toLocaleString()}</td>
                    <td style={{fontSize:12}}>{f.frequency?.replace(/_/g,' ')}</td>
                    <td><span className={`badge ${f.isActive ? 'badge-green' : 'badge-gray'}`}>{f.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      {/* Assessments / Statement of Account */}
      {activeTab === 'assessments' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Term</th>{ !isStudent && <th>Student</th> }<th>Net Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length: isStudent ? 5 : 6}).map((_,j) => <td key={j}><div className="skeleton" style={{height:14}} /></td>)}</tr>)
                : data.length === 0 ? <tr><td colSpan={isStudent ? 5 : 6} className="table-empty">No assessments found</td></tr>
                : data.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{fontWeight:600}}>{a.academicYear}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>{a.semester} Semester</div>
                    </td>
                    { !isStudent && <td>{a.student?.firstName} {a.student?.lastName}</td> }
                    <td style={{fontWeight:600}}>₱{(a.netAmount||0).toLocaleString()}</td>
                    <td style={{color:'var(--success)'}}>₱{(a.totalPaid||0).toLocaleString()}</td>
                    <td style={{fontWeight:700,color:'var(--danger)'}}>₱{(a.balance||0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${a.status === 'paid' ? 'badge-green' : a.status === 'partial' ? 'badge-yellow' : 'badge-red'}`} style={{textTransform:'capitalize'}}>{a.status}</span>
                    </td>
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
