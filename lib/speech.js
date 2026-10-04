// Speech Recognition and Text-to-Speech Helper with multi-language fallback

export function speakText(text, lang = 'en') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  
  if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (lang === 'bn') {
    utterance.lang = 'bn-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.rate = 0.95; // slightly slower for high clarity
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Sample vernacular starter phrases for voice declaration demo
export const sampleVoicePhrases = {
  bn: "আমি ৭ বছর ধরে বাড়ি আর দোকানে কনসিল্ড পাইপ ওয়্যারিং, সুইচবোর্ড ফিটিং, এমসিবি ডিবি বসানো আর আর্থিং-এর কাজ করি। টেস্টার দিয়ে ভোল্টেজ মেপে কাজ করি।",
  hi: "मैं 7 साल से घरों और दुकानों में कंसील्ड पाइप वायरिंग, स्विचबोर्ड फिटिंग, एमसीबी डीबी लगाना और अर्थिंग की जांच करता हूँ। टेस्टर और मल्टीमीटर से सुरक्षित काम करता हूँ।",
  en: "I have 7 years experience doing concealed conduit wiring, fitting modular switchboards, installing MCB distribution boards, and earth loop impedance testing."
};
