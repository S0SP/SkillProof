'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Globe, 
  Volume2, 
  Users, 
  FileCheck, 
  Building2, 
  ActivitySquare 
} from 'lucide-react';
import ResponsibilityMatrixModal from './ResponsibilityMatrixModal';

export default function TopBar() {
  const { 
    lang, 
    setLang, 
    t, 
    activeRole, 
    setActiveRole, 
    isAirplaneMode, 
    toggleAirplaneMode, 
    syncState, 
    opLogQueue, 
    setShowResponsibilityMatrix,
    speak
  } = useApp();
  
  const router = useRouter();
  const pathname = usePathname();

  const handleRoleSelect = (roleKey, route) => {
    setActiveRole(roleKey);
    router.push(route);
  };

  return (
    <>
      <ResponsibilityMatrixModal />

      {/* Top Banner if in Airplane Mode */}
      {isAirplaneMode && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>AIRPLANE MODE ACTIVE (Simulated Field Condition) • Local Op-Log Queue: {opLogQueue.length} items</span>
          <button 
            onClick={toggleAirplaneMode}
            style={{ 
              background: '#ffffff', 
              color: '#9A3412', 
              border: 'none', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: 700, 
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}
          >
            Turn Wi-Fi On
          </button>
        </div>
      )}

      {/* Main Brand & Action Header */}
      <header className="top-bar">
        <div className="brand-section" onClick={() => router.push('/')}>
          <div className="brand-logo-badge">
            <span>प्रमाण</span>
            <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 600 }}>RPL</span>
          </div>
          <div>
            <h1 style={{ lineHeight: 1.1 }}>{t.app_name}</h1>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, color: '#E0E7FF' }}>
              NSQF Skill Assessment & Consistency Tool
            </p>
          </div>
        </div>

        <div className="top-actions">
          {/* Audio helper button */}
          <button 
            type="button"
            className="btn btn-sm btn-outline" 
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '0.35rem 0.6rem' }}
            onClick={() => speak(`${t.app_name}. ${t.slogan}. ${t.ncvet_badge}`)}
            title="Read screen aloud"
          >
            <Volume2 size={16} />
          </button>

          {/* Responsibility Matrix Opener */}
          <button
            type="button"
            className="btn btn-sm"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              borderColor: 'rgba(255,255,255,0.25)', 
              color: '#ffffff',
              fontSize: '12px',
              padding: '0.35rem 0.75rem'
            }}
            onClick={() => setShowResponsibilityMatrix(true)}
            title="View Human vs AI Boundaries"
          >
            <ShieldCheck size={15} />
            <span style={{ display: 'none', sm: 'inline' }}>AI vs Human</span>
          </button>

          {/* Airplane Mode Toggle */}
          <button
            type="button"
            className="btn btn-sm"
            style={{
              backgroundColor: isAirplaneMode ? '#DC2626' : 'rgba(255, 255, 255, 0.15)',
              borderColor: isAirplaneMode ? '#EF4444' : 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontSize: '12px',
              padding: '0.35rem 0.65rem'
            }}
            onClick={toggleAirplaneMode}
            title={isAirplaneMode ? "Click to connect Wi-Fi" : "Simulate offline airplane mode"}
          >
            {isAirplaneMode ? <WifiOff size={15} /> : <Wifi size={15} />}
            <span>{isAirplaneMode ? 'Offline' : 'Online'}</span>
          </button>

          {/* Sync Status Chip */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '11px', 
              backgroundColor: 'rgba(0,0,0,0.2)', 
              padding: '0.35rem 0.6rem', 
              borderRadius: '9999px',
              color: syncState === 'synced' ? '#86EFAC' : (syncState === 'syncing' ? '#FDE047' : '#E2E8F0')
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: syncState === 'synced' ? '#22C55E' : (syncState === 'syncing' ? '#EAB308' : '#94A3B8'),
              display: 'inline-block'
            }} />
            <span style={{ fontWeight: 600 }}>
              {syncState === 'synced' ? 'Synced' : (syncState === 'syncing' ? 'Syncing...' : 'Local Queue')}
            </span>
          </div>

          {/* Trilingual Switcher */}
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.25)', padding: '2px', borderRadius: '6px' }}>
            <button
              onClick={() => setLang('en')}
              style={{
                background: lang === 'en' ? '#ffffff' : 'transparent',
                color: lang === 'en' ? 'var(--color-primary)' : '#ffffff',
                border: 'none',
                padding: '0.2rem 0.45rem',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              style={{
                background: lang === 'hi' ? '#ffffff' : 'transparent',
                color: lang === 'hi' ? 'var(--color-primary)' : '#ffffff',
                border: 'none',
                padding: '0.2rem 0.45rem',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLang('bn')}
              style={{
                background: lang === 'bn' ? '#ffffff' : 'transparent',
                color: lang === 'bn' ? 'var(--color-primary)' : '#ffffff',
                border: 'none',
                padding: '0.2rem 0.45rem',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              বাংলা
            </button>
          </div>
        </div>
      </header>

      {/* Role Navigation Bar */}
      <nav className="nav-tabs-bar">
        <button
          className={`nav-tab-btn ${pathname === '/' || pathname.startsWith('/home') || pathname.startsWith('/worker') || pathname.startsWith('/test') || pathname.startsWith('/proof') || pathname.startsWith('/result') ? 'active' : ''}`}
          onClick={() => handleRoleSelect('worker', '/')}
        >
          <Users size={16} />
          <span>1. {t.role_worker}</span>
        </button>

        <button
          className={`nav-tab-btn ${pathname.startsWith('/assessor') ? 'active' : ''}`}
          onClick={() => handleRoleSelect('assessor', '/assessor')}
        >
          <FileCheck size={16} />
          <span>2. {t.role_assessor}</span>
        </button>

        <button
          className={`nav-tab-btn ${pathname.startsWith('/coordinator') ? 'active' : ''}`}
          onClick={() => handleRoleSelect('coordinator', '/coordinator')}
        >
          <Building2 size={16} />
          <span>3. {t.role_coordinator}</span>
        </button>

        <button
          className={`nav-tab-btn ${pathname.startsWith('/qa') ? 'active' : ''}`}
          onClick={() => handleRoleSelect('qa', '/qa')}
        >
          <ActivitySquare size={16} />
          <span>4. {t.role_qa}</span>
        </button>
      </nav>
    </>
  );
}
