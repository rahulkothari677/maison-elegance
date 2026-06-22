import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dob: true,
      gender: true,
      avatar: true,
      memberSince: true,
      tier: true,
      loyaltyPoints: true,
      lifetimeSpend: true,
    },
  });

  if (!fullUser) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ user: fullUser });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;
  const body = await req.json();

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name: body.name,
      phone: body.phone,
      dob: body.dob,
      gender: body.gender,
      avatar: body.avatar,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dob: true,
      gender: true,
      avatar: true,
      memberSince: true,
      tier: true,
      loyaltyPoints: true,
      lifetimeSpend: true,
    },
  });

  return NextResponse.json({ user: updated });
}
