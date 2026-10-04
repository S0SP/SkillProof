'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReviewTestPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [data, setData] = useState(null);
  const [finalAnswers, setFinalAnswers] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/assessments/${id}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        const editableAns = (d.answers || []).map(a => ({
          id: a.id,
          questionId: a.questionId,
          marks: a.marks !== null && a.marks !== undefined ? Number(a.marks) : (Number(a.ai_marks) || 0),
          skipped: a.skipped
        }));
        setFinalAnswers(editableAns);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="content">
        <p>Loading assessment details...</p>
      </div>
    );
  }

  if (!data || !data.assessment) {
    return (
      <div className="content">
        <p>Assessment not found.</p>
        <button className="btn" onClick={() => router.push('/assessor')}>Back to Assessor List</button>
      </div>
    );
  }

  const handleMarkChange = (ansId, newMarks) => {
    setFinalAnswers(prev => prev.map(a => a.id === ansId ? { ...a, marks: Number(newMarks) } : a));
  };

  const calculateLiveScore = () => {
    let t = 0;
    finalAnswers.forEach(fa => {
      t += Number(fa.marks) || 0;
    });
    return t;
  };

  const liveScore = calculateLiveScore();
  let liveLevel = "Beginner";
  if (liveScore >= 40 && liveScore < 70) liveLevel = "Intermediate";
  if (liveScore >= 70) liveLevel = "Expert";

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assessments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalAnswers, comment })
      });
      if (res.ok) {
        router.push('/assessor');
      } else {
        alert("Failed to approve assessment.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error approving assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content" style={{ padding: '1rem', width: '100%', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>{data.worker?.name || 'Worker'}</h2>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '0.25rem' }}>📞 {data.worker?.phone} | 🌐 {data.worker?.language?.toUpperCase()}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>{data.assessment.trade?.toUpperCase()} • {new Date(data.assessment.startTime).toLocaleDateString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{liveScore}<span style={{ fontSize: '16px', color: '#999' }}>/100</span></div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: liveLevel === 'Expert' ? '#10B981' : (liveLevel === 'Intermediate' ? '#3B82F6' : '#F59E0B') }}>{liveLevel}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {(data.answers || []).filter(a => a.questionId).map(ans => {
          const fa = finalAnswers.find(a => a.id === ans.id);
          return (
            <div key={ans.id} className="card" style={{ borderLeft: (ans.needs_manual_review) ? '4px solid #F59E0B' : '4px solid #3B82F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>{ans.questionId} - Question</h4>
                {(ans.needs_manual_review) && <span style={{ background: '#FEF3C7', color: '#D97706', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>⚠️ Please check</span>}
              </div>
              <div style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px', fontSize: '14px', fontStyle: 'italic', marginBottom: '0.5rem', borderLeft: '2px solid #ccc' }}>
                "{ans.text}"
              </div>
              <p style={{ fontSize: '14px', margin: 0 }}><b>AI Reason:</b> {ans.reason}</p>
              
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
                <b style={{ fontSize: '14px' }}>Final Marks (out of 20):</b> 
                <input 
                  type="number" 
                  min="0" 
                  max="20" 
                  value={fa?.marks ?? 0} 
                  onChange={e => handleMarkChange(ans.id, e.target.value)} 
                  style={{ width: '60px', padding: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
                <span style={{ fontSize: '12px', color: '#999' }}>(AI suggested: {ans.ai_marks ?? 0})</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.5rem', width: '100%' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Assessor Comment (Optional)</h4>
        <textarea 
          className="select-box" 
          style={{ width: '100%', minHeight: '80px', fontSize: '14px' }} 
          value={comment} 
          onChange={e => setComment(e.target.value)} 
          placeholder="Type feedback for the worker to see..." 
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={() => router.push('/assessor')} style={{ flex: 1, color: '#D97706', borderColor: '#D97706' }}>
          Back ↩️
        </button>
        <button 
          className="btn" 
          style={{ flex: 2, background: '#10B981', color: 'white', borderColor: '#10B981' }} 
          onClick={handleApprove}
          disabled={submitting}
        >
          {submitting ? 'Approving...' : 'Approve Test ✅'}
        </button>
      </div>
    </div>
  );
}
