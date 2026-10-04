'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';
import { speakText, stopSpeaking } from '@/lib/speech';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [activeRole, setActiveRole] = useState('worker'); // 'worker', 'assessor', 'coordinator', 'qa'
  const [isAirplaneMode, setIsAirplaneMode] = useState(false);
  const [syncState, setSyncState] = useState('synced'); // 'local', 'syncing', 'synced'
  const [opLogQueue, setOpLogQueue] = useState([]);
  
  // Domain state
  const [worker, setWorker] = useState(null);
  const [declaration, setDeclaration] = useState(null);
  const [mappingResult, setMappingResult] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [assessorToken, setAssessorToken] = useState('session-active');
  const [showResponsibilityMatrix, setShowResponsibilityMatrix] = useState(false);

  const t = translations[lang] || translations.en;

  // Read aloud helper for low-literacy workers
  const speak = (text) => {
    speakText(text, lang);
  };

  // Helper to record an op-log mutation (offline-first sync queue)
  const recordOpLog = (entity, action, payload) => {
    const op = {
      id: `OP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      entity,
      action,
      payload,
      timestamp: new Date().toISOString()
    };
    
    setOpLogQueue(prev => [...prev, op]);
    if (isAirplaneMode) {
      setSyncState('local');
    } else {
      // Simulate rapid sync
      setSyncState('syncing');
      setTimeout(() => {
        setSyncState('synced');
      }, 1200);
    }
  };

  // Toggle airplane mode
  const toggleAirplaneMode = () => {
    setIsAirplaneMode(prev => {
      const next = !prev;
      if (next) {
        setSyncState('local');
      } else {
        setSyncState('syncing');
        setTimeout(() => {
          setSyncState('synced');
          setOpLogQueue([]);
        }, 1500);
      }
      return next;
    });
  };

  // Fetch worker from DB
  const fetchWorkerById = async (workerId) => {
    if (!workerId) return null;
    try {
      const res = await fetch(`/api/workers?id=${workerId}`);
      if (res.ok) {
        const data = await res.json();
        setWorker(data.worker);
        return data.worker;
      }
    } catch (err) {
      console.error("Failed to fetch worker by id:", err);
    }
    return null;
  };

  // Fetch assessment from DB
  const fetchAssessmentById = async (assessmentId) => {
    if (!assessmentId) return null;
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data.assessment);
        if (data.worker) {
          setWorker(data.worker);
        }
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch assessment by id:", err);
    }
    return null;
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        activeRole,
        setActiveRole,
        isAirplaneMode,
        toggleAirplaneMode,
        syncState,
        setSyncState,
        opLogQueue,
        recordOpLog,
        speak,
        stopSpeaking,
        worker,
        setWorker,
        declaration,
        setDeclaration,
        mappingResult,
        setMappingResult,
        assessment,
        setAssessment,
        finalResult,
        setFinalResult,
        assessorToken,
        setAssessorToken,
        showResponsibilityMatrix,
        setShowResponsibilityMatrix,
        fetchWorkerById,
        fetchAssessmentById
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
