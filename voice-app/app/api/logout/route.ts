import { NextResponse } from "next/server";
import { signOut } from "@/lib/actions/auth.action";

export async function POST() {
  await signOut();
  return NextResponse.json({ success: true });
} 