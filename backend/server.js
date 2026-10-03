require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
// Increase JSON payload limit for image uploads
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3002;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/api/questions', (req, res) => {
  const filePath = path.join(__dirname, '..', 'electrician.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Questions not found' });
  }
});

app.post('/api/workers', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone || phone.length !== 10) {
    return res.status(400).json({ error: 'Invalid name or phone' });
  }
  
  const { data, error } = await supabase
    .from('workers')
    .insert({ name, phone, language: 'en' })
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ worker: data });
});

app.post('/api/assessments', async (req, res) => {
  const { workerId, trade, language } = req.body;
  const { data, error } = await supabase
    .from('assessments')
    .insert({ worker_id: workerId, trade, language, status: 'in_progress' })
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ assessment: data });
});

app.post('/api/score-answer', async (req, res) => {
  const { assessmentId, questionId, text, language } = req.body;
  
  const { data: existingAnswer } = await supabase.from('answers').select('*').eq('assessment_id', assessmentId).eq('question_id', questionId).maybeSingle();
  if (existingAnswer && existingAnswer.ai_marks != null) {
    const { data, error } = await supabase.from('answers').update({ answer_text: text }).eq('id', existingAnswer.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ result: data });
  }

  const filePath = path.join(__dirname, '..', 'electrician.json');
  let qData;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    qData = JSON.parse(data);
  } catch (err) {
    return res.status(500).json({ error: 'Could not load questions' });
  }

  const question = qData.questions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const systemPrompt = `You are a skill assessor for Electricians in India.
Your ONLY job is to check if the worker's answer contains the meanings or keywords of the provided 'Correct points'.
Do NOT deduct marks for bad grammar, broken English/Hindi, spelling mistakes, or mixed languages.
Reply with ONLY valid JSON, no extra text.`;

  const userPrompt = `Question: ${language === 'hi' ? question.question_hi : question.question_en}
Max marks: 20
Correct points: ${question.correct_points.join(' | ')}
Worker answer: ${text}

Required JSON:
{
 "marks": number from 0 to 20,
 "reason": "one short simple sentence in the worker's language"
}`;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const getAIResult = async (retryCount = 0) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text(); 
        throw new Error(errText);
      }

      const data = await response.json();
      const jsonStr = data.choices[0].message.content;
      const parsed = JSON.parse(jsonStr);
      
      if (typeof parsed.marks !== 'number' || parsed.marks > 20) {
        throw new Error("Invalid marks");
      }
      return parsed;
    } catch (err) {
      console.error("AI Error:", err.message);
      if (retryCount === 0) {
        return getAIResult(1);
      } else if (retryCount === 1) {
        await sleep(3000);
        return getAIResult(2);
      }
      return null;
    }
  };

  const aiResult = await getAIResult();
  
  const finalResult = {
    assessment_id: assessmentId,
    question_id: questionId,
    answer_text: text,
    needs_manual_review: false,
    low_confidence: false,
    ai_marks: null,
    reason: 'Needs assessor check'
  };

  if (!aiResult) {
    finalResult.needs_manual_review = true;
  } else {
    finalResult.ai_marks = aiResult.marks;
    finalResult.reason = aiResult.reason;
  }

  let data, error;
  if (existingAnswer) {
    ({ data, error } = await supabase.from('answers').update(finalResult).eq('id', existingAnswer.id).select().single());
  } else {
    ({ data, error } = await supabase.from('answers').insert(finalResult).select().single());
  }
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ result: data });
});

app.post('/api/score-proof', async (req, res) => {
  const { assessmentId, imageBase64, skipped } = req.body;
  
  if (skipped) {
    const proofResult = {
      assessment_id: assessmentId,
      skipped: true,
      ai_marks: 0,
      notes: "Proof skipped by worker."
    };
    const { data, error } = await supabase.from('proofs').insert(proofResult).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ result: data });
  }

  // Handle Image Upload to Supabase Storage
  let fileUrl = null;
  if (imageBase64) {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `proof_${Date.now()}.jpg`;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('proofs')
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: false
        });
        
      if (storageError) throw storageError;
      
      const { data: publicUrlData } = supabase.storage.from('proofs').getPublicUrl(filename);
      fileUrl = publicUrlData.publicUrl;
    } catch (err) {
      console.error("Storage error", err);
    }
  }

  // Mock AI result
  const proofResult = {
    assessment_id: assessmentId,
    file_url: fileUrl,
    skipped: false,
    ai_marks: 15,
    good_points: ["Neat wiring", "Correct tools used"],
    problems: ["Minor insulation issue visible"],
    notes: "Electrical work is good but ensure proper insulation on all joints."
  };
  
  const { data, error } = await supabase.from('proofs').insert(proofResult).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ result: data });
});

app.post('/api/finish-assessment', async (req, res) => {
  const { assessmentId } = req.body;
  
  const { data: answers } = await supabase.from('answers').select('*').eq('assessment_id', assessmentId);
  
  let grandTotal = 0;

  if (answers) {
    answers.forEach(a => {
      grandTotal += (a.ai_marks || 0);
    });
  }

  let level = "Beginner";
  if (grandTotal >= 40 && grandTotal < 70) level = "Skilled";
  if (grandTotal >= 70) level = "Expert";

  const { data: assessment, error } = await supabase
    .from('assessments')
    .update({
      total_score: grandTotal,
      level,
      status: 'waiting_for_assessor'
    })
    .eq('id', assessmentId)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });

  res.json({ 
    score: grandTotal, 
    level 
  });
});

app.post('/api/assessor/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ASSESSOR_PASSWORD) {
    res.json({ success: true, token: 'assessor-token' });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

app.get('/api/assessments/all', async (req, res) => {
  const { data: assessments, error } = await supabase.from('assessments').select('*, workers(name)');
  if (error) return res.status(500).json({ error: error.message });
  
  const { data: answers } = await supabase.from('answers').select('assessment_id, needs_manual_review, low_confidence');
  
  const list = assessments.map(a => {
    const ans = answers.filter(ans => ans.assessment_id === a.id);
    const needsCheck = ans.some(ans => ans.needs_manual_review || ans.low_confidence);
    return {
      ...a,
      workerName: a.workers ? a.workers.name : 'Unknown',
      needsCheck,
      score: a.total_score,
      startTime: a.created_at
    };
  });
  list.sort((a, b) => (b.needsCheck === true) - (a.needsCheck === true));
  res.json({ assessments: list });
});

app.get('/api/assessments/:id', async (req, res) => {
  const { data: assessment, error } = await supabase.from('assessments').select('*, workers(*)').eq('id', req.params.id).single();
  if (error || !assessment) return res.status(404).json({ error: 'Not found' });
  
  const { data: answers } = await supabase.from('answers').select('*').eq('assessment_id', assessment.id);
  const { data: proofs } = await supabase.from('proofs').select('*').eq('assessment_id', assessment.id);
  
  // Format to match old UI expectations
  const formattedAnswers = [];
  if (answers) {
    answers.forEach(a => {
      formattedAnswers.push({
        id: a.id,
        questionId: a.question_id,
        text: a.answer_text,
        marks: a.final_marks !== null ? a.final_marks : a.ai_marks,
        ai_marks: a.ai_marks,
        reason: a.reason,
        needs_manual_review: a.needs_manual_review
      });
    });
  }
  if (proofs && proofs.length > 0) {
    const p = proofs[0];
    formattedAnswers.push({
      id: p.id,
      skipped: p.skipped,
      imageBase64: p.file_url,
      marks: p.final_marks !== null ? p.final_marks : p.ai_marks,
      ai_marks: p.ai_marks,
      reason: p.notes,
      good_points: p.good_points,
      problems: p.problems
    });
  }

  res.json({ 
    assessment: { ...assessment, startTime: assessment.created_at }, 
    worker: assessment.workers, 
    answers: formattedAnswers 
  });
});

app.post('/api/assessments/:id/approve', async (req, res) => {
  const { finalAnswers, comment } = req.body; 
  const assessmentId = req.params.id;

  const { data: oldAnswers } = await supabase.from('answers').select('*').eq('assessment_id', assessmentId);

  let grandTotal = 0;

  for (const fa of finalAnswers) {
    const oAns = oldAnswers?.find(a => a.id === fa.id);
    if (oAns) {
      await supabase.from('answers').update({ final_marks: fa.marks }).eq('id', oAns.id);
      grandTotal += fa.marks;
    }
  }

  let level = "Beginner";
  if (grandTotal >= 40 && grandTotal < 70) level = "Skilled";
  if (grandTotal >= 70) level = "Expert";

  await supabase.from('assessments').update({
    total_score: grandTotal,
    level,
    status: 'approved',
    assessor_comment: comment,
    approved_time: new Date().toISOString()
  }).eq('id', assessmentId);

  res.json({ success: true });
});

app.get('/api/result/:assessmentId', async (req, res) => {
    const { data: assessment, error } = await supabase.from('assessments').select('*').eq('id', req.params.assessmentId).single();
    if (error || !assessment) return res.status(404).json({ error: 'Not found' });
    const { data: answers } = await supabase.from('answers').select('*').eq('assessment_id', assessment.id);
    res.json({ assessment, answers });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
