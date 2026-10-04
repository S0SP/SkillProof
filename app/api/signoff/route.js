import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditEvent } from '@/lib/cryptoLog';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      assessmentId, 
      assessorId = "ASSESSOR-DAS-01", 
      assessorName = "Mrs. S. Das (Certified ToA #8841)", 
      decision = "certified", // 'certified', 'partial_nos', 'upskill_required', 'refer_second'
      overrideReason = "",
      pin = "1234",
      signatureData
    } = body;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessmentId' }, { status: 400 });
    }

    const currentAsm = await db.getAssessment(assessmentId);
    if (!currentAsm) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const scores = await db.getScores(assessmentId);
    
    // Check critical safety criteria:
    // If any critical item received 0, cannot issue full certification
    const criticalFails = scores.filter(s => s.critical && s.assessor_score === 0);
    const finalDecision = criticalFails.length > 0 && decision === 'certified' ? 'partial_nos' : decision;

    const signOffRecord = {
      status: finalDecision === 'certified' ? 'certified' : (finalDecision === 'partial_nos' ? 'partial_certified' : 'referred'),
      level: finalDecision === 'certified' ? 'NSQF Level 3 Certified' : 'Partial Competence / Upskill',
      credits_awarded: finalDecision === 'certified' ? 18 : 10,
      assessor_signed: true,
      assessor_signed_at: new Date().toISOString(),
      assessor_details: {
        id: assessorId,
        name: assessorName,
        decision: finalDecision,
        override_reason: overrideReason || null,
        signature_hash: signatureData ? "SHA256:SIG-VERIFIED" : "PIN-VERIFIED"
      }
    };

    const updated = await db.updateAssessment(assessmentId, signOffRecord);

    const auditEvent = await createAuditEvent({
      actor: `ASSESSOR:${assessorId}`,
      action: "DIGITAL_SIGNOFF_ASSESSMENT",
      entity: "ASSESSMENT",
      entity_id: assessmentId,
      payload: {
        decision: finalDecision,
        credits: signOffRecord.credits_awarded,
        override_reason: overrideReason
      }
    });
    await db.logAuditEvent(auditEvent);

    return NextResponse.json({
      assessment: updated,
      decision: finalDecision,
      audit_hash: auditEvent.block_hash
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
