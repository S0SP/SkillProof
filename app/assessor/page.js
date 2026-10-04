'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AssessorPage() {
  const { t, assessorToken, setAssessorToken } = useApp();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (assessorToken) {
      fetch('/api/assessments/all')
        .then(res => res.json())
        .then(data => setAssessments(data.assessments || []))
        .catch(console.error);
    }
  }, [assessorToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/assessor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setAssessorToken(data.token);
        setError('');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (!assessorToken) {
    return (
      <div className="content">
        <h2>{t.assessor_title}</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password (skill123)" 
            className="select-box" 
            required
          />
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/')}>
            Back to Home
          </button>
        </form>
      </div>
    );
  }

  const filtered = assessments.filter(a => {
    if (filter === 'Waiting') return a.status === 'waiting_for_assessor';
    if (filter === 'Approved') return a.status === 'approved';
    return true;
  });

  return (
    <div className="content" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{t.assessor_title}</h2>
        <button 
          onClick={() => setAssessorToken(null)} 
          style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
        <button className={filter === 'All' ? 'btn' : 'btn btn-secondary'} onClick={() => setFilter('All')} style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}>All</button>
        <button className={filter === 'Waiting' ? 'btn' : 'btn btn-secondary'} onClick={() => setFilter('Waiting')} style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}>Waiting</button>
        <button className={filter === 'Approved' ? 'btn' : 'btn btn-secondary'} onClick={() => setFilter('Approved')} style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}>Approved</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {filtered.map(a => (
          <div 
            key={a.id} 
            className="card" 
            onClick={() => router.push(`/assessor/review/${a.id}`)} 
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {a.needsCheck && a.status !== 'approved' && (
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#EF4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Check first
              </div>
            )}
            <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{a.workerName || 'Worker'}</span>
              <span style={{ fontSize: '14px', color: 'var(--color-primary)' }}>{a.score}/100</span>
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666', marginBottom: '0.25rem' }}>
              <span>📞 {a.workerPhone || 'N/A'}</span>
              <span>🌐 {a.workerLanguage?.toUpperCase() || 'EN'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
              <span>{a.trade?.toUpperCase() || 'TRADE'} • {a.level || 'Beginner'}</span>
              <span style={{ color: a.status === 'approved' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>
                {a.status === 'approved' ? '✅ Approved' : '⏳ Waiting'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>{a.startTime ? new Date(a.startTime).toLocaleString() : ''}</div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No assessments found.</p>}
      </div>
    </div>
  );
}
