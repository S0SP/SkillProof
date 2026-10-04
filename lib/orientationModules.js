// Track A: Worker Orientation Micro-modules (NCVET Aug 2023 12-15 hour mandatory requirement)
// Track B: Gap-Based Upskilling (triggered when candidate maps < 70% or misses PCs)
// Track C: Assessor Calibration Course (reduces inter-assessor variance)

export const orientationTrackA = [
  {
    id: "MOD-A1",
    title: "What is RPL & Your Certification Benefits",
    title_hi: "RPL क्या है और प्रमाणपत्र के लाभ",
    title_bn: "RPL কী এবং আপনার সার্টিফিকেশনের সুবিধা",
    duration_minutes: 3,
    hours_credit: 2,
    video_summary: "Learn how your years of informal trade experience can be certified under National Skills Qualification Framework (NSQF). Earn Academic Bank of Credits (ABC) points, boost daily wages, and gain verified government recognition without losing working days.",
    key_points: [
      "No formal school degree needed; competence is what counts",
      "Official certificate issued by NCVET & Sector Skill Council",
      "Valid for Gulf & overseas trade job visas and government contracts"
    ],
    quiz: {
      question: "Under RPL, on what basis is the NSQF certificate awarded?",
      question_hi: "RPL के तहत प्रमाणपत्र किस आधार पर दिया जाता है?",
      question_bn: "RPL-এর অধীনে কোন ভিত্তিতে সার্টিফিকেট দেওয়া হয়?",
      options: [
        "On demonstrated practical skill and competence",
        "On passing a written English exam",
        "Only if you have an ITI diploma",
        "Based on age and connections"
      ],
      correct_index: 0
    }
  },
  {
    id: "MOD-A2",
    title: "Candidate Rights, Data Privacy & DPDP Consent",
    title_hi: "अधिकार, गोपनीयता एवं DPDP सहमति",
    title_bn: "প্রার্থীর অধিকার, ডেটা গোপনীয়তা ও DPDP সম্মতি",
    duration_minutes: 2.5,
    hours_credit: 1.5,
    video_summary: "Your data is protected under the Digital Personal Data Protection (DPDP) Act 2023. Video evidence is encrypted, geotagged, and strictly used for skill assessment by authorized assessors. No fees are charged from candidates under PMKVY RPL.",
    key_points: [
      "No unauthorized sharing of your personal details",
      "Assessment is free of cost for enrolled workers",
      "You have the right to request a reassessment or appeal"
    ],
    quiz: {
      question: "Are any secret registration fees required for standard RPL assessment?",
      question_hi: "क्या सामान्य RPL मूल्यांकन के लिए कोई शुल्क आवश्यक है?",
      question_bn: "সাধারণ RPL মূল্যায়নের জন্য কি কোনো ফি দিতে হয়?",
      options: [
        "No, PMKVY RPL enrolment is free of charge",
        "Yes, Rs. 5000 in cash",
        "Yes, half of your first month wage",
        "Only for electricians"
      ],
      correct_index: 0
    }
  },
  {
    id: "MOD-A3",
    title: "How to Make Your Voice Self-Declaration",
    title_hi: "आवाज से अपना कार्य अनुभव कैसे बताएं",
    title_bn: "কণ্ঠস্বরের মাধ্যমে আপনার কাজের অভিজ্ঞতা কীভাবে জানাবেন",
    duration_minutes: 3,
    hours_credit: 2,
    video_summary: "Speaking is faster than typing. Press the microphone button and describe the practical tasks you perform regularly: wiring houses, fixing switches, installing MCBs, or earthing. The app automatically detects your skills and converts them to qualification cards.",
    key_points: [
      "Speak clearly in Hindi, Bengali, or English",
      "Mention tools you use like pliers, tester, multimeter",
      "Mention real jobs you have done: domestic, commercial, or repairs"
    ],
    quiz: {
      question: "What is the best way to declare your experience in the app?",
      question_hi: "ऐप में अपना अनुभव बताने का सबसे अच्छा तरीका क्या है?",
      question_bn: "অ্যাপে আপনার অভিজ্ঞতা জানানোর সেরা উপায় কী?",
      options: [
        "Speak clearly using the microphone button",
        "Type long English essays",
        "Submit fake certificates",
        "Do not tell anything"
      ],
      correct_index: 0
    }
  },
  {
    id: "MOD-A4",
    title: "The Assessment Day Breakdown (Theory, Practical, Viva)",
    title_hi: "मूल्यांकन दिवस: थ्योरी, प्रैक्टिकल और मौखिक परीक्षा",
    title_bn: "মূল্যায়ন দিবস: থিওরি, প্র্যাকটিক্যাল এবং মৌখিক পরীক্ষা",
    duration_minutes: 4,
    hours_credit: 2.5,
    video_summary: "NCVET mandates that practical demonstration carries 50% to 70% of total marks for Level 1 to 3.5. You will perform hands-on wiring, answer brief oral viva questions, and complete a simple audio-assisted knowledge check.",
    key_points: [
      "Practical work is 50-70% of your total score",
      "Assessor observes your tool handling and safety steps",
      "Viva questions can be answered orally in your mother tongue"
    ],
    quiz: {
      question: "Which component carries the highest weightage in NSQF Level 3 RPL assessment?",
      question_hi: "NSQF लेवल 3 RPL मूल्यांकन में सबसे अधिक अंक किस घटक के होते हैं?",
      question_bn: "NSQF লেভেল ৩ RPL মূল্যায়নে কোন অংশের নম্বর সবচেয়ে বেশি?",
      options: [
        "Hands-on practical demonstration (50-70%)",
        "Written English grammar",
        "Memorizing formulas",
        "College attendance"
      ],
      correct_index: 0
    }
  },
  {
    id: "MOD-A5",
    title: "How to Record Video Evidence with Quality Guard",
    title_hi: "गुणवत्ता जांच के साथ वीडियो साक्ष्य कैसे रिकॉर्ड करें",
    title_bn: "কোয়ালিটি গার্ডের সাথে ভিডিও প্রমাণ কীভাবে রেকর্ড করবেন",
    duration_minutes: 3,
    hours_credit: 2,
    video_summary: "The app features an on-device Quality Guard that monitors camera lighting, framing, and blur. Position your phone 4 to 6 feet away so the test board, your hands, and your insulated tools are clearly visible in the frame.",
    key_points: [
      "Ensure good lighting; do not record against direct sunlight",
      "Keep hands and tool tips clearly visible in frame",
      "Wait for green Quality Check indicator before starting"
    ],
    quiz: {
      question: "Why does the app check lighting and framing during recording?",
      question_hi: "रिकॉर्डिंग के दौरान ऐप रोशनी और फ्रेमिंग की जांच क्यों करता है?",
      question_bn: "রেকর্ডিং চলাকালীন অ্যাপটি কেন আলো এবং ফ্রেমিং পরীক্ষা করে?",
      options: [
        "To ensure your proof is clear and auditable for the assessor",
        "To consume more phone battery",
        "To upload to social media",
        "It is not necessary"
      ],
      correct_index: 0
    }
  },
  {
    id: "MOD-A6",
    title: "Safety First: Critical Must-Pass Rules",
    title_hi: "सुरक्षा सर्वोपरि: अनिवार्य पास नियम",
    title_bn: "সুরক্ষা সবার আগে: বাধ্যতামূলক পাস নিয়ম",
    duration_minutes: 3.5,
    hours_credit: 2.5,
    video_summary: "Certain safety steps are binary must-pass. If you touch live exposed terminals without testing, fail to isolate the main switch, or omit safety footwear, the assessor cannot certify you. Always verify zero voltage before touching conductors.",
    key_points: [
      "Always switch off and verify with neon tester before touching wires",
      "Wear insulated footwear at all times on site",
      "Never bypass an MCB or create a bootleg neutral-earth bridge"
    ],
    quiz: {
      question: "What must you ALWAYS do before stripping or touching a socket wire?",
      question_hi: "सॉकेट की तार छूने या छीलने से पहले आपको हमेशा क्या करना चाहिए?",
      question_bn: "সকেটের তার ছোঁয়ার বা কাটার আগে সর্বদা কী করা উচিত?",
      options: [
        "Switch off main MCB and verify dead with tester",
        "Touch it quickly with fingers to check",
        "Wash your hands with water",
        "Ask a friend to hold the wire"
      ],
      correct_index: 0
    }
  },
  {
    id: "MOD-A7",
    title: "Mock Task & In-App Practice Session",
    title_hi: "मॉक टास्क और अभ्यास सत्र",
    title_bn: "মক টাস্ক এবং অনুশীলন সেশন",
    duration_minutes: 3,
    hours_credit: 1.5,
    video_summary: "Practice taking a photo of a completed wiring board, testing audio recording, and answering a sample question. This rehearsal ensures you feel confident and relaxed during the actual assessment day.",
    key_points: [
      "No marks are deducted for practice sessions",
      "Check that your phone microphone captures your voice cleanly",
      "Familiarize yourself with the countdown timer"
    ],
    quiz: {
      question: "Do practice recordings count toward your official test score?",
      question_hi: "क्या अभ्यास रिकॉर्डिंग आपके आधिकारिक टेस्ट स्कोर में गिनी जाती है?",
      question_bn: "অনুশীলন রেকর্ডিং কি আপনার অফিসিয়াল টেস্ট স্কোরে যোগ হয়?",
      options: [
        "No, practice tasks carry zero penalty and help you prepare",
        "Yes, they reduce your marks",
        "Only if you make a mistake",
        "Yes, they count 50%"
      ],
      correct_index: 0
    }
  },
  {
    id: "MOD-A8",
    title: "Employability, Customer Communication & First Aid",
    title_hi: "रोजगार क्षमता, ग्राहक व्यवहार एवं प्राथमिक उपचार",
    title_bn: "কর্মসংস্থান, গ্রাহকের সাথে আচরণ ও প্রাথমিক চিকিৎসা",
    duration_minutes: 2.5,
    hours_credit: 1,
    video_summary: "Learn professional conduct at customer premises: clear price estimation, clean housekeeping after drilling or conduit installation, digital payment via UPI, and immediate non-conductive rescue in case of electrical accidents.",
    key_points: [
      "Explain the repair plan and cost before starting work",
      "Clean up wire clippings and insulation shavings after work",
      "Know 108 emergency ambulance helpline for electrical shock"
    ],
    quiz: {
      question: "If someone suffers an electric shock, what is the FIRST action?",
      question_hi: "यदि किसी को बिजली का झटका लगे, तो सबसे पहला कदम क्या है?",
      question_bn: "কাউকে বিদ্যুতের শক লাগলে প্রথম পদক্ষেপ কী?",
      options: [
        "Immediately switch off the main power supply or use a dry wooden stick",
        "Pull them with bare wet hands",
        "Throw a bucket of water on them",
        "Take a selfie"
      ],
      correct_index: 0
    }
  }
];

// Track B: Gap-based Upskilling Modules
export const upskillingTrackB = [
  {
    id: "GAP-01",
    pc_id: "PC-04-02",
    title: "Earthing Systems: Pipe, Plate, and Earth Loop Testing",
    title_hi: "अर्थिंग प्रणालियां: पाइप, प्लेट और अर्थ लूप परीक्षण",
    title_bn: "আর্থিং সিস্টেম: পাইপ, প্লেট ও আর্থ লুপ পরীক্ষা",
    duration: "6 mins",
    key_concept: "Difference between neutral and earth, measuring Neutral-Earth potential with multimeter (<5V), and treating soil resistance.",
    action_prompt: "Practice measuring voltage between socket neutral and earth pin using a digital multimeter."
  },
  {
    id: "GAP-02",
    pc_id: "PC-02-02",
    title: "Using Digital Clamp Meters Safely",
    title_hi: "डिजिटल क्लैंप मीटर का सुरक्षित उपयोग",
    title_bn: "ডিজিটাল ক্ল্যাম্প মিটারের নিরাপদ ব্যবহার",
    duration: "5 mins",
    key_concept: "Measuring running current through single phase conductor without cutting wires. Understanding AC Ampere ranges.",
    action_prompt: "Clamp around a single phase conductor to measure running fan/heater current."
  },
  {
    id: "GAP-03",
    pc_id: "PC-04-01",
    title: "Distribution Board Dressing & MCB Ampere Sizing",
    title_hi: "डिस्ट्रीब्यूशन बोर्ड ड्रेसिंग और MCB साइजिंग",
    title_bn: "ডিস্ট্রিবিউশন বোর্ড ড্রেসিং ও MCB সাইজিং",
    duration: "7 mins",
    key_concept: "Matching B-curve vs C-curve MCBs, selecting 6A for lighting, 16A for power sockets, 25A for AC/Geyser.",
    action_prompt: "Calculate total wattage and pick the right MCB rating for a 1.5-ton split AC."
  }
];

// Track C: Assessor Calibration Gold Clips
export const calibrationGoldClips = [
  {
    id: "GOLD-01",
    candidate_name: "Simulated Candidate #1",
    trade: "Assistant Electrician L3",
    task: "Conduit Wire Stripping & Switchboard Dressing",
    video_url: "https://assets.skillproof.gov.in/exemplars/clip_01_dressing.mp4",
    gold_scores: {
      "PC-01-01": 3,
      "PC-01-02": 2,
      "PC-03-01": 2,
      "PC-03-02": 3
    },
    expert_consensus_summary: "Candidate executed perfect 12mm strip with zero copper strand nicks. Used insulated pliers. Clean right-angle conductor dressing.",
    common_assessor_biases: "Overly harsh assessors penalize for slight dust on board. Leniency bias ignores lack of pre-inspection on tool handles."
  },
  {
    id: "GOLD-02",
    candidate_name: "Simulated Candidate #2",
    trade: "Assistant Electrician L3",
    task: "Socket Earth Verification & Dead-Test",
    video_url: "https://assets.skillproof.gov.in/exemplars/clip_02_deadtest.mp4",
    gold_scores: {
      "PC-02-01": 0, // Critical failure
      "PC-02-02": 1,
      "PC-04-02": 0
    },
    expert_consensus_summary: "CRITICAL FAILURE: Candidate touched terminal screws with bare finger before testing with phase tester. Must-pass safety violated.",
    common_assessor_biases: "Lenient assessors give 1 or 2 marks because candidate was polite. CRITICAL safety violation must receive 0 and block direct pass."
  }
];
