import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { assessmentId } = body;

    const { data: answers } = await supabase
      .from('answers')
      .select('*')
      .eq('assessment_id', assessmentId);

    const { data: proofs } = await supabase
      .from('proofs')
      .select('*')
      .eq('assessment_id', assessmentId);

    let grandTotal = 0;

    if (answers) {
      answers.forEach(a => {
        grandTotal += (a.final_marks !== null && a.final_marks !== undefined ? a.final_marks : (a.ai_marks || 0));
      });
    }

    if (proofs && proofs.length > 0) {
      const p = proofs[0];
      grandTotal += (p.final_marks !== null && p.final_marks !== undefined ? p.final_marks : (p.ai_marks || 0));
    }

    let level = "Beginner";
    if (grandTotal >= 40 && grandTotal < 70) level = "Intermediate";
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      score: grandTotal,
      level,
      assessment,
      answers: answers || [],
      proofs: proofs || []
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
