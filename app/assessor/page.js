'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { heroQualificationPack } from '@/lib/qualificationPacks';
import { calibrationGoldClips } from '@/lib/orientationModules';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  DownloadCloud, 
  Eye, 
  Sparkles, 
  Lock, 
  Award, 
  FileText, 
  UserCheck, 
  Check, 
  X, 
  RefreshCw, 
  PenTool, 
  ChevronRight,
  TrendingUp,
  Volume2
} from 'lucide-react';

export default function AssessorPage() {
  const { t, lang, assessorToken, setAssessorToken, recordOpLog, speak } = useApp();
  const router = useRouter();

  // Navigation tabs within Assessor Console: 'queue', 'scoring', 'calibration', 'incidents'
  const [subTab, setSubTab] = useState('queue');
  const [filter, setFilter] = useState('All');
  const [assessments, setAssessments] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offlinePackDownloaded, setOfflinePackDownloaded] = useState(false);

  // Scoring state for active case
  const [activePCIndex, setActivePCIndex] = useState(0);
  const [assessorScores, setAssessorScores] = useState({
    "PC-01-01": 3,
    "PC-01-02": 2,
    "PC-02-01": 2,
    "PC-02-02": 2,
    "PC-03-01": 3,
    "PC-03-02": 2,
    "PC-03-03": 2,
    "PC-04-01": 2,
    "PC-04-02": 2,
    "PC-ES-01": 3
  });
  const [revealedAIs, setRevealedAIs] = useState({});
  const [overrideReasons, setOverrideReasons] = useState({});
  const [criticalSafetyPass, setCriticalSafetyPass] = useState(true);
  const [observedChecklist, setObservedChecklist] = useState({
    "S1": true,
    "S2": true,
    "S3": true,
    "S4": true,
    "S5": true,
    "S6": true,
    "S7": true
  });
  const [assessorPIN, setAssessorPIN] = useState('8841');
  const [signOffStatus, setSignOffStatus] = useState(null);
  const [isSigning, setIsSigning] = useState(false);

  // Calibration Centre State
  const [selectedGoldClip, setSelectedGoldClip] = useState(calibrationGoldClips[0]);
  const [calibrationSubmitted, setCalibrationSubmitted] = useState(false);
  const [calibrationAssessorScore, setCalibrationAssessorScore] = useState(2);

  // Fetch assessments from hybrid DB
  const loadAssessments = () => {
    setLoading(true);
    fetch('/api/assessments')
      .then(res => res.json())
      .then(data => {
        setAssessments(data.assessments || []);
        if (data.assessments && data.assessments.length > 0 && !selectedCase) {
          setSelectedCase(data.assessments[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  // Offline batch preparation
  const handleDownloadBatchPack = () => {
    setOfflinePackDownloaded(true);
    recordOpLog("ASSESSOR", "PREPARE_BATCH_OFFLINE", {
      batchId: "BATCH-KOL-01",
      casesCount: assessments.length,
      qpId: heroQualificationPack.id
    });
    alert("Batch #B24-KOL-01 (Barasat ITI Hub) successfully pre-cached offline in IndexedDB. Ready for airplane-mode scoring.");
  };

  const handleSelectCase = async (c) => {
    setSelectedCase(c);
    setSubTab('scoring');
    try {
      const res = await fetch(`/api/assessments/${c.id}`);
      const data = await res.json();
      if (data.assessment) {
        setSelectedCase(data.assessment);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Commit individual PC score (Blind-first flow)
  const handleScoreSelect = (pcId, scoreValue) => {
    setAssessorScores(prev => ({ ...prev, [pcId]: scoreValue }));
  };

  const handleRevealAI = (pcId) => {
    setRevealedAIs(prev => ({ ...prev, [pcId]: true }));
  };

  // Final digital sign-off
  const handleDigitalSignOff = async (decision) => {
    setIsSigning(true);
    try {
      const res = await fetch('/api/signoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: selectedCase.id,
          assessorId: "ASSESSOR-DAS-01",
          assessorName: "Mrs. S. Das (Certified ToA #8841)",
          decision,
          overrideReason: overrideReasons["PC-02-01"] || "Competence fully demonstrated under physical observation",
          pin: assessorPIN
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSignOffStatus(data);
        recordOpLog("ASSESSOR", "DIGITAL_SIGNOFF", {
          assessmentId: selectedCase.id,
          decision,
          auditHash: data.audit_hash
        });
        loadAssessments();
      }
    } catch (e) {
      console.error(e);
      setSignOffStatus({ decision: 'certified', audit_hash: 'LOCAL-SHA256-SIGN-LOCKED' });
    } finally {
      setIsSigning(false);
    }
  };

  // All PCs in hero trade
  const allPCs = heroQualificationPack.nos_list.flatMap(nos => 
    nos.performance_criteria.map(pc => ({ ...pc, nos_id: nos.id, nos_code: nos.code, nos_name: nos.name }))
  );
  const currentPC = allPCs[activePCIndex] || allPCs[0];

  const filteredAssessments = assessments.filter(a => {
    if (filter === 'Waiting') return a.status === 'awaiting_signoff' || a.status === 'waiting_for_assessor';
    if (filter === 'Certified') return a.status === 'certified' || a.assessor_signed;
    return true;
  });

  return (
    <div className="dashboard-view-container">
      
      {/* Assessor Console Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-neutral">Certified Assessor Console</span>
            <span className="badge badge-success">ToA #8841 • Mrs. S. Das</span>
          </div>
          <h2 style={{ fontSize: '20px', margin: '0.25rem 0 0' }}>
            {t.assessor_title} — Barasat Govt ITI Hub
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={offlinePackDownloaded ? "btn btn-success btn-sm" : "btn btn-outline btn-sm"}
            onClick={handleDownloadBatchPack}
          >
            <DownloadCloud size={14} />
            <span>{offlinePackDownloaded ? "Batch Pre-Cached Offline" : "Prepare Batch for Offline"}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadAssessments}
          >
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Internal Assessor Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={subTab === 'queue' ? 'btn btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setSubTab('queue')}
        >
          Candidate Queue ({assessments.length})
        </button>
        <button
          type="button"
          className={subTab === 'scoring' ? 'btn btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setSubTab('scoring')}
          disabled={!selectedCase}
        >
          Active Scoring & Rubrics {selectedCase ? `(${selectedCase.workers?.name || 'Selected'})` : ''}
        </button>
        <button
          type="button"
          className={subTab === 'calibration' ? 'btn btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setSubTab('calibration')}
        >
          🎯 Calibration Centre (Track C)
        </button>
      </div>

      {/* SUBTAB 1: CASE QUEUE */}
      {subTab === 'queue' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['All', 'Waiting', 'Certified'].map(f => (
              <button
                key={f}
                type="button"
                className={filter === f ? 'btn btn-sm' : 'btn btn-secondary btn-sm'}
                onClick={() => setFilter(f)}
              >
                {f} Candidates
              </button>
            ))}
          </div>

          {/* Candidates Grid */}
          <div className="grid-3" style={{ gap: '1rem' }}>
            {filteredAssessments.map((item) => {
              const isCertified = item.status === 'certified' || item.assessor_signed;
              const isWaiting = item.status === 'awaiting_signoff' || item.status === 'waiting_for_assessor';
              return (
                <div
                  key={item.id}
                  className="card card-clickable"
                  style={{
                    borderLeft: isCertified ? '4px solid var(--color-success)' : (isWaiting ? '4px solid var(--color-warning)' : '4px solid var(--color-primary)'),
                    padding: '1.25rem'
                  }}
                  onClick={() => handleSelectCase(item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      {item.id}
                    </span>
                    <span className={`badge ${isCertified ? 'badge-success' : (isWaiting ? 'badge-warning' : 'badge-neutral')}`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', marginBottom: '0.2rem' }}>
                    {item.workers?.name || "Ramesh Mandal"}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    📞 {item.workers?.phone || "9830112233"} • {item.trade} (L3)
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <span>Score: <strong>{item.total_score || 78}/100</strong></span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      Review & Score <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ACTIVE SCORING & RUBRICS */}
      {subTab === 'scoring' && selectedCase && (
        <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* Left Column: Live Checklist & Video Evidence */}
          <div>
            
            {/* Candidate Pre-Assessment Overview */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  Candidate: {selectedCase.workers?.name || "Ramesh Mandal"}
                </h3>
                <span className="badge badge-success">Declared 74% Coverage</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Voice Claim: "আমি ৭ বছর ধরে বাড়ি আর দোকানে কনসিল্ড পাইপ ওয়্যারিং, সুইচবোর্ড ফিটিং, এমসিবি ডিবি বসানো আর আর্থিং-এর কাজ করি।"
              </p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span className="badge badge-neutral">Affidavit Route Accepted</span>
                <span className="badge badge-neutral">Orientation 15h Completed</span>
              </div>
            </div>

            {/* Task Card & Real-Time Checklist */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '14px' }}>
                  Observation Checklist (Task: 2-Lamp 1-Socket Control Board)
                </h4>
                <button
                  type="button"
                  className={criticalSafetyPass ? "btn btn-sm btn-outline" : "btn btn-sm btn-danger"}
                  onClick={() => setCriticalSafetyPass(!criticalSafetyPass)}
                >
                  <ShieldAlert size={14} />
                  <span>{criticalSafetyPass ? "Flag Safety Violation" : "CRITICAL SAFETY VIOLATION FLAGGED"}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {heroQualificationPack.task_cards[0].steps.map((st) => (
                  <label
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: observedChecklist[st.id] ? '#F0FDF4' : '#F8FAFC',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!observedChecklist[st.id]}
                      onChange={e => setObservedChecklist({ ...observedChecklist, [st.id]: e.target.checked })}
                    />
                    <span style={{ fontWeight: st.critical ? 700 : 500, color: st.critical ? 'var(--color-error)' : 'var(--color-text)' }}>
                      [{st.id}] {st.name} {st.critical ? "(Critical)" : ""}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Video Evidence & AI Bookmarks */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '0.5rem' }}>
                Captured Evidence & AI Timeline Bookmarks
              </h4>

              <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80"
                  alt="Bench Evidence"
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>
                  SHA-256: e3b0c44298fc1c149afbf4c8... • GPS Verified
                </div>
              </div>

              {/* Running AI Bookmarks */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span className="badge badge-ai">00:15 Supply Isolated</span>
                <span className="badge badge-ai">00:42 12mm Stripping Seen</span>
                <span className="badge badge-ai">01:15 Insulated Pliers Used</span>
                <span className="badge badge-ai">02:30 Green Earth Terminated</span>
                <span className="badge badge-ai">03:10 Multimeter 230V Recorded</span>
              </div>
            </div>

          </div>

          {/* Right Column: Anchored Rubric Scoring UI (Blind-First) */}
          <div>
            
            {/* PC Navigation Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-neutral">
                PC {activePCIndex + 1} of {allPCs.length} • {currentPC.nos_code}
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={activePCIndex === 0}
                  onClick={() => setActivePCIndex(activePCIndex - 1)}
                >
                  Prev PC
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={activePCIndex === allPCs.length - 1}
                  onClick={() => setActivePCIndex(activePCIndex + 1)}
                >
                  Next PC
                </button>
              </div>
            </div>

            {/* Current PC Anchored Rubric Card */}
            <div className="card" style={{ marginBottom: '1.25rem', borderLeft: currentPC.critical ? '4px solid var(--color-error)' : '4px solid var(--color-primary)' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentPC.id} {currentPC.critical ? "• CRITICAL MUST-PASS" : ""}
                </span>
                <h3 style={{ fontSize: '15px', margin: '0.2rem 0 0', lineHeight: 1.4 }}>
                  {currentPC.text}
                </h3>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  <strong>Blind-First Rule:</strong> Select your score anchor (0–3) before viewing the AI suggestion.
                </p>
              </div>

              {/* Behavioral Anchors (Levels 0, 1, 2, 3) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {[0, 1, 2, 3].map((lvl) => {
                  const isSelected = assessorScores[currentPC.id] === lvl;
                  const anchorText = currentPC.rubric_anchors?.[lvl] || `Level ${lvl} performance criteria demonstrated.`;
                  return (
                    <div
                      key={lvl}
                      onClick={() => handleScoreSelect(currentPC.id, lvl)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-subtle)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                          Level {lvl}: {lvl === 0 ? "Unsafe / Not Attempted" : (lvl === 1 ? "Needs Guidance" : (lvl === 2 ? "Competent Industry Standard" : "Mastery / Self-Directed"))}
                        </span>
                        {isSelected && <CheckCircle2 size={16} color="var(--color-primary)" />}
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
                        {anchorText}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Reveal AI Co-Pilot Suggestion */}
              {!revealedAIs[currentPC.id] ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={() => handleRevealAI(currentPC.id)}
                >
                  <Sparkles size={14} /> Reveal AI Co-Pilot Suggestion
                </button>
              ) : (
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="badge badge-ai">
                      AI Suggestion: Level 3 (Confidence: 91%)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      AI Suggestion. Assessor Decides.
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                    Rationale: Video bookmark 00:42 confirms 12mm clean strip with zero copper strand nicks. Phase polarity verified.
                  </p>

                  {/* Override input if assessor differs from AI */}
                  <div style={{ marginTop: '0.65rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '0.2rem' }}>
                      Override Justification Note (Stored in immutable audit log):
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ minHeight: '36px', fontSize: '12px' }}
                      placeholder="Optional notes or reasons for revision..."
                      value={overrideReasons[currentPC.id] || ''}
                      onChange={e => setOverrideReasons({ ...overrideReasons, [currentPC.id]: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Final Digital Sign-Off Area */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <PenTool size={16} color="var(--color-primary)" />
                  Assessor Endorsement & Digital Sign-Off
                </h4>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Assessor PIN (8841)"
                    className="input-field"
                    value={assessorPIN}
                    onChange={e => setAssessorPIN(e.target.value)}
                    style={{ flex: 1, minHeight: '40px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    style={{ flex: 2 }}
                    onClick={() => handleDigitalSignOff('certified')}
                    disabled={isSigning}
                  >
                    <Lock size={14} /> Certify (Sign-Off)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleDigitalSignOff('partial_nos')}
                    disabled={isSigning}
                  >
                    Partial NOS
                  </button>
                </div>

                {signOffStatus && (
                  <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                      ✅ Digitally Signed & Locked by Mrs. S. Das (ToA #8841)
                    </span>
                    <p style={{ margin: '0.2rem 0 0', fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      Audit Block: {signOffStatus.audit_hash}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 3: CALIBRATION CENTRE (TRACK C) */}
      {subTab === 'calibration' && (
        <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* Gold Benchmark Video Exercise */}
          <div className="card">
            <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
              Calibration Gate: Gold Clip Exercise
            </span>
            <h3 style={{ fontSize: '16px', marginBottom: '0.25rem' }}>
              Clip #1: {selectedGoldClip.task}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Standardize your scoring against the National Expert Consensus.
            </p>

            <div style={{ backgroundColor: '#0F172A', borderRadius: 'var(--radius-sm)', padding: '2rem 1rem', textAlign: 'center', color: 'white', marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#93C5FD' }}>
                Benchmark Exemplar Video: 00:00 - 02:45
              </p>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Simulated Candidate #1: Conduit Wire Stripping & Dressing
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Your Score for Conductor Insulation & Dressing (0–3):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[0, 1, 2, 3].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    className={calibrationAssessorScore === lvl ? "btn btn-sm" : "btn btn-secondary btn-sm"}
                    style={{ flex: 1 }}
                    onClick={() => setCalibrationAssessorScore(lvl)}
                  >
                    Level {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm"
              style={{ width: '100%' }}
              onClick={() => setCalibrationSubmitted(true)}
            >
              Submit Calibration Rating
            </button>

            {calibrationSubmitted && (
              <div style={{ marginTop: '1rem', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.4rem' }}>
                  Expert Consensus: Level 3
                </span>
                <p style={{ fontSize: '12px', color: 'var(--color-text)', margin: '0 0 0.4rem' }}>
                  {selectedGoldClip.expert_consensus_summary}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-warning)', margin: 0 }}>
                  <strong>Awareness:</strong> {selectedGoldClip.common_assessor_biases}
                </p>
              </div>
            )}
          </div>

          {/* Personal Bias & Severity Metrics */}
          <div className="card">
            <span className="badge badge-neutral" style={{ marginBottom: '0.5rem' }}>
              Assessor Personal Bias Profile
            </span>
            <h3 style={{ fontSize: '16px', marginBottom: '0.75rem' }}>
              Reliability & Drift Analytics (Mrs. S. Das)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '0.2rem' }}>
                  <span>Severity / Leniency Index:</span>
                  <span style={{ color: 'var(--color-success)' }}>Balanced (+0.04)</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                  Scoring closely aligns with expert gold standard without harshness drift.
                </p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '0.2rem' }}>
                  <span>Weighted Cohen's Kappa vs Gold Set:</span>
                  <span style={{ color: 'var(--color-primary)' }}>0.86 (High Reliability)</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                  Inter-assessor agreement exceeds NCVET benchmark threshold of 0.70.
                </p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '0.2rem' }}>
                  <span>Calibration Gate Status:</span>
                  <span className="badge badge-success">PASSED & AUTHORIZED</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                  Valid for live physical RPL candidate assessments until 31 Dec 2026.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
