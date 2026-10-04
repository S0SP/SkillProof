const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding data to Supabase...");

  // 1. Create Workers
  const { data: w1 } = await supabase.from('workers').insert({ name: 'Rahul Kumar', phone: '9876543210', language: 'hi' }).select().single();
  const { data: w2 } = await supabase.from('workers').insert({ name: 'Amit Singh', phone: '9876543211', language: 'en' }).select().single();
  const { data: w3 } = await supabase.from('workers').insert({ name: 'Suresh Das', phone: '9876543212', language: 'hi' }).select().single();

  // 2. Create Assessments
  const { data: a1 } = await supabase.from('assessments').insert({ worker_id: w1.id, trade: 'electrician', language: 'hi', status: 'waiting_for_assessor', total_score: 85, level: 'Expert' }).select().single();
  const { data: a2 } = await supabase.from('assessments').insert({ worker_id: w2.id, trade: 'electrician', language: 'en', status: 'waiting_for_assessor', total_score: 55, level: 'Intermediate' }).select().single();
  const { data: a3 } = await supabase.from('assessments').insert({ worker_id: w3.id, trade: 'electrician', language: 'hi', status: 'waiting_for_assessor', total_score: 30, level: 'Beginner' }).select().single();

  // 3. Create Answers
  await supabase.from('answers').insert({
    assessment_id: a1.id, question_id: 'Q1', answer_text: 'MCB is reusable, fuse wire melts.', ai_marks: 14, safety_marks: 0, reason: 'Correct', confidence: 0.9, needs_manual_review: false, low_confidence: false
  });
  
  await supabase.from('answers').insert({
    assessment_id: a2.id, question_id: 'Q2', answer_text: 'earthing is good for switch.', ai_marks: 5, safety_marks: 1, reason: 'Unclear if worker understands full mechanism.', confidence: 0.5, needs_manual_review: false, low_confidence: true
  });
  
  await supabase.from('answers').insert({
    assessment_id: a3.id, question_id: 'Q3', answer_text: 'i dont know', ai_marks: 0, safety_marks: 0, reason: 'Could not generate AI score', confidence: 0, needs_manual_review: true, low_confidence: false
  });

  console.log("Seeding complete!");
}

seed().catch(console.error);
