import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = process.env.ASSESSOR_PASSWORD || 'skill123';

    if (password === expectedPassword) {
      return NextResponse.json({ success: true, token: 'assessor-token-' + Date.now() });
    } else {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
