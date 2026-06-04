import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: 'rgba(30,41,59,0.7)', padding: 40, borderRadius: 20, border: '1px solid rgba(148,163,184,0.1)' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontSize: 32, fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: 24, color: '#f8fafc' }}>Privacy Policy</h1>
        <div style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 15 }}>
          <p style={{ marginBottom: 16 }}>At International State Colleges of the Philippines (ISCP), we are committed to protecting your privacy and ensuring the security of your personal data.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h2>
          <p style={{ marginBottom: 16 }}>We collect information you provide directly to us, such as your name, contact details, academic records, and payment information during enrollment and platform usage.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>2. How We Use Your Information</h2>
          <p style={{ marginBottom: 16 }}>Your information is used to facilitate enrollment, provide academic services, communicate important updates, and improve our educational platform. We comply with the Data Privacy Act of 2012.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>3. Data Sharing</h2>
          <p style={{ marginBottom: 16 }}>We do not sell your personal data. Information may be shared with authorized third-party service providers solely for operating the platform or as required by law.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>4. Security Measures</h2>
          <p style={{ marginBottom: 16 }}>We implement strict security protocols to protect against unauthorized access, alteration, or data breaches. All sensitive communications are encrypted.</p>
        </div>
      </div>
    </div>
  );
}
