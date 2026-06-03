import { Settings } from 'lucide-react';
export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header"><h1 className="page-title">System Settings</h1></div>
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { label: 'School Name', value: 'International State Colleges of the Philippines' },
            { label: 'Academic Year', value: '2025-2026' },
            { label: 'Current Semester', value: '1st Semester' },
            { label: 'School Level', value: 'Both (K-12 and College)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
