'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function TestContent() {
  const { lang, t, assessment, fetchAssessmentById } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const activeAssessmentId = assessment?.id || assessmentIdFromUrl;

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

  useEffect(() => {
    if (!activeAssessmentId) {
      alert(lang === 'hi' ? 'कृपया अपना टेस्ट फिर से शुरू करें' : 'Please start your test again');
      router.push('/');
      return;
    }

    if (!assessment && assessmentIdFromUrl) {
      fetchAssessmentById(assessmentIdFromUrl);
    }

    setQuestionsError(false);
    fetch('/api/questions')
      .then(res => {
        if (!res.ok) throw new Error("Questions fetch failed");
        return res.json();
      })
      .then(data => setQuestions(data.questions || []))
      .catch(err => {
        console.error("Fetch Error:", err);
        setQuestionsError(true);
      });

    const onDemoFill = () => {
      setAnswerText('एमसीबी ट्रिप हो जाती है और इसे फिर से चालू किया जा सकता है। फ्यूज पिघल जाता है। दोनों ओवरलोड और शॉर्ट सर्किट से बचाते हैं। एमसीबी तेज और सुरक्षित है।');
    };
    window.addEventListener('demo-fill', onDemoFill);
    return () => {
      window.removeEventListener('demo-fill', onDemoFill);
    };
  }, [loadRetry, activeAssessmentId, assessment, assessmentIdFromUrl, fetchAssessmentById, router, lang]);

  const currentQuestion = questions[currentIndex];
  const questionText = currentQuestion ? (lang === 'hi' ? currentQuestion.question_hi : currentQuestion.question_en) : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, [t.mic_blocked, recognitionObj]);

  useEffect(() => {
    if (questionText) {
      handleListen();
    }
    // eslint-disable-next-line
  }, [questionText, lang]);

  const handleListen = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && questionText) {
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

    setIsChecking(true);
    const payload = {
      assessmentId: activeAssessmentId,
      questionId: currentQuestion.id,
      text: answerText,
      language: lang
    };

    try {
      const res = await fetch('/api/score-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Server error " + res.status);
    } catch (err) {
      console.error("Submit Error:", err);
    } finally {
      setIsChecking(false);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswerText('');
    } else {
      router.push(`/proof?assessmentId=${activeAssessmentId}`);
    }
  };

  if (questionsError) {
    return (
      <div className="content">
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          {lang === 'hi' ? 'सर्वर से कनेक्ट नहीं हो सका' : 'Could not connect to server'}
        </p>
        <button className="btn" onClick={() => setLoadRetry(r => r + 1)}>Try again</button>
        <button className="btn btn-secondary" onClick={() => router.push('/home')}>Go to Home</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="content" style={{ justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #ccc', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Loading questions...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="content">
      <div style={{ width: '100%', marginBottom: '1rem' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>
          {t.question} {currentIndex + 1} {t.of} {questions.length}
        </p>
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
          type="button"
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
          {isChecking ? 'Saving...' : t.next} <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div className="content"><p>Loading questions...</p></div>}>
      <TestContent />
    </Suspense>
  );
}
