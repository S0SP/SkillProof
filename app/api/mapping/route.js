import { NextResponse } from 'next/server';
import { runQualificationMapping, extractClaimsFromText } from '@/lib/mappingEngine';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { claims, transcript, trade = 'electrician' } = body;

    const taskClaims = claims || extractClaimsFromText(transcript, trade);
    const result = runQualificationMapping(taskClaims, trade);

    return NextResponse.json({ mapping: result, claims: taskClaims });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
