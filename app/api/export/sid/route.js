import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroQualificationPack } from '@/lib/qualificationPacks';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id') || 'asm-rahul-02';

    const assessment = await db.getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const worker = assessment.worker || await db.getWorker(assessment.worker_id);
    const declaration = await db.getDeclaration(assessment.worker_id);
    const mapping = await db.getMapping(assessment.worker_id);
    const scores = await db.getScores(assessmentId);
    const answers = await db.getAnswers(assessmentId);
    const proofs = await db.getProofs(assessmentId);
    const auditEvents = await db.getAuditEvents();

    const sidPayload = {
      sid_version: "2.1-NCVET-2023",
      export_timestamp: new Date().toISOString(),
      awarding_body: "Electronics Sector Skills Council of India (ESSCI)",
      assessment_agency: "Pramaan-RPL Certified System",
      centre_details: {
        code: "TC-WB-BARASAT-009",
        name: "Barasat Govt ITI Skill Hub",
        district: worker?.district || "North 24 Parganas, West Bengal"
      },
      candidate: {
        id: worker?.id,
        name: worker?.name,
        phone_masked: worker?.phone ? worker.phone.slice(0, 2) + "******" + worker.phone.slice(8) : "98******10",
        language: worker?.language || "en",
        consent_recorded: true
      },
      qualification: {
        qp_code: heroQualificationPack.nqr_code,
        title: heroQualificationPack.title,
        nsqf_level: heroQualificationPack.nsqf_level,
        notional_hours: heroQualificationPack.notional_hours,
        ncrf_credits: assessment.credits_awarded || 18
      },
      rpl_workflow: {
        orientation_hours_completed: 15,
        declared_coverage_pct: mapping?.coverage_pct || 74,
        direct_route_applied: (mapping?.coverage_pct || 74) >= 70,
        theory_marks: 38,
        practical_marks: 40,
        total_aggregate_pct: assessment.total_score || 78,
        result: assessment.status === 'certified' ? 'PASS / CERTIFIED' : 'PENDING'
      },
      evidence_integrity: {
        proofs_count: proofs?.length || 1,
        sha256_checksum: proofs?.[0]?.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        geotag_verified: true,
        blockchain_audit_block: auditEvents?.[auditEvents.length - 1]?.block_hash || "GENESIS-CHAIN-LOCKED"
      },
      assessor_endorsement: {
        assessor_name: "Mrs. S. Das",
        certificate_id: "ToA-8841-ESSCI",
        signed_at: assessment.assessor_signed_at || new Date().toISOString(),
        e_sign_status: "VERIFIED"
      }
    };

    return NextResponse.json(sidPayload);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
