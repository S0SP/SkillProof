import { NextResponse } from 'next/server';
import { getQuestionsData } from '@/lib/questions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = getQuestionsData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Questions not found' }, { status: 500 });
  }
}
