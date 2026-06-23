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

  try {
    // Try Prisma first
    try {
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
    } catch (prismaErr: any) {
      // Prisma failed — fall back to raw SQL
      console.warn("[admin/orders] Prisma query failed, using raw SQL:", prismaErr?.message);

      // Ensure tables exist
      try {
        await db.$executeRawUnsafe(`SELECT 1 FROM "Order" LIMIT 1`);
      } catch {
        return NextResponse.json({ orders: [] });
      }

      // Raw SQL query — use ? placeholders for SQLite/LibSQL
      let rows: any[];
      if (status && status !== "all") {
        rows = await db.$queryRawUnsafe(
          `SELECT o.*, oi.id as item_id, oi."productId", oi.name as item_name, oi.image, oi.size, oi.color, oi.quantity, oi.price as item_price
           FROM "Order" o
           LEFT JOIN "OrderItem" oi ON oi."orderId" = o."id"
           WHERE o."status" = ?
           ORDER BY o."createdAt" DESC
           LIMIT 100`,
          status
        );
      } else {
        rows = await db.$queryRawUnsafe(
          `SELECT o.*, oi.id as item_id, oi."productId", oi.name as item_name, oi.image, oi.size, oi.color, oi.quantity, oi.price as item_price
           FROM "Order" o
           LEFT JOIN "OrderItem" oi ON oi."orderId" = o."id"
           ORDER BY o."createdAt" DESC
           LIMIT 100`
        );
      }

      // Group items by order
      const ordersMap: Record<string, any> = {};
      for (const row of rows as any[]) {
        if (!ordersMap[row.id]) {
          ordersMap[row.id] = {
            id: row.id,
            orderNumber: row.orderNumber,
            status: row.status,
            total: row.total,
            subtotal: row.subtotal,
            shipping: row.shipping,
            tax: row.tax,
            shippingAddress: row.shippingAddress,
            trackingNumber: row.trackingNumber,
            createdAt: row.createdAt,
            customer: { name: "Guest", email: row.guestEmail, tier: "Silver" },
            items: [],
          };
        }
        if (row.item_id) {
          ordersMap[row.id].items.push({
            id: row.item_id,
            productId: row.productId,
            name: row.item_name,
            image: row.image,
            size: row.size,
            color: row.color,
            quantity: row.quantity,
            price: row.item_price,
          });
        }
      }

      return NextResponse.json({ orders: Object.values(ordersMap) });
    }
  } catch (error: any) {
    console.error("[admin/orders] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders", orders: [] },
      { status: 500 }
    );
  }
}
