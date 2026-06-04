import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Clock, AlertCircle, BookOpen, CreditCard, UserCheck, Megaphone, MessageSquare, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import CustomSelect from '../../components/forms/CustomSelect';

const TYPE_ICON = {
  grade: BookOpen,
  payment: CreditCard,
  attendance: UserCheck,
  announcement: Megaphone,
  enrollment: UserCheck,
  message: MessageSquare,
  system: Bell,
  alert: AlertCircle,
  reminder: Clock,
};

const TYPE_COLOR = {
  grade: 'blue', payment: 'green', attendance: 'purple',
  announcement: 'yellow', enrollment: 'blue', message: 'blue',
  system: 'gray', alert: 'red', reminder: 'yellow',
};

const PRIORITY_COLOR = { low: 'badge-gray', normal: 'badge-blue', high: 'badge-yellow', urgent: 'badge-red' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filter === 'unread') params.set('isRead', 'false');
      if (filter === 'read') params.set('isRead', 'true');
      if (typeFilter) params.set('type', typeFilter);

      const { data } = await api.get(`/communication/notifications?${params}`);
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [filter, typeFilter, page]);

  const markRead = async (id) => {
    try {
      await api.put(`/communication/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date() } : n));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await api.put('/communication/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/communication/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { toast.error('Failed'); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => !typeFilter || n.type === typeFilter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications
            {unreadCount > 0 && <span className="badge badge-red" style={{ fontSize: 12 }}>{unreadCount} unread</span>}
          </h1>
          <p className="page-sub">{total} total notifications</p>
        </div>
        <div className="page-actions">
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {['all', 'unread', 'read'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setFilter(f); setPage(1); }} style={{ textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
        <CustomSelect
          className="filter-cs"
          value={typeFilter}
          onChange={val => { setTypeFilter(val); setPage(1); }}
          options={[
            { value: '', label: 'All Types' },
            ...['grade', 'payment', 'attendance', 'announcement', 'enrollment', 'message', 'system', 'alert', 'reminder'].map(t => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1)
            }))
          ]}
        />
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
              </div>
            </div>
          </div>
        )) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Bell size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No notifications {filter !== 'all' ? `(${filter})` : ''}</div>
          </div>
        ) : filtered.map(notif => {
          const Icon = TYPE_ICON[notif.type] || Bell;
          const color = TYPE_COLOR[notif.type] || 'gray';
          return (
            <div
              key={notif._id}
              className="card"
              style={{
                padding: '14px 16px',
                cursor: notif.isRead ? 'default' : 'pointer',
                borderLeft: !notif.isRead ? `3px solid var(--primary)` : '3px solid transparent',
                background: !notif.isRead ? 'rgba(59,130,246,0.04)' : undefined,
                transition: 'all 0.15s ease',
              }}
              onClick={() => !notif.isRead && markRead(notif._id)}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: `rgba(var(--${color}-rgb, 59, 130, 246), 0.12)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: `var(--${color === 'gray' ? 'text-muted' : color === 'green' ? 'success' : color === 'red' ? 'danger' : 'primary'})`,
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: notif.isRead ? 500 : 700, fontSize: 14 }}>{notif.title}</span>
                    {!notif.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                    {notif.priority !== 'normal' && (
                      <span className={`badge ${PRIORITY_COLOR[notif.priority]}`} style={{ fontSize: 10 }}>{notif.priority}</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{notif.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span className={`badge badge-${color === 'gray' ? 'gray' : 'blue'}`} style={{ fontSize: 10 }}>{notif.type}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                    {notif.isRead && notif.readAt && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        <Check size={10} style={{ display: 'inline', marginRight: 2, verticalAlign: 'middle' }} />
                        Read {formatDistanceToNow(new Date(notif.readAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {!notif.isRead && (
                    <button className="btn btn-ghost btn-sm btn-icon" title="Mark as read"
                      onClick={e => { e.stopPropagation(); markRead(notif._id); }}>
                      <Check size={13} />
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Delete"
                    onClick={e => { e.stopPropagation(); deleteNotification(notif._id); }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}>Next</button>
        </div>
      )}
    </div>
  );
}
