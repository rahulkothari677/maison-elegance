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

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
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
