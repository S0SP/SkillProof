import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditEvent } from '@/lib/cryptoLog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const batches = await db.getBatches();
    return NextResponse.json({ batches });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, venue, date, assessor_name, target_size = 24, equipment_checklist } = body;

    const newBatch = await db.createBatch({
      name: name || `Batch-${Date.now().toString(36).toUpperCase()}`,
      venue: venue || 'Barasat Govt ITI Hub',
      date: date || new Date().toISOString().split('T')[0],
      assessor_name: assessor_name || 'Mrs. S. Das (Certified ToA)',
      target_size: Number(target_size) || 24,
      tools_ready: true,
      equipment_checklist: equipment_checklist || [
        { name: "Safe 230V Test Boards with MCB DIN Rails", checked: true },
        { name: "Digital Multimeters & Neon Testers (1000V)", checked: true },
        { name: "Earth Resistance Ground Meggers", checked: true },
        { name: "Insulated Wire Strippers & Pliers", checked: true },
        { name: "First Aid Kit with Non-conductive Sheath", checked: true }
      ]
    });

    const auditEvent = await createAuditEvent({
      actor: "COORDINATOR",
      action: "CREATE_ASSESSMENT_BATCH",
      entity: "BATCH",
      entity_id: newBatch.id,
      payload: { name: newBatch.name, target_size: newBatch.target_size }
    });
    await db.logAuditEvent(auditEvent);

    return NextResponse.json({ batch: newBatch, audit_hash: auditEvent.block_hash });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
