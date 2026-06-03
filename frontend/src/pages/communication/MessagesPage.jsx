import { useState, useEffect, useRef } from 'react';
import { Send, Plus, Search, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

let socket;

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('accessToken') },
    });
    socket.emit('join-user', user?._id);
    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/communication/conversations');
      setConversations(data.conversations || []);
    } catch { }
  };

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    socket.emit('join-conversation', conv.conversationId);
    setLoading(true);
    try {
      const { data } = await api.get(`/communication/conversations/${conv.conversationId}/messages`);
      setMessages(data.messages || []);
    } catch { } finally { setLoading(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedConv) return;
    const content = input;
    setInput('');
    try {
      await api.post(`/communication/conversations/${selectedConv.conversationId}/messages`, { content });
      fetchConversations();
    } catch { setInput(content); toast.error('Failed to send'); }
  };

  const getOtherParticipant = (conv) => conv.participants?.find(p => p._id !== user?._id);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 160px)', gap: 16 }}>
      {/* Conversation List */}
      <div className="card" style={{ width: 300, display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Messages</span>
          <button className="btn btn-primary btn-sm btn-icon"><Plus size={14} /></button>
        </div>
        <div className="search-box" style={{ margin: '12px', width: 'calc(100% - 24px)' }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search..." style={{ width: '100%' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div className="table-empty" style={{ padding: 24 }}>No conversations yet</div>
          ) : conversations.map(conv => {
            const other = getOtherParticipant(conv);
            const initials = other ? `${other.firstName?.[0]}${other.lastName?.[0]}` : 'G';
            const isSelected = selectedConv?.conversationId === conv.conversationId;
            return (
              <div key={conv._id} onClick={() => openConversation(conv)}
                style={{ padding: '12px 16px', cursor: 'pointer', background: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent', borderLeft: isSelected ? '3px solid var(--primary-light)' : '3px solid transparent', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="avatar avatar-sm">{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, truncate: true }}>{other ? `${other.firstName} ${other.lastName}` : conv.name || 'Group Chat'}</div>
                    <div className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {conv.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                  {conv.lastMessage?.sentAt && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatDistanceToNow(new Date(conv.lastMessage.sentAt), { addSuffix: false })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
        {!selectedConv ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12 }}>
            <MessageSquare size={48} style={{ opacity: 0.2 }} />
            <div style={{ color: 'var(--text-muted)' }}>Select a conversation to start messaging</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              {(() => { const other = getOtherParticipant(selectedConv); return other ? (
                <>
                  <div className="avatar avatar-sm">{other.firstName?.[0]}{other.lastName?.[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{other.firstName} {other.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{other.role?.replace(/_/g,' ')}</div>
                  </div>
                </>
              ) : <div style={{ fontWeight: 700 }}>{selectedConv.name}</div>; })()}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading ? <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div> :
              messages.length === 0 ? <div className="table-empty">No messages yet. Say hello!</div> :
              messages.map(msg => {
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8 }}>
                    {!isMine && <div className="avatar avatar-sm">{msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}</div>}
                    <div style={{
                      maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMine ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'var(--bg-secondary)',
                      fontSize: 13, lineHeight: 1.6,
                    }}>
                      {msg.content}
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: false }) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <input className="form-input" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
                <Send size={15} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
