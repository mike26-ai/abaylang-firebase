// File: src/app/api/group-sessions/cancel/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';

const CancelGroupSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required."),
});

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
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
    
    const bookingsRef = adminDb.collection('bookings');
    const bookingsQuery = bookingsRef.where('groupSessionId', '==', sessionId);
    const bookingsSnapshot = await bookingsQuery.get();
    
    if (!bookingsSnapshot.empty) {
        const batch = adminDb.batch();
        bookingsSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { 
                status: 'cancelled-by-admin',
                cancellationReason: 'The group session was cancelled by the administrator.'
            });
        });
        await batch.commit();
    }

    const sessionRef = adminDb.collection('groupSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
        throw new Error("Session not found.");
    }
    await sessionRef.update({ status: 'cancelled' });


    return NextResponse.json({ success: true, message: 'Session and all associated bookings have been cancelled.' }, { status: 200 });

  } catch (error: any) {
    console.error('API Error (/group-sessions/cancel):', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel group session.', details: error.message }, { status: 500 });
  }
}
