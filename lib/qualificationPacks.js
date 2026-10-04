// Hero Qualification Pack: Assistant Electrician (Domestic cum Industrial)
// NSQF Level 3, NQR Code: QG-03-PW-02422-2024-V1-MSME
// Compliant with NCVET RPL Guidelines (August 2023)

export const heroQualificationPack = {
  id: "QP-ELE-L3-01",
  nqr_code: "QG-03-PW-02422-2024-V1-MSME",
  title: "Assistant Electrician (Domestic cum Industrial)",
  title_hi: "सहायक इलेक्ट्रीशियन (घरेलू एवं औद्योगिक)",
  title_bn: "সহকারী ইলেকট্রিশিয়ান (গার্হস্থ্য ও শিল্প)",
  sector: "Electronics & Electrical Skill Council",
  nsqf_level: 3,
  credits: 18,
  notional_hours: 450,
  direct_assessment_threshold: 0.70, // NCVET 70% rule
  orientation_hours_required: 15,
  description: "Assists in domestic wiring, fitting conduits, testing continuity, MCB distribution board installation, and basic earthing verification under supervision.",
  
  nos_list: [
    {
      id: "MSME/DIE/01",
      code: "MSME/DIE/01",
      name: "Basic Electrical Concepts & Safety Tools",
      name_hi: "बुनियादी विद्युत अवधारणाएं और सुरक्षा उपकरण",
      name_bn: "মৌলিক বৈদ্যুতিক ধারণা ও সুরক্ষা সরঞ্জাম",
      credits: 3,
      weight: 0.15,
      mandatory: true,
      performance_criteria: [
        {
          id: "PC-01-01",
          text: "Identify conductors, insulators, standard wire gauges, and cable color codes (Phase: Red/Brown, Neutral: Black/Blue, Earth: Green/Yellow).",
          critical: true,
          rubric_anchors: {
            0: "Cannot identify phase/neutral/earth conductors; confuses colour codes or poses immediate short-circuit hazard.",
            1: "Identifies basic phase and neutral but hesitates on earth conductor or gauge ratings; needs guidance.",
            2: "Correctly identifies phase, neutral, and earth cables; selects appropriate gauge for domestic lighting loads.",
            3: "Fluently explains current rating, voltage drop factors, and colour standards across single and 3-phase circuits without prompting."
          }
        },
        {
          id: "PC-01-02",
          text: "Select, inspect, and use insulated hand tools (pliers, screwdrivers, strippers) rated up to 1000V and inspect PPE.",
          critical: true,
          rubric_anchors: {
            0: "Uses uninsulated or damaged tools on electrical points; neglects safety footwear or gloves.",
            1: "Uses insulated tools but forgets inspection for cracked insulation or worn tips; prompted on PPE.",
            2: "Selects insulated tools verified safe for 1000V; wears rubber-soled footwear and standard PPE throughout.",
            3: "Conducts thorough pre-use check of tool insulation, explains double-insulation ratings, and maintains safe tool placement."
          }
        }
      ]
    },
    {
      id: "MSME/DIE/02",
      code: "MSME/DIE/02",
      name: "Measure Electrical Parameters (Voltage, Current, Continuity)",
      name_hi: "विद्युत मापदंडों का मापन (वोल्टेज, करंट, निरंतरता)",
      name_bn: "বৈদ্যুতিক পরামিতি পরিমাপ (ভোল্টেজ, কারেন্ট, ধারাবাহিকতা)",
      credits: 3,
      weight: 0.20,
      mandatory: true,
      performance_criteria: [
        {
          id: "PC-02-01",
          text: "Use neon phase tester correctly to verify absence of voltage before touching conductors (Dead-Test verification).",
          critical: true,
          rubric_anchors: {
            0: "Touches terminals with bare hands before testing, or uses defective tester without testing on a known live source first.",
            1: "Tests terminal but fails to verify tester against known supply first; unsteady grip on tester.",
            2: "Executes Prove-Test-Prove routine (verifies tester on known source, tests target point, re-verifies tester).",
            3: "Flawlessly performs voltage test with insulated stance, checks both phase and neutral leakage, and explains false-glow risks."
          }
        },
        {
          id: "PC-02-02",
          text: "Configure and operate digital multimeter / clamp meter to measure AC voltage and loop continuity.",
          critical: false,
          rubric_anchors: {
            0: "Incorrect selector knob setting (e.g. resistance mode on live AC line); puts meter and operator at risk.",
            1: "Sets knob with hesitation; takes reading but struggles to interpret decimal or unit scale.",
            2: "Sets meter to correct AC Voltage / Ohms range; securely places probes on test lugs; records valid reading (230V +/- 10%).",
            3: "Swiftly tests line-neutral, line-earth, and neutral-earth potentials; accurately diagnoses neutral floating or high impedance."
          }
        }
      ]
    },
    {
      id: "MSME/DIE/03",
      code: "MSME/DIE/03",
      name: "Prepare for Domestic Electrical Wiring & Conduit Fitting",
      name_hi: "घरेलू वायरिंग और कंड्यूट फिटिंग की तैयारी",
      name_bn: "গার্হস্থ্য তারের সংযোগ এবং কন্ডুইট ফিটিং প্রস্তুতি",
      credits: 6,
      weight: 0.35,
      mandatory: true,
      performance_criteria: [
        {
          id: "PC-03-01",
          text: "Isolate main distribution supply, install lock-out/tag-out tag, and secure work perimeter before cutting or pulling cables.",
          critical: true,
          rubric_anchors: {
            0: "Leaves main supply active while stripping cables; no warning to bystanders.",
            1: "Switches off local sub-switch only, leaving distribution box live; forgets warning notice.",
            2: "Switches off Main MCB/Isolator, places warning sign, confirms zero energy at distribution box.",
            3: "Applies proper LOTO isolation, tests all incoming phases, discharges residual capacitance, and secures workspace."
          }
        },
        {
          id: "PC-03-02",
          text: "Cut, strip, and route single-core PVC cables through concealed/surface conduit without damaging conductor strands.",
          critical: false,
          rubric_anchors: {
            0: "Nicks or shears more than 20% of copper strands; rough cuts insulation leaving exposed copper outside terminal.",
            1: "Stripping leaves slight scratches on copper; cable bundle loose inside conduit.",
            2: "Clean insulation strip of exact required length (10-12mm); zero conductor strand damage; smooth pull with fish-wire.",
            3: "Exemplary neat routing with cable ties, proper conduit bend radius maintained, zero conductor score marks."
          }
        },
        {
          id: "PC-03-03",
          text: "Assemble 1-way / 2-way switchboard with ceiling fan regulator and 3-pin 6A/16A socket with proper terminal torque.",
          critical: false,
          rubric_anchors: {
            0: "Phase connected directly to appliance instead of switch; loose terminals that wobble.",
            1: "Switch wired on phase, but terminal screws loose or insulation pinched under clamp screw.",
            2: "Phase properly switched, neutral looped to socket, earth lead connected to top pin; terminals tightened securely.",
            3: "Immaculate dressing, ferrules/labels affixed, phase on right pin, neutral on left pin, top earth confirmed, torque checked."
          }
        }
      ]
    },
    {
      id: "MSME/DIE/04",
      code: "MSME/DIE/04",
      name: "Distribution Board, MCB/RCCB Installation & Earthing Verification",
      name_hi: "डिस्ट्रीब्यूशन बोर्ड, MCB/RCCB स्थापना और अर्थिंग सत्यापन",
      name_bn: "ডিস্ট্রিবিউশন বোর্ড, MCB/RCCB স্থাপন ও আর্থিং যাচাইকরণ",
      credits: 4,
      weight: 0.20,
      mandatory: true,
      performance_criteria: [
        {
          id: "PC-04-01",
          text: "Mount and wire Single Pole and Double Pole Miniature Circuit Breakers (MCB) with correct current rating.",
          critical: true,
          rubric_anchors: {
            0: "Bypasses MCB or connects input to output terminals in reverse; installs 32A MCB for 1.0 sq mm lighting circuit.",
            1: "Connects line to MCB top/bottom appropriately but selects oversized breaker for the conductor.",
            2: "Mounts DIN rail MCB securely; wires line to supply side and load to protected side; rates MCB appropriately (6A/16A).",
            3: "Calculates total load vs cable gauge; verifies breaking capacity (6kA/10kA); terminates busbar cleanly with zero slack."
          }
        },
        {
          id: "PC-04-02",
          text: "Verify earthing continuity from 3-pin socket earth terminal to main earth busbar / earth electrode.",
          critical: true,
          rubric_anchors: {
            0: "Earth pin left open or connected to neutral wire (bootleg ground); zero continuity to ground electrode.",
            1: "Earth connected but high resistance (>5 ohms); loose bolt on earth clamp.",
            2: "Continuous green/yellow earth conductor routed from socket pin to main earth bar; low resistance verified (<2 ohms).",
            3: "Performs full earth loop impedance test, explains soil moisture treatment around earth pit, and tests RCCB test button."
          }
        }
      ]
    },
    {
      id: "MSME/ES/01",
      code: "MSME/ES/01",
      name: "Employability, Workplace Communication & First Aid Basics",
      name_hi: "रोजगार क्षमता, कार्यस्थल संचार और प्राथमिक चिकित्सा",
      name_bn: "কর্মসংস্থান দক্ষতা, কর্মক্ষেত্রের যোগাযোগ ও প্রাথমিক চিকিৎসা",
      credits: 2,
      weight: 0.10,
      mandatory: true,
      performance_criteria: [
        {
          id: "PC-ES-01",
          text: "Demonstrate immediate action protocol in case of electric shock (de-energise source, non-conductive rescue, CPR call).",
          critical: true,
          rubric_anchors: {
            0: "Claims they would pull victim with bare hands while live; has no knowledge of emergency cutoff or CPR.",
            1: "Knows to disconnect power, but panics on rescue sequence; hesitant on artificial respiration steps.",
            2: "Accurately articulates: switch off mains -> use dry wooden stick to detach victim -> check pulse -> summon 108 medical help.",
            3: "Executes full mock rescue protocol calmly, demonstrates recovery position and chest compression cadence, explains burn treatment."
          }
        }
      ]
    }
  ],

  task_cards: [
    {
      id: "TC-01",
      nos_id: "MSME/DIE/03",
      title: "Assembly & Wiring of a 2-Lamp, 1-Socket Control Board with MCB",
      title_hi: "MCB युक्त 2-लैंप, 1-सॉकेट कंट्रोल बोर्ड की असेंबली और वायरिंग",
      title_bn: "MCB সহ ২টি ল্যাম্প ও ১টি সকেট কন্ট্রোল বোর্ড সংযোজন ও তারের সংযোগ",
      time_limit_minutes: 30,
      tools_required: ["Combination Pliers (Insulated)", "Wire Stripper", "Neon Phase Tester", "Digital Multimeter", "Screw Driver Set 1000V", "Rubber Footwear"],
      critical_items: [
        "Must verify supply isolation before stripping wires",
        "Must connect phase conductor to switches, not direct to lamps",
        "Must route dedicated earth lead to 3-pin socket earth pin"
      ],
      steps: [
        { id: "S1", name: "De-energise & lock out test supply", critical: true },
        { id: "S2", name: "Select & strip 1.5 sq mm phase (Red) & neutral (Black) cables", critical: false },
        { id: "S3", name: "Fix modular switch, socket, and indicator onto mounting plate", critical: false },
        { id: "S4", name: "Connect phase loop across switch inputs and supply side of MCB", critical: true },
        { id: "S5", name: "Terminate green/yellow earth wire to top socket terminal", critical: true },
        { id: "S6", name: "Perform insulation & dead continuity check with multimeter", critical: true },
        { id: "S7", name: "Energise supply and test lamp operation with phase tester", critical: false }
      ]
    },
    {
      id: "TC-02",
      nos_id: "MSME/DIE/04",
      title: "Earth Resistance & Socket Polarity Verification",
      title_hi: "अर्थ प्रतिरोध और सॉकेट ध्रुवता सत्यापन",
      title_bn: "আর্থ রেজিস্ট্যান্স ও সকেট পোলারিটি যাচাইকরণ",
      time_limit_minutes: 20,
      tools_required: ["Digital Multimeter", "Phase Tester", "Insulated Gloves"],
      critical_items: [
        "Phase must be on right terminal of socket",
        "Voltage between Neutral and Earth must be less than 5V"
      ],
      steps: [
        { id: "S1", name: "Visual inspection of earth pit and bonding clamp", critical: false },
        { id: "S2", name: "Check phase polarity on 3-pin socket using tester", critical: true },
        { id: "S3", name: "Measure Line-to-Neutral AC voltage (expect 230V)", critical: false },
        { id: "S4", name: "Measure Line-to-Earth AC voltage (expect ~230V)", critical: true },
        { id: "S5", name: "Measure Neutral-to-Earth AC voltage (expect < 5V)", critical: true }
      ]
    }
  ]
};

// Second QP: Electrician (Construction / Building Services) NSQF Level 4
export const level4ElectricianQP = {
  id: "QP-ELE-L4-02",
  nqr_code: "QG-04-EL-01200-2024",
  title: "Electrician (Construction & Industrial)",
  title_hi: "इलेक्ट्रीशियन (निर्माण एवं औद्योगिक)",
  title_bn: "ইলেকট্রিশিয়ান (নির্মাণ ও শিল্প)",
  sector: "Construction & Infrastructure Skill Council",
  nsqf_level: 4,
  credits: 24,
  notional_hours: 600,
  direct_assessment_threshold: 0.70,
  orientation_hours_required: 15,
  description: "Advanced domestic, commercial 3-phase wiring, conduit bending, motor starter wiring (DOL/Star-Delta), and industrial distribution panel maintenance.",
  nos_list: [
    {
      id: "CON/ELE/01",
      code: "CON/ELE/01",
      name: "3-Phase Distribution & Panel Wiring",
      credits: 8,
      weight: 0.40,
      mandatory: true,
      performance_criteria: [
        { id: "PC-L4-01", text: "Balance single-phase lighting and power loads across R-Y-B phases in 3-phase TPN board.", critical: true },
        { id: "PC-L4-02", text: "Wire DOL starter for 3-phase induction motor with thermal overload relay calibration.", critical: true }
      ]
    },
    {
      id: "CON/ELE/02",
      code: "CON/ELE/02",
      name: "Commercial Conduit Bending & Cable Tray Installation",
      credits: 8,
      weight: 0.35,
      mandatory: true,
      performance_criteria: [
        { id: "PC-L4-03", text: "Bend MS conduit up to 90 degrees using mechanical bender without wrinkling or throat reduction.", critical: false }
      ]
    },
    {
      id: "CON/ELE/03",
      code: "CON/ELE/03",
      name: "Inspection, Testing & Commissioning of Electrical Installations",
      credits: 8,
      weight: 0.25,
      mandatory: true,
      performance_criteria: [
        { id: "PC-L4-04", text: "Conduct insulation resistance test using 500V Megger (minimum 1 Mega-ohm rule).", critical: true }
      ]
    }
  ]
};

// Third QP: Plumber (General) NSQF Level 3
export const plumberQP = {
  id: "QP-PLM-L3-01",
  nqr_code: "QG-03-PL-00501-2024",
  title: "Plumber (General)",
  title_hi: "प्लंबर (सामान्य)",
  title_bn: "প্লাম্বার (সাধারণ)",
  sector: "Plumbing Sector Skill Council",
  nsqf_level: 3,
  credits: 16,
  notional_hours: 400,
  direct_assessment_threshold: 0.70,
  orientation_hours_required: 15,
  description: "Installation and repair of CPVC/UPVC pipes, sanitary fixtures, water pumps, valves, and leak detection in domestic and commercial buildings.",
  nos_list: [
    {
      id: "PSC/Q0101",
      code: "PSC/Q0101",
      name: "Pipe Cutting, Threading & Solvent Jointing",
      credits: 6,
      weight: 0.40,
      mandatory: true,
      performance_criteria: [
        { id: "PC-PLM-01", text: "Cut, deburr, and joint CPVC/UPVC pipes with solvent cement ensuring leak-proof curing.", critical: true },
        { id: "PC-PLM-02", text: "Cut and thread GI pipes using die stock with Teflon tape wrapping on male threads.", critical: false }
      ]
    },
    {
      id: "PSC/Q0102",
      code: "PSC/Q0102",
      name: "Installation of Sanitary Fixtures & Pressure Testing",
      credits: 6,
      weight: 0.40,
      mandatory: true,
      performance_criteria: [
        { id: "PC-PLM-03", text: "Install water closet, wash basin, and diverter mixer with spirit level alignment.", critical: false },
        { id: "PC-PLM-04", text: "Perform hydrostatic pressure leak test at 1.5x operating pressure using manual pressure pump.", critical: true }
      ]
    },
    {
      id: "PSC/Q0103",
      code: "PSC/Q0103",
      name: "Health, Safety & Trench Shoring",
      credits: 4,
      weight: 0.20,
      mandatory: true,
      performance_criteria: [
        { id: "PC-PLM-05", text: "Adhere to safety in confined sewer spaces with atmospheric gas testing.", critical: true }
      ]
    }
  ]
};

export const qualificationCatalog = [
  heroQualificationPack,
  level4ElectricianQP,
  plumberQP
];
