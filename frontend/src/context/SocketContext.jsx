import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore, useNotifStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { MessageSquare, Bell, Megaphone } from 'lucide-react';

const SocketContext = createContext({
  socket: null,
  online: false,
});

export const useSocket = () => useContext(SocketContext);

// Web Audio API Synthesized Premium Chimes
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.6);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.6);
  } catch (_) {}
};

const playChatSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(587.33, now + 0.08); // D5
    osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.18); // B5
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  } catch (_) {}
};

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchNotifications } = useNotifStore();
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setOnline(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(socketUrl, {
      auth: { token: localStorage.getItem('accessToken') },
      reconnectionAttempts: 10,
      reconnectionDelay: 2500,
    });

    s.on('connect', () => {
      setOnline(true);
      s.emit('join-user', user._id);
      if (user.schoolId) {
        s.emit('join-school', user.schoolId);
      }
    });

    s.on('disconnect', () => {
      setOnline(false);
    });

    s.on('new-notification', (notif) => {
      // Reload notifications count & sidebar/topbar lists
      fetchNotifications();
      playNotificationSound();
      
      // Show dynamic toast
      toast((t) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--primary)',
            padding: 6,
            borderRadius: '50%',
            display: 'flex'
          }}>
            <Bell size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{notif.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{notif.message}</div>
          </div>
        </div>
      ), { duration: 4000 });
    });

    s.on('new-announcement', (ann) => {
      playNotificationSound();
      toast((t) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--warning)',
            padding: 6,
            borderRadius: '50%',
            display: 'flex'
          }}>
            <Megaphone size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>New Announcement</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{ann.title}</div>
          </div>
        </div>
      ), { duration: 5000 });
    });

    s.on('message-notification', (data) => {
      // Check if user is currently looking at this chat
      const isCurrentlyInThisChat = 
        window.location.pathname === '/messages' &&
        document.body.getAttribute('data-active-conversation') === data.conversationId;

      if (!isCurrentlyInThisChat) {
        playChatSound();
        toast((t) => (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}
               onClick={() => { window.location.href = '/messages'; toast.dismiss(t.id); }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--success)',
              padding: 6,
              borderRadius: '50%',
              display: 'flex'
            }}>
              <MessageSquare size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{data.senderName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{data.content}</div>
            </div>
          </div>
        ), { duration: 4000 });
      }
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setOnline(false);
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, online }}>
      {children}
    </SocketContext.Provider>
  );
}
