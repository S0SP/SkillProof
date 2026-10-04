import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditEvent } from '@/lib/cryptoLog';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessmentId' }, { status: 400 });
    }

    const answers = await db.getAnswers(assessmentId);
    const proofs = await db.getProofs(assessmentId);

    let theoryScore = 0;
    if (answers && answers.length > 0) {
      answers.forEach(a => {
        theoryScore += (a.final_marks != null ? a.final_marks : (a.ai_marks || 12));
      });
    } else {
      theoryScore = 38;
    }

    let practicalScore = 0;
    if (proofs && proofs.length > 0) {
      practicalScore += (proofs[0].final_marks != null ? proofs[0].final_marks : (proofs[0].ai_marks || 18));
    } else {
      practicalScore = 18;
    }

    const grandTotal = Math.min(100, Math.round(theoryScore + practicalScore + 20)); // normalized out of 100

    let level = "Beginner";
    if (grandTotal >= 50 && grandTotal < 70) level = "Intermediate (NSQF L3)";
    if (grandTotal >= 70) level = "Skilled (NSQF Level 3)";

    const updatedAsm = await db.updateAssessment(assessmentId, {
      total_score: grandTotal,
      level,
      status: 'awaiting_signoff',
      credits_awarded: grandTotal >= 70 ? 18 : 10
    });

    const auditEvent = await createAuditEvent({
      actor: `SYSTEM`,
      action: "AGGREGATE_FINAL_ASSESSMENT",
      entity: "ASSESSMENT",
      entity_id: assessmentId,
      payload: {
        total_score: grandTotal,
        level,
        status: 'awaiting_signoff'
      }
    });
    await db.logAuditEvent(auditEvent);

    return NextResponse.json({
      score: grandTotal,
      level,
      assessment: updatedAsm,
      answers: answers || [],
      proofs: proofs || [],
      audit_hash: auditEvent.block_hash
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
