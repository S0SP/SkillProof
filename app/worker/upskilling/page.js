'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { upskillingTrackB } from '@/lib/orientationModules';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  PlayCircle, 
  Sparkles, 
  Award, 
  RotateCcw 
} from 'lucide-react';

export default function UpskillingPage() {
  const { t, lang, mappingResult, setMappingResult } = useApp();
  const router = useRouter();

  const [completedGaps, setCompletedGaps] = useState([]);
  const [activeGap, setActiveGap] = useState(upskillingTrackB[0]);

  const handleCompleteGap = (gapId) => {
    if (!completedGaps.includes(gapId)) {
      const next = [...completedGaps, gapId];
      setCompletedGaps(next);

      // Boost coverage if gap completed
      if (mappingResult) {
        const updated = {
          ...mappingResult,
          coverage_pct: Math.min(92, mappingResult.coverage_pct + 12),
          meets_direct_threshold: true,
          route: "direct_assessment"
        };
        setMappingResult(updated);
      }
    }
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="badge badge-warning" style={{ marginBottom: '0.4rem' }}>
            <BookOpen size={12} /> Track B: Gap-Based Upskilling
          </span>
          <h2 style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
            Personalised Gap-Closing Modules
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Targeted 5-minute micro-learning focused exclusively on unmet Performance Criteria (PCs).
          </p>
        </div>

        {/* Selected Module Viewer */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ 
            backgroundColor: '#0F172A', 
            borderRadius: 'var(--radius-sm)', 
            padding: '1.5rem 1rem', 
            textAlign: 'center', 
            color: 'white',
            marginBottom: '1rem' 
          }}>
            <PlayCircle size={32} color="#93C5FD" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '0.25rem' }}>
              {lang === 'hi' ? activeGap.title_hi : (lang === 'bn' ? activeGap.title_bn : activeGap.title)}
            </h3>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontSize: '11px' }}>
              Mapped to {activeGap.pc_id} • Duration: {activeGap.duration}
            </span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '0.25rem' }}>Core Concept:</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {activeGap.key_concept}
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#F0FDF4', 
            border: '1px solid #BBF7D0', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.75rem',
            marginBottom: '1rem'
          }}>
            <h4 style={{ fontSize: '13px', color: 'var(--color-success)', marginBottom: '0.25rem' }}>
              Hands-On Practical Exercise:
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text)', margin: 0 }}>
              {activeGap.action_prompt}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-sm"
            style={{ width: '100%' }}
            onClick={() => handleCompleteGap(activeGap.id)}
          >
            {completedGaps.includes(activeGap.id) ? "✅ Competency Re-Verified" : "Mark Practice Exercise Done"}
          </button>
        </div>

        {/* Gap Modules List */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            Recommended Micro-Modules ({upskillingTrackB.length}):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upskillingTrackB.map((gap) => {
              const isCompleted = completedGaps.includes(gap.id);
              const isCurrent = activeGap.id === gap.id;
              return (
                <div
                  key={gap.id}
                  className="card"
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: 0,
                    cursor: 'pointer',
                    border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isCompleted ? '#F0FDF4' : '#FFFFFF'
                  }}
                  onClick={() => setActiveGap(gap)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', margin: 0 }}>
                        {lang === 'hi' ? gap.title_hi : (lang === 'bn' ? gap.title_bn : gap.title)}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Linked PC: {gap.pc_id}
                      </span>
                    </div>
                    {isCompleted ? (
                      <span className="badge badge-success">Done</span>
                    ) : (
                      <span className="badge badge-neutral">{gap.duration}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            className="btn"
            style={{ width: '100%' }}
            onClick={() => router.push('/worker/mapping')}
          >
            <RotateCcw size={16} /> Recalculate NSQF Match & Schedule Assessment
          </button>
        </div>

      </div>
    </div>
  );
}
