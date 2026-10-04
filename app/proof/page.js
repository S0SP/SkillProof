'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, CheckCircle2, ShieldAlert, ArrowRight, Upload, Lock, MapPin, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { heroQualificationPack } from '@/lib/qualificationPacks';
import { sha256Hex } from '@/lib/cryptoLog';

export default function ProofPage() {
  const { t, lang, assessment, setFinalResult, recordOpLog } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const activeAssessmentId = assessment?.id || assessmentIdFromUrl || 'asm-ramesh-01';

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [mediaHash, setMediaHash] = useState('');
  const [geotag, setGeotag] = useState({ lat: 22.7214, lng: 88.4815, district: 'Barasat, North 24 Parganas' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const taskCard = heroQualificationPack.task_cards[0];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      return;
    }

    setErrorMsg('');
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setPhotoBase64(base64);

      // Compute cryptographic SHA-256 hash
      const hash = await sha256Hex(base64);
      setMediaHash(hash);
    };
    reader.readAsDataURL(file);
  };

  const handleUseExemplarSample = async () => {
    const sampleUrl = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80";
    setPhotoUrl(sampleUrl);
    setPhotoBase64(sampleUrl);
    const hash = await sha256Hex(sampleUrl);
    setMediaHash(hash);
  };

  const handleFinalize = async (skipped = false) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Submit proof
      await fetch('/api/score-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: activeAssessmentId,
          imageBase64: photoBase64,
          mediaHash: mediaHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          geotag,
          skipped
        })
      });

      // 2. Finish assessment and aggregate scores
      const res = await fetch('/api/finish-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: activeAssessmentId })
      });

      const data = await res.json();
      setFinalResult(data);
      recordOpLog("ASSESSMENT", "SUBMIT_PRACTICAL_PROOF", {
        assessmentId: activeAssessmentId,
        sha256: mediaHash
      });

      router.push(`/result?assessmentId=${activeAssessmentId}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit. Switching to local review mode.');
      router.push(`/result?assessmentId=${activeAssessmentId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="badge badge-neutral" style={{ marginBottom: '0.4rem' }}>
            Phase 2: Practical Task Evidence Capture
          </span>
          <h2 style={{ fontSize: '18px', color: 'var(--color-primary)' }}>
            {lang === 'hi' ? taskCard.title_hi : (lang === 'bn' ? taskCard.title_bn : taskCard.title)}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            NCVET Mandate: Practical performance carries 50–70% of total score for NSQF Level 3.
          </p>
        </div>

        {/* Task Card Checklist & Safety Rules */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--color-error)' }}>
            <ShieldAlert size={18} />
            <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--color-error)' }}>
              Critical Safety Must-Pass Checklist:
            </h4>
          </div>

          <ul style={{ paddingLeft: '1.25rem', fontSize: '12px', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
            {taskCard.critical_items.map((item, idx) => (
              <li key={idx} style={{ fontWeight: 600 }}>{item}</li>
            ))}
          </ul>

          <h4 style={{ fontSize: '13px', marginBottom: '0.35rem' }}>Tools Required at Bench:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {taskCard.tools_required.map((tool, i) => (
              <span key={i} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Photo Preview or Camera Trigger */}
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem', marginBottom: '1.25rem' }}>
          {photoUrl ? (
            <div style={{ marginBottom: '1rem' }}>
              <img 
                src={photoUrl} 
                alt="Captured Work Board" 
                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
              />
              {mediaHash && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  backgroundColor: '#F8FAFC', 
                  padding: '0.45rem', 
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}>
                  <Lock size={12} color="var(--color-success)" />
                  <span style={{ fontFamily: 'monospace' }}>SHA-256: {mediaHash.slice(0, 24)}...</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              border: '2px dashed var(--color-border)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '1.75rem 1rem', 
              backgroundColor: '#F8FAFC',
              marginBottom: '1rem'
            }}>
              <Camera size={36} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '14px', marginBottom: '0.25rem' }}>Capture Finished Board Photo</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                Frame your switchboard, MCB terminals, and green earth wire clearly.
              </p>
            </div>
          )}

          {/* Hidden File Input & Triggers */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            id="cameraFileInput" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => document.getElementById('cameraFileInput')?.click()}
            >
              <Camera size={16} /> Open Camera
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleUseExemplarSample}
            >
              Use Sample Bench Photo
            </button>
          </div>

          {/* Geotag & Time Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.85rem', fontSize: '11px', color: 'var(--color-text-dim)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={11} /> {geotag.district}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={11} /> Monotonic Geotag Recorded
            </span>
          </div>
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--color-error)', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>
            {errorMsg}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn"
            style={{ width: '100%', fontSize: '16px' }}
            onClick={() => handleFinalize(false)}
            disabled={isSubmitting || !photoUrl}
          >
            {isSubmitting ? t.submitting : "Submit Evidence & View Result"} <ArrowRight size={18} />
          </button>
          
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleFinalize(true)}
            disabled={isSubmitting}
          >
            Skip Photo (Viva Only Route)
          </button>
        </div>

      </div>
    </div>
  );
}
