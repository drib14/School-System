import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { DollarSign, CreditCard, TrendingUp, Plus, CheckCircle, X } from 'lucide-react';
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
  const [showPayModal, setShowPayModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({});
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
          {!isStudent && activeTab === 'payments' && <button className="btn btn-primary btn-sm" onClick={() => { setFormData({}); setShowAddModal('payment'); }}><Plus size={14} /> Record Payment</button>}
          {!isStudent && activeTab === 'fees' && <button className="btn btn-primary btn-sm" onClick={() => { setFormData({}); setShowAddModal('fee'); }}><Plus size={14} /> Add Fee</button>}
          {!isStudent && activeTab === 'assessments' && <button className="btn btn-primary btn-sm" onClick={() => { setFormData({}); setShowAddModal('assessment'); }}><Plus size={14} /> Generate Assessment</button>}
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
                : data.length === 0 ? <tr><td colSpan={6} className="table-empty">
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CreditCard size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                    <div style={{ fontWeight: 600 }}>No Payment Records Found</div>
                    <p style={{ fontSize: 13, marginTop: 4 }}>There are no recent payments for this account.</p>
                  </div>
                </td></tr>
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
                : data.length === 0 ? <tr><td colSpan={5} className="table-empty">
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <DollarSign size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                    <div style={{ fontWeight: 600 }}>No Fees Configured</div>
                    <p style={{ fontSize: 13, marginTop: 4 }}>There are currently no active fee structures available.</p>
                  </div>
                </td></tr>
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
      )}

      {/* Assessments / Statement of Account */}
      {activeTab === 'assessments' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Term</th>{ !isStudent && <th>Student</th> }<th>Net Amount</th><th>Paid</th><th>Balance</th><th>Status</th>{isStudent && <th>Action</th>}</tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length: isStudent ? 6 : 6}).map((_,j) => <td key={j}><div className="skeleton" style={{height:14}} /></td>)}</tr>)
                : data.length === 0 ? <tr><td colSpan={isStudent ? 6 : 6} className="table-empty">
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle size={48} style={{ opacity: 0.2, margin: '0 auto 16px', color: 'var(--success)' }} />
                    <div style={{ fontWeight: 600 }}>All Cleared!</div>
                    <p style={{ fontSize: 13, marginTop: 4 }}>You don't have any active assessments or statements of account right now.</p>
                  </div>
                </td></tr>
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
                    {isStudent && (
                      <td>
                        {a.balance > 0 ? (
                          <button className="btn btn-primary btn-sm" onClick={() => setShowPayModal(a)} style={{ whiteSpace: 'nowrap' }}>
                            <DollarSign size={14} style={{ marginRight: 4 }} /> Pay Now
                          </button>
                        ) : (
                          <span className="text-muted" style={{ fontSize: 12 }}>Cleared</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPayModal(null)}>
          <div className="modal animate-slide" style={{ background: 'rgba(15, 17, 26, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={18} /> Make Payment</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowPayModal(null)}>✕</button>
            </div>
            <div style={{ padding: '0 0 20px 0' }}>
              <div style={{ marginBottom: 20, textAlign: 'center', padding: 20, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Amount Due</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6' }}>₱{(showPayModal.balance || 0).toLocaleString()}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-input">
                  <option>Credit / Debit Card</option>
                  <option>GCash</option>
                  <option>Maya</option>
                  <option>Online Bank Transfer</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => setShowPayModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {
                  toast.success('Payment processed successfully! (Simulated)');
                  setShowPayModal(null);
                  fetchData(); // Refresh data
                }}>Confirm Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Modals */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal animate-slide">
            <div className="modal-header">
              <h3 className="modal-title">
                {showAddModal === 'fee' && 'Add Fee'}
                {showAddModal === 'assessment' && 'Generate Assessment'}
                {showAddModal === 'payment' && 'Record Payment'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {showAddModal === 'fee' && (
                <>
                  <div className="form-group"><label className="form-label">Fee Name</label><input className="form-input" placeholder="e.g. Tuition Fee" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Amount</label><input type="number" className="form-input" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Category</label>
                    <select className="form-select" value={formData.category || 'tuition'} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option value="tuition">Tuition</option><option value="miscellaneous">Miscellaneous</option><option value="laboratory">Laboratory</option><option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}
              {showAddModal === 'assessment' && (
                <>
                  <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" placeholder="Enter student ID" value={formData.student || ''} onChange={e => setFormData({ ...formData, student: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Academic Year</label><input className="form-input" placeholder="e.g. 2024-2025" value={formData.academicYear || ''} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Discount (Optional)</label><input type="number" className="form-input" value={formData.discount || ''} onChange={e => setFormData({ ...formData, discount: e.target.value })} /></div>
                </>
              )}
              {showAddModal === 'payment' && (
                <>
                  <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" placeholder="Enter student ID" value={formData.student || ''} onChange={e => setFormData({ ...formData, student: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Amount</label><input type="number" className="form-input" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Method</label>
                    <select className="form-select" value={formData.method || 'cash'} onChange={e => setFormData({ ...formData, method: e.target.value })}>
                      <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  let endpoint = '';
                  let payload = { ...formData };
                  if (showAddModal === 'fee') endpoint = '/financial/fees';
                  if (showAddModal === 'assessment') {
                    endpoint = '/financial/assessments';
                    payload.fees = []; // mock fees payload
                  }
                  if (showAddModal === 'payment') endpoint = '/financial/payments/cash';

                  await api.post(endpoint, payload);
                  toast.success('Successfully saved');
                  setShowAddModal(false);
                  fetchData();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Action failed. Check console for details or check if ID exists.');
                }
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
