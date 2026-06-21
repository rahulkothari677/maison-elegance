import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      loyaltyPoints: true,
      lifetimeSpend: true,
      createdAt: true,
      avatar: true,
      _count: {
        select: { orders: true, reviews: true, wishlistItems: true },
      },
    },
    orderBy: { lifetimeSpend: "desc" },
  });

  return NextResponse.json({
    customers: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      tier: u.tier,
      loyaltyPoints: u.loyaltyPoints,
      lifetimeSpend: u.lifetimeSpend,
      joinedAt: u.createdAt,
      avatar: u.avatar,
      orderCount: u._count.orders,
      reviewCount: u._count.reviews,
      wishlistCount: u._count.wishlistItems,
    })),
  });
}
