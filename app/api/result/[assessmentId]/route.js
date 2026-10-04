import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { assessmentId } = params;

    const assessment = await db.getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const answers = await db.getAnswers(assessmentId);
    const proofs = await db.getProofs(assessmentId);
    const scores = await db.getScores(assessmentId);

    return NextResponse.json({
      assessment,
      worker: assessment.worker,
      answers: answers || [],
      proofs: proofs || [],
      scores: scores || []
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
