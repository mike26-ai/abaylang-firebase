

// File: src/app/api/group-sessions/cancel/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, initAdmin } from '@/lib/firebase-admin';
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
    
    // Use a transaction to ensure atomicity
    await adminDb.runTransaction(async (transaction) => {
        const sessionRef = adminDb.collection('groupSessions').doc(sessionId);
        const sessionDoc = await transaction.get(sessionRef);

        if (!sessionDoc.exists) {
            throw new Error("Session not found.");
        }
        
        // 1. Update the group session status
        transaction.update(sessionRef, { status: 'cancelled' });

        // 2. Find all bookings associated with this group session
        const bookingsRef = adminDb.collection('bookings');
        const bookingsQuery = bookingsRef.where('groupSessionId', '==', sessionId);
        const bookingsSnapshot = await transaction.get(bookingsQuery);
        
        // 3. Update the status of each associated booking to 'cancelled-by-admin'
        bookingsSnapshot.docs.forEach(doc => {
            transaction.update(doc.ref, { 
                status: 'cancelled-by-admin',
                cancellationReason: 'The group session was cancelled by the administrator.'
            });
        });
    });

    return NextResponse.json({ success: true, message: 'Session and all associated bookings have been cancelled.' }, { status: 200 });

  } catch (error: any) {
    console.error('API Error (/group-sessions/cancel):', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel group session.', details: error.message }, { status: 500 });
  }
}
