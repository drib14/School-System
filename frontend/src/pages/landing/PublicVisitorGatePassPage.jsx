import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Building2, User, FileText, CheckCircle, Printer, Sparkles, MapPin, Phone, Mail } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/forms/CustomSelect';

const ID_TYPES = [
  { value: 'Government ID', label: 'Government ID' },
  { value: "Driver's License", label: "Driver's License" },
  { value: 'Passport', label: 'Passport' },
  { value: 'Company ID', label: 'Company ID' },
  { value: 'Student ID', label: 'Student ID' },
  { value: 'Other', label: 'Other ID' }
];

const inputStyle = {
  padding: '10px 14px',
  background: '#0f172a',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 10,
  color: '#f1f5f9',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  width: '100%',
};

export default function PublicVisitorGatePassPage() {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] = useState(null);

  const [form, setForm] = useState({
    campusId: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    purpose: '',
    personToVisit: '',
    department: '',
    idType: 'Government ID',
    idNumber: '',
    vehiclePlate: ''
  });

  useEffect(() => {
    api.get('/public/campuses')
      .then(res => setCampuses(res.data.campuses || []))
      .catch(err => console.error('Error loading campuses:', err));
  }, []);

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.campusId) {
      toast.error('Please select a campus location.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/public/visitors/register', form);
      toast.success('Registration successful!');
      setRegisteredVisitor(data.visitor);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-pass').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <html>
        <head>
          <title>Visitor Gate Pass</title>
          <style>
            body { font-family: 'Inter', sans-serif; background: #fff; color: #000; padding: 40px; display: flex; justify-content: center; }
            .pass-card { border: 2px solid #000; border-radius: 16px; padding: 24px; max-width: 400px; text-align: center; }
            .title { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #555; margin-bottom: 20px; }
            .qr-img { width: 200px; height: 200px; margin: 16px auto; display: block; }
            .field-group { text-align: left; margin-bottom: 12px; font-size: 14px; }
            .label { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #666; }
            .val { font-size: 14px; color: #000; }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <h1 class="title">ISCP GATE PASS</h1>
            <p class="subtitle">Digital Visitor Entry Token</p>
            <div class="field-group">
              <div class="label">Visitor Name</div>
              <div class="val">${registeredVisitor?.firstName} ${registeredVisitor?.lastName}</div>
            </div>
            <div class="field-group">
              <div class="label">Purpose of Visit</div>
              <div class="val">${registeredVisitor?.purpose}</div>
            </div>
            <div class="field-group">
              <div class="label">Person to Visit</div>
              <div class="val">${registeredVisitor?.personToVisit} (${registeredVisitor?.department || 'N/A'})</div>
            </div>
            ${registeredVisitor?.vehiclePlate ? `
            <div class="field-group">
              <div class="label">Vehicle Plate</div>
              <div class="val">${registeredVisitor.vehiclePlate}</div>
            </div>
            ` : ''}
            <img class="qr-img" src="${registeredVisitor?.qrCode}" />
            <p style="font-size: 11px; color: #555; margin-top: 20px;">Please present this pass to the security guard at the gate scanner.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    window.location.reload(); // Reload to restore the original document view
  };

  const selectedCampusDetails = campuses.find(c => c._id === form.campusId);

  if (registeredVisitor) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 500, width: '100%', padding: '40px 32px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24, backdropFilter: 'blur(16px)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 25px rgba(16,185,129,0.25)' }}>
            <CheckCircle size={32} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#f1f5f9', fontFamily: 'Outfit, sans-serif' }}>Registration Successful!</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Your visitor gate pass has been generated. Please keep a copy of the details below.</p>

          {/* Printable Pass Container */}
          <div id="printable-pass" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, textAlign: 'left', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>ISCP GATE PASS</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>VISITOR GATE PASS</div>
              </div>
              <img src="/iscp-logo.jpg" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Visitor</label>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{registeredVisitor.firstName} {registeredVisitor.lastName}</div>
              </div>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Host</label>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{registeredVisitor.personToVisit}</div>
              </div>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Purpose</label>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{registeredVisitor.purpose}</div>
              </div>
              {registeredVisitor.vehiclePlate && (
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Vehicle Plate</label>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{registeredVisitor.vehiclePlate}</div>
                </div>
              )}
            </div>

            {/* QR Code */}
            {registeredVisitor.qrCode && (
              <div style={{ background: '#fff', padding: 12, borderRadius: 12, width: 180, height: 180, margin: '16px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={registeredVisitor.qrCode} alt="Visitor QR Gate Pass" style={{ width: '100%', height: '100%' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/')} style={{ flex: 1, padding: '10px 20px', borderRadius: 10, background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Back to Home
            </button>
            <button onClick={handlePrint} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
              <Printer size={16} /> Print Pass
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', padding: '80px 24px 60px' }}>
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', padding: '0 32px', zIndex: 100, gap: 16 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} style={{ color: '#3b82f6' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14 }}>ISCP Gate Pass Portal</span>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#3b82f6' }}>
            <Shield size={24} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Visitor Gate Pass Request</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Please fill out the form to request a temporary gate pass. No login required.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 20, padding: '32px 36px', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Campus selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Campus Location *</label>
            <CustomSelect
              value={form.campusId}
              onChange={(val) => handleChange('campusId', val)}
              options={campuses.map(c => ({ value: c._id, label: `${c.name} (${c.code})` }))}
              placeholder="Select Campus..."
            />
            {selectedCampusDetails && (
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {selectedCampusDetails.address?.city || selectedCampusDetails.address?.street}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {selectedCampusDetails.contact?.phone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {selectedCampusDetails.contact?.email}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>First Name *</label>
              <input value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required style={inputStyle} placeholder="First name" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Last Name *</label>
              <input value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} required style={inputStyle} placeholder="Last name" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Phone Number</label>
              <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} style={inputStyle} placeholder="e.g. +639171234567" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle} placeholder="e.g. visitor@example.com" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Host Name *</label>
              <input value={form.personToVisit} onChange={e => handleChange('personToVisit', e.target.value)} required style={inputStyle} placeholder="Person or Office to visit" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department / Office</label>
              <input value={form.department} onChange={e => handleChange('department', e.target.value)} style={inputStyle} placeholder="e.g. Registrar, Principal Office" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Identification Type</label>
              <CustomSelect
                value={form.idType}
                onChange={(val) => handleChange('idType', val)}
                options={ID_TYPES}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>ID / Card Number</label>
              <input value={form.idNumber} onChange={e => handleChange('idNumber', e.target.value)} style={inputStyle} placeholder="e.g. Drivers license number" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Vehicle Plate (optional)</label>
            <input value={form.vehiclePlate} onChange={e => handleChange('vehiclePlate', e.target.value)} style={inputStyle} placeholder="e.g. ABC-1234" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Purpose of Visit *</label>
            <textarea value={form.purpose} onChange={e => handleChange('purpose', e.target.value)} required rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Specify your agenda (e.g. submit forms, purchase uniform, etc.)" />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Registering...' : 'Request Gate Pass'}
          </button>
        </form>
      </div>
    </div>
  );
}
