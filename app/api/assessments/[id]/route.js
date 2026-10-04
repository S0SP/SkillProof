import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditEvent } from '@/lib/cryptoLog';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const assessment = await db.getAssessment(id);

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const answers = await db.getAnswers(id);
    const proofs = await db.getProofs(id);
    const scores = await db.getScores(id);
    const declaration = await db.getDeclaration(assessment.worker_id);
    const mapping = await db.getMapping(assessment.worker_id);

    return NextResponse.json({
      assessment,
      worker: assessment.worker,
      answers: answers || [],
      proofs: proofs || [],
      scores: scores || [],
      declaration,
      mapping
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    const updated = await db.updateAssessment(id, updates);

    const auditEvent = await createAuditEvent({
      actor: `ASSESSOR`,
      action: "UPDATE_ASSESSMENT_STATE",
      entity: "ASSESSMENT",
      entity_id: id,
      payload: updates
    });
    await db.logAuditEvent(auditEvent);

    return NextResponse.json({ assessment: updated, audit_hash: auditEvent.block_hash });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
