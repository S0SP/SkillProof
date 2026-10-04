'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, MicOff, ArrowRight, Volume2, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { heroQualificationPack } from '@/lib/qualificationPacks';
import { speakText } from '@/lib/speech';

export default function TestPage() {
  const { lang, t, assessment, fetchAssessmentById, speak, recordOpLog } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const activeAssessmentId = assessment?.id || assessmentIdFromUrl || 'asm-ramesh-01';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      })
      .catch(console.error);

    if (activeAssessmentId && !assessment) {
      fetchAssessmentById(activeAssessmentId);
    }
  }, [activeAssessmentId, assessment, fetchAssessmentById]);

  const currentQ = questions[currentIndex] || {
    id: "Q1",
    question_en: "What is the difference between an MCB and a fuse?",
    question_hi: "फ्यूज़ और MCB में क्या अंतर है?",
    question_bn: "ফিউজ এবং MCB-র মধ্যে পার্থক্য কী?",
    type: "knowledge"
  };

  const questionPrompt = lang === 'hi' 
    ? (currentQ.question_hi || currentQ.question_en) 
    : (lang === 'bn' ? (currentQ.question_bn || currentQ.question_hi || currentQ.question_en) : currentQ.question_en);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);

      if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SpeechRec();
        rec.lang = lang === 'hi' ? 'hi-IN' : (lang === 'bn' ? 'bn-IN' : 'en-IN');
        rec.continuous = false;
        rec.onresult = (e) => {
          const txt = e.results[0][0].transcript;
          setAnswerText(prev => (prev ? prev + ' ' + txt : txt));
          setIsRecording(false);
        };
        rec.onerror = () => {
          setIsRecording(false);
          // Demo fallback
          setAnswerText(lang === 'bn' 
            ? "MCB ট্রিপ করে এবং পুনরায় চালু করা যায়। ফিউজ গলে যায়।" 
            : "MCB ट्रिप हो जाता है और फिर से चालू किया जा सकता है। फ्यूज का तार पिघल जाता है।");
        };
        try {
          rec.start();
        } catch (e) {
          setIsRecording(false);
        }
      } else {
        setTimeout(() => {
          setIsRecording(false);
          setAnswerText(lang === 'bn' 
            ? "MCB ট্রিপ করে এবং পুনরায় চালু করা যায়। ফিউজ গলে যায়।" 
            : "MCB ट्रिप हो जाता है और फिर से चालू किया जा सकता है। फ्यूज का तार पिघल जाता है।");
        }, 1400);
      }
    }
  };

  const handleNextQuestion = async () => {
    if (!answerText.trim()) return;

    setIsChecking(true);
    try {
      await fetch('/api/score-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: activeAssessmentId,
          questionId: currentQ.id,
          text: answerText,
          language: lang
        })
      });

      recordOpLog("ASSESSMENT", "SUBMIT_ANSWER", {
        assessmentId: activeAssessmentId,
        questionId: currentQ.id
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
      setAnsweredCount(prev => prev + 1);
      setAnswerText('');

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Proceed to practical task proof recording
        router.push(`/proof?assessmentId=${activeAssessmentId}`);
      }
    }
  };

  return (
    <div className="worker-view-container">
      <div className="content">
        
        {/* Header Progress */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              Phase 1: Knowledge & Viva • {t.question} {currentIndex + 1} {t.of} {questions.length || 5}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Oral Audio / Voice Assisted
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${((currentIndex + 1) / (questions.length || 5)) * 100}%`, 
                height: '100%', 
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.3s ease'
              }} 
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '17px', color: 'var(--color-primary-dark)', margin: 0, lineHeight: 1.4 }}>
              {questionPrompt}
            </h3>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => speak(questionPrompt)}
              title="Listen to question"
              style={{ flexShrink: 0 }}
            >
              <Volume2 size={16} /> {t.listen}
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            You may speak your answer in Hindi, Bengali, or English using the microphone button below.
          </p>

          {/* Voice Input Controls */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              type="button"
              className={`btn ${isRecording ? 'mic-active' : 'btn-secondary'}`}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                margin: '0 auto 0.5rem',
                padding: 0
              }}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
            <p style={{ fontSize: '12px', color: isRecording ? 'var(--color-error)' : 'var(--color-text-muted)', fontWeight: 600 }}>
              {isRecording ? t.listening : "Tap to speak your answer"}
            </p>
          </div>

          {/* Answer Text Area */}
          <div>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Your answer will appear here as you speak, or you may type..."
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              style={{ width: '100%', resize: 'none', fontSize: '14px', lineHeight: 1.5 }}
            />
          </div>

          {/* Quick Demo Pre-fill */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => {
                setAnswerText(lang === 'bn' 
                  ? "MCB ট্রিপ করে এবং পুনরায় চালু করা যায়। ফিউজ গলে যায় এবং তার বদলাতে হয়। দুটোই শর্ট সার্কিট এবং ওভারলোড থেকে রক্ষা করে।" 
                  : "MCB ट्रिप हो जाती है और इसे फिर से चालू किया जा सकता है। फ्यूज पिघल जाता है। दोनों ओवरलोड और शॉर्ट सर्किट से बचाते हैं।");
              }}
            >
              Fill standard correct answer
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button
            type="button"
            className="btn"
            style={{ width: '100%', fontSize: '16px' }}
            onClick={handleNextQuestion}
            disabled={isChecking || !answerText.trim()}
          >
            {isChecking ? t.checking_answer : (currentIndex < (questions.length || 5) - 1 ? t.next : "Proceed to Practical Evidence Capture")} <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
