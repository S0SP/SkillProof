'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { heroQualificationPack } from '@/lib/qualificationPacks';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Download, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  QrCode, 
  MessageSquare, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function ResultPage() {
  const { t, lang, assessment, fetchAssessmentById, recordOpLog } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const activeAssessmentId = assessment?.id || assessmentIdFromUrl || 'asm-rahul-02';

  const [assessmentData, setAssessmentData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);

  useEffect(() => {
    fetch(`/api/assessments/${activeAssessmentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.assessment) {
          setAssessmentData(data.assessment);
          setAnswers(data.answers || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeAssessmentId]);

  const score = assessmentData?.total_score || 82;
  const isCertified = assessmentData?.status === 'certified' || assessmentData?.assessor_signed;
  const statusLabel = isCertified ? "NSQF Level 3 Certified" : "Awaiting Assessor Digital Sign-Off";

  const handleDownloadSid = () => {
    window.open(`/api/export/sid?id=${activeAssessmentId}`, '_blank');
  };

  const handleSendFeedback = () => {
    setFeedbackSent(true);
    recordOpLog("WORKER", "SUBMIT_CANDIDATE_FEEDBACK", {
      assessmentId: activeAssessmentId,
      rating: feedbackRating
    });
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Verification & Certification Header Card */}
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '1.5rem 1rem', 
            marginBottom: '1.25rem',
            borderTop: isCertified ? '4px solid var(--color-success)' : '4px solid var(--color-warning)'
          }}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: isCertified ? 'var(--color-success-subtle)' : 'var(--color-warning-subtle)',
            color: isCertified ? 'var(--color-success)' : 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            {isCertified ? <Award size={36} /> : <Clock size={32} />}
          </div>

          <h2 style={{ fontSize: '20px', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            {statusLabel}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            {heroQualificationPack.title} • NSQF Level 3
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-success">
              Score: {score} / 100
            </span>
            <span className="badge badge-neutral">
              NCrF Credits: 18
            </span>
            <span className="badge badge-neutral">
              NQR: QG-03-PW-02422
            </span>
          </div>

          <div style={{ 
            backgroundColor: '#F8FAFC', 
            padding: '0.65rem', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}>
            <ShieldCheck size={14} color="var(--color-success)" />
            <span>Digital Certificate Hash: 8f434346648f6b96df89dda901c5176b</span>
          </div>
        </div>

        {/* Competency Heatmap (NOS x PC) */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '0.65rem' }}>
            Competency Profile (NOS Mastery Breakdown)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {heroQualificationPack.nos_list.map((nos) => (
              <div 
                key={nos.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {nos.code}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '10px' }}>
                      Level 3 Competent
                    </span>
                  </div>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '12px', fontWeight: 600 }}>
                    {lang === 'hi' ? nos.name_hi : (lang === 'bn' ? nos.name_bn : nos.name)}
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}>
                  Pass
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Credential QR Code Card */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '74px', 
              height: '74px', 
              backgroundColor: '#FFFFFF', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <QrCode size={56} color="var(--color-primary-dark)" />
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '13px', margin: 0 }}>DigiLocker & SID Verifiable QR</h4>
              <p style={{ margin: '0.2rem 0 0.5rem', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Scannable by employers and contractors to verify NSQF certification authenticity.
              </p>
              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={handleDownloadSid}
                style={{ fontSize: '11px', padding: '0.3rem 0.6rem' }}
              >
                <Download size={12} /> {t.download_sid_report}
              </button>
            </div>
          </div>
        </div>

        {/* Post-Assessment Feedback (Mandated by NCVET Aug 2023 Guidelines) */}
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#F8FAFC' }}>
          <h4 style={{ fontSize: '13px', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MessageSquare size={14} color="var(--color-primary)" />
            Candidate Feedback (NCVET Mandated)
          </h4>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '0.65rem' }}>
            How fair, clear, and respectful was the assessment process today?
          </p>

          {!feedbackSent ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: star <= feedbackRating ? '#F59E0B' : '#CBD5E1'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button 
                type="button" 
                className="btn btn-sm"
                onClick={handleSendFeedback}
              >
                Submit Feedback
              </button>
            </div>
          ) : (
            <span className="badge badge-success">
              ✅ Feedback recorded in audit log. Thank you!
            </span>
          )}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn"
            style={{ width: '100%' }}
            onClick={() => router.push('/assessor')}
          >
            Switch to Assessor View (Review & Sign-Off) <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
