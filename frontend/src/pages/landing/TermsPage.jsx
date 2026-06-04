import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: 'rgba(30,41,59,0.7)', padding: 40, borderRadius: 20, border: '1px solid rgba(148,163,184,0.1)' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontSize: 32, fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: 24, color: '#f8fafc' }}>Terms of Service</h1>
        <div style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 15 }}>
          <p style={{ marginBottom: 16 }}>Welcome to International State Colleges of the Philippines (ISCP). By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: 16 }}>By using the ISCP online portal, you agree to comply with all applicable policies, guidelines, and rules of the institution.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>2. User Responsibilities</h2>
          <p style={{ marginBottom: 16 }}>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Do not share your Student ID or Password with anyone.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>3. Academic Integrity</h2>
          <p style={{ marginBottom: 16 }}>All students must adhere to the ISCP Academic Integrity Policy. Cheating, plagiarism, and any form of academic dishonesty are strictly prohibited and may result in disciplinary action.</p>
          <h2 style={{ fontSize: 20, color: '#f1f5f9', marginTop: 32, marginBottom: 12 }}>4. Modifications</h2>
          <p style={{ marginBottom: 16 }}>ISCP reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </div>
      </div>
    </div>
  );
}
