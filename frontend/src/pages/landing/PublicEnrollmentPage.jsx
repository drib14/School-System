import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronLeft, ChevronRight, Check, School, User, BookOpen, FileText, CheckCircle, ArrowLeft, Star, Award, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import CustomSelect from '../../components/forms/CustomSelect';

const YEAR_LEVELS = {
  elementary: { label: 'Elementary', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'], icon: Star, color: '#f59e0b', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  jhs: { label: 'Junior High School', grades: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'], icon: BookOpen, color: '#10b981', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  shs: { label: 'Senior High School', grades: ['Grade 11', 'Grade 12'], icon: Award, color: '#3b82f6', gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', tracks: ['STEM', 'ABM', 'HUMSS', 'TVL - ICT', 'TVL - Home Economics', 'TVL - Industrial Arts', 'TVL - Agriculture', 'Arts & Design', 'Sports'] },
  college: {
    label: 'College', grades: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
    icon: GraduationCap, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    programs: [
      'BS Information Technology', 'BS Computer Science', 'BS Business Administration',
      'BS Accountancy', 'BS Nursing', 'BS Education (BEED)', 'BS Secondary Education (BSED)',
      'BS Criminology', 'BS Hotel & Restaurant Management', 'BS Tourism Management',
      'BS Civil Engineering', 'BS Electrical Engineering', 'BS Mechanical Engineering',
      'AB Communication', 'AB Political Science', 'BS Psychology', 'BS Social Work',
    ]
  },
  graduate: { label: 'Graduate School', grades: ['1st Year', '2nd Year', '3rd Year'], icon: Layers, color: '#06b6d4', gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)', programs: ['Master of Arts in Education', 'Master of Business Administration (MBA)', 'Master of Science in Information Technology', 'Master of Public Administration', 'Doctor of Education', 'Doctor of Philosophy'] },
};

const GENDERS = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' }];
const CIVIL_STATUS = [{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'widowed', label: 'Widowed' }, { value: 'separated', label: 'Separated' }];
const ENROLLMENT_TYPES = [{ value: 'new', label: 'New Student' }, { value: 'transferee', label: 'Transferee' }, { value: 'returning', label: 'Returning Student' }, { value: 'cross_enrollee', label: 'Cross Enrollee' }];
const STEPS = ['Level & Type', 'Personal Info', 'Family & Contact', 'Academic Info', 'Review & Submit'];

function FieldGroup({ children, cols = 2 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>{children}</div>;
}

function Field({ label, children, required, col }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: col ? `span ${col}` : undefined }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{required && ' *'}</label>
      {children}
    </div>
  );
}

const inputStyle = (accentColor = '#3b82f6') => ({
  padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%',
});

export default function PublicEnrollmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const [form, setForm] = useState({
    // Step 0 — Level
    level: '', grade: '', track: '', program: '', enrollmentType: 'new', academicYear: '2025-2026', semester: '1st',
    // Step 1 — Personal
    firstName: '', lastName: '', middleName: '', suffix: '', birthDate: '', birthPlace: '', gender: '', civilStatus: 'single', nationality: 'Filipino', religion: '',
    // Step 2 — Family & Contact
    address: '', city: '', province: '', zip: '', contactNumber: '', email: '',
    guardianName: '', guardianRelation: '', guardianContact: '', guardianEmail: '',
    // Step 3 — Academic
    lastSchoolAttended: '', lastSchoolAddress: '', lastGradeYear: '', lastSchoolType: 'public', lrn: '', awards: '',
    // Misc
    remarks: '',
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressTimer, setAddressTimer] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: typeof e === 'string' ? e : e.target.value }));

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, address: val }));
    
    if (addressTimer) clearTimeout(addressTimer);
    if (!val.trim()) {
      setAddressSuggestions([]);
      return;
    }
    
    setAddressTimer(setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const token = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;
        const res = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${token}&q=${encodeURIComponent(val)}&limit=5&countrycodes=ph`);
        const data = await res.json();
        setAddressSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('LocationIQ Error:', err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 600));
  };

  const selectAddress = (item) => {
    const addr = item.address || {};
    setForm(f => ({
      ...f,
      address: item.display_name,
      city: addr.city || addr.town || addr.county || '',
      province: addr.state || addr.region || '',
      zip: addr.postcode || '',
    }));
    setAddressSuggestions([]);
  };

  const levelInfo = YEAR_LEVELS[form.level];

  const validate = () => {
    if (step === 0) return form.level && form.grade && form.enrollmentType && ((form.level === 'shs' && form.track) || form.level !== 'shs') && ((['college', 'graduate'].includes(form.level) && form.program) || !['college', 'graduate'].includes(form.level));
    if (step === 1) return form.firstName && form.lastName && form.birthDate && form.gender;
    if (step === 2) return form.address && form.contactNumber;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { ...form, status: 'pending', submittedAt: new Date() };
      const { data } = await api.post('/admission/applications', payload);
      const ref = data.referenceNumber || data.admissionNo || data.application?.applicationNumber || `ENR-${Date.now()}`;
      setReferenceNo(ref);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '48px 32px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 30px rgba(16,185,129,0.35)' }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Enrollment Submitted!</h2>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            Welcome, <strong style={{ color: '#f1f5f9' }}>{form.firstName}</strong>! Your enrollment application for <strong style={{ color: '#60a5fa' }}>{levelInfo?.label} — {form.grade}</strong> has been received.
          </p>
          <div style={{ padding: '16px 24px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Reference Number</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.05em' }}>{referenceNo}</p>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>
            Please keep your reference number for tracking. Your student portal credentials have been sent to your email (<strong style={{ color: '#f1f5f9' }}>{form.email}</strong>). You can now login to check your admission status!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/')} style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Back to Home
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Go to Student Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", padding: '80px 24px 60px' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', padding: '0 32px', zIndex: 100, gap: 16 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <School size={18} style={{ color: '#3b82f6' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14 }}>Enrollment Portal</span>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
            <GraduationCap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Student Enrollment Form</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>A.Y. 2025-2026 · Fill out all required fields to complete your enrollment application</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 56 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, zIndex: 1, flexShrink: 0, transition: 'all 0.3s', background: i < step ? '#10b981' : i === step ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(30,41,59,0.8)', border: i <= step ? 'none' : '2px solid rgba(148,163,184,0.2)', color: i <= step ? 'white' : '#64748b', boxShadow: i === step ? '0 4px 14px rgba(16,185,129,0.4)' : 'none' }}>
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span style={{ position: 'absolute', top: 44, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', color: i === step ? '#10b981' : i < step ? '#10b981' : '#64748b', letterSpacing: '0.03em' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#10b981' : 'rgba(148,163,184,0.15)', transition: 'background 0.4s' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 20, padding: '36px 40px', backdropFilter: 'blur(12px)', marginTop: 40 }}>

          {/* STEP 0 — Level & Type */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><BookOpen size={18} style={{ color: '#10b981' }} /> Select Academic Level</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
                {Object.entries(YEAR_LEVELS).map(([key, lv]) => (
                  <div key={key} onClick={() => setForm(f => ({ ...f, level: key, grade: '', track: '', program: '' }))}
                    style={{ padding: '18px 20px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.25s', border: form.level === key ? `2px solid ${lv.color}` : '2px solid rgba(148,163,184,0.12)', background: form.level === key ? lv.color + '15' : 'rgba(15,23,42,0.5)', boxShadow: form.level === key ? `0 8px 20px ${lv.color}25` : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: form.level === key ? lv.gradient : 'rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <lv.icon size={20} style={{ color: form.level === key ? 'white' : '#64748b' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: form.level === key ? lv.color : '#f1f5f9' }}>{lv.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{lv.grades[0]} – {lv.grades[lv.grades.length - 1]}</div>
                  </div>
                ))}
              </div>

              {form.level && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <Field label="Grade / Year Level" required>
                    <CustomSelect value={form.grade} onChange={set('grade')} options={(levelInfo?.grades || []).map(g => ({ value: g, label: g }))} placeholder="Select grade" />
                  </Field>
                  {form.level === 'shs' && (
                    <Field label="SHS Track / Strand" required>
                      <CustomSelect value={form.track} onChange={set('track')} options={(levelInfo?.tracks || []).map(t => ({ value: t, label: t }))} placeholder="Select track" />
                    </Field>
                  )}
                  {['college', 'graduate'].includes(form.level) && (
                    <Field label="Program / Course" required>
                      <CustomSelect value={form.program} onChange={set('program')} options={(levelInfo?.programs || []).map(p => ({ value: p, label: p }))} placeholder="Select program" />
                    </Field>
                  )}
                  <Field label="Enrollment Type" required>
                    <CustomSelect value={form.enrollmentType} onChange={set('enrollmentType')} options={ENROLLMENT_TYPES} />
                  </Field>
                  <FieldGroup cols={2}>
                    <Field label="Academic Year" required>
                      <CustomSelect value={form.academicYear} onChange={set('academicYear')} options={[{ value: '2025-2026', label: 'A.Y. 2025-2026' }]} />
                    </Field>
                    {form.level !== 'elementary' && form.level !== 'jhs' && (
                      <Field label="Semester" required>
                        <CustomSelect value={form.semester} onChange={set('semester')} options={[{ value: '1st', label: '1st Semester' }, { value: '2nd', label: '2nd Semester' }, { value: 'Summer', label: 'Summer' }]} />
                      </Field>
                    )}
                  </FieldGroup>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Personal Info */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><User size={18} style={{ color: '#3b82f6' }} /> Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FieldGroup cols={3}>
                  {['firstName', 'middleName', 'lastName'].map((k, i) => (
                    <Field key={k} label={['First Name', 'Middle Name', 'Last Name'][i]} required={k !== 'middleName'}>
                      <input value={form[k]} onChange={set(k)} placeholder={['First Name', 'Middle Name', 'Last Name'][i]} style={inputStyle()} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                    </Field>
                  ))}
                </FieldGroup>
                <FieldGroup>
                  <Field label="Date of Birth" required>
                    <input type="date" value={form.birthDate} onChange={set('birthDate')} style={inputStyle()} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                  </Field>
                  <Field label="Place of Birth">
                    <input value={form.birthPlace} onChange={set('birthPlace')} placeholder="City / Municipality" style={inputStyle()} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field label="Gender" required>
                    <CustomSelect value={form.gender} onChange={set('gender')} options={GENDERS} placeholder="Select gender" />
                  </Field>
                  <Field label="Civil Status">
                    <CustomSelect value={form.civilStatus} onChange={set('civilStatus')} options={CIVIL_STATUS} />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field label="Nationality">
                    <input value={form.nationality} onChange={set('nationality')} placeholder="Nationality" style={inputStyle()} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                  </Field>
                  <Field label="Religion">
                    <input value={form.religion} onChange={set('religion')} placeholder="Religion (optional)" style={inputStyle()} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                  </Field>
                </FieldGroup>
              </div>
            </div>
          )}

          {/* STEP 2 — Family & Contact */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={18} style={{ color: '#f59e0b' }} /> Family & Contact Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Home Address" required col={2}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      value={form.address} 
                      onChange={handleAddressChange} 
                      placeholder="Start typing your address to autocomplete..." 
                      style={inputStyle('#f59e0b')} 
                      onFocus={e => e.target.style.borderColor = '#f59e0b'} 
                      onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} 
                    />
                    {isSearchingAddress && <div style={{ position: 'absolute', right: 12, top: 10, fontSize: 12, color: '#94a3b8' }}>Searching...</div>}
                    {addressSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, marginTop: 4, zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                        {addressSuggestions.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => selectAddress(item)}
                            style={{ padding: '10px 14px', fontSize: 12, borderBottom: idx < addressSuggestions.length - 1 ? '1px solid rgba(148,163,184,0.1)' : 'none', cursor: 'pointer', color: '#f1f5f9' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {item.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
                <FieldGroup cols={3}>
                  {[['city', 'City / Municipality'], ['province', 'Province'], ['zip', 'ZIP Code']].map(([k, lb]) => (
                    <Field key={k} label={lb}>
                      <input value={form[k]} onChange={set(k)} placeholder={lb} style={inputStyle('#f59e0b')} onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                    </Field>
                  ))}
                </FieldGroup>
                <FieldGroup>
                  {[['contactNumber', 'Contact Number', true], ['email', 'Email Address (optional)', false]].map(([k, lb, req]) => (
                    <Field key={k} label={lb} required={req}>
                      <input value={form[k]} onChange={set(k)} placeholder={lb} style={inputStyle('#f59e0b')} onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                    </Field>
                  ))}
                </FieldGroup>
                <div style={{ borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: 20, marginTop: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Parent / Guardian</p>
                  <FieldGroup cols={3}>
                    {[['guardianName', 'Guardian Full Name'], ['guardianRelation', 'Relationship'], ['guardianContact', 'Contact Number']].map(([k, lb]) => (
                      <Field key={k} label={lb}>
                        <input value={form[k]} onChange={set(k)} placeholder={lb} style={inputStyle('#f59e0b')} onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                      </Field>
                    ))}
                  </FieldGroup>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Academic History */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><School size={18} style={{ color: '#8b5cf6' }} /> Academic History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Last School Attended">
                  <input value={form.lastSchoolAttended} onChange={set('lastSchoolAttended')} placeholder="Name of school" style={inputStyle('#8b5cf6')} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                </Field>
                <Field label="School Address">
                  <input value={form.lastSchoolAddress} onChange={set('lastSchoolAddress')} placeholder="City, Province" style={inputStyle('#8b5cf6')} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                </Field>
                <FieldGroup>
                  <Field label="Last Grade / Year Completed">
                    <input value={form.lastGradeYear} onChange={set('lastGradeYear')} placeholder="e.g. Grade 10, 3rd Year College" style={inputStyle('#8b5cf6')} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                  </Field>
                  <Field label="School Type">
                    <CustomSelect value={form.lastSchoolType} onChange={set('lastSchoolType')} options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }, { value: 'international', label: 'International' }]} />
                  </Field>
                </FieldGroup>
                <Field label="Learner Reference Number (LRN)">
                  <input value={form.lrn} onChange={set('lrn')} placeholder="12-digit LRN (for Basic Education)" style={inputStyle('#8b5cf6')} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                </Field>
                <Field label="Academic Awards / Honors Received">
                  <textarea value={form.awards} onChange={set('awards')} rows={3} placeholder="e.g. With Highest Honors, Valedictorian, Dean's Lister..." style={{ ...inputStyle('#8b5cf6'), resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Review Enrollment Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['Academic Level', levelInfo?.label || '—'],
                  ['Level & Track', `${levelInfo?.label || ''} ${form.track ? `— ${form.track}` : ''} ${form.program ? `— ${form.program}` : ''}`],
                  ['Grade / Year', form.grade],
                  ['Academic Year', (form.level === 'elementary' || form.level === 'jhs') ? form.academicYear : `${form.academicYear} — ${form.semester} Semester`],
                  ['Enrollment Type', ENROLLMENT_TYPES.find(t => t.value === form.enrollmentType)?.label],
                  ['Full Name', `${form.firstName} ${form.middleName ? form.middleName + ' ' : ''}${form.lastName}`],
                  ['Date of Birth', form.birthDate],
                  ['Gender', form.gender],
                  ['Contact Number', form.contactNumber],
                  ['Email', form.email || '—'],
                  ['Address', `${form.address}, ${form.city}, ${form.province}`],
                  ['Guardian', form.guardianName ? `${form.guardianName} (${form.guardianRelation})` : '—'],
                  ['Last School', form.lastSchoolAttended || '—'],
                  ['LRN', form.lrn || '—'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{value || '—'}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
                  By submitting this form, you confirm that all information provided is accurate and complete. You will receive a reference number after submission.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(148,163,184,0.08)' }}>
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => { if (validate()) setStep(s => s + 1); else toast.error('Please fill in all required fields.'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.35)', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Submitting...' : <><Check size={16} /> Submit Enrollment</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
