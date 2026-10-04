import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*, workers(*)')
      .eq('id', id)
      .single();

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const { data: answers } = await supabase
      .from('answers')
      .select('*')
      .eq('assessment_id', assessment.id);

    const { data: proofs } = await supabase
      .from('proofs')
      .select('*')
      .eq('assessment_id', assessment.id);

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

    return NextResponse.json({
      assessment: { ...assessment, startTime: assessment.created_at },
      worker: assessment.workers,
      answers: formattedAnswers
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
