import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    configured: !!process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
  });
}
