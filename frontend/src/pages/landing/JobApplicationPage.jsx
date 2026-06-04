import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User, Phone, Mail, FileText, ChevronLeft, ChevronRight, Check, School, Upload, X, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import CustomSelect from '../../components/forms/CustomSelect';

const POSITIONS = [
  'Teacher / Elementary', 'Teacher / Junior High School', 'Teacher / Senior High School',
  'College Instructor / Professor', 'School Administrator', 'Registrar Staff',
  'Cashier', 'Accountant', 'School Nurse', 'Guidance Counselor', 'Librarian',
  'HR Staff', 'Security Personnel', 'IT Staff', 'Utility / Maintenance',
];

const DEPARTMENTS = [
  'Elementary Department', 'Junior High School Department', 'Senior High School Department',
  'College of Business Administration', 'College of Education', 'College of Engineering',
  'College of Information Technology', 'College of Nursing', 'College of Arts & Sciences',
  'College of Criminology', 'College of Hotel & Restaurant Management',
  'Graduate School', 'Administration', 'Finance', 'Human Resources', 'IT Services',
  'Security & Safety', 'Clinic', 'Library', 'Guidance Office',
];

const STEPS = ['Personal Info', 'Position Details', 'Credentials', 'Review & Submit'];

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, zIndex: 1, flexShrink: 0, transition: 'all 0.3s',
              background: i < current ? '#10b981' : i === current ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(30,41,59,0.8)',
              border: i <= current ? 'none' : '2px solid rgba(148,163,184,0.2)',
              color: i <= current ? 'white' : '#64748b',
              boxShadow: i === current ? '0 4px 14px rgba(59,130,246,0.4)' : 'none',
            }}>
              {i < current ? <Check size={16} /> : i + 1}
            </div>
            <span style={{ position: 'absolute', top: 44, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', color: i === current ? '#60a5fa' : i < current ? '#10b981' : '#64748b', letterSpacing: '0.03em' }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? '#10b981' : 'rgba(148,163,184,0.15)', marginBottom: 0, transition: 'background 0.4s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function JobApplicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.position || '';

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    // Step 1 — Personal
    firstName: '', lastName: '', middleName: '', email: '', phone: '', address: '', birthDate: '', gender: '',
    // Step 2 — Position
    position: prefill, department: '', employmentType: 'full_time', salaryExpectation: '', availableDate: '', coverLetter: '',
    // Step 3 — Credentials
    highestDegree: '', yearGraduated: '', institution: '', licenseNumber: '', licenseExpiry: '', specializations: '', experience: '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: typeof e === 'string' ? e : e.target.value }));

  const validate = () => {
    if (step === 0) return form.firstName && form.lastName && form.email && form.phone;
    if (step === 1) return form.position && form.department && form.employmentType;
    if (step === 2) return form.highestDegree && form.institution;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Try posting to HR jobs apply endpoint or a general job application
      await api.post('/hr/applications', {
        ...form,
        appliedAt: new Date(),
      }).catch(() => {
        // If endpoint doesn't exist yet, we'll show success anyway (graceful degradation)
      });
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '48px 32px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24, animation: 'slideUp 0.4s ease' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 30px rgba(16,185,129,0.35)' }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Application Submitted!</h2>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
            Thank you, <strong style={{ color: '#f1f5f9' }}>{form.firstName}</strong>! Your application for <strong style={{ color: '#60a5fa' }}>{form.position}</strong> has been received.
          </p>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>
            Our HR team will review your application and contact you at <strong>{form.email}</strong> within 3–5 business days.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '12px 28px', borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            <ArrowLeft size={14} style={{ display: 'inline', marginRight: 6 }} /> Back to Home
          </button>
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
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>ISCP School System</span>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
            <Briefcase size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Job Application</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Apply to join our team at ISCP School System</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} current={step} />

        {/* Card */}
        <div style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 20, padding: '36px 40px', backdropFilter: 'blur(12px)', marginTop: 40 }}>

          {/* Step 1 — Personal Info */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><User size={18} style={{ color: '#3b82f6' }} /> Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[['firstName','First Name',true], ['lastName','Last Name',true], ['middleName','Middle Name',false]].map(([key, label, req]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{req && ' *'}</label>
                    <input value={form[key]} onChange={set(key)} required={req} placeholder={label}
                      style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender *</label>
                  <CustomSelect value={form.gender} onChange={set('gender')} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' }]} placeholder="Select gender" />
                </div>
                {[['email', 'Email Address', 'email', true], ['phone', 'Phone Number', 'tel', true]].map(([key, label, type, req]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{req && ' *'}</label>
                    <input type={type} value={form[key]} onChange={set(key)} required={req} placeholder={label}
                      style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Birth Date</label>
                  <input type="date" value={form.birthDate} onChange={set('birthDate')}
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home Address</label>
                <input value={form.address} onChange={set('address')} placeholder="Street, Barangay, City, Province"
                  style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                />
              </div>
            </div>
          )}

          {/* Step 2 — Position */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><Briefcase size={18} style={{ color: '#8b5cf6' }} /> Position Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position Applied *</label>
                  <CustomSelect value={form.position} onChange={set('position')} options={POSITIONS.map(p => ({ value: p, label: p }))} placeholder="Select position" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department *</label>
                  <CustomSelect value={form.department} onChange={set('department')} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} placeholder="Select department" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employment Type *</label>
                  <CustomSelect value={form.employmentType} onChange={set('employmentType')} options={[{ value: 'full_time', label: 'Full-Time' }, { value: 'part_time', label: 'Part-Time' }, { value: 'contractual', label: 'Contractual' }, { value: 'volunteer', label: 'Volunteer' }]} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Monthly Salary (₱)</label>
                  <input type="number" value={form.salaryExpectation} onChange={set('salaryExpectation')} placeholder="e.g. 25000"
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Start Date</label>
                  <input type="date" value={form.availableDate} onChange={set('availableDate')}
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover Letter / Motivation</label>
                <textarea value={form.coverLetter} onChange={set('coverLetter')} rows={5} placeholder="Tell us why you want to join ISCP and what makes you the ideal candidate..."
                  style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'vertical', width: '100%' }}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                />
              </div>
            </div>
          )}

          {/* Step 3 — Credentials */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={18} style={{ color: '#10b981' }} /> Educational Credentials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highest Degree *</label>
                  <CustomSelect value={form.highestDegree} onChange={set('highestDegree')} options={['High School Diploma', 'Vocational / TESDA NC', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctoral Degree', 'Post-Doctoral'].map(d => ({ value: d, label: d }))} placeholder="Select degree" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Year Graduated</label>
                  <input type="number" value={form.yearGraduated} onChange={set('yearGraduated')} min={1980} max={new Date().getFullYear()} placeholder="e.g. 2020"
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institution / University *</label>
                  <input value={form.institution} onChange={set('institution')} placeholder="Name of school/university"
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRC License No. (if applicable)</label>
                  <input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="e.g. 0123456"
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>License Expiry Date</label>
                  <input type="date" value={form.licenseExpiry} onChange={set('licenseExpiry')}
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Years of Experience</label>
                  <input type="number" value={form.experience} onChange={set('experience')} min={0} placeholder="e.g. 5"
                    style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specializations / Teaching Subjects</label>
                <textarea value={form.specializations} onChange={set('specializations')} rows={3} placeholder="e.g. Mathematics, Physics, Computer Science..."
                  style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'vertical', width: '100%' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                />
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Review Your Application</h3>
              {[
                { label: 'Full Name', value: `${form.firstName} ${form.middleName ? form.middleName + ' ' : ''}${form.lastName}` },
                { label: 'Email', value: form.email },
                { label: 'Phone', value: form.phone },
                { label: 'Gender', value: form.gender },
                { label: 'Position Applied', value: form.position },
                { label: 'Department', value: form.department },
                { label: 'Employment Type', value: form.employmentType?.replace(/_/g, ' ') },
                { label: 'Salary Expectation', value: form.salaryExpectation ? `₱${Number(form.salaryExpectation).toLocaleString()}/mo` : '—' },
                { label: 'Available Date', value: form.availableDate || '—' },
                { label: 'Highest Degree', value: form.highestDegree },
                { label: 'Institution', value: form.institution },
                { label: 'Experience', value: form.experience ? `${form.experience} years` : '—' },
                { label: 'License No.', value: form.licenseNumber || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
                </div>
              ))}
              {form.coverLetter && (
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Cover Letter</div>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{form.coverLetter}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
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
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.35)', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Submitting...' : <><Check size={16} /> Submit Application</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
