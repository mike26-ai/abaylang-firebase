
import { NextResponse } from "next/server";
import { initAdmin, adminDb } from "@/lib/firebase-admin";

// Initialize admin SDK
initAdmin();

export const dynamic = 'force-dynamic'; // This line is added

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");
    if (!tutorId) return NextResponse.json({ error: "Missing tutorId" }, { status: 400 });
    
    // FIX: Use the correct Admin SDK syntax for querying.
    // The previous code was mixing client SDK functions (query, collection, where) with the adminDb instance.
    const bookingsRef = adminDb.collection("bookings");
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
