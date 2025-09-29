
import { NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";

// Initialize admin SDK
initAdmin();
const db = getFirestore();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");
    if (!tutorId) return NextResponse.json({ error: "Missing tutorId" }, { status: 400 });

    const q = query(collection(db, "bookings"), where("tutorId", "==", tutorId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
