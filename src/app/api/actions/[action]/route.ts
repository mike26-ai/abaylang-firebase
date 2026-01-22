import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { action: string } }
) {
  return NextResponse.json({
    ok: true,
    action: params.action,
  });
}
