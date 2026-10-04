'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { orientationTrackA } from '@/lib/orientationModules';
import { 
  PlayCircle, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Volume2, 
  ShieldAlert, 
  Video 
} from 'lucide-react';

export default function OrientationPage() {
  const { t, lang, worker, speak, recordOpLog } = useApp();
  const router = useRouter();

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState([0]); // module 1 pre-completed
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState('');

  const currentModule = orientationTrackA[activeModuleIndex];
  const totalHoursCredit = completedModules.reduce((acc, idx) => acc + orientationTrackA[idx].hours_credit, 0);
  const targetHours = 15;
  const progressPct = Math.min(100, Math.round((totalHoursCredit / targetHours) * 100));

  const handleSelectModule = (index) => {
    setActiveModuleIndex(index);
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setQuizError('');
  };

  const handleQuizSubmit = () => {
    if (quizAnswer === null) {
      setQuizError('Please select an answer to confirm readiness.');
      return;
    }

    if (quizAnswer === currentModule.quiz.correct_index) {
      setQuizSubmitted(true);
      setQuizError('');
      if (!completedModules.includes(activeModuleIndex)) {
        const next = [...completedModules, activeModuleIndex];
        setCompletedModules(next);
        recordOpLog("WORKER", "COMPLETE_ORIENTATION_MODULE", {
          workerId: worker?.id,
          moduleId: currentModule.id,
          hours_earned: currentModule.hours_credit
        });
      }
    } else {
      setQuizError('Incorrect. Please review the key safety points above and try again.');
    }
  };

  const handleNextOrFinish = () => {
    if (activeModuleIndex < orientationTrackA.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setQuizAnswer(null);
      setQuizSubmitted(false);
      setQuizError('');
    } else {
      router.push('/worker/declaration');
    }
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Header Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="badge badge-neutral" style={{ marginBottom: '0.4rem' }}>
            <Clock size={12} /> Track A: Pre-Assessment Orientation
          </span>
          <h2 style={{ fontSize: '18px', color: 'var(--color-primary)' }}>
            {t.orientation_title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            NCVET August 2023 Guidelines prescribe 12–15 hours orientation for Level 1–3.5 candidates.
          </p>
        </div>

        {/* Progress Bar toward 15 Hours */}
        <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Orientation Hours Logged</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {totalHoursCredit} / {targetHours} Hours ({progressPct}%)
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${progressPct}%`, 
                height: '100%', 
                backgroundColor: progressPct >= 80 ? 'var(--color-success)' : 'var(--color-primary)', 
                transition: 'width 0.4s ease' 
              }} 
            />
          </div>
        </div>

        {/* Module Viewer Card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          
          {/* Simulated Vernacular Micro-Video Player */}
          <div 
            style={{ 
              backgroundColor: '#0F172A', 
              borderRadius: 'var(--radius-sm)', 
              padding: '1.75rem 1rem', 
              textAlign: 'center', 
              color: 'white',
              position: 'relative',
              marginBottom: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Video size={28} color="#93C5FD" />
              <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
                Module {activeModuleIndex + 1} of 8 • {currentModule.duration_minutes} Mins
              </span>
            </div>
            
            <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '0.35rem' }}>
              {lang === 'hi' ? currentModule.title_hi : (lang === 'bn' ? currentModule.title_bn : currentModule.title)}
            </h3>
            
            <p style={{ fontSize: '12px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto 1rem', lineHeight: 1.4 }}>
              Vernacular audio with illustrated practical slides (Offline-cached).
            </p>

            <button 
              type="button" 
              className="btn btn-sm" 
              style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', margin: '0 auto' }}
              onClick={() => speak(`${currentModule.title}. ${currentModule.video_summary}`)}
            >
              <Volume2 size={16} /> Listen to Audio Narration
            </button>
          </div>

          {/* Key Learning Highlights */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '14px', color: 'var(--color-text)' }}>
              Core Takeaways for Candidates:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {currentModule.key_points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Interactive Readiness Check Quiz */}
          <div style={{ 
            backgroundColor: '#F8FAFC', 
            border: '1px solid var(--color-border)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '1rem' 
          }}>
            <h4 style={{ fontSize: '13px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} color="var(--color-primary)" />
              Readiness Check:
            </h4>

            <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.75rem' }}>
              {lang === 'hi' ? currentModule.quiz.question_hi : (lang === 'bn' ? currentModule.quiz.question_bn : currentModule.quiz.question)}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
              {currentModule.quiz.options.map((opt, optIdx) => (
                <label 
                  key={optIdx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '4px',
                    backgroundColor: quizAnswer === optIdx ? 'var(--color-primary-subtle)' : '#ffffff',
                    border: quizAnswer === optIdx ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  <input 
                    type="radio" 
                    name="quizOpt" 
                    checked={quizAnswer === optIdx} 
                    onChange={() => setQuizAnswer(optIdx)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            {quizError && (
              <p style={{ color: 'var(--color-error)', fontSize: '12px', fontWeight: 600, marginBottom: '0.5rem' }}>
                {quizError}
              </p>
            )}

            {!quizSubmitted ? (
              <button 
                type="button" 
                className="btn btn-sm" 
                style={{ width: '100%' }}
                onClick={handleQuizSubmit}
              >
                Confirm Module Completion
              </button>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">
                  ✅ Module Passed (+{currentModule.hours_credit} hrs credited)
                </span>
                <button 
                  type="button" 
                  className="btn btn-sm" 
                  onClick={handleNextOrFinish}
                >
                  {activeModuleIndex < orientationTrackA.length - 1 ? 'Next Module' : 'Proceed to Declaration'} <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Micro-Module Carousel List */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '13px', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
            All 8 Orientation Micro-Modules:
          </h4>
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {orientationTrackA.map((mod, idx) => {
              const isDone = completedModules.includes(idx);
              const isActive = activeModuleIndex === idx;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(idx)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isActive ? 'var(--color-primary-subtle)' : (isDone ? '#F0FDF4' : '#ffffff'),
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {isDone && <CheckCircle2 size={13} color="var(--color-success)" />}
                  <span>{idx + 1}. {mod.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Skip to Declaration for Experienced Candidates */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => router.push('/worker/declaration')}
          >
            {t.start_test} (Voice Self-Declaration) <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
