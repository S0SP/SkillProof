'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';

function ResultContent() {
  const { t, assessment } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const activeAssessmentId = assessment?.id || assessmentIdFromUrl;

  const [assessmentData, setAssessmentData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeAssessmentId) {
      router.push('/');
      return;
    }

    const loadData = () => {
      fetch(`/api/result/${activeAssessmentId}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load result");
          return res.json();
        })
        .then(d => {
          if (d.assessment) {
            setAssessmentData(d.assessment);
            setAnswers(d.answers || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    loadData();
    // Poll every 5 seconds to update live status if waiting for assessor
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [activeAssessmentId, router]);

  if (loading) {
    return (
      <div className="content" style={{ justifyContent: 'center' }}>
        <p>Loading your results...</p>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="content">
        <p>Assessment not found.</p>
        <button className="btn" onClick={() => router.push('/')}>Go Home</button>
      </div>
    );
  }

  const score = assessmentData.total_score || 0;
  const level = assessmentData.level || 'Beginner';
  const displayStatus = assessmentData.status || 'waiting_for_assessor';

  let levelColor = '#F59E0B'; // Amber for Beginner
  if (level === 'Intermediate' || level === 'Skilled') levelColor = '#3B82F6'; // Blue
  if (level === 'Expert') levelColor = '#10B981'; // Green

  return (
    <div className="content" style={{ padding: '1rem', width: '100%' }}>
      <h2 style={{ textAlign: 'center' }}>{t.result_title}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1.5rem 0' }}>
        <div 
          style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            border: `8px solid ${displayStatus === 'approved' ? levelColor : '#ccc'}`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: displayStatus === 'approved' ? 'black' : '#666' 
          }}
        >
          {displayStatus === 'approved' ? `${score}/100` : `${score}/100`}
        </div>
        <div style={{ background: levelColor, color: 'white', padding: '0.25rem 1rem', borderRadius: '16px', marginTop: '-12px', fontWeight: 'bold', zIndex: 1 }}>
          {t[level.toLowerCase()] || level}
        </div>
      </div>

      <div 
        style={{ 
          background: displayStatus === 'approved' ? '#D1FAE5' : '#FEF3C7', 
          color: displayStatus === 'approved' ? '#065F46' : '#B45309', 
          padding: '0.75rem', 
          borderRadius: '8px', 
          width: '100%', 
          textAlign: 'center', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem' 
        }}
      >
        {displayStatus === 'approved' ? `✅ ${t.approved_assessor}` : `⏳ ${t.waiting_assessor}`}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {answers.filter(a => a.question_id).map(ans => (
          <div key={ans.id} style={{ background: '#f9f9f9', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              <span>{ans.question_id}</span>
              <span>{ans.final_marks !== null && ans.final_marks !== undefined ? ans.final_marks : (ans.ai_marks || 0)}/20</span>
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              "{ans.reason || 'Assessed'}"
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary" onClick={() => window.print()} style={{ marginBottom: '1rem' }}>
        📄 {t.download_report}
      </button>

      <button className="btn" onClick={() => router.push('/')}>
        🔄 {t.take_test_again}
      </button>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="content"><p>Loading...</p></div>}>
      <ResultContent />
    </Suspense>
  );
}
