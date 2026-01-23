// File: src/app/api/group-sessions/route.ts
import { NextResponse } from 'next/server';
import { adminDb, Timestamp } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    const now = new Date();
    // Fetch all scheduled sessions that have not ended yet.
    const sessionsSnapshot = await adminDb.collection('groupSessions')
      .where('status', '==', 'scheduled')
      .where('startTime', '>', now) // Only fetch future sessions
      .orderBy('startTime', 'asc') // Order them from soonest to latest
      .get();
      
    if (sessionsSnapshot.empty) {
        return NextResponse.json({ success: true, data: [] });
    }
      
    const sessions = sessionsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startTime: (data.startTime as typeof Timestamp).toDate().toISOString(),
          endTime: (data.endTime as typeof Timestamp).toDate().toISOString(),
          createdAt: (data.createdAt as typeof Timestamp).toDate().toISOString(),
        };
      });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('API Error (/api/group-sessions):', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch group sessions.' }, { status: 500 });
  }
}
