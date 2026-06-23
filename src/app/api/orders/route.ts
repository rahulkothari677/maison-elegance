import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureAllTables } from "@/lib/ensure-all-tables";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;

  // Ensure all tables exist before querying
  await ensureAllTables();

  try {
    // Try Prisma first
    try {
      const orders = await db.order.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders });
    } catch (prismaErr: any) {
      // Prisma failed — fall back to raw SQL
      console.warn("[orders] Prisma query failed, using raw SQL:", prismaErr?.message);

      // Try raw SQL with ? placeholders (SQLite/LibSQL syntax)
      const rows = await db.$queryRawUnsafe(
        `SELECT o.*, oi.id as item_id, oi."productId", oi.name as item_name, oi.image, oi.size, oi.color, oi.quantity, oi.price as item_price
         FROM "Order" o
         LEFT JOIN "OrderItem" oi ON oi."orderId" = o."id"
         WHERE o."userId" = ? OR o."guestEmail" = ?
         ORDER BY o."createdAt" DESC
         LIMIT 50`,
        user.id,
        user.email
      );

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
    console.error("[orders] Error:", error);
    return NextResponse.json({ orders: [], error: error?.message });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  const { items, shippingAddress, subtotal, shipping, tax, total } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Generate order number
  const orderNumber = `ME-${Math.floor(Math.random() * 9000000) + 1000000}`;

  // Look up product IDs from slugs
  const productSlugs = items.map((i: any) => i.productId);
  const products = await db.product.findMany({
    where: { slug: { in: productSlugs } },
  });
  const slugToId = new Map(products.map((p) => [p.slug, p.id]));

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: session?.user ? (session.user as any).id : null,
      guestEmail: session?.user ? null : body.email || null,
      status: "Confirmed",
      subtotal: parseInt(subtotal),
      shipping: parseInt(shipping),
      tax: parseInt(tax),
      total: parseInt(total),
      shippingAddress,
      trackingNumber: `1Z999AA1${Math.floor(Math.random() * 90000000) + 10000000}`,
      items: {
        create: items.map((item: any) => ({
          productId: slugToId.get(item.productId) || products[0].id,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });

  // Update user loyalty points + lifetime spend if signed in
  if (session?.user) {
    const user = session.user as any;
    await db.user.update({
      where: { id: user.id },
      data: {
        loyaltyPoints: { increment: Math.floor(parseInt(total)) },
        lifetimeSpend: { increment: parseInt(total) },
      },
    });

    // Auto-promote to Gold at $5000, Platinum at $20000
    const updated = await db.user.findUnique({ where: { id: user.id } });
    if (updated) {
      let newTier = updated.tier;
      if (updated.lifetimeSpend >= 20000) newTier = "Platinum";
      else if (updated.lifetimeSpend >= 5000) newTier = "Gold";
      else newTier = "Silver";
      if (newTier !== updated.tier) {
        await db.user.update({
          where: { id: user.id },
          data: { tier: newTier },
        });
      }
    }
  }

  return NextResponse.json({ order }, { status: 201 });
}
