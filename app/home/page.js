'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen, Mic, Award, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { heroQualificationPack } from '@/lib/qualificationPacks';

function HomeContent() {
  const { lang, setLang, t, worker, fetchWorkerById } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerIdFromUrl = searchParams.get('workerId');

  const [trade, setTrade] = useState('electrician');

  useEffect(() => {
    if (!worker && workerIdFromUrl) {
      fetchWorkerById(workerIdFromUrl);
    }
  }, [worker, workerIdFromUrl, fetchWorkerById]);

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Welcome Banner */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="badge badge-success" style={{ marginBottom: '0.4rem' }}>
            <Award size={12} /> Candidate Portal
          </span>
          <h2 style={{ fontSize: '22px', color: 'var(--color-primary)' }}>
            {t.home_title}{worker?.name || 'Ramesh Mandal'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Welcome to the PMKVY RPL Skill Assessment & Certification Gateway.
          </p>
        </div>

        {/* Step 1: Language */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '0.65rem' }}>
            {t.step_1} (भाषा / ভাষা)
          </h4>
          <div className="grid-3" style={{ gap: '0.5rem' }}>
            <button
              type="button"
              className={lang === 'en' ? 'btn btn-sm' : 'btn btn-outline btn-sm'}
              onClick={() => setLang('en')}
            >
              English
            </button>
            <button
              type="button"
              className={lang === 'hi' ? 'btn btn-sm' : 'btn btn-outline btn-sm'}
              onClick={() => setLang('hi')}
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={lang === 'bn' ? 'btn btn-sm' : 'btn btn-outline btn-sm'}
              onClick={() => setLang('bn')}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Step 2: Trade Selection */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '0.65rem' }}>
            {t.step_2}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div 
              className="card card-clickable" 
              style={{ 
                border: trade === 'electrician' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: trade === 'electrician' ? 'var(--color-primary-subtle)' : '#ffffff',
                padding: '0.85rem 1rem',
                marginBottom: 0
              }}
              onClick={() => setTrade('electrician')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '24px' }}>⚡</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', margin: 0 }}>
                    {heroQualificationPack.title}
                  </h4>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    NSQF Level 3 • Mandatory Domestic Wiring, MCB & Earthing
                  </p>
                </div>
                {trade === 'electrician' && <CheckCircle2 size={18} color="var(--color-primary)" />}
              </div>
            </div>

            <div 
              className="card card-clickable" 
              style={{ 
                border: trade === 'plumber' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: trade === 'plumber' ? 'var(--color-primary-subtle)' : '#ffffff',
                padding: '0.85rem 1rem',
                marginBottom: 0
              }}
              onClick={() => setTrade('plumber')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '24px' }}>🔧</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', margin: 0 }}>
                    Plumber (General)
                  </h4>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    NSQF Level 3 • Solvent Jointing, Fixtures & Pressure Leak Testing
                  </p>
                </div>
                {trade === 'plumber' && <CheckCircle2 size={18} color="var(--color-primary)" />}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: 2 paths */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn"
            style={{ width: '100%', fontSize: '16px' }}
            onClick={() => router.push('/worker/declaration')}
          >
            <Mic size={18} /> Voice Self-Declaration <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => router.push('/worker/orientation')}
          >
            <BookOpen size={16} /> Pre-Assessment Orientation (12–15h Track)
          </button>
        </div>

      </div>
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
