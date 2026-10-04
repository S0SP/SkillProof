import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditEvent } from '@/lib/cryptoLog';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const assessments = await db.getAssessments();
    return NextResponse.json({ assessments });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { workerId, trade = 'electrician', language = 'en', batch_id = 'BATCH-KOL-01' } = body;

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 });
    }

    const assessment = await db.createAssessment({
      workerId,
      trade,
      language,
      batch_id
    });

    const auditEvent = await createAuditEvent({
      actor: `SYSTEM`,
      action: "CREATE_ASSESSMENT_CASE",
      entity: "ASSESSMENT",
      entity_id: assessment.id,
      payload: { workerId, trade, batch_id }
    });
    await db.logAuditEvent(auditEvent);

    return NextResponse.json({ assessment, audit_hash: auditEvent.block_hash });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
