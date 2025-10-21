
// File: src/app/api/group-sessions/route.ts
import { NextResponse } from 'next/server';
import { adminDb, initAdmin, Timestamp } from '@/lib/firebase-admin';

initAdmin();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = Timestamp.now();
    const sessionsSnapshot = await adminDb.collection('groupSessions')
      .where('status', '==', 'scheduled')
      .where('startTime', '>', now)
      .orderBy('startTime', 'asc')
      .get();
      
    const sessions = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        // Convert Timestamps to a serializable format (ISO strings)
        startTime: data.startTime.toDate().toISOString(),
        endTime: data.endTime.toDate().toISOString(),
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });
    
    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('API Error (/api/group-sessions):', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch group sessions.' }, { status: 500 });
  }
}
