import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status && status !== "all") {
    where.status = status;
  }

  const orders = await db.order.findMany({
    where,
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true, tier: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      subtotal: o.subtotal,
      shipping: o.shipping,
      tax: o.tax,
      shippingAddress: o.shippingAddress,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt,
      customer: o.user
        ? {
            name: o.user.name,
            email: o.user.email,
            tier: o.user.tier,
          }
        : { name: "Guest", email: o.guestEmail, tier: "Silver" },
      items: o.items,
    })),
  });
}
