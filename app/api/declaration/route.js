import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClaimsFromText, runQualificationMapping } from '@/lib/mappingEngine';
import { createAuditEvent } from '@/lib/cryptoLog';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { workerId, transcript, customClaims, trade = 'electrician', hasDocuments = false, affidavitAccepted = false } = body;

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 });
    }

    // Extract claims from voice transcript or use confirmed custom claims
    const claims = customClaims || extractClaimsFromText(transcript, trade);
    
    // Run deterministic code mapping (never LLM arithmetic)
    const mapping = runQualificationMapping(claims, trade);

    // Save declaration
    const declaration = await db.createDeclaration({
      worker_id: workerId,
      transcript: transcript || '',
      trade,
      has_documents: hasDocuments,
      affidavit_accepted: affidavitAccepted,
      task_claims: claims
    });

    // Save mapping result
    const savedMapping = await db.saveMapping({
      worker_id: workerId,
      declaration_id: declaration.id,
      ...mapping
    });

    // Append tamper-evident audit event
    const auditEvent = await createAuditEvent({
      actor: `WORKER:${workerId}`,
      action: "SUBMIT_SELF_DECLARATION",
      entity: "DECLARATION",
      entity_id: declaration.id,
      payload: {
        trade,
        claims_count: claims.length,
        coverage_pct: mapping.coverage_pct,
        route: mapping.route
      }
    });
    await db.logAuditEvent(auditEvent);

    return NextResponse.json({
      declaration,
      mapping: savedMapping,
      audit_hash: auditEvent.block_hash
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 });
    }

    const declaration = await db.getDeclaration(workerId);
    const mapping = await db.getMapping(workerId);

    return NextResponse.json({ declaration, mapping });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
