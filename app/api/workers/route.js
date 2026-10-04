import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');

    let query = supabase.from('workers').select('*');
    if (id) {
      query = query.eq('id', id);
    } else if (phone) {
      query = query.eq('phone', phone);
    } else {
      return NextResponse.json({ error: 'Missing id or phone' }, { status: 400 });
    }

    const { data, error } = await query.single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ worker: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone || String(phone).length !== 10) {
      return NextResponse.json({ error: 'Invalid name or 10-digit phone number' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('workers')
      .insert({ name, phone: String(phone), language: 'en' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ worker: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
