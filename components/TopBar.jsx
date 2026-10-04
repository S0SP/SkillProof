'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function TopBar() {
  const { lang, setLang, t } = useApp();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 3000);
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleLogoClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 5) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('demo-fill'));
      }
      setClicks(0);
    }
  };

  return (
    <>
      {!isOnline && (
        <div style={{ background: '#F59E0B', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold' }}>
          ⚠️ No internet connection detected. Please stay connected.
        </div>
      )}
      {showSyncSuccess && (
        <div style={{ background: '#10B981', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold' }}>
          ✅ Internet connection restored!
        </div>
      )}
      <div className="top-bar">
        <h1 onClick={handleLogoClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
          {t.app_name}
        </h1>
        <button 
          className="lang-switch" 
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>
    </>
  );
}
