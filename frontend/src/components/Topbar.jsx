import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, ChevronDown, User, Settings, LogOut, Check, Dot } from 'lucide-react';
import { useAuthStore, useNotifStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ROLE_LABELS = {
  super_admin: 'Super Admin', school_owner: 'School Owner', principal: 'Principal',
  registrar: 'Registrar', teacher: 'Teacher', student: 'Student', parent: 'Parent',
  cashier: 'Cashier', accountant: 'Accountant', librarian: 'Librarian',
  nurse: 'Nurse', guidance_counselor: 'Guidance Counselor', hr_staff: 'HR Staff',
  employee: 'Employee', alumni: 'Alumni',
};

export default function Topbar({ collapsed, onToggle, title }) {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotifStore();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef();
  const userRef = useRef();

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <header className={`topbar ${collapsed ? 'collapsed' : ''}`}>
      <button className="btn-ghost btn-icon" onClick={onToggle} style={{ color: 'var(--text-secondary)' }}>
        <Menu size={20} />
      </button>

      <span className="topbar-title">{title}</span>

      <div className="topbar-right">
        {/* Search */}
        <div className="search-box" style={{ display: 'none' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search..." />
        </div>

        {/* Notifications */}
        <div className="dropdown" ref={notifRef}>
          <button className="topbar-btn" onClick={() => { setShowNotif(v => !v); setShowUser(false); }}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>
          {showNotif && (
            <div className="dropdown-menu" style={{ width: 340, right: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications {unreadCount > 0 && <span className="badge badge-red" style={{ marginLeft: 6 }}>{unreadCount}</span>}</span>
                {unreadCount > 0 && <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={markAllRead}>Mark all read</button>}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="table-empty" style={{ padding: 24 }}>No notifications</div>
                ) : notifications.map(n => (
                  <div key={n._id} className="dropdown-item" style={{ alignItems: 'flex-start', opacity: n.isRead ? 0.6 : 1 }}
                    onClick={() => { markRead(n._id); if (n.link) navigate(n.link); setShowNotif(false); }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'transparent' : 'var(--primary-light)', flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.message?.substring(0, 80)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '8px 4px 4px' }}>
                <button className="btn-ghost w-full" style={{ fontSize: 12, textAlign: 'center' }} onClick={() => { navigate('/notifications'); setShowNotif(false); }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="dropdown" ref={userRef}>
          <div className="user-menu" onClick={() => { setShowUser(v => !v); setShowNotif(false); }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="user-avatar" />
            ) : (
              <div className="user-avatar">{initials}</div>
            )}
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{ROLE_LABELS[user?.role] || user?.role}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: 4 }} />
          </div>
          {showUser && (
            <div className="dropdown-menu">
              <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <div className="dropdown-item" onClick={() => { navigate('/profile'); setShowUser(false); }}>
                <User size={15} /> My Profile
              </div>
              <div className="dropdown-item" onClick={() => { navigate('/settings'); setShowUser(false); }}>
                <Settings size={15} /> Settings
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
