import { Building2 } from 'lucide-react';
export default function RoomsPage() {
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Room Management</h1></div>
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <Building2 size={48} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
        <div style={{ color: 'var(--text-muted)' }}>Room Management — Coming Soon</div>
      </div>
    </div>
  );
}
