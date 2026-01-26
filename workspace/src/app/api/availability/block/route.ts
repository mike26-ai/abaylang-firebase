import { NextResponse, type NextRequest } from "next/server";
import { adminDb, Timestamp as AdminTimestamp } from "@/lib/firebase-admin";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import { z } from "zod";
import { ADMIN_EMAIL } from "@/config/site";
import { _blockSlot } from "@/app/api/availability/service";

const auth = getAuth();

const BlockTimeSchema = z
  .object({
    tutorId: z.string().min(1),
    startISO: z.string().datetime(),
    endISO: z.string().datetime(),
    note: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.endISO) > new Date(data.startISO),
    {
      message: "End time must be after start time",
      path: ["endISO"],
    }
  );

export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers
      .get("Authorization")
      ?.split("Bearer ")[1];

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "No authentication token provided." },
        { status: 401 }
      );
    }

    const decodedToken: DecodedIdToken =
      await auth.verifyIdToken(idToken);

    const isAdmin =
      decodedToken.email === ADMIN_EMAIL ||
      decodedToken.admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "User does not have admin privileges." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = BlockTimeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await _blockSlot({
      ...parsed.data,
      decodedToken,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error (/availability/block):", error);

    if (error?.message?.includes("slot_already_booked")) {
      return NextResponse.json(
        {
          success: false,
          error: "This time slot is already booked by a student.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to block time slot.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
