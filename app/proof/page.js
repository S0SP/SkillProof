'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function ProofContent() {
  const { t, assessment, setFinalResult } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const activeAssessmentId = assessment?.id || assessmentIdFromUrl;

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t.proof_error);
      return;
    }
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setErrorMsg(t.proof_error);
      return;
    }
    setErrorMsg('');
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const finalize = async (skipped, base64) => {
    if (!activeAssessmentId) {
      router.push('/');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await fetch('/api/score-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: activeAssessmentId,
          imageBase64: base64,
          skipped
        })
      });

      const res = await fetch('/api/finish-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: activeAssessmentId })
      });

      if (!res.ok) throw new Error('Finish assessment failed');
      const data = await res.json();
      setFinalResult(data);
      router.push(`/result?assessmentId=${activeAssessmentId}`);
    } catch (err) {
      console.error("Proof finalize error:", err);
      setErrorMsg('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content">
      <h2>{t.proof_title}</h2>
      
      {photoUrl && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src={photoUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'cover' }} />
        </div>
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', justifyContent: 'center' }}>
        <input type="file" accept="image/jpeg, image/png" capture="environment" id="cameraInput" style={{ display: 'none' }} onChange={handleFile} />
        <input type="file" accept="image/jpeg, image/png" id="galleryInput" style={{ display: 'none' }} onChange={handleFile} />
        
        <button type="button" className="btn btn-secondary" onClick={() => document.getElementById('cameraInput')?.click()}>
          <Camera size={24} /> {t.take_photo}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => document.getElementById('galleryInput')?.click()}>
          🖼️ {t.choose_gallery}
        </button>
        {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', position: 'relative' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => finalize(true, null)} 
          style={{ flex: 1 }} 
          disabled={isSubmitting}
        >
          {t.skip}
        </button>
        <button 
          className="btn" 
          onClick={() => finalize(false, photoBase64)} 
          style={{ flex: 1 }} 
          disabled={!photoBase64 || isSubmitting}
        >
          {isSubmitting ? t.submitting : t.submit_photo} <CheckCircle size={24} />
        </button>
      </div>
    </div>
  );
}

export default function ProofPage() {
  return (
    <Suspense fallback={<div className="content"><p>Loading...</p></div>}>
      <ProofContent />
    </Suspense>
  );
}
