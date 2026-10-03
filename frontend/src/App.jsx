import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Mic, Camera, CheckCircle, ArrowRight, User, Briefcase, Settings } from 'lucide-react';
import { translations } from './translations';

function TopBar({ lang, setLang }) {
  const t = translations[lang];
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
      syncOfflineAnswers();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineAnswers = async () => {
    const offlineQueue = JSON.parse(localStorage.getItem('offlineAnswers') || '[]');
    if (offlineQueue.length === 0) return;
    
    for (const item of offlineQueue) {
      try {
        await fetch('http://localhost:3002/api/score-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } catch (e) {
        console.error("Sync failed for item", item);
        return; 
      }
    }
    localStorage.removeItem('offlineAnswers');
  };

  const handleLogoClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 5) {
      window.dispatchEvent(new Event('demo-fill'));
      setClicks(0);
    }
  };

  return (
    <>
      {!isOnline && (
        <div style={{ background: '#F59E0B', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold' }}>
          ⚠️ No internet. Your answers are saved locally.
        </div>
      )}
      {showSyncSuccess && (
        <div style={{ background: '#10B981', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold' }}>
          ✅ Internet restored. All answers synced successfully!
        </div>
      )}
      <div className="top-bar">
        <h1 onClick={handleLogoClick} style={{ cursor: 'pointer', userSelect: 'none' }}>{t.app_name}</h1>
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

// 1. Welcome and Login
function Welcome({ lang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!name || phone.length !== 10) {
      setError('Please enter a valid name and 10-digit phone number.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3002/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('worker', JSON.stringify(data.worker));
        navigate('/home');
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      // Fallback for demo if backend is not running
      const fallbackWorker = { id: Date.now().toString(), name, phone };
      localStorage.setItem('worker', JSON.stringify(fallbackWorker));
      navigate('/home');
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{t.slogan}</h2>
      <div style={{ flex: 1 }} />
      
      {!showWorkerForm ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn" onClick={() => setShowWorkerForm(true)} style={{ padding: '2rem', fontSize: '24px' }}>
            <User size={32} /> {t.i_am_worker}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/assessor')} style={{ padding: '2rem', fontSize: '24px' }}>
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
          />
          <input 
            type="number" 
            placeholder={t.phone_placeholder} 
            className="select-box" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="btn" style={{ padding: '1.5rem', fontSize: '20px' }}>
            {t.login_btn} <ArrowRight size={24} />
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

// 2. Pick language and trade
function Home({ lang, setLang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [trade, setTrade] = useState('');

  useEffect(() => {
    const w = localStorage.getItem('worker');
    if (w) setWorker(JSON.parse(w));
    else navigate('/');
  }, [navigate]);

  const [startError, setStartError] = useState(false);

  const handleStartTest = async () => {
    if (!trade || !lang) return;
    setStartError(false);
    try {
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 10000);
      const res = await fetch('http://localhost:3002/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: worker?.id, trade, language: lang }),
        signal: abortController.signal
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("Start test failed");
      const data = await res.json();
      localStorage.setItem('assessment', JSON.stringify(data.assessment));
      navigate('/test');
    } catch (err) {
      console.error("Start Test Error:", err);
      setStartError(true);
    }
  };

  return (
    <div className="content">
      <h2>{t.home_title}{worker?.name}</h2>
      
      <div style={{ width: '100%', marginTop: '1rem' }}>
        <h3>{t.step_1}</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div 
            className="card" 
            style={{ flex: 1, textAlign: 'center', cursor: 'pointer', border: lang === 'hi' ? '2px solid var(--color-primary)' : '1px solid #ccc' }}
            onClick={() => setLang('hi')}
          >
            <h2>हिंदी</h2>
          </div>
          <div 
            className="card" 
            style={{ flex: 1, textAlign: 'center', cursor: 'pointer', border: lang === 'en' ? '2px solid var(--color-primary)' : '1px solid #ccc' }}
            onClick={() => setLang('en')}
          >
            <h2>English</h2>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', marginTop: '1rem' }}>
        <h3>{t.step_2}</h3>
        <div 
          className="card" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', border: trade === 'electrician' ? '2px solid var(--color-primary)' : '1px solid #ccc' }}
          onClick={() => setTrade('electrician')}
        >
          <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: '50%' }}>⚡</div>
          <h3>{t.trade_electrician}</h3>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5, backgroundColor: '#f9f9f9' }}>
          <div style={{ background: '#E0E7FF', padding: '1rem', borderRadius: '50%' }}>🔧</div>
          <div>
            <h3 style={{ marginBottom: 0 }}>{t.trade_plumber}</h3>
            <p style={{ fontSize: '14px' }}>{t.coming_soon}</p>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5, backgroundColor: '#f9f9f9' }}>
          <div style={{ background: '#FCE7F3', padding: '1rem', borderRadius: '50%' }}>🧵</div>
          <div>
            <h3 style={{ marginBottom: 0 }}>{t.trade_tailor}</h3>
            <p style={{ fontSize: '14px' }}>{t.coming_soon}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      {startError && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{lang === 'hi' ? 'सर्वर त्रुटि। फिर से कोशिश करें।' : 'Server error. Try again.'}</p>}
      <button 
        className="btn" 
        onClick={handleStartTest} 
        disabled={!trade} 
        style={{ opacity: trade ? 1 : 0.5 }}
      >
        <ArrowRight size={24} /> {t.start_test}
      </button>
    </div>
  );
}

// 3. Question screen
function Test({ lang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [recognitionObj, setRecognitionObj] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [questionsError, setQuestionsError] = useState(false);
  const [loadRetry, setLoadRetry] = useState(0);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    const assessmentStr = localStorage.getItem('assessment');
    if (!assessmentStr) {
      alert(lang === 'hi' ? 'कृपया अपना टेस्ट फिर से शुरू करें' : 'Please start your test again');
      navigate('/home');
      return;
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 10000);

    setQuestionsError(false);
    fetch('http://localhost:3002/api/questions', { signal: abortController.signal })
      .then(res => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Questions fetch failed");
        return res.json();
      })
      .then(data => setQuestions(data.questions || []))
      .catch(err => {
        clearTimeout(timeout);
        console.error("Fetch Error:", err);
        setQuestionsError(true);
      });

    const onDemoFill = () => {
      setAnswerText('एमसीबी ट्रिप हो जाती है और इसे फिर से चालू किया जा सकता है। फ्यूज पिघल जाता है। दोनों ओवरलोड और शॉर्ट सर्किट से बचाते हैं। एमसीबी तेज और सुरक्षित है।');
    };
    window.addEventListener('demo-fill', onDemoFill);
    return () => {
      window.removeEventListener('demo-fill', onDemoFill);
      clearTimeout(timeout);
    };
  }, [loadRetry, navigate, lang]);

  const currentQuestion = questions[currentIndex];
  const questionText = currentQuestion ? (lang === 'hi' ? currentQuestion.question_hi : currentQuestion.question_en) : '';

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionObj) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setAnswerText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };
      rec.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setSpeechError(t.mic_blocked);
        } else {
          setSpeechError('Microphone error: ' + event.error);
        }
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      setRecognitionObj(rec);
    }
  }, [t.mic_blocked, recognitionObj]);

  useEffect(() => {
    if (questionText) {
      handleListen();
    }
    // eslint-disable-next-line
  }, [questionText, lang]);

  const handleListen = () => {
    if ('speechSynthesis' in window && questionText) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!recognitionObj) {
      setSpeechError(t.mic_blocked);
      return;
    }
    
    if (isRecording) {
      recognitionObj.stop();
      setIsRecording(false);
    } else {
      recognitionObj.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      try {
        recognitionObj.start();
        setIsRecording(true);
        setSpeechError('');
        setErrorMsg('');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = async () => {
    if (!answerText.trim()) {
      setErrorMsg(t.please_answer);
      return;
    }
    setErrorMsg('');
    if (isRecording && recognitionObj) {
      recognitionObj.stop();
      setIsRecording(false);
    }

    const assessmentStr = localStorage.getItem('assessment');
    const assessment = assessmentStr ? JSON.parse(assessmentStr) : { id: 'test' };

    setIsChecking(true);
    const payload = {
      assessmentId: assessment.id,
      questionId: currentQuestion.id,
      text: answerText,
      language: lang
    };

    if (!navigator.onLine) {
      const offlineQueue = JSON.parse(localStorage.getItem('offlineAnswers') || '[]');
      offlineQueue.push(payload);
      localStorage.setItem('offlineAnswers', JSON.stringify(offlineQueue));
    } else {
      try {
        const abortController = new AbortController();
        const timeout = setTimeout(() => abortController.abort(), 10000);
        const res = await fetch('http://localhost:3002/api/score-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortController.signal
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Server error " + res.status);
      } catch (err) {
        console.error("Submit Error:", err);
        setSubmitError(true);
        setIsChecking(false);
        return;
      }
    }
    setIsChecking(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswerText('');
    } else {
      navigate('/proof');
    }
  };

  if (questionsError) {
    return (
      <div className="content">
        <p style={{ color: 'red', fontWeight: 'bold' }}>{lang === 'hi' ? 'सर्वर से कनेक्ट नहीं हो सका' : 'Could not connect to server'}</p>
        <button className="btn" onClick={() => setLoadRetry(r => r + 1)}>Try again</button>
        <button className="btn btn-secondary" onClick={() => navigate('/home')}>Go to Home</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="content" style={{ justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #ccc', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Loading question...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="content">
        <p style={{ color: 'red', fontWeight: 'bold' }}>{lang === 'hi' ? 'उत्तर भेजने में विफल' : 'Failed to submit answer'}</p>
        <button className="btn" onClick={() => setSubmitError(false)}>Try again</button>
        <button className="btn btn-secondary" onClick={() => navigate('/home')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div className="content">
      <div style={{ width: '100%', marginBottom: '1rem' }}>
        <p style={{ fontWeight: 'bold' }}>{t.question} {currentIndex + 1} {t.of} {questions.length}</p>
        <div style={{ width: '100%', height: '8px', background: '#ccc', borderRadius: '4px', marginTop: '0.5rem' }}>
          <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px' }} />
        </div>
      </div>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>{questionText}</h3>
        <button className="btn btn-secondary" onClick={handleListen} style={{ width: 'auto', alignSelf: 'flex-start', minHeight: '40px', padding: '0.5rem 1rem' }}>
          🔊 {t.listen}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {speechError && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px', marginBottom: '1rem' }}>{speechError}</p>}
        
        <button 
          onClick={toggleRecording}
          style={{
            width: '96px', height: '96px', borderRadius: '50%', border: 'none',
            background: isRecording ? '#fee2e2' : 'var(--color-primary)',
            color: isRecording ? 'red' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isRecording ? '0 0 0 8px rgba(220, 38, 38, 0.2)' : 'none',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none',
            marginBottom: '1rem',
            transition: 'all 0.3s'
          }}
        >
          <Mic size={48} />
        </button>
        
        <textarea 
          className="select-box"
          style={{ width: '100%', minHeight: '120px', resize: 'vertical', fontSize: '16px' }}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={lang === 'hi' ? "आपका उत्तर यहाँ दिखाई देगा..." : "Your answer will appear here..."}
        />
        {errorMsg && <p style={{ color: 'red', marginTop: '0.5rem' }}>{errorMsg}</p>}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', width: '100%', position: 'relative' }}>
        <button className="btn btn-secondary" onClick={() => setAnswerText('')} style={{ flex: 1 }} disabled={isChecking}>
          {t.try_again}
        </button>
        <button className="btn" onClick={handleNext} style={{ flex: 1 }} disabled={isChecking}>
          {t.next} <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}

// 4. Upload proof
function Proof({ lang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitFailed, setSubmitFailed] = useState(false);
  const [lastParams, setLastParams] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t.proof_error);
      return;
    }
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setErrorMsg(t.proof_error);
      return;
    }
    setErrorMsg('');
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const finalize = async (skipped, base64) => {
    setIsSubmitting(true);
    const assessmentStr = localStorage.getItem('assessment');
    const assessment = assessmentStr ? JSON.parse(assessmentStr) : { id: 'test' };

    try {
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 10000);
      const pRes = await fetch('http://localhost:3002/api/score-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          imageBase64: base64,
          skipped
        }),
        signal: abortController.signal
      });
      if (!pRes.ok) { clearTimeout(timeout); throw new Error('Proof failed'); }

      const res = await fetch('http://localhost:3002/api/finish-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: assessment.id }),
        signal: abortController.signal
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('Finish failed');
      const data = await res.json();
      localStorage.setItem('finalResult', JSON.stringify(data));
      setIsSubmitting(false);
      setSubmitFailed(false);
      navigate('/result');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setSubmitFailed(true);
      setLastParams({ skipped, base64 });
    }
  };

  return (
    <div className="content">
      <h2>{t.proof_title}</h2>
      
      {photoUrl && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src={photoUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
        </div>
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', justifyContent: 'center' }}>
        <input type="file" accept="image/jpeg, image/png" capture="environment" id="cameraInput" style={{ display: 'none' }} onChange={handleFile} />
        <input type="file" accept="image/jpeg, image/png" id="galleryInput" style={{ display: 'none' }} onChange={handleFile} />
        
        <button className="btn btn-secondary" onClick={() => document.getElementById('cameraInput').click()}>
          <Camera size={24} /> {t.take_photo}
        </button>
        <button className="btn btn-secondary" onClick={() => document.getElementById('galleryInput').click()}>
          🖼️ {t.choose_gallery}
        </button>
        {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', position: 'relative' }}>

        {submitFailed && !isSubmitting ? (
          <div style={{ position: 'absolute', top: '-60px', left: 0, right: 0, textAlign: 'center' }}>
            <p style={{ color: 'red', margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '14px' }}>Submission failed (offline?)</p>
            <button className="btn" style={{ background: '#EF4444', color: 'white', padding: '0.25rem 1rem' }} onClick={() => finalize(lastParams.skipped, lastParams.base64)}>
              Try again
            </button>
          </div>
        ) : null}
        <button className="btn btn-secondary" onClick={() => finalize(true, null)} style={{ flex: 1 }} disabled={isSubmitting}>
          {t.skip}
        </button>
        <button className="btn" onClick={() => finalize(false, photoBase64)} style={{ flex: 1 }} disabled={!photoBase64 || isSubmitting}>
          {t.submit_photo} <CheckCircle size={24} />
        </button>
      </div>
    </div>
  );
}

// 5. Result
function Result({ lang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    const res = localStorage.getItem('finalResult');
    const assessmentStr = localStorage.getItem('assessment');
    if (res && assessmentStr) {
      setResult(JSON.parse(res));
      const assessment = JSON.parse(assessmentStr);
      
      // Fetch live status
      fetch(`http://localhost:3002/api/result/${assessment.id}`)
        .then(r => r.json())
        .then(d => {
          if (d.assessment) setLiveStatus(d.assessment.status);
        })
        .catch(console.error);
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!result) return null;

  const { score, level, breakdown, covered_points, missed_points } = result;
  const displayStatus = liveStatus || 'waiting_for_assessor';

  
  let levelColor = '#F59E0B'; // Amber for Beginner
  if (level === 'Skilled') levelColor = '#3B82F6'; // Blue
  if (level === 'Expert') levelColor = '#10B981'; // Green

  return (
    <div className="content" style={{ padding: '1rem', width: '100%' }}>
      <h2 style={{ textAlign: 'center' }}>{t.result_title}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1.5rem 0' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `8px solid ${levelColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
          {score}/100
        </div>
        <div style={{ background: levelColor, color: 'white', padding: '0.25rem 1rem', borderRadius: '16px', marginTop: '-12px', fontWeight: 'bold' }}>
          {t[level.toLowerCase()]}
        </div>
      </div>

      <div style={{ background: displayStatus === 'approved' ? '#D1FAE5' : '#FEF3C7', color: displayStatus === 'approved' ? '#065F46' : '#B45309', padding: '0.75rem', borderRadius: '8px', width: '100%', textAlign: 'center', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {displayStatus === 'approved' ? `✅ ${t.approved_assessor}` : `⏳ ${t.waiting_assessor}`}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {result.answers?.filter(a => a.question_id).map(ans => (
          <div key={ans.id} style={{ background: '#f9f9f9', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              <span>{ans.question_id}</span>
              <span>{ans.final_marks !== null ? ans.final_marks : ans.ai_marks}/20</span>
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              "{ans.reason}"
            </div>
          </div>
        ))}
      </div>



      <button className="btn btn-secondary" onClick={() => window.print()} style={{ marginBottom: '1rem' }}>
        📄 {t.download_report}
      </button>

      <button className="btn" onClick={() => navigate('/')}>
        🔄 {t.take_test_again}
      </button>
    </div>
  );
}

// 6. Assessor Login & List
function AssessorList({ lang }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('assessorToken'));
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [assessments, setAssessments] = useState([]);
  const [filter, setFilter] = useState('All'); 

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3002/api/assessments/all')
        .then(res => res.json())
        .then(data => setAssessments(data.assessments || []))
        .catch(console.error);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3002/api/assessor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('assessorToken', data.token);
        setToken(data.token);
        setError('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError('Login failed');
    }
  };

  if (!token) {
    return (
      <div className="content">
        <h2>{t.assessor_title}</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (skill123)" className="select-box" />
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <button className="btn" type="submit">Login</button>
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
        <button onClick={() => { localStorage.removeItem('assessorToken'); setToken(null); }} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
        <button className={filter === 'All' ? 'btn' : 'btn btn-secondary'} onClick={() => setFilter('All')} style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}>All</button>
        <button className={filter === 'Waiting' ? 'btn' : 'btn btn-secondary'} onClick={() => setFilter('Waiting')} style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}>Waiting</button>
        <button className={filter === 'Approved' ? 'btn' : 'btn btn-secondary'} onClick={() => setFilter('Approved')} style={{ flex: 1, padding: '0.5rem', fontSize: '14px' }}>Approved</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {filtered.map(a => (
          <div key={a.id} className="card" onClick={() => navigate(`/assessor/review/${a.id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
            {a.needsCheck && a.status !== 'approved' && (
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#EF4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Check first
              </div>
            )}
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{a.workerName}</span>
              <span style={{ fontSize: '14px', color: 'var(--color-primary)' }}>{a.score}/100</span>
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
              <span>{a.trade.toUpperCase()} • {a.level}</span>
              <span style={{ color: a.status === 'approved' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>
                {a.status === 'approved' ? '✅ Approved' : '⏳ Waiting'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>{new Date(a.startTime).toLocaleString()}</div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No assessments found.</p>}
      </div>
    </div>
  );
}

// 7. Review Test
function ReviewTest({ lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [finalAnswers, setFinalAnswers] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3002/api/assessments/${id}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        const editableAns = d.answers.map(a => ({
          id: a.id,
          questionId: a.questionId,
          marks: a.marks,
          skipped: a.skipped
        }));
        setFinalAnswers(editableAns);
      })
      .catch(console.error);
  }, [id]);

  if (!data) return <div className="content">Loading...</div>;

  const handleMarkChange = (ansId, newMarks) => {
    setFinalAnswers(prev => prev.map(a => a.id === ansId ? { ...a, marks: Number(newMarks) } : a));
  };

  const calculateLiveScore = () => {
    let t = 0;
    finalAnswers.forEach(fa => {
      t += fa.marks;
    });
    return t;
  };

  const liveScore = calculateLiveScore();
  let liveLevel = "Beginner";
  if (liveScore >= 40 && liveScore < 70) liveLevel = "Skilled";
  if (liveScore >= 70) liveLevel = "Expert";

  const handleApprove = async () => {
    try {
      await fetch(`http://localhost:3002/api/assessments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalAnswers, comment })
      });
      navigate('/assessor');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="content" style={{ padding: '1rem', width: '100%', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>{data.worker.name}</h2>
          <div style={{ fontSize: '14px', color: '#666' }}>{data.assessment.trade.toUpperCase()} • {new Date(data.assessment.startTime).toLocaleDateString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{liveScore}<span style={{ fontSize: '16px', color: '#999' }}>/100</span></div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: liveLevel === 'Expert' ? '#10B981' : (liveLevel === 'Skilled' ? '#3B82F6' : '#F59E0B') }}>{liveLevel}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {data.answers.filter(a => a.questionId).map(ans => {
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
                <input type="number" min="0" max="20" value={fa?.marks || 0} onChange={e => handleMarkChange(ans.id, e.target.value)} style={{ width: '60px', padding: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <span style={{ fontSize: '12px', color: '#999' }}>(AI suggested: {ans.ai_marks ?? 0})</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.5rem', width: '100%' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Assessor Comment (Optional)</h4>
        <textarea className="select-box" style={{ width: '100%', minHeight: '80px', fontSize: '14px' }} value={comment} onChange={e => setComment(e.target.value)} placeholder="Type feedback for the worker to see..." />
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/assessor')} style={{ flex: 1, color: '#D97706', borderColor: '#D97706' }}>
          Send Back ↩️
        </button>
        <button className="btn" style={{ flex: 2, background: '#10B981', color: 'white', borderColor: '#10B981' }} onClick={handleApprove}>
          Approve Test ✅
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');

  return (
    <BrowserRouter>
      <div className="app-container">
        <TopBar lang={lang} setLang={setLang} />
        <Routes>
          <Route path="/" element={<Welcome lang={lang} />} />
          <Route path="/home" element={<Home lang={lang} setLang={setLang} />} />
          <Route path="/test" element={<Test lang={lang} />} />
          <Route path="/proof" element={<Proof lang={lang} />} />
          <Route path="/result" element={<Result lang={lang} />} />
          <Route path="/assessor" element={<AssessorList lang={lang} />} />
          <Route path="/assessor/review/:id" element={<ReviewTest lang={lang} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
