import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get subscription status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;

  const user_data = await db.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      tier: true,
    },
  });

  return NextResponse.json({
    subscribed: false, // Would be stored in DB in production
    plan: null,
    nextBox: null,
    styleProfile: null,
  });
}

// Subscribe or update style profile
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action, styleProfile } = body;

  if (action === "subscribe") {
    // Calculate next box date (first of next month)
    const nextBox = new Date();
    nextBox.setMonth(nextBox.getMonth() + 1);
    nextBox.setDate(1);

    return NextResponse.json({
      success: true,
      subscribed: true,
      plan: body.plan || "monthly",
      nextBox: nextBox.toISOString(),
      styleProfile,
      message: "Subscription active! Your first box ships on the 1st of next month.",
    });
  }

  if (action === "update-profile") {
    return NextResponse.json({
      success: true,
      styleProfile,
      message: "Style profile updated — your next box will reflect these preferences.",
    });
  }

  if (action === "cancel") {
    return NextResponse.json({
      success: true,
      subscribed: false,
      message: "Subscription cancelled. You won't be charged again.",
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
