import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/actions/auth.action";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ success: false, message: "Missing ID token" }, { status: 400 });
  }

  await setSessionCookie(idToken);
  return NextResponse.json({ success: true });
}