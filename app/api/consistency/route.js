import { NextResponse } from 'next/server';
import { getConsistencyExperimentData } from '@/lib/consistencyEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = getConsistencyExperimentData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
