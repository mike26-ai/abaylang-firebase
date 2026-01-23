import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const db = adminDb();
    if (!db) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");
    if (!tutorId) return NextResponse.json({ error: "Missing tutorId" }, { status: 400 });
    
    const bookingsRef = db.collection("bookings");
    const q = bookingsRef.where("tutorId", "==", tutorId);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json([]);
    }
    
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
