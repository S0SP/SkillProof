import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { finalAnswers = [], comment = '' } = body;

    const { data: oldAnswers } = await supabase
      .from('answers')
      .select('*')
      .eq('assessment_id', id);

    let grandTotal = 0;

    for (const fa of finalAnswers) {
      const oAns = (oldAnswers || []).find(a => a.id === fa.id);
      if (oAns) {
        await supabase
          .from('answers')
          .update({ final_marks: fa.marks })
          .eq('id', oAns.id);
        grandTotal += Number(fa.marks) || 0;
      }
    }

    let level = "Beginner";
    if (grandTotal >= 40 && grandTotal < 70) level = "Intermediate";
    if (grandTotal >= 70) level = "Expert";

    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        total_score: grandTotal,
        level,
        status: 'approved',
        assessor_comment: comment,
        approved_time: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, score: grandTotal, level });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
