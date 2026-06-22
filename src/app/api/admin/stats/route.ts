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

  // 30-day revenue trend
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30Orders = await db.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { total: true, createdAt: true },
  });
  const revenueByDay30 = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayRevenue = last30Orders
      .filter((o) => o.createdAt.toISOString().split("T")[0] === dateStr)
      .reduce((sum, o) => sum + o.total, 0);
    return {
      date: dateStr,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayRevenue,
      orders: last30Orders.filter(
        (o) => o.createdAt.toISOString().split("T")[0] === dateStr
      ).length,
    };
  });

  // Sales by category
  const allOrderItems = await db.orderItem.findMany({
    select: { name: true, quantity: true, price: true },
  });
  const categoryRevenue: Record<string, number> = {};
  allOrderItems.forEach((item) => {
    // Derive category from product name (simplified)
    let cat = "Other";
    if (item.name.match(/coat|jacket|blazer/i)) cat = "Outerwear";
    else if (item.name.match(/dress|silk/i)) cat = "Women";
    else if (item.name.match(/shirt|suit|denim|jean/i)) cat = "Men";
    else if (item.name.match(/boot|sneaker|heel|shoe/i)) cat = "Footwear";
    else if (item.name.match(/bag|sunglass|watch|scarf|wallet/i)) cat = "Accessories";
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.price * item.quantity;
  });

  // Conversion funnel (simulated — in production would track real events)
  const totalOrdersAll = await db.order.count();
  const funnel = {
    visitors: totalOrdersAll * 12, // ~12x orders = visitors (industry avg)
    productViews: totalOrdersAll * 6,
    cartAdds: totalOrdersAll * 3,
    checkouts: Math.ceil(totalOrdersAll * 1.5),
    purchases: totalOrdersAll,
  };

  // Customer cohort (by signup month)
  const allUsers = await db.user.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const cohorts: Record<string, number> = {};
  allUsers.forEach((u) => {
    const key = u.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    cohorts[key] = (cohorts[key] || 0) + 1;
  });

  // AOV trend (last 7 days)
  const aovByDay = revenueByDay.map((d, i) => {
    const dayOrders = recentOrdersWithDates.filter(
      (o) => o.createdAt.toISOString().split("T")[0] === d.date
    );
    return {
      label: d.label,
      aov: dayOrders.length > 0 ? Math.round(d.revenue / dayOrders.length) : 0,
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
    // New analytics data
    revenueByDay30,
    aovByDay,
    categoryRevenue: Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue),
    funnel,
    cohorts: Object.entries(cohorts).map(([month, count]) => ({ month, count })),
  });
}
