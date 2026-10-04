'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function WelcomePage() {
  const { t, setWorker } = useApp();
  const router = useRouter();
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!name || phone.length !== 10) {
      setError('Please enter a valid name and 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      if (res.ok && data.worker) {
        setWorker(data.worker);
        router.push(`/home?workerId=${data.worker.id}`);
      } else {
        setError(data.error || 'Failed to login');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
        {t.slogan}
      </h2>
      <div style={{ flex: 1 }} />

      {!showWorkerForm ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => setShowWorkerForm(true)} 
            style={{ padding: '2rem', fontSize: '24px' }}
          >
            <User size={32} /> {t.i_am_worker}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => router.push('/assessor')} 
            style={{ padding: '2rem', fontSize: '24px' }}
          >
            <Briefcase size={32} /> {t.i_am_assessor}
          </button>
        </div>
      ) : (
        <form onSubmit={handleWorkerSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder={t.name_placeholder} 
            className="select-box" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
          <input 
            type="tel" 
            placeholder={t.phone_placeholder} 
            className="select-box" 
            value={phone} 
            maxLength={10}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
            required
          />
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn" style={{ padding: '1.5rem', fontSize: '20px' }} disabled={loading}>
            {loading ? 'Please wait...' : t.login_btn} <ArrowRight size={24} />
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowWorkerForm(false)}>
            Back
          </button>
        </form>
      )}
      <div style={{ flex: 1 }} />
    </div>
  );
}
