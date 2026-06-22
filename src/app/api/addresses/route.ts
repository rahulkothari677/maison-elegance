import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;
  const body = await req.json();

  // If new address is default, unset others
  if (body.isDefault) {
    await db.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await db.address.create({
    data: {
      userId: user.id,
      label: body.label,
      fullName: body.fullName,
      line1: body.line1,
      line2: body.line2 || null,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      phone: body.phone,
      isDefault: body.isDefault || false,
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
