import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, Edit2, UserX, UserCheck, GraduationCap, Download, Upload, QrCode } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_BADGE = {
  active: 'badge-green', inactive: 'badge-gray', irregular: 'badge-yellow',
  graduated: 'badge-blue', dropped: 'badge-red', transferee: 'badge-purple', archived: 'badge-gray',
};

function StudentRow({ student, onView, onEdit, onAction }) {
  const user = student.userId;
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'S';

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.avatar ? (
            <img src={user.avatar} className="avatar avatar-sm" alt="" />
          ) : (
            <div className="avatar avatar-sm">{initials}</div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>
      </td>
      <td>
        <code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>
          {student.studentId}
        </code>
      </td>
      <td><span style={{ fontSize: 13 }}>{student.program?.name || student.gradeLevel || '—'}</span></td>
      <td><span style={{ fontSize: 13 }}>{student.yearLevel ? `Year ${student.yearLevel}` : student.section || '—'}</span></td>
      <td>
        <span className={`badge ${STATUS_BADGE[student.academicStatus] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
          {student.academicStatus}
        </span>
      </td>
      <td>
        <span className={`badge ${student.enrollmentStatus === 'enrolled' ? 'badge-green' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
          {student.enrollmentStatus}
        </span>
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {student.createdAt ? format(new Date(student.createdAt), 'MMM d, yyyy') : '—'}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onView(student)} title="View">
            <Eye size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(student)} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onAction(student, 'qr')} title="QR Code">
            <QrCode size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddStudentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', email: '', gender: '',
    birthDate: '', phone: '', gradeLevel: '', yearLevel: '', section: '',
    fatherName: '', motherName: '', guardianName: '', guardianPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/students', {
        firstName: form.firstName, middleName: form.middleName, lastName: form.lastName,
        email: form.email,
        gender: form.gender, birthDate: form.birthDate, phone: form.phone,
        gradeLevel: form.gradeLevel, yearLevel: form.yearLevel ? Number(form.yearLevel) : undefined,
        section: form.section,
        father: { name: form.fatherName },
        mother: { name: form.motherName },
        guardian: { name: form.guardianName, contactNumber: form.guardianPhone },
      });
      toast.success('Student added successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', required }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      <input className="form-input" type={type} value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} required={required} />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">Add New Student</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-400)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <GraduationCap size={14} /> Personal Information
              </h4>
              <div className="form-row cols-3">
                <Field label="First Name" name="firstName" required />
                <Field label="Middle Name" name="middleName" />
                <Field label="Last Name" name="lastName" required />
              </div>
              <div className="form-row cols-3" style={{ marginTop: 12 }}>
                <Field label="Email" name="email" type="email" required />
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <Field label="Birth Date" name="birthDate" type="date" />
              </div>
              <div className="form-row cols-2" style={{ marginTop: 12 }}>
                <Field label="Phone Number" name="phone" />
                <div className="form-group">
                  <label className="form-label">Year Level (College)</label>
                  <select className="form-input" value={form.yearLevel} onChange={e => setForm(p => ({ ...p, yearLevel: e.target.value }))}>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option><option value="2">2nd Year</option>
                    <option value="3">3rd Year</option><option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-400)', marginBottom: 12 }}>Family Information</h4>
              <div className="form-row cols-2">
                <Field label="Father's Name" name="fatherName" />
                <Field label="Mother's Name" name="motherName" />
              </div>
              <div className="form-row cols-2" style={{ marginTop: 12 }}>
                <Field label="Guardian Name" name="guardianName" />
                <Field label="Guardian Phone" name="guardianPhone" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewStudentModal({ student, onClose }) {
  const user = student.userId;
  const initials = user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'S';
  const [activeTab, setActiveTab] = useState('info');

  const tabs = ['info', 'family', 'academic', 'documents', 'medical'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl animate-slide">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {user?.avatar ? <img src={user.avatar} className="avatar avatar-lg" alt="" /> : <div className="avatar avatar-lg">{initials}</div>}
            <div>
              <h3 className="modal-title">{user?.firstName} {user?.middleName} {user?.lastName}</h3>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>{student.studentId}</code>
                <span className={`badge ${STATUS_BADGE[student.academicStatus]}`}>{student.academicStatus}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="form-row cols-2">
            {[
              ['Email', user?.email], ['Phone', user?.phone], ['Gender', user?.gender],
              ['Birth Date', user?.birthDate ? format(new Date(user.birthDate), 'MMM d, yyyy') : '—'],
              ['Nationality', student.citizenship], ['Blood Type', student.bloodType],
              ['PWD', student.pwdStatus ? 'Yes' : 'No'], ['Program', student.program?.name],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{val || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'family' && (
          <div className="grid-3">
            {[
              ['Father', student.father], ['Mother', student.mother], ['Guardian', student.guardian],
            ].map(([type, info]) => (
              <div key={type} className="card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--blue-400)' }}>{type}</div>
                {info?.name ? Object.entries(info).filter(([k, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k}</div>
                    <div style={{ fontSize: 12 }}>{v}</div>
                  </div>
                )) : <div className="text-muted text-sm">No data</div>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            {student.documents?.length === 0 ? (
              <div className="table-empty">No documents uploaded</div>
            ) : (
              <div className="grid-3">
                {student.documents?.map((doc, i) => (
                  <div key={i} className="card" style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 13, marginBottom: 6 }}>{doc.type?.replace(/_/g, ' ')}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className={`badge ${doc.verified ? 'badge-green' : 'badge-yellow'}`}>{doc.verified ? 'Verified' : 'Pending'}</span>
                      {doc.url && <a href={doc.url} target="_blank" className="badge badge-blue">View</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ academicStatus: '', enrollmentStatus: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...filters });
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/students?${params}`);
      setStudents(data.students);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const pages = Math.ceil(total / 15);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-sub">{total.toLocaleString()} total students</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Download size={15} /> Export
          </button>
          <button className="btn btn-secondary">
            <Upload size={15} /> Import
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, minWidth: 250 }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input placeholder="Search by name, email, student ID..." value={search} onChange={handleSearch} />
          </div>
          <select className="filter-select" value={filters.academicStatus} onChange={e => setFilters(p => ({ ...p, academicStatus: e.target.value }))}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="graduated">Graduated</option>
            <option value="dropped">Dropped</option>
            <option value="transferee">Transferee</option>
            <option value="archived">Archived</option>
          </select>
          <select className="filter-select" value={filters.enrollmentStatus} onChange={e => setFilters(p => ({ ...p, enrollmentStatus: e.target.value }))}>
            <option value="">All Enrollment</option>
            <option value="enrolled">Enrolled</option>
            <option value="not_enrolled">Not Enrolled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Program / Grade</th>
                <th>Year / Section</th>
                <th>Academic Status</th>
                <th>Enrollment</th>
                <th>Enrolled Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr><td colSpan={8} className="table-empty">No students found</td></tr>
              ) : students.map(s => (
                <StudentRow key={s._id} student={s}
                  onView={() => setViewStudent(s)}
                  onEdit={() => {}}
                  onAction={() => {}}
                />
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pagination" style={{ marginTop: 16 }}>
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
            {Array.from({ length: Math.min(7, pages) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page - 3 + i;
              return p <= pages ? (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ) : null;
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>→</button>
          </div>
        )}
      </div>

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchStudents(); }} />}
      {viewStudent && <ViewStudentModal student={viewStudent} onClose={() => setViewStudent(null)} />}
    </div>
  );
}
