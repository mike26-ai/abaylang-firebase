// File: src/app/api/group-sessions/cancel/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, initAdmin, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';

initAdmin();

const CancelGroupSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required."),
});

export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    
    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const validation = CancelGroupSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { sessionId } = validation.data;
    const sessionRef = adminDb.collection('groupSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
    }

    // TODO: In a future version, you could add logic here to notify registered users via email.
    // For now, we just update the status as planned.

    await sessionRef.update({
        status: 'cancelled',
    });

    return NextResponse.json({ success: true, message: 'Session successfully cancelled.' }, { status: 200 });

  } catch (error: any) {
    console.error('API Error (/group-sessions/cancel):', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel group session.', details: error.message }, { status: 500 });
  }
}
