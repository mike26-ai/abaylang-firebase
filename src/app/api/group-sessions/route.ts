// File: src/app/api/group-sessions/route.ts
import { NextResponse } from 'next/server';
import { adminDb, initAdmin } from '@/lib/firebase-admin';
import type { Timestamp } from 'firebase-admin/firestore';

initAdmin();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
          startTime: (data.startTime as Timestamp).toDate().toISOString(),
          endTime: (data.endTime as Timestamp).toDate().toISOString(),
          createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        };
      });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('API Error (/api/group-sessions):', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch group sessions.' }, { status: 500 });
  }
}
