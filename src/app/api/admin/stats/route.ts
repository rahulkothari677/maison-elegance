import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue,
    recentOrders,
    topProducts,
    ordersByStatus,
  ] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
    db.order.aggregate({ _sum: { total: true } }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { items: true, user: true },
    }),
    db.orderItem.groupBy({
      by: ["productId", "name", "image"],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  // Calculate revenue by day for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentOrdersWithDates = await db.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { total: true, createdAt: true },
  });

  const revenueByDay = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayRevenue = recentOrdersWithDates
      .filter(
        (o) => o.createdAt.toISOString().split("T")[0] === dateStr
      )
      .reduce((sum, o) => sum + o.total, 0);
    return {
      date: dateStr,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayRevenue,
    };
  });

  return NextResponse.json({
    stats: {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.total || 0,
      avgOrderValue:
        totalOrders > 0
          ? Math.round((totalRevenue._sum.total || 0) / totalOrders)
          : 0,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      customerName: o.user?.name || o.guestEmail || "Guest",
      itemCount: o.items.length,
    })),
    topProducts: topProducts.map((p) => ({
      name: p.name,
      image: p.image,
      unitsSold: p._sum.quantity,
      orderCount: p._count.id,
    })),
    ordersByStatus: ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    revenueByDay,
  });
}
