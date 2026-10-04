'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Building2, 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  RefreshCw, 
  HardDrive, 
  Wifi, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function CoordinatorPage() {
  const { t, lang, recordOpLog } = useApp();
  const router = useRouter();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Form for creating new batch
  const [batchName, setBatchName] = useState('Barasat ITI Hub - Batch #25');
  const [venue, setVenue] = useState('Barasat Govt ITI Electrical Lab');
  const [batchDate, setBatchDate] = useState('2026-10-18');
  const [assessorName, setAssessorName] = useState('Mrs. S. Das (Certified ToA #8841)');
  const [targetSize, setTargetSize] = useState(24);

  const loadBatches = () => {
    setLoading(true);
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(data.batches || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: batchName,
          venue,
          date: batchDate,
          assessor_name: assessorName,
          target_size: targetSize
        })
      });

      if (res.ok) {
        setShowBatchModal(false);
        loadBatches();
        recordOpLog("COORDINATOR", "CREATE_BATCH", { name: batchName, targetSize });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-view-container">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-neutral">Centre Coordinator Console</span>
            <span className="badge badge-success">NCVET Batch Size: 20–30 Standard</span>
          </div>
          <h2 style={{ fontSize: '20px', margin: '0.25rem 0 0' }}>
            RPL Centre Operations & Batch Logistics
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setShowBatchModal(true)}
          >
            <Plus size={16} /> Create New Batch (20–30)
          </button>
          
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => router.push('/')}
          >
            <Users size={16} /> Enrol Candidate on Behalf
          </button>
        </div>
      </div>

      {/* Logistics & Device Sync Dashboard (Section 11.3 C3) */}
      <div className="grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <HardDrive size={18} color="var(--color-primary)" />
            <h4 style={{ margin: 0, fontSize: '14px' }}>Device Storage & Cache</h4>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', margin: '0.2rem 0' }}>
            4.2 GB Free
          </p>
          <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
            ✅ Storage sufficient for 60 task videos (480p H.264)
          </span>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Wifi size={18} color="var(--color-success)" />
            <h4 style={{ margin: 0, fontSize: '14px' }}>Sync Backlog & Health</h4>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', margin: '0.2rem 0' }}>
            0 Pending Ops
          </p>
          <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
            🟢 All local candidate hashes synced to cloud
          </span>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Clock size={18} color="var(--color-warning)" />
            <h4 style={{ margin: 0, fontSize: '14px' }}>Orientation Hours Status</h4>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', margin: '0.2rem 0' }}>
            92% Completed
          </p>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            22 of 24 candidates logged ≥12 orientation hours
          </span>
        </div>
      </div>

      {/* Batches List */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '0.75rem' }}>
          Scheduled RPL Assessment Batches ({batches.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {batches.map((batch) => (
            <div key={batch.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-neutral">{batch.id}</span>
                    <span className="badge badge-success">Assigned: {batch.assessor_name}</span>
                  </div>
                  <h3 style={{ fontSize: '17px', margin: '0.25rem 0' }}>
                    {batch.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                    📍 Venue: {batch.venue} • 📅 Date: {batch.date} • Batch Size: {batch.target_size} candidates
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline"
                    onClick={() => router.push('/assessor')}
                  >
                    Open Assessor View
                  </button>
                </div>
              </div>

              {/* Equipment & Tool Readiness Checklist (Section 11.3 C2) */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                  Laboratory Equipment Readiness Check (NCVET Mandatory):
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(batch.equipment_checklist || []).map((eq, i) => (
                    <span key={i} className="badge badge-success" style={{ fontSize: '11px' }}>
                      <CheckCircle2 size={12} /> {eq.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Batch Modal */}
      {showBatchModal && (
        <div className="modal-backdrop" onClick={() => setShowBatchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '17px', marginBottom: '0.75rem' }}>
              Create RPL Assessment Batch (20–30 Candidates)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              NCVET guidelines require batches of 20 to 30 workers per certified assessor for rigorous physical observation.
            </p>

            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                  Batch Title / Centre Code
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    Assessment Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={batchDate}
                    onChange={e => setBatchDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    Batch Target Size (20–30)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={30}
                    className="input-field"
                    value={targetSize}
                    onChange={e => setTargetSize(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                  Physical Assessment Venue
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                  Assigned Certified Assessor
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={assessorName}
                  onChange={e => setAssessorName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowBatchModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm">
                  Save & Schedule Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
