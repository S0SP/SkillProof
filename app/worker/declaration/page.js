'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { sampleVoicePhrases } from '@/lib/speech';
import { extractClaimsFromText } from '@/lib/mappingEngine';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  Volume2, 
  Wrench, 
  RotateCcw 
} from 'lucide-react';

export default function WorkerDeclarationPage() {
  const { t, lang, worker, setDeclaration, setMappingResult, recordOpLog, speak } = useApp();
  const router = useRouter();

  const [trade, setTrade] = useState('electrician');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [taskClaims, setTaskClaims] = useState([]);
  const [yearsExp, setYearsExp] = useState('7');
  const [siteType, setSiteType] = useState('Domestic & Commercial Housing');
  const [hasDocuments, setHasDocuments] = useState(false);
  const [affidavitAccepted, setAffidavitAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-load default claims on mount
  useEffect(() => {
    const initialClaims = extractClaimsFromText(sampleVoicePhrases[lang] || sampleVoicePhrases.en, trade);
    setTaskClaims(initialClaims);
    setTranscript(sampleVoicePhrases[lang] || sampleVoicePhrases.en);
  }, [lang, trade]);

  // Handle Speech Recognition or simulated vernacular voice input
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setErrorMsg('');

      if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SpeechRec();
        rec.lang = lang === 'hi' ? 'hi-IN' : (lang === 'bn' ? 'bn-IN' : 'en-IN');
        rec.continuous = false;
        rec.interimResults = false;

        rec.onresult = (e) => {
          const text = e.results[0][0].transcript;
          setTranscript(prev => (prev ? prev + ' ' + text : text));
          const updatedClaims = extractClaimsFromText(text, trade);
          setTaskClaims(updatedClaims);
          setIsRecording(false);
        };

        rec.onerror = (e) => {
          console.warn("Speech error, using demo sample:", e.error);
          setIsRecording(false);
          // Fallback to sample phrase
          setTranscript(sampleVoicePhrases[lang] || sampleVoicePhrases.en);
          setTaskClaims(extractClaimsFromText(sampleVoicePhrases[lang] || sampleVoicePhrases.en, trade));
        };

        try {
          rec.start();
        } catch (e) {
          setIsRecording(false);
        }
      } else {
        // Speech API unavailable, simulate live voice capture with sample phrase
        setTimeout(() => {
          setIsRecording(false);
          const sample = sampleVoicePhrases[lang] || sampleVoicePhrases.en;
          setTranscript(sample);
          setTaskClaims(extractClaimsFromText(sample, trade));
        }, 1500);
      }
    }
  };

  const handleClaimRatingChange = (termId, newRating) => {
    setTaskClaims(prev => prev.map(c => c.term_id === termId ? { ...c, self_rating: newRating } : c));
  };

  const handleProceedToMapping = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const activeWorkerId = worker?.id || `w-local-${Date.now()}`;
      const payload = {
        workerId: activeWorkerId,
        transcript,
        customClaims: taskClaims,
        trade,
        hasDocuments,
        affidavitAccepted
      };

      const res = await fetch('/api/declaration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.mapping) {
        setDeclaration(data.declaration);
        setMappingResult(data.mapping);
        recordOpLog("WORKER", "SUBMIT_DECLARATION", {
          workerId: activeWorkerId,
          claimsCount: taskClaims.length,
          coveragePct: data.mapping.coverage_pct
        });
        router.push('/worker/mapping');
      } else {
        throw new Error(data.error || 'Mapping failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error generating qualification mapping. Switching to local engine.');
      // Local fallback calculation
      const { runQualificationMapping } = await import('@/lib/mappingEngine');
      const fallbackMapping = runQualificationMapping(taskClaims, trade);
      setMappingResult(fallbackMapping);
      router.push('/worker/mapping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="badge badge-neutral" style={{ marginBottom: '0.4rem' }}>
            <FileText size={12} /> Step 2: Voice-First Self-Declaration
          </span>
          <h2 style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
            {t.dec_title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {t.dec_subtitle}
          </p>
        </div>

        {/* Trade Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            className={trade === 'electrician' ? 'btn btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setTrade('electrician')}
            style={{ flex: 1 }}
          >
            ⚡ {t.trade_electrician}
          </button>
          <button
            type="button"
            className={trade === 'plumber' ? 'btn btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setTrade('plumber')}
            style={{ flex: 1 }}
          >
            🔧 {t.trade_plumber}
          </button>
        </div>

        {/* Voice Recording Box */}
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className={`btn ${isRecording ? 'mic-active' : ''}`}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                margin: '0 auto',
                padding: 0,
                boxShadow: isRecording ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'var(--shadow-md)'
              }}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>

          <h3 style={{ fontSize: '15px', marginBottom: '0.35rem' }}>
            {isRecording ? t.listening : t.dec_speak_btn}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            Speak in Hindi, Bengali, or English about what wiring, MCB, or earthing work you perform.
          </p>

          {/* Transcript Display Box */}
          <div style={{ 
            backgroundColor: '#F8FAFC', 
            border: '1.5px dashed var(--color-border)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.75rem', 
            minHeight: '64px',
            textAlign: 'left',
            fontSize: '13px',
            color: transcript ? 'var(--color-text)' : 'var(--color-text-dim)',
            lineHeight: 1.5,
            marginBottom: '0.75rem'
          }}>
            {transcript || t.dec_transcript_placeholder}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-sm btn-outline"
              onClick={() => {
                const sample = sampleVoicePhrases[lang] || sampleVoicePhrases.en;
                setTranscript(sample);
                setTaskClaims(extractClaimsFromText(sample, trade));
              }}
            >
              <RotateCcw size={13} /> Load Sample Voice Input
            </button>

            {transcript && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => speak(transcript)}
                title="Play back audio"
              >
                <Volume2 size={14} /> Listen
              </button>
            )}
          </div>
        </div>

        {/* Extracted Task Claims Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '15px', color: 'var(--color-text)' }}>
              {t.task_claims_title} ({taskClaims.length})
            </h3>
            <span className="badge badge-ai">
              <Sparkles size={11} /> AI Structured Vocabulary
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {taskClaims.map((claim) => (
              <div 
                key={claim.term_id}
                className="card"
                style={{ 
                  padding: '0.85rem 1rem', 
                  marginBottom: 0,
                  borderLeft: claim.self_rating === 'alone' ? '3px solid var(--color-success)' : (claim.self_rating === 'with_help' ? '3px solid var(--color-warning)' : '3px solid #CBD5E1')
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '20px' }}>{claim.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', margin: 0 }}>
                      {lang === 'hi' ? claim.term_text_hi : (lang === 'bn' ? claim.term_text_bn : claim.term_text)}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                      Maps to PCs: {claim.pcs_covered.join(', ')}
                    </span>
                  </div>
                </div>

                {/* 3-level rating selector */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => handleClaimRatingChange(claim.term_id, 'alone')}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.25rem',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: claim.self_rating === 'alone' ? '1.5px solid var(--color-success)' : '1px solid var(--color-border)',
                      backgroundColor: claim.self_rating === 'alone' ? 'var(--color-success-subtle)' : '#ffffff',
                      color: claim.self_rating === 'alone' ? 'var(--color-success)' : 'var(--color-text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {t.alone}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClaimRatingChange(claim.term_id, 'with_help')}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.25rem',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: claim.self_rating === 'with_help' ? '1.5px solid var(--color-warning)' : '1px solid var(--color-border)',
                      backgroundColor: claim.self_rating === 'with_help' ? 'var(--color-warning-subtle)' : '#ffffff',
                      color: claim.self_rating === 'with_help' ? 'var(--color-warning)' : 'var(--color-text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {t.with_help}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClaimRatingChange(claim.term_id, 'seen_it')}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.25rem',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: claim.self_rating === 'seen_it' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: claim.self_rating === 'seen_it' ? 'var(--color-primary-subtle)' : '#ffffff',
                      color: claim.self_rating === 'seen_it' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {t.seen_it}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Details & Affidavit Route */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '0.65rem' }}>
            Work History & Legal Declaration Route
          </h4>

          <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Years of Practical Work
              </label>
              <select className="select-box" value={yearsExp} onChange={e => setYearsExp(e.target.value)}>
                <option value="1-3">1–3 years</option>
                <option value="4-6">4–6 years</option>
                <option value="7">7+ years (Experienced)</option>
                <option value="10+">10+ years (Master craftsman)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Primary Work Environment
              </label>
              <select className="select-box" value={siteType} onChange={e => setSiteType(e.target.value)}>
                <option value="Domestic & Commercial Housing">Domestic Housing / Flats</option>
                <option value="Commercial Shops & Small Factories">Shops & Small Factories</option>
                <option value="Under Electrical Contractor">Sub-contractor Team</option>
                <option value="Independent Freelance Repair">Independent Repair</option>
              </select>
            </div>
          </div>

          {/* Affidavit Route Toggle */}
          <div style={{ 
            backgroundColor: '#F8FAFC', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--color-border)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="affidavitCheck" 
                checked={affidavitAccepted} 
                onChange={e => setAffidavitAccepted(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              />
              <div>
                <label htmlFor="affidavitCheck" style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'block' }}>
                  {t.affidavit_route}
                </label>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0.2rem 0 0', lineHeight: 1.35 }}>
                  {t.affidavit_note}
                </p>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--color-error)', fontSize: '13px', textAlign: 'center', fontWeight: 600, marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Submit to Mapping Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button 
            type="button" 
            className="btn" 
            style={{ width: '100%', fontSize: '16px' }}
            onClick={handleProceedToMapping}
            disabled={loading}
          >
            {loading ? t.loading : t.calculate_match} <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
