'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Briefcase, 
  Building2, 
  ActivitySquare, 
  ArrowRight, 
  ShieldCheck, 
  Mic, 
  PlayCircle, 
  CheckCircle2, 
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function WelcomePage() {
  const { t, lang, setLang, setWorker, recordOpLog, speak } = useApp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Barasat (North 24 Parganas)');
  const [ageBand, setAgeBand] = useState('25-35');
  const [consentGiven, setConsentGiven] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Quick Demo Preload for Ramesh Mandal (Barasat)
  const handleLaunchRameshDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workers?phone=9830112233');
      const data = await res.json();
      if (data.worker) {
        setWorker(data.worker);
        setLang('bn'); // Ramesh speaks Bengali
        router.push('/worker/declaration');
      }
    } catch (e) {
      console.error(e);
      router.push('/worker/declaration');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!name || phone.length !== 10) {
      setError(lang === 'hi' ? 'कृपया मान्य नाम और 10-अंकों का फ़ोन नंबर दर्ज करें।' : (lang === 'bn' ? 'অনুগ্রহ করে সঠিক নাম এবং ১০ সংখ্যার ফোন নম্বর লিখুন।' : 'Please enter a valid name and 10-digit mobile number.'));
      return;
    }

    if (!consentGiven) {
      setError('Please review and accept DPDP digital consent.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          language: lang,
          district,
          age_band: ageBand,
          trade: 'electrician'
        })
      });

      const data = await res.json();
      if (res.ok && data.worker) {
        setWorker(data.worker);
        recordOpLog("WORKER", "REGISTER", { workerId: data.worker.id, name, phone });
        // Route to mandatory orientation track or voice declaration
        router.push('/worker/orientation');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Operating in offline local mode.');
      // Offline fallback: create local worker
      const offlineWorker = {
        id: `w-local-${Date.now()}`,
        name,
        phone,
        language: lang,
        district
      };
      setWorker(offlineWorker);
      router.push('/worker/orientation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Compliance Banner */}
        <div style={{ 
          backgroundColor: 'var(--color-primary-subtle)', 
          border: '1px solid #BFDBFE', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}>
          <Award size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
            {t.ncvet_badge}
          </span>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '26px', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
            {t.app_name}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            {t.slogan}
          </p>
        </div>

        {/* Quick Demo Card */}
        <div 
          className="card" 
          style={{ 
            border: '1.5px solid #93C5FD', 
            backgroundColor: '#F8FAFC',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>
              ⚡ 5-Minute Winning Pitch Demo
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Barasat, West Bengal</span>
          </div>
          <h3 style={{ fontSize: '15px', marginBottom: '0.25rem' }}>
            Ramesh Mandal: Wireman (7 Years Informal Experience)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            Airplane-mode voice declaration in Bengali → 74% coverage ring → Guided video evidence → Assessor anchored scoring.
          </p>
          <button 
            type="button" 
            className="btn btn-sm" 
            style={{ width: '100%', fontSize: '13px' }}
            onClick={handleLaunchRameshDemo}
            disabled={loading}
          >
            <PlayCircle size={16} /> Launch Ramesh's End-to-End Demo
          </button>
        </div>

        {/* Registration Form */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '16px' }}>
            Candidate Enrolment / Worker Login
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Enter your mobile number to begin skill assessment under PMKVY RPL.
          </p>

          <form onSubmit={handleWorkerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Full Name (पूरा नाम / পুরো নাম)
              </label>
              <input
                type="text"
                placeholder={t.name_placeholder}
                className="input-field"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Mobile Number (10 डिजिट मोबाइल नंबर)
              </label>
              <input
                type="tel"
                placeholder={t.phone_placeholder}
                className="input-field"
                value={phone}
                maxLength={10}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="grid-2">
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  District / District Hub
                </label>
                <select 
                  className="select-box"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                >
                  <option value="Barasat (North 24 Parganas)">Barasat (North 24 Parganas)</option>
                  <option value="Patna (Bihar)">Patna (Bihar)</option>
                  <option value="Asansol (Paschim Bardhaman)">Asansol (Paschim Bardhaman)</option>
                  <option value="Kolkata Central">Kolkata Central</option>
                  <option value="Ranchi (Jharkhand)">Ranchi (Jharkhand)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Age Group
                </label>
                <select 
                  className="select-box"
                  value={ageBand}
                  onChange={e => setAgeBand(e.target.value)}
                >
                  <option value="18-25">18–25 years</option>
                  <option value="25-35">25–35 years</option>
                  <option value="35-50">35–50 years</option>
                  <option value="50+">50+ years</option>
                </select>
              </div>
            </div>

            {/* DPDP Consent Agreement Checkbox */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.65rem', 
              backgroundColor: '#F8FAFC', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)'
            }}>
              <input 
                type="checkbox" 
                id="consentCheck" 
                checked={consentGiven} 
                onChange={e => setConsentGiven(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              />
              <label htmlFor="consentCheck" style={{ fontSize: '12px', color: 'var(--color-text)', lineHeight: 1.4, cursor: 'pointer' }}>
                <strong>DPDP Act 2023 Consent:</strong> I agree to voice & video evidence capture for RPL skill assessment. Data will not be shared without authorization.
              </label>
            </div>

            {error && (
              <div style={{ color: 'var(--color-error)', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? t.loading : t.login_btn} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Fast Role Navigation Cards */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            Other Stakeholder Consoles
          </p>
          <div className="grid-3" style={{ gap: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              onClick={() => router.push('/assessor')}
              style={{ fontSize: '12px' }}
            >
              <Briefcase size={14} /> Assessor Portal
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              onClick={() => router.push('/coordinator')}
              style={{ fontSize: '12px' }}
            >
              <Building2 size={14} /> Coordinator Hub
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              onClick={() => router.push('/qa')}
              style={{ fontSize: '12px' }}
            >
              <ActivitySquare size={14} /> QA Consistency Lab
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
