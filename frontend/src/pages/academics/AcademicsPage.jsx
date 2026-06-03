import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Plus, Search, BookOpen, ClipboardList, Calendar, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AcademicsPage() {
  const location = useLocation();
  const path = location.pathname;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getConfig = () => {
    if (path.includes('programs')) return { title: 'Academic Programs', endpoint: '/academics/programs', key: 'programs' };
    if (path.includes('subjects')) return { title: 'Subject Management', endpoint: '/academics/subjects', key: 'subjects' };
    if (path.includes('curriculum')) return { title: 'Curriculum Management', endpoint: '/academics/curriculum', key: 'curricula' };
    if (path.includes('schedules')) return { title: 'Class Schedules', endpoint: '/academics/schedules', key: 'schedules' };
    return { title: 'Academics', endpoint: '/academics/programs', key: 'programs' };
  };

  const config = getConfig();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(config.endpoint);
        setData(res[config.key] || []);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [path]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-sub">{data.length} records</p>
        </div>
        <div className="page-actions">
          {/* Sub-nav */}
          {[
            { path: '/academics/programs', label: 'Programs' },
            { path: '/academics/subjects', label: 'Subjects' },
            { path: '/academics/curriculum', label: 'Curriculum' },
            { path: '/academics/schedules', label: 'Schedules' },
          ].map(({ path: p, label }) => (
            <Link key={p} to={p} className={`btn ${location.pathname === p ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{label}</Link>
          ))}
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Add</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : data.length === 0 ? (
          <div className="table-empty">No {config.key} found. Add some to get started.</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {path.includes('programs') && <><th>Code</th><th>Name</th><th>Type</th><th>Duration</th><th>Status</th></>}
                  {path.includes('subjects') && <><th>Code</th><th>Name</th><th>Units</th><th>Category</th><th>Status</th></>}
                  {path.includes('schedules') && <><th>Subject</th><th>Teacher</th><th>Section</th><th>Room</th><th>Days/Time</th><th>Enrolled</th></>}
                  {path.includes('curriculum') && <><th>Name</th><th>Program</th><th>Version</th><th>Status</th></>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item._id}>
                    {path.includes('programs') && (
                      <>
                        <td><code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>{item.code}</code></td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td><span className="badge badge-blue">{item.type}</span></td>
                        <td>{item.duration ? `${item.duration} yrs` : '—'}</td>
                        <td><span className={`badge ${item.isActive ? 'badge-green' : 'badge-gray'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                      </>
                    )}
                    {path.includes('subjects') && (
                      <>
                        <td><code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>{item.code}</code></td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.units} units</td>
                        <td><span className="badge badge-blue">{item.category}</span></td>
                        <td><span className={`badge ${item.isActive ? 'badge-green' : 'badge-gray'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                      </>
                    )}
                    {path.includes('schedules') && (
                      <>
                        <td><div style={{ fontWeight: 600 }}>{item.subject?.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.subject?.code}</div></td>
                        <td>{item.teacher?.firstName} {item.teacher?.lastName}</td>
                        <td>{item.section}</td>
                        <td>{item.roomName || item.room?.name || '—'}</td>
                        <td style={{ fontSize: 12 }}>
                          {item.schedule?.map((s, i) => <div key={i}>{s.day} {s.startTime}-{s.endTime}</div>)}
                        </td>
                        <td>{item.enrolledCount}/{item.maxStudents}</td>
                      </>
                    )}
                    {path.includes('curriculum') && (
                      <>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.program?.name}</td>
                        <td>{item.version}</td>
                        <td><span className={`badge ${item.status === 'active' ? 'badge-green' : item.status === 'draft' ? 'badge-yellow' : 'badge-gray'}`}>{item.status}</span></td>
                      </>
                    )}
                    <td>
                      <button className="btn btn-ghost btn-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
