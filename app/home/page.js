'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function HomeContent() {
  const { lang, setLang, t, worker, setWorker, setAssessment, fetchWorkerById } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerIdFromUrl = searchParams.get('workerId');

  const [trade, setTrade] = useState('');
  const [startError, setStartError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!worker && workerIdFromUrl) {
      fetchWorkerById(workerIdFromUrl);
    } else if (!worker && !workerIdFromUrl) {
      router.push('/');
    }
  }, [worker, workerIdFromUrl, fetchWorkerById, router]);

  const handleStartTest = async () => {
    if (!trade || !lang) return;
    setStartError(false);
    setLoading(true);

    try {
      const activeWorkerId = worker?.id || workerIdFromUrl;
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: activeWorkerId, trade, language: lang }),
      });

      if (!res.ok) throw new Error("Start test failed");
      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
        router.push(`/test?assessmentId=${data.assessment.id}`);
      } else {
        throw new Error("No assessment returned");
      }
    } catch (err) {
      console.error("Start Test Error:", err);
      setStartError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <h2>{t.home_title}{worker?.name || ''}</h2>

      <div style={{ width: '100%', marginTop: '1rem' }}>
        <h3>{t.step_1}</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div 
            className="card" 
            style={{ flex: 1, textAlign: 'center', cursor: 'pointer', border: lang === 'hi' ? '2px solid var(--color-primary)' : '1px solid #ccc' }}
            onClick={() => setLang('hi')}
          >
            <h2>हिंदी</h2>
          </div>
          <div 
            className="card" 
            style={{ flex: 1, textAlign: 'center', cursor: 'pointer', border: lang === 'en' ? '2px solid var(--color-primary)' : '1px solid #ccc' }}
            onClick={() => setLang('en')}
          >
            <h2>English</h2>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', marginTop: '1rem' }}>
        <h3>{t.step_2}</h3>
        <div 
          className="card" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', border: trade === 'electrician' ? '2px solid var(--color-primary)' : '1px solid #ccc' }}
          onClick={() => setTrade('electrician')}
        >
          <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: '50%', fontSize: '24px' }}>⚡</div>
          <h3>{t.trade_electrician}</h3>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5, backgroundColor: '#f9f9f9' }}>
          <div style={{ background: '#E0E7FF', padding: '1rem', borderRadius: '50%', fontSize: '24px' }}>🔧</div>
          <div>
            <h3 style={{ marginBottom: 0 }}>{t.trade_plumber}</h3>
            <p style={{ fontSize: '14px', margin: 0 }}>{t.coming_soon}</p>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5, backgroundColor: '#f9f9f9' }}>
          <div style={{ background: '#FCE7F3', padding: '1rem', borderRadius: '50%', fontSize: '24px' }}>🧵</div>
          <div>
            <h3 style={{ marginBottom: 0 }}>{t.trade_tailor}</h3>
            <p style={{ fontSize: '14px', margin: 0 }}>{t.coming_soon}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      {startError && (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>
          {lang === 'hi' ? 'सर्वर त्रुटि। फिर से कोशिश करें।' : 'Server error. Try again.'}
        </p>
      )}
      <button 
        className="btn" 
        onClick={handleStartTest} 
        disabled={!trade || loading} 
        style={{ opacity: trade && !loading ? 1 : 0.5 }}
      >
        <ArrowRight size={24} /> {loading ? 'Starting...' : t.start_test}
      </button>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="content"><p>Loading...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
