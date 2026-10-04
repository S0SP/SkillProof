import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');

    if (!id && !phone) {
      return NextResponse.json({ error: 'Missing id or phone' }, { status: 400 });
    }

    const worker = await db.getWorker(id, phone);
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json({ worker });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, language = 'en', district = 'Barasat', age_band = '25-35', trade = 'electrician' } = body;

    if (!name || !phone || String(phone).length !== 10) {
      return NextResponse.json({ error: 'Please enter a valid name and 10-digit phone number' }, { status: 400 });
    }

    const worker = await db.createWorker({
      name,
      phone: String(phone),
      language,
      district,
      age_band,
      trade
    });

    return NextResponse.json({ worker });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
