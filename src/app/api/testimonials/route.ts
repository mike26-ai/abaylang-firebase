// File: src/app/api/testimonials/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Securely fetches all 'approved' testimonials using the Firebase Admin SDK.
 * This route is publicly accessible but only exposes approved content.
 */
export async function GET() {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    const snapshot = await adminDb
      .collection("testimonials")
      .where("status", "==", "approved")
      .get();
      
    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    const testimonials = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    return NextResponse.json(testimonials);

  } catch (err: any) {
    console.error("API Error: /api/testimonials:", err);
    return NextResponse.json(
        { error: "Failed to load testimonials from server." },
        { status: 500 }
    );
  }
}
