'use client';

import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, UserCheck, Cpu } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ResponsibilityMatrixModal() {
  const { showResponsibilityMatrix, setShowResponsibilityMatrix, t } = useApp();

  if (!showResponsibilityMatrix) return null;

  const matrix = [
    {
      task: "Collect Prior Experience & Tasks",
      who: "Candidate / Worker",
      role: "Voice capture, task claims extraction, translation",
      actor_type: "worker",
      ai_role: "Supports (Voice & Speech-to-Text)"
    },
    {
      task: "Map Claims to Qualification Pack (QP)",
      who: "Assessor / Coordinator Confirms",
      role: "Proposes ranked QPs with explainable NOS/PC citations",
      actor_type: "human_decides",
      ai_role: "Proposes (BM25 + Semantic Embeddings)"
    },
    {
      task: "Compute % Coverage & Direct Route",
      who: "Deterministic Code",
      role: "Strict mathematical code execution of NCVET ≥70% rule",
      actor_type: "deterministic",
      ai_role: "Automated Arithmetic (Zero LLM Hallucination)"
    },
    {
      task: "Verify Worker Identity & Documents",
      who: "Centre Coordinator / Assessor",
      role: "Checks photo ID or accepts DPDP legal affidavit",
      actor_type: "human_only",
      ai_role: "Human-Only Gate"
    },
    {
      task: "Observe Practical Demonstration",
      who: "Certified Assessor (ToA)",
      role: "Physically present observation; checks live technique",
      actor_type: "human_only",
      ai_role: "Supports (Timeline Bookmarks & Timestamps)"
    },
    {
      task: "Safety-Critical Judgement (Must-Pass)",
      who: "Assessor ONLY",
      role: "Raises inspection flags; AI can NEVER fail or pass safety",
      actor_type: "human_only",
      ai_role: "Flag to Look Only (Human Must Confirm)"
    },
    {
      task: "Score Performance Criteria (PCs)",
      who: "Assessor (Blind-First)",
      role: "Assessor scores first; AI suggestion revealed after commit",
      actor_type: "human_decides",
      ai_role: "Anchored Rubric Co-Pilot (Post-Commit)"
    },
    {
      task: "Final Certification & Sign-Off",
      who: "Certified Assessor & Awarding Body",
      role: "Cryptographic e-signature locks audit record immutably",
      actor_type: "human_only",
      ai_role: "NEVER REPLACED (Human Accountability)"
    }
  ];

  return (
    <div className="modal-backdrop" onClick={() => setShowResponsibilityMatrix(false)}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} color="var(--color-primary)" />
              <h2 style={{ margin: 0, fontSize: '18px' }}>Certification Integrity: Responsibility Matrix</h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              "The tool supports, but does NOT replace, the human assessor's final decision." (NCVET August 2023)
            </p>
          </div>
          <button 
            onClick={() => setShowResponsibilityMatrix(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} color="var(--color-text-muted)" />
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--color-primary-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #BFDBFE', marginBottom: '1rem' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-primary-dark)', margin: 0, fontWeight: 600 }}>
            Official Principle: AI proposes within anchored rubrics; deterministic code verifies arithmetic thresholds; certified human assessors hold legal sign-off authority.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-border-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Decision / Task</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Who Decides</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>AI / Tool Role</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{row.task}</td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span className={`badge ${row.actor_type === 'human_only' ? 'badge-danger' : (row.actor_type === 'human_decides' ? 'badge-warning' : 'badge-neutral')}`}>
                      {row.who}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--color-text-muted)' }}>{row.ai_role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-sm" onClick={() => setShowResponsibilityMatrix(false)}>
            Close Responsibility Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
