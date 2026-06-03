import { useState, useEffect } from 'react';
import { Plus, Megaphone, Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const PRIORITY_COLOR = { normal: 'badge-gray', important: 'badge-yellow', urgent: 'badge-red' };

function AnnouncementCard({ ann }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{ borderLeft: `3px solid ${ann.priority === 'urgent' ? 'var(--danger)' : ann.priority === 'important' ? 'var(--warning)' : 'var(--border)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${PRIORITY_COLOR[ann.priority] || 'badge-gray'}`}>{ann.priority}</span>
            <span className="badge badge-blue">{ann.type}</span>
            {ann.audience?.map(a => <span key={a} className="badge badge-gray">{a}</span>)}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{ann.title}</h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div className="avatar avatar-sm" style={{ width: 20, height: 20, fontSize: 9 }}>
                {ann.createdBy?.firstName?.[0]}{ann.createdBy?.lastName?.[0]}
              </div>
              {ann.createdBy?.firstName} {ann.createdBy?.lastName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} />
              {ann.createdAt ? formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true }) : ''}
            </span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {expanded ? ann.content : ann.content?.substring(0, 200)}
        {ann.content?.length > 200 && (
          <button onClick={() => setExpanded(v => !v)} style={{ color: 'var(--blue-400)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, marginLeft: 6 }}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>
      {ann.attachments?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {ann.attachments.map((a, i) => (
            <a key={i} href={a.url} target="_blank" className="btn btn-secondary btn-sm">{a.name}</a>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateAnnouncementModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', content: '', type: 'school', audience: ['all'], priority: 'normal' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/communication/announcements', form);
      toast.success('Announcement posted!');
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">New Announcement</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Announcement title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="school">School-wide</option>
                <option value="department">Department</option>
                <option value="class">Class</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Audience</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['all','students','teachers','parents','staff','admin'].map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form.audience.includes(a)}
                    onChange={e => setForm(p => ({ ...p, audience: e.target.checked ? [...p.audience, a] : p.audience.filter(x => x !== a) }))} />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea className="form-input" rows={5} placeholder="Write your announcement..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required style={{ resize: 'vertical' }} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const canCreate = ['principal','registrar','teacher','super_admin','school_owner'].includes(user?.role);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/communication/announcements');
      setAnnouncements(data.announcements || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-sub">{announcements.length} announcements</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Post Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card"><div className="skeleton" style={{ height: 80 }} /></div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Megaphone size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
          <div style={{ color: 'var(--text-muted)' }}>No announcements yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map(a => <AnnouncementCard key={a._id} ann={a} />)}
        </div>
      )}

      {showCreate && <CreateAnnouncementModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchAnnouncements(); }} />}
    </div>
  );
}
