import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { workerId, trade, language } = body;

    const { data, error } = await supabase
      .from('assessments')
      .insert({ worker_id: workerId, trade, language, status: 'in_progress' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assessment: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
