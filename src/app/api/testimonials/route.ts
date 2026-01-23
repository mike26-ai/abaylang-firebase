// File: src/app/api/testimonials/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    
    const testimonialsRef = adminDb.collection("testimonials");
    const q = testimonialsRef.where("status", "==", "approved").orderBy("createdAt", "desc");
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json([]);
    }
    
    const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return { 
            id: doc.id, 
            ...docData,
            // Ensure timestamp is serialized
            createdAt: docData.createdAt.toDate().toISOString(),
        }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
