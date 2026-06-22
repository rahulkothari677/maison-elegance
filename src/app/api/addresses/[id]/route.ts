import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;
  const { id } = await params;
  const body = await req.json();

  // Verify ownership
  const existing = await db.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.isDefault) {
    await db.address.updateMany({
      where: { userId: user.id, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const address = await db.address.update({
    where: { id },
    data: {
      label: body.label,
      fullName: body.fullName,
      line1: body.line1,
      line2: body.line2 || null,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      phone: body.phone,
      isDefault: body.isDefault,
    },
  });

  return NextResponse.json({ address });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;
  const { id } = await params;

  const existing = await db.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
