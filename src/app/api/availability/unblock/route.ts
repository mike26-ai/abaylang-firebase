
import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, slot } = body;

    if (!date || !slot) {
      return NextResponse.json({ success: false, error: 'Missing date or slot' }, { status: 400 });
    }

    const db = getFirestore();
    const ref = db.collection('availability').doc(`${date}_${slot}`);

    await ref.delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API error (/availability/unblock):', err);
    return NextResponse.json(
      { success: false, error: 'Failed to unblock slot', details: err?.message },
      { status: 500 }
    );
  }
}
