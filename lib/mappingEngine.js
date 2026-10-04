// Deterministic QP/NOS/PC Mapping Engine
// Strictly complies with Section 13.1 & Section 6 (A2) of PRD:
// "Coverage % is computed in code, never by the LLM"
// Direct assessment threshold: >= 70% per NCVET RPL Guidelines (August 2023)

import { heroQualificationPack, level4ElectricianQP, plumberQP } from './qualificationPacks';

// Controlled vocabulary dictionary for trade task claims
export const controlledTradeVocabulary = {
  electrician: [
    {
      id: "TERM-01",
      term: "Concealed conduit & house wiring",
      term_hi: "कंसील्ड कंड्यूट और मकान की वायरिंग",
      term_bn: "কনসিল্ড কন্ডুইট ও বাড়ির ওয়ারিং",
      pcs_covered: ["PC-01-01", "PC-03-02"],
      weight: 1.0,
      icon: "⚡"
    },
    {
      id: "TERM-02",
      term: "Switchboard fitting & socket wiring",
      term_hi: "स्विचबोर्ड फिटिंग और सॉकेट वायरिंग",
      term_bn: "সুইচবোর্ড ফিটিং ও সকেট ওয়ারিং",
      pcs_covered: ["PC-01-01", "PC-03-03"],
      weight: 1.0,
      icon: "🔌"
    },
    {
      id: "TERM-03",
      term: "Main distribution box & MCB/RCCB installation",
      term_hi: "डिस्ट्रीब्यूशन बॉक्स और MCB/RCCB लगाना",
      term_bn: "ডিস্ট্রিবিউশন বক্স ও MCB/RCCB স্থাপন",
      pcs_covered: ["PC-03-01", "PC-04-01"],
      weight: 1.0,
      icon: "🧰"
    },
    {
      id: "TERM-04",
      term: "Earthing connection & pipe/plate earth testing",
      term_hi: "अर्थिंग कनेक्शन और पाइप/प्लेट अर्थिंग जांच",
      term_bn: "আর্থিং সংযোগ ও পাইপ/প্লেট আর্থিং পরীক্ষা",
      pcs_covered: ["PC-04-02", "PC-02-02"],
      weight: 1.0,
      icon: "🌱"
    },
    {
      id: "TERM-05",
      term: "Using neon tester & multimeter for dead-test",
      term_hi: "नियॉन टेस्टर और मल्टीमीटर से वोल्टेज नापना",
      term_bn: "নিয়ন টেস্টার ও মাল্টিমিটার দিয়ে ভোল্টেজ পরীক্ষা",
      pcs_covered: ["PC-01-02", "PC-02-01", "PC-02-02"],
      weight: 1.0,
      icon: "📟"
    },
    {
      id: "TERM-06",
      term: "Ceiling fan, regulator, & lighting fixtures repair",
      term_hi: "पंखे, रेगुलेटर और ट्यूबलाइट/LED मरम्मत",
      term_bn: "সিলিং ফ্যান, রেগুলেটর ও আলো মেরামত",
      pcs_covered: ["PC-03-02", "PC-03-03"],
      weight: 0.8,
      icon: "💡"
    },
    {
      id: "TERM-07",
      term: "First aid for electric shock & safety isolation (LOTO)",
      term_hi: "करंट लगने पर प्राथमिक उपचार एवं सुरक्षा आइसोलेशन",
      term_bn: "বিদ্যুৎস্পৃষ্ট হলে প্রাথমিক চিকিৎসা ও সুরক্ষা আইসোলেশন",
      pcs_covered: ["PC-03-01", "PC-ES-01"],
      weight: 1.0,
      icon: "🦺"
    },
    {
      id: "TERM-08",
      term: "3-Phase distribution & motor starter connection (Advanced)",
      term_hi: "3-फेज डिस्ट्रीब्यूशन और मोटर स्टार्टर वायरिंग",
      term_bn: "৩-ফেজ ডিস্ট্রিবিউশন ও মোটর স্টার্টার সংযোগ",
      pcs_covered: ["PC-L4-01", "PC-L4-02"],
      weight: 1.0,
      icon: "⚙️"
    }
  ],
  plumber: [
    {
      id: "PLM-TERM-01",
      term: "CPVC / UPVC pipe cutting & solvent cement jointing",
      term_hi: "CPVC/UPVC पाइप काटना और सॉल्वेंट जॉइंट लगाना",
      term_bn: "CPVC/UPVC পাইপ কাটা ও সলভেন্ট জয়েন্ট করা",
      pcs_covered: ["PC-PLM-01"],
      weight: 1.0,
      icon: "🚰"
    },
    {
      id: "PLM-TERM-02",
      term: "Sanitary fitting (washbasin, toilet, taps)",
      term_hi: "सैनिटरी फिटिंग (वॉशबेसिन, कमोड, नल)",
      term_bn: "স্যানিটারি ফিটিং (ওয়াশবেসিন, কমোড, কল)",
      pcs_covered: ["PC-PLM-03"],
      weight: 1.0,
      icon: "🚿"
    },
    {
      id: "PLM-TERM-03",
      term: "Pressure testing & pipeline leak detection",
      term_hi: "प्रेशर टेस्टिंग और पाइप लीकेज ढूंढना",
      term_bn: "প্রেসার টেস্টিং ও পাইপ ফুটো শনাক্তকরণ",
      pcs_covered: ["PC-PLM-04", "PC-PLM-05"],
      weight: 1.0,
      icon: "🔧"
    }
  ]
};

/**
 * Extracts candidate claims from voice transcript or selected task items
 */
export function extractClaimsFromText(transcript, trade = 'electrician') {
  const text = (transcript || '').toLowerCase();
  const catalog = controlledTradeVocabulary[trade] || controlledTradeVocabulary.electrician;
  
  const keywordsMap = {
    "TERM-01": ["wiring", "conduit", "kansiild", "concealed", "casing", "capping", "wire", "वायरिंग", "कंड्यूट", "তার"],
    "TERM-02": ["switch", "socket", "board", "modular", "स्विच", "सॉकेट", "बोर्ड", "সকেট"],
    "TERM-03": ["mcb", "db", "distribution", "fuse", "rccb", "डिस्ट्रीब्यूशन", "फ्यूज", "এমসিবি"],
    "TERM-04": ["earth", "earthing", "ground", "grounding", "अर्थिंग", "अर्थ", "আর্থিং"],
    "TERM-05": ["tester", "multimeter", "clamp", "meter", "voltage", "टेस्टर", "मल्टीमीटर", "ভোল্টমিটার"],
    "TERM-06": ["fan", "regulator", "light", "motor", "पंखा", "रेगुलेटर", "লাইট", "ফ্যান"],
    "TERM-07": ["safety", "glove", "boot", "shock", "सुरक्षा", "दस्ताने", "জুতো", "শক"],
    "TERM-08": ["3 phase", "three phase", "starter", "motor starter", "3-फेज", "স্টার্টার"]
  };

  const claims = catalog.map(item => {
    const kws = keywordsMap[item.id] || [];
    const matched = kws.some(k => text.includes(k));
    return {
      term_id: item.id,
      term_text: item.term,
      term_text_hi: item.term_hi,
      term_text_bn: item.term_bn,
      icon: item.icon,
      pcs_covered: item.pcs_covered,
      // Default to "alone" if mentioned in text, otherwise "with_help" or user editable
      self_rating: matched ? "alone" : "with_help",
      auto_detected: matched
    };
  });

  return claims;
}

/**
 * Deterministic QP Mapping Engine
 * Computes coverage % in code based on weighted NOS credits
 */
export function runQualificationMapping(taskClaims, trade = 'electrician') {
  const targetQP = trade === 'plumber' ? plumberQP : heroQualificationPack;
  const adjacentQP = trade === 'plumber' ? null : level4ElectricianQP;

  // Set of PCs covered with rating 'alone' (100% weight) or 'with_help' (60% weight)
  const pcCreditMap = {};

  (taskClaims || []).forEach(claim => {
    const factor = claim.self_rating === 'alone' ? 1.0 : (claim.self_rating === 'with_help' ? 0.75 : 0.2);
    (claim.pcs_covered || []).forEach(pcId => {
      pcCreditMap[pcId] = Math.max(pcCreditMap[pcId] || 0, factor);
    });
  });

  // Calculate coverage for Hero QP
  let totalWeightedPossible = 0;
  let totalWeightedEarned = 0;
  const nosBreakdown = [];
  const matchedPcsDetails = [];

  targetQP.nos_list.forEach(nos => {
    let nosPcCount = nos.performance_criteria.length;
    let nosPcsEarned = 0;

    nos.performance_criteria.forEach(pc => {
      const credit = pcCreditMap[pc.id] || 0;
      nosPcsEarned += credit;

      matchedPcsDetails.push({
        pc_id: pc.id,
        nos_id: nos.id,
        nos_name: nos.name,
        pc_text: pc.text,
        critical: pc.critical,
        coverage_score: credit,
        covered: credit >= 0.75,
        rating: credit >= 1.0 ? 'alone' : (credit >= 0.75 ? 'with_help' : 'uncovered')
      });
    });

    const nosFraction = nosPcCount > 0 ? nosPcsEarned / nosPcCount : 0;
    totalWeightedPossible += nos.weight;
    totalWeightedEarned += (nosFraction * nos.weight);

    nosBreakdown.push({
      nos_id: nos.id,
      code: nos.code,
      name: nos.name,
      name_hi: nos.name_hi,
      name_bn: nos.name_bn,
      credits: nos.credits,
      weight: nos.weight,
      coverage_pct: Math.round(nosFraction * 100),
      status: nosFraction >= 0.70 ? 'strong' : (nosFraction >= 0.40 ? 'gap' : 'unmet')
    });
  });

  const finalCoveragePct = Math.round((totalWeightedEarned / (totalWeightedPossible || 1)) * 100);
  const meetsDirectThreshold = finalCoveragePct >= 70; // NCVET 70% rule

  // Evaluate Level 4 match if applicable
  let l4CoveragePct = 0;
  if (adjacentQP) {
    let l4Earned = 0;
    let l4Total = 0;
    adjacentQP.nos_list.forEach(n => {
      n.performance_criteria.forEach(pc => {
        l4Total += 1;
        l4Earned += (pcCreditMap[pc.id] || 0);
      });
    });
    l4CoveragePct = Math.round((l4Earned / (l4Total || 1)) * 100);
  }

  // Recommended NSQF Level
  let recommendedLevel = targetQP.nsqf_level;
  if (l4CoveragePct >= 70) {
    recommendedLevel = 4;
  }

  return {
    qualification_id: targetQP.id,
    qualification_title: targetQP.title,
    qualification_title_hi: targetQP.title_hi,
    qualification_title_bn: targetQP.title_bn,
    nqr_code: targetQP.nqr_code,
    nsqf_level: targetQP.nsqf_level,
    recommended_level: recommendedLevel,
    coverage_pct: finalCoveragePct,
    meets_direct_threshold: meetsDirectThreshold,
    route: meetsDirectThreshold ? "direct_assessment" : "upskilling_first",
    nos_breakdown: nosBreakdown,
    matched_pcs: matchedPcsDetails,
    adjacent_qp: adjacentQP ? {
      id: adjacentQP.id,
      title: adjacentQP.title,
      nsqf_level: adjacentQP.nsqf_level,
      coverage_pct: l4CoveragePct
    } : null,
    explanation: meetsDirectThreshold
      ? `Worker demonstrates ${finalCoveragePct}% weighted coverage across mandatory NOS modules, satisfying NCVET requirement of ≥70% for direct physical assessment.`
      : `Worker demonstrates ${finalCoveragePct}% coverage (<70%). Per NCVET Aug 2023 guidelines, candidate should complete Track B gap-based orientation micro-modules prior to practical examination.`
  };
}
