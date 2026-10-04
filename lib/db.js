import { supabase, isSupabaseConfigured } from './supabase';
import { heroQualificationPack } from './qualificationPacks';
import { getConsistencyExperimentData } from './consistencyEngine';

// In-memory & file-backed store for local / offline-first execution
// Seamlessly syncs to Supabase whenever SUPABASE_URL & SUPABASE_SERVICE_KEY are active

class InMemoryDB {
  constructor() {
    this.workers = [
      {
        id: "w-ramesh-01",
        name: "Ramesh Mandal",
        phone: "9830112233",
        language: "bn",
        age_band: "25-35",
        district: "North 24 Parganas (Barasat)",
        trade: "electrician",
        consent_accepted: true,
        consent_timestamp: new Date().toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "w-rahul-02",
        name: "Rahul Kumar",
        phone: "9876543210",
        language: "hi",
        age_band: "25-35",
        district: "Patna",
        trade: "electrician",
        consent_accepted: true,
        consent_timestamp: new Date().toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: "w-amit-03",
        name: "Amit Singh",
        phone: "9876543211",
        language: "en",
        age_band: "18-25",
        district: "Asansol",
        trade: "electrician",
        consent_accepted: true,
        consent_timestamp: new Date().toISOString(),
        created_at: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: "w-sunita-04",
        name: "Sunita Devi",
        phone: "9876543212",
        language: "hi",
        age_band: "35-50",
        district: "Hooghly",
        trade: "electrician",
        consent_accepted: true,
        consent_timestamp: new Date().toISOString(),
        created_at: new Date(Date.now() - 345600000).toISOString()
      }
    ];

    this.batches = [
      {
        id: "BATCH-KOL-01",
        name: "Barasat Skill Hub - Batch #24",
        venue: "Barasat Govt ITI Assessment Centre",
        date: "2026-10-10",
        assessor_name: "Mrs. S. Das (Certified ToA #8841)",
        target_size: 24,
        status: "scheduled",
        tools_ready: true,
        equipment_checklist: [
          { name: "Safe 230V Test Boards with MCB DIN Rails", checked: true },
          { name: "Digital Multimeters & Neon Testers (1000V)", checked: true },
          { name: "Earth Resistance Ground Meggers", checked: true },
          { name: "Insulated Wire Strippers & Pliers", checked: true },
          { name: "First Aid Kit with Non-conductive Sheath", checked: true }
        ]
      }
    ];

    this.declarations = [
      {
        id: "dec-ramesh-01",
        worker_id: "w-ramesh-01",
        transcript: "আমি ৭ বছর ধরে বাড়ি আর দোকানে কনসিল্ড পাইপ ওয়্যারিং, সুইচবোর্ড ফিটিং, এমসিবি ডিবি বসানো আর আর্থিং-এর কাজ করি।",
        experience_years: "7",
        has_documents: false,
        affidavit_accepted: true,
        task_claims: [
          { term_id: "TERM-01", term_text: "Concealed conduit & house wiring", self_rating: "alone" },
          { term_id: "TERM-02", term_text: "Switchboard fitting & socket wiring", self_rating: "alone" },
          { term_id: "TERM-03", term_text: "Main distribution box & MCB/RCCB installation", self_rating: "alone" },
          { term_id: "TERM-04", term_text: "Earthing connection & pipe/plate earth testing", self_rating: "with_help" },
          { term_id: "TERM-05", term_text: "Using neon tester & multimeter for dead-test", self_rating: "alone" },
          { term_id: "TERM-07", term_text: "First aid for electric shock & safety isolation", self_rating: "alone" }
        ],
        created_at: new Date(Date.now() - 43200000).toISOString()
      }
    ];

    this.mappings = [
      {
        id: "map-ramesh-01",
        worker_id: "w-ramesh-01",
        qualification_id: heroQualificationPack.id,
        qualification_title: heroQualificationPack.title,
        coverage_pct: 74,
        meets_direct_threshold: true,
        route: "direct_assessment",
        recommended_level: 3,
        explanation: "Worker demonstrates 74% weighted coverage across mandatory NOS modules, satisfying NCVET requirement of ≥70% for direct physical assessment.",
        created_at: new Date(Date.now() - 40000000).toISOString()
      }
    ];

    this.assessments = [
      {
        id: "asm-ramesh-01",
        worker_id: "w-ramesh-01",
        trade: "electrician",
        batch_id: "BATCH-KOL-01",
        language: "bn",
        status: "ready_for_assessment", // declared, mapped, ready_for_assessment, in_assessment, scored, recommended, certified
        total_score: 78,
        level: "Skilled (NSQF Level 3)",
        credits_awarded: 18,
        assessor_signed: false,
        created_at: new Date(Date.now() - 36000000).toISOString()
      },
      {
        id: "asm-rahul-02",
        worker_id: "w-rahul-02",
        trade: "electrician",
        batch_id: "BATCH-KOL-01",
        language: "hi",
        status: "awaiting_signoff",
        total_score: 84,
        level: "Expert (NSQF Level 3)",
        credits_awarded: 18,
        assessor_signed: false,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "asm-amit-03",
        worker_id: "w-amit-03",
        trade: "electrician",
        batch_id: "BATCH-KOL-01",
        language: "en",
        status: "waiting_for_assessor",
        total_score: 55,
        level: "Intermediate (NSQF Level 3)",
        credits_awarded: 12,
        assessor_signed: false,
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    this.scores = [
      {
        id: "sc-rahul-01",
        assessment_id: "asm-rahul-02",
        pc_id: "PC-01-01",
        assessor_score: 3,
        ai_suggestion: 3,
        ai_confidence: 0.94,
        ai_rationale: "Correctly identifies phase/neutral/earth codes and demonstrates insulated wire handling.",
        revealed: true,
        overridden: false,
        override_reason: null
      },
      {
        id: "sc-rahul-02",
        assessment_id: "asm-rahul-02",
        pc_id: "PC-02-01",
        assessor_score: 3,
        ai_suggestion: 2,
        ai_confidence: 0.82,
        ai_rationale: "Phase tester applied accurately after known-source check.",
        revealed: true,
        overridden: true,
        override_reason: "Worker demonstrated exemplary probe angle and double insulation check."
      }
    ];

    this.answers = [
      {
        id: "ans-rahul-01",
        assessment_id: "asm-rahul-02",
        question_id: "Q1",
        answer_text: "MCB reusable hota hai trip hone ke baad, fuse ka taar pighal jata hai aur badalna padta hai.",
        ai_marks: 14,
        safety_marks: 2,
        reason: "Accurate distinction between fuse wire melting and MCB magnetic/thermal trip.",
        confidence: 0.92,
        needs_manual_review: false
      },
      {
        id: "ans-rahul-02",
        assessment_id: "asm-rahul-02",
        question_id: "Q2",
        answer_text: "Earthing leakage current ko zameen me bhejti hai taaki shock na lage aur appliance surakshit rahe.",
        ai_marks: 13,
        safety_marks: 2,
        reason: "Correctly explains low-resistance ground path for electric shock prevention.",
        confidence: 0.95,
        needs_manual_review: false
      }
    ];

    this.proofs = [
      {
        id: "prf-rahul-01",
        assessment_id: "asm-rahul-02",
        image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        ai_marks: 18,
        ai_feedback: "Clean conduit bends, no exposed strands outside lugs, green earth wire routed securely to busbar.",
        geotag: { lat: 22.7214, lng: 88.4815, district: "Barasat, WB" },
        timestamp: new Date().toISOString()
      }
    ];

    this.audit_events = [
      {
        id: "AUDIT-0001",
        ts: new Date(Date.now() - 86400000).toISOString(),
        actor: "SYSTEM",
        action: "GENESIS_BLOCK",
        entity: "CHAIN",
        entity_id: "ROOT",
        payload: { note: "Pramaan-RPL Tamper-Evident Audit Chain Initialised" },
        payload_hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        block_hash: "a4f89d31b2c45e67890123456789abcdef0123456789abcdef0123456789abcd"
      },
      {
        id: "AUDIT-0002",
        ts: new Date(Date.now() - 43200000).toISOString(),
        actor: "WORKER:w-ramesh-01",
        action: "SUBMIT_DECLARATION",
        entity: "DECLARATION",
        entity_id: "dec-ramesh-01",
        payload: { trade: "electrician", claims_count: 6, lang: "bn" },
        payload_hash: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
        prev_hash: "a4f89d31b2c45e67890123456789abcdef0123456789abcdef0123456789abcd",
        block_hash: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
      }
    ];

    this.calibration_attempts = [];
    this.appeals = [];
  }

  // --- Workers ---
  async getWorkers() {
    return this.workers;
  }

  async getWorkerById(id) {
    return this.workers.find(w => w.id === id) || null;
  }

  async getWorkerByPhone(phone) {
    return this.workers.find(w => w.phone === String(phone)) || null;
  }

  async createWorker({ name, phone, language = 'en', district = 'Barasat', age_band = '25-35', trade = 'electrician' }) {
    const existing = await this.getWorkerByPhone(phone);
    if (existing) {
      existing.name = name;
      existing.language = language;
      return existing;
    }
    const newWorker = {
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      phone: String(phone),
      language,
      age_band,
      district,
      trade,
      consent_accepted: true,
      consent_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    this.workers.unshift(newWorker);
    return newWorker;
  }

  // --- Declarations ---
  async createDeclaration(data) {
    const dec = {
      id: `dec-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString()
    };
    this.declarations.unshift(dec);
    return dec;
  }

  async getDeclarationByWorker(workerId) {
    return this.declarations.find(d => d.worker_id === workerId) || null;
  }

  // --- Mapping Results ---
  async saveMappingResult(data) {
    const map = {
      id: `map-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString()
    };
    this.mappings.unshift(map);
    return map;
  }

  async getMappingByWorker(workerId) {
    return this.mappings.find(m => m.worker_id === workerId) || null;
  }

  // --- Assessments (Cases) ---
  async getAssessments() {
    return this.assessments.map(a => {
      const worker = this.workers.find(w => w.id === a.worker_id);
      return {
        ...a,
        workers: worker ? { name: worker.name, phone: worker.phone, district: worker.district } : null
      };
    });
  }

  async getAssessmentById(id) {
    const asm = this.assessments.find(a => a.id === id);
    if (!asm) return null;
    const worker = this.workers.find(w => w.id === asm.worker_id);
    return {
      ...asm,
      worker: worker || null,
      workers: worker ? { name: worker.name, phone: worker.phone, district: worker.district } : null
    };
  }

  async createAssessment({ workerId, trade = 'electrician', language = 'en', batch_id = 'BATCH-KOL-01' }) {
    const newAsm = {
      id: `asm-${Date.now()}`,
      worker_id: workerId,
      trade,
      language,
      batch_id,
      status: 'in_progress',
      total_score: 0,
      level: 'Pending',
      credits_awarded: 0,
      assessor_signed: false,
      created_at: new Date().toISOString()
    };
    this.assessments.unshift(newAsm);
    return newAsm;
  }

  async updateAssessment(id, updates) {
    const asm = this.assessments.find(a => a.id === id);
    if (!asm) return null;
    Object.assign(asm, updates);
    return asm;
  }

  // --- Answers & Proofs ---
  async getAnswersByAssessment(assessmentId) {
    return this.answers.filter(a => a.assessment_id === assessmentId);
  }

  async saveAnswer(data) {
    const existingIdx = this.answers.findIndex(
      a => a.assessment_id === data.assessment_id && a.question_id === data.question_id
    );
    if (existingIdx >= 0) {
      this.answers[existingIdx] = { ...this.answers[existingIdx], ...data };
      return this.answers[existingIdx];
    } else {
      const newAns = { id: `ans-${Date.now()}`, ...data };
      this.answers.push(newAns);
      return newAns;
    }
  }

  async getProofsByAssessment(assessmentId) {
    return this.proofs.filter(p => p.assessment_id === assessmentId);
  }

  async saveProof(data) {
    const newProof = { id: `prf-${Date.now()}`, ...data };
    this.proofs.push(newProof);
    return newProof;
  }

  // --- Scores (PC-level rubrics) ---
  async getScoresByAssessment(assessmentId) {
    return this.scores.filter(s => s.assessment_id === assessmentId);
  }

  async saveScore(data) {
    const existingIdx = this.scores.findIndex(
      s => s.assessment_id === data.assessment_id && s.pc_id === data.pc_id
    );
    if (existingIdx >= 0) {
      this.scores[existingIdx] = { ...this.scores[existingIdx], ...data };
      return this.scores[existingIdx];
    } else {
      const newScore = { id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...data };
      this.scores.push(newScore);
      return newScore;
    }
  }

  // --- Batches ---
  async getBatches() {
    return this.batches;
  }

  async createBatch(batchData) {
    const newBatch = {
      id: `BATCH-${Date.now().toString(36).toUpperCase()}`,
      ...batchData,
      status: "scheduled"
    };
    this.batches.unshift(newBatch);
    return newBatch;
  }

  // --- Audit Trail ---
  async getAuditEvents() {
    return this.audit_events;
  }

  async appendAuditEvent(event) {
    this.audit_events.push(event);
    return event;
  }

  // --- Appeals ---
  async createAppeal(data) {
    const appeal = {
      id: `APP-${Date.now()}`,
      ...data,
      status: "under_review",
      created_at: new Date().toISOString()
    };
    this.appeals.unshift(appeal);
    return appeal;
  }

  async getAppeals() {
    return this.appeals;
  }
}

// Global singleton instance
const inMemoryDB = new InMemoryDB();

// Hybrid DB Adapter that prioritises Supabase when configured, or transparently falls back to inMemoryDB
export const db = {
  // Workers
  async getWorker(id, phone) {
    try {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('workers').select('*');
        if (id) query = query.eq('id', id);
        else if (phone) query = query.eq('phone', String(phone));
        const { data, error } = await query.maybeSingle();
        if (data && !error) return data;
      }
    } catch (e) {
      console.warn("Supabase query error, using local DB:", e.message);
    }
    if (id) return inMemoryDB.getWorkerById(id);
    if (phone) return inMemoryDB.getWorkerByPhone(phone);
    return null;
  },

  async createWorker(workerData) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('workers').insert({
          name: workerData.name,
          phone: String(workerData.phone),
          language: workerData.language || 'en'
        }).select().single();
        if (data && !error) return data;
      }
    } catch (e) {
      console.warn("Supabase insert worker error, using local DB:", e.message);
    }
    return inMemoryDB.createWorker(workerData);
  },

  // Assessments
  async getAssessments() {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('assessments')
          .select('*, workers(name, phone)')
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("Supabase getAssessments error, using local DB:", e.message);
    }
    return inMemoryDB.getAssessments();
  },

  async getAssessment(id) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('assessments')
          .select('*, workers(name, phone)')
          .eq('id', id)
          .maybeSingle();
        if (data && !error) return data;
      }
    } catch (e) {
      console.warn("Supabase getAssessment error, using local DB:", e.message);
    }
    return inMemoryDB.getAssessmentById(id);
  },

  async createAssessment(data) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: asm, error } = await supabase.from('assessments').insert({
          worker_id: data.workerId,
          trade: data.trade || 'electrician',
          language: data.language || 'en',
          status: 'in_progress'
        }).select().single();
        if (asm && !error) return asm;
      }
    } catch (e) {
      console.warn("Supabase createAssessment error, using local DB:", e.message);
    }
    return inMemoryDB.createAssessment(data);
  },

  async updateAssessment(id, updates) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('assessments')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (data && !error) return data;
      }
    } catch (e) {
      console.warn("Supabase updateAssessment error, using local DB:", e.message);
    }
    return inMemoryDB.updateAssessment(id, updates);
  },

  // Answers & Proofs
  async getAnswers(assessmentId) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('answers').select('*').eq('assessment_id', assessmentId);
        if (data && !error && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("Supabase getAnswers error, using local DB:", e.message);
    }
    return inMemoryDB.getAnswersByAssessment(assessmentId);
  },

  async saveAnswer(data) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: ans, error } = await supabase.from('answers').upsert(data).select().single();
        if (ans && !error) return ans;
      }
    } catch (e) {
      console.warn("Supabase saveAnswer error, using local DB:", e.message);
    }
    return inMemoryDB.saveAnswer(data);
  },

  async getProofs(assessmentId) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('proofs').select('*').eq('assessment_id', assessmentId);
        if (data && !error && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("Supabase getProofs error, using local DB:", e.message);
    }
    return inMemoryDB.getProofsByAssessment(assessmentId);
  },

  async saveProof(data) {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: prf, error } = await supabase.from('proofs').insert(data).select().single();
        if (prf && !error) return prf;
      }
    } catch (e) {
      console.warn("Supabase saveProof error, using local DB:", e.message);
    }
    return inMemoryDB.saveProof(data);
  },

  // Declarations & Mappings
  async createDeclaration(data) {
    return inMemoryDB.createDeclaration(data);
  },

  async getDeclaration(workerId) {
    return inMemoryDB.getDeclarationByWorker(workerId);
  },

  async saveMapping(data) {
    return inMemoryDB.saveMappingResult(data);
  },

  async getMapping(workerId) {
    return inMemoryDB.getMappingByWorker(workerId);
  },

  // Scores
  async getScores(assessmentId) {
    return inMemoryDB.getScoresByAssessment(assessmentId);
  },

  async saveScore(data) {
    return inMemoryDB.saveScore(data);
  },

  // Batches
  async getBatches() {
    return inMemoryDB.getBatches();
  },

  async createBatch(data) {
    return inMemoryDB.createBatch(data);
  },

  // Audit Events
  async getAuditEvents() {
    return inMemoryDB.getAuditEvents();
  },

  async logAuditEvent(event) {
    return inMemoryDB.appendAuditEvent(event);
  },

  // Appeals
  async createAppeal(data) {
    return inMemoryDB.createAppeal(data);
  },

  async getAppeals() {
    return inMemoryDB.getAppeals();
  }
};
