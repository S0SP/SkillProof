'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { heroQualificationPack } from '@/lib/qualificationPacks';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';

export default function MappingResultPage() {
  const { t, lang, mappingResult, setAssessment, worker, recordOpLog } = useApp();
  const router = useRouter();

  const [expandedNos, setExpandedNos] = useState(null);
  const [selectedQP, setSelectedQP] = useState('QP-ELE-L3-01');
  const [loading, setLoading] = useState(false);

  // If mappingResult is not in context (e.g. direct reload), provide robust fallback
  const result = mappingResult || {
    qualification_id: heroQualificationPack.id,
    qualification_title: heroQualificationPack.title,
    qualification_title_hi: heroQualificationPack.title_hi,
    qualification_title_bn: heroQualificationPack.title_bn,
    nqr_code: heroQualificationPack.nqr_code,
    nsqf_level: 3,
    recommended_level: 3,
    coverage_pct: 74,
    meets_direct_threshold: true,
    route: "direct_assessment",
    explanation: "Worker demonstrates 74% weighted coverage across mandatory NOS modules, satisfying NCVET requirement of ≥70% for direct physical assessment.",
    nos_breakdown: heroQualificationPack.nos_list.map(nos => ({
      nos_id: nos.id,
      code: nos.code,
      name: nos.name,
      name_hi: nos.name_hi,
      name_bn: nos.name_bn,
      credits: nos.credits,
      weight: nos.weight,
      coverage_pct: nos.id === 'MSME/DIE/04' ? 50 : 85,
      status: nos.id === 'MSME/DIE/04' ? 'gap' : 'strong'
    })),
    adjacent_qp: {
      id: "QP-ELE-L4-02",
      title: "Electrician (Construction & Industrial)",
      nsqf_level: 4,
      coverage_pct: 42
    }
  };

  const coverage = result.coverage_pct || 74;
  const directPass = result.meets_direct_threshold !== false && coverage >= 70;

  // SVG Circular progress ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (coverage / 100) * circumference;

  const handleConfirmAndSchedule = async () => {
    setLoading(true);
    try {
      const activeWorkerId = worker?.id || 'w-ramesh-01';
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: activeWorkerId,
          trade: 'electrician',
          language: lang,
          batch_id: 'BATCH-KOL-01'
        })
      });

      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
        recordOpLog("WORKER", "SCHEDULE_ASSESSMENT", { assessmentId: data.assessment.id });
        router.push(`/test?assessmentId=${data.assessment.id}`);
      } else {
        router.push('/test');
      }
    } catch (e) {
      console.error(e);
      router.push('/test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <span className="badge badge-success" style={{ marginBottom: '0.4rem' }}>
            <Award size={13} /> NCVET Qualification Pack Mapping
          </span>
          <h2 style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
            {lang === 'hi' ? result.qualification_title_hi : (lang === 'bn' ? result.qualification_title_bn : result.qualification_title)}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            NQR Code: {result.nqr_code} • NSQF Level {result.nsqf_level}
          </p>
        </div>

        {/* Circular Coverage Ring & Decision Box */}
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 1rem' }}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={directPass ? "var(--color-success)" : "var(--color-warning)"}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span style={{ fontSize: '30px', fontWeight: 800, color: directPass ? 'var(--color-success)' : 'var(--color-warning)', lineHeight: 1 }}>
                {coverage}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Coverage
              </span>
            </div>
          </div>

          {/* Direct Assessment Decision Banner (NCVET August 2023 70% Rule) */}
          <div style={{
            backgroundColor: directPass ? 'var(--color-success-subtle)' : 'var(--color-warning-subtle)',
            border: directPass ? '1.5px solid var(--color-success-border)' : '1.5px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              {directPass ? (
                <CheckCircle2 size={18} color="var(--color-success)" />
              ) : (
                <AlertCircle size={18} color="var(--color-warning)" />
              )}
              <h4 style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: directPass ? 'var(--color-success)' : 'var(--color-warning)' 
              }}>
                {directPass ? t.direct_route_badge : t.upskill_route_badge}
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text)', margin: 0, lineHeight: 1.4 }}>
              {result.explanation}
            </p>
          </div>
        </div>

        {/* NOS Competency Breakdown Heatmap Table */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '14px', margin: 0 }}>
              {t.nos_matrix_title}
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              70% Pass Gate
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {(result.nos_breakdown || []).map((nos) => {
              const isStrong = nos.coverage_pct >= 70;
              const isExpanded = expandedNos === nos.nos_id;
              return (
                <div 
                  key={nos.nos_id} 
                  style={{ 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '0.65rem 0.75rem',
                    backgroundColor: isStrong ? '#FFFFFF' : '#FFFBEB'
                  }}
                >
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setExpandedNos(isExpanded ? null : nos.nos_id)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {nos.code}
                        </span>
                        <span className={`badge ${isStrong ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                          {nos.coverage_pct}%
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '13px', fontWeight: 600 }}>
                        {lang === 'hi' ? nos.name_hi : (lang === 'bn' ? nos.name_bn : nos.name)}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--color-border)', fontSize: '12px' }}>
                      <p style={{ margin: '0 0 0.4rem', color: 'var(--color-text-muted)' }}>
                        <strong>NCrF Credits:</strong> {nos.credits} • <strong>Module Weight:</strong> {Math.round(nos.weight * 100)}%
                      </p>
                      <p style={{ margin: 0, color: 'var(--color-text)' }}>
                        {isStrong 
                          ? "✅ Demonstrated skills in conduit wiring and insulated tool handling satisfy the learning criteria."
                          : "⚠️ Earth resistance testing and clamp meter operations showed minor gaps; short 5-minute refresher recommended."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Adjacent L4 Option */}
        {result.adjacent_qp && (
          <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', backgroundColor: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Higher Qualification</span>
                <h4 style={{ fontSize: '13px', margin: '0.2rem 0 0' }}>
                  {result.adjacent_qp.title} (Level 4)
                </h4>
                <p style={{ margin: '0.1rem 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Current Match: {result.adjacent_qp.coverage_pct}% (Requires 3-phase motor experience)
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => router.push('/worker/upskilling')}
              >
                View L4 Track
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button 
            type="button" 
            className="btn" 
            style={{ width: '100%', fontSize: '16px' }}
            onClick={handleConfirmAndSchedule}
            disabled={loading}
          >
            <Calendar size={18} /> {t.schedule_assessment} (Proceed to Practical)
          </button>

          {!directPass && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => router.push('/worker/upskilling')}
            >
              <BookOpen size={16} /> Open Gap-Based Upskilling (Track B)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
