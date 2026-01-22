import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    users: 0,
    bookings: 0,
    revenue: 0,
  });
}
