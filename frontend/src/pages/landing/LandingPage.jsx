import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, BookOpen, School, ChevronRight, Star, Award, Globe,
  UserCheck, DollarSign, Stethoscope, HeartHandshake, Shield, Library,
  ClipboardList, Briefcase, Phone, Mail, MapPin, ArrowRight, Sparkles,
  Building2, Layers, CheckCircle, FlaskConical, Calculator, Leaf, Music,
  Dumbbell, Code2, BarChart3, BookMarked, Gavel, Flame,
} from 'lucide-react';

/* ── Positions offered ─────────────────────────────────────────────── */
const POSITIONS = [
  { title: 'Teacher / Instructor', icon: GraduationCap, color: '#3b82f6', desc: 'Elementary, JHS, SHS & College Faculty' },
  { title: 'School Administrator', icon: Building2, color: '#8b5cf6', desc: 'Administrative & Managerial Roles' },
  { title: 'Registrar Staff', icon: ClipboardList, color: '#06b6d4', desc: 'Records & Enrollment Processing' },
  { title: 'Cashier / Accountant', icon: DollarSign, color: '#10b981', desc: 'Financial & Billing Department' },
  { title: 'School Nurse', icon: Stethoscope, color: '#ef4444', desc: 'Student Health & Clinic Services' },
  { title: 'Guidance Counselor', icon: HeartHandshake, color: '#f59e0b', desc: 'Student Welfare & Counseling' },
  { title: 'Librarian', icon: Library, color: '#84cc16', desc: 'Library & Information Resources' },
  { title: 'HR Staff', icon: Briefcase, color: '#a78bfa', desc: 'Human Resources Department' },
  { title: 'Security Personnel', icon: Shield, color: '#fb923c', desc: 'Campus Security & Safety' },
];

/* ── Academic levels ────────────────────────────────────────────────── */
const LEVELS = [
  {
    title: 'Elementary',
    subtitle: 'Grades 1–6',
    icon: Star,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    desc: 'Building the foundation for lifelong learning',
  },
  {
    title: 'Junior High School',
    subtitle: 'Grades 7–10',
    icon: BookOpen,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    desc: 'DepEd K-12 Curriculum for secondary education',
  },
  {
    title: 'Senior High School',
    subtitle: 'Grades 11–12',
    icon: Award,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    desc: 'STEM, ABM, HUMSS, TVL & more tracks',
    tracks: ['STEM', 'ABM', 'HUMSS', 'TVL', 'Arts & Design', 'Sports'],
  },
  {
    title: 'College',
    subtitle: 'Bachelor\'s Degree Programs',
    icon: GraduationCap,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    desc: 'Undergraduate programs across all departments',
  },
  {
    title: 'Graduate School',
    subtitle: 'Master\'s & Doctoral Programs',
    icon: Layers,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)',
    desc: 'Advanced academic & professional programs',
  },
];

/* ── Special Programs ───────────────────────────────────────────────── */
const SPECIAL_PROGRAMS = [
  { name: 'TESDA Technical-Vocational', icon: Flame, color: '#f97316', desc: 'NC certifications & TVET programs aligned with TESDA' },
  { name: 'Alternative Learning System (ALS)', icon: BookMarked, color: '#84cc16', desc: 'DepEd ALS for out-of-school youth & adults' },
  { name: 'Madrasah Education Program', icon: Globe, color: '#06b6d4', desc: 'Arabic language & Islamic values education' },
  { name: 'Indigenous Peoples Education (IPEd)', icon: Leaf, color: '#10b981', desc: 'Culturally responsive curriculum for IP learners' },
  { name: 'Special Education (SPED)', icon: HeartHandshake, color: '#8b5cf6', desc: 'Programs for learners with special needs' },
  { name: 'Philippine Science High School', icon: FlaskConical, color: '#3b82f6', desc: 'Science & technology-oriented curriculum' },
  { name: 'Regional Science High School', icon: Calculator, color: '#a78bfa', desc: 'DOST-funded advanced science programs' },
  { name: 'Sports Science Program', icon: Dumbbell, color: '#ef4444', desc: 'Athletics & physical education excellence' },
];

/* ── Stats banner ────────────────────────────────────────────────────── */
const HERO_STATS = [
  { value: '10,000+', label: 'Students Enrolled' },
  { value: '500+', label: 'Faculty & Staff' },
  { value: '50+', label: 'Programs Offered' },
  { value: '95%', label: 'Graduate Employment' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [stats, setStats] = useState({
    students: '10,000+',
    staff: '500+',
    programs: '50+',
    employmentRate: '95%'
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    
    fetch(`${baseUrl}/api/public/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStats({
            students: data.data.students > 0 ? data.data.students.toLocaleString() : '10,000+',
            staff: data.data.staff > 0 ? data.data.staff.toLocaleString() : '500+',
            programs: data.data.programs > 0 ? data.data.programs.toLocaleString() : '50+',
            employmentRate: data.data.employmentRate || '95%'
          });
        }
      })
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const HERO_STATS_DYNAMIC = [
    { value: stats.students, label: 'Students Enrolled' },
    { value: stats.staff, label: 'Faculty & Staff' },
    { value: stats.programs, label: 'Programs Offered' },
    { value: stats.employmentRate, label: 'Graduate Employment' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ───── NAVBAR ───── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        padding: '0 40px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/iscp-logo.jpg" alt="ISCP Logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              International State Colleges of the Philippines
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>ISCP</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login/student')}
            style={{ padding: '9px 22px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = 'rgba(59,130,246,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(59,130,246,0.1)'}
          >
            Student Login
          </button>
          <button
            onClick={() => navigate('/login/staff')}
            style={{ padding: '9px 22px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = 'rgba(16,185,129,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(16,185,129,0.1)'}
          >
            Staff Login
          </button>
          <button
            onClick={() => navigate('/apply-job')}
            style={{ padding: '9px 22px', borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.35)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.target.style.transform = 'none'}
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '160px 40px 100px', overflow: 'hidden' }}>
        {/* Simple gradient background to replace the full glassmorphism image overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }} />
        
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(100px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, padding: '40px' }}>
          <img src="/iscp-logo.jpg" alt="ISCP Logo" style={{ width: 140, height: 140, borderRadius: '50%', border: '4px solid rgba(59,130,246,0.3)', margin: '0 auto 32px', display: 'block', objectFit: 'cover', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: 28 }}>
            <Sparkles size={13} style={{ color: '#60a5fa' }} />
            <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>Admissions for A.Y. 2025–2026 are now open!</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontFamily: 'Outfit, sans-serif', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            International State Colleges<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>of the Philippines</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 'clamp(18px, 2.5vw, 24px)', maxWidth: 700, margin: '0 auto 16px', lineHeight: 1.6, fontStyle: 'italic', fontWeight: 600 }}>
            "Filipinos Sultus Es"
          </p>

          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#94a3b8', lineHeight: 1.7, marginBottom: 40, maxWidth: 680, margin: '0 auto 40px' }}>
            Experience world-class education from Elementary to Graduate School. Empowering students with cutting-edge learning systems, dedicated faculty, and an inclusive academic community.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/enroll/new')}
              style={{ padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none', boxShadow: '0 8px 25px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(59,130,246,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.4)'; }}
            >
              <GraduationCap size={18} /> Enroll Now <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login/student')}
              style={{ padding: '14px 32px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              <UserCheck size={18} /> Student Login
            </button>
          </div>
        </div>
      </section>

      {/* ───── HERO STATS ───── */}
      <section style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '-40px auto 0', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {HERO_STATS_DYNAMIC.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, backdropFilter: 'blur(8px)', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: 36, fontFamily: 'Outfit, sans-serif', fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── STUDENT SECTION ───── */}
      <section style={{ padding: '60px 40px', background: 'rgba(15,23,42,0.5)', borderTop: '1px solid rgba(148,163,184,0.08)', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>For Students</h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>Access your academic journey seamlessly</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {/* Student Login Card */}
            <div
              onClick={() => navigate('/login/student')}
              style={{ padding: 32, borderRadius: 20, background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(59,130,246,0.35)' }}>
                <UserCheck size={28} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Student Portal Login</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>Access grades, schedules, attendance, clearance, and more through your personal student account.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa', fontWeight: 600, fontSize: 14 }}>
                Login to Portal <ArrowRight size={14} />
              </div>
            </div>

            {/* Enrollment Card */}
            <div
              onClick={() => navigate('/enroll/new')}
              style={{ padding: 32, borderRadius: 20, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(16,185,129,0.2)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'; }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16,185,129,0.35)' }}>
                <GraduationCap size={28} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New Enrollment</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>Start your enrollment journey for the upcoming academic year. Select your year level and fill out the required information.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: 14 }}>
                Enroll Now <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── YEAR LEVELS ───── */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Academic Programs</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>From Elementary to Graduate School — we have a program for every learner</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {LEVELS.map((level) => (
            <div
              key={level.title}
              onClick={() => navigate('/enroll/new')}
              style={{ padding: 28, borderRadius: 20, background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.1)', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = level.color + '55'; e.currentTarget.style.boxShadow = `0 20px 40px ${level.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: level.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 6px 16px ${level.color}33` }}>
                <level.icon size={24} color="white" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{level.title}</h3>
              <p style={{ fontSize: 12, color: level.color, fontWeight: 600, marginBottom: 10 }}>{level.subtitle}</p>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{level.desc}</p>
              {level.tracks && (
                <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {level.tracks.map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: level.color + '20', color: level.color, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ───── SPECIAL PROGRAMS ───── */}
      <section style={{ padding: '60px 40px', background: 'rgba(15,23,42,0.5)', borderTop: '1px solid rgba(148,163,184,0.08)', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Special Programs</h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>Government-recognized special education programs in the Philippines</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {SPECIAL_PROGRAMS.map(prog => (
              <div
                key={prog.name}
                style={{ padding: 24, borderRadius: 16, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)', transition: 'all 0.25s', display: 'flex', gap: 16, alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = prog.color + '44'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: prog.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <prog.icon size={20} style={{ color: prog.color }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{prog.name}</h4>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── JOB OPENINGS ───── */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Join Our Team</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>Be part of a world-class educational institution. Apply for any position below.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {POSITIONS.map((pos) => (
            <div
              key={pos.title}
              onClick={() => navigate('/apply-job', { state: { position: pos.title } })}
              style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.1)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = pos.color + '55'; e.currentTarget.style.boxShadow = `0 16px 40px ${pos.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: pos.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${pos.color}30` }}>
                <pos.icon size={22} style={{ color: pos.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{pos.title}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{pos.desc}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#64748b', flexShrink: 0 }} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button
            onClick={() => navigate('/apply-job')}
            style={{ padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none', boxShadow: '0 8px 25px rgba(59,130,246,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(59,130,246,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.35)'; }}
          >
            <Briefcase size={16} /> Apply for a Position
          </button>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ background: '#0a0f1a', borderTop: '1px solid rgba(148,163,184,0.08)', padding: '48px 40px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <img src="/iscp-logo.jpg" alt="ISCP Logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Int'l State Colleges of the PH</span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>Empowering education through technology. From elementary to graduate school, we support every step of the learning journey.</p>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Quick Links</h4>
              {[
                { label: 'Student Login', path: '/login/student' },
                { label: 'New Enrollment', path: '/enroll/new' },
                { label: 'Apply for Position', path: '/apply-job' },
                { label: 'Academic Programs', path: '/' },
                { label: 'Special Programs', path: '/' }
              ].map(({ label, path }) => (
                <div key={label} onClick={() => navigate(path)} style={{ fontSize: 13, color: '#475569', marginBottom: 10, cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#94a3b8'}
                  onMouseLeave={e => e.target.style.color = '#475569'}
                >{label}</div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Legal</h4>
              {[
                { label: 'Terms of Service', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' }
              ].map(({ label, path }) => (
                <div key={label} onClick={() => navigate(path)} style={{ fontSize: 13, color: '#475569', marginBottom: 10, cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#94a3b8'}
                  onMouseLeave={e => e.target.style.color = '#475569'}
                >{label}</div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Contact Us</h4>
              {[
                { icon: MapPin, text: '123 Education Drive, Quezon City, Metro Manila' },
                { icon: Phone, text: '+63 (2) 8123-4567' },
                { icon: Mail, text: 'info@iscp.edu.ph' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <Icon size={14} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Newsletter</h4>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>Subscribe to get the latest updates and news from ISCP.</p>
              <form onSubmit={e => { e.preventDefault(); alert('Subscribed successfully!'); }} style={{ display: 'flex', gap: 8 }}>
                <input type="email" placeholder="Enter your email" required style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, background: '#3b82f6', color: 'white', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Subscribe</button>
              </form>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#334155' }}>© {new Date().getFullYear()} International State Colleges of the Philippines. All rights reserved.</p>
            <p style={{ fontSize: 12, color: '#334155' }}>Built with ❤️ for Philippine Education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
