import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import { processRefund, rupeesToPaise } from "@/lib/razorpay";

/**
 * POST /api/orders/return
 * Allows a customer to request a return for a delivered order.
 *
 * Body: { orderId: string, reason: string, items?: string[] }
 *   - items: optional array of OrderItem IDs to return (partial return).
 *           If not provided, full order return.
 *
 * Flow (like Flipkart/Myntra):
 * 1. Customer requests return → status becomes "Return Requested"
 * 2. Admin reviews → schedules pickup
 * 3. Courier picks up item → "Return Picked Up"
 * 4. Quality check at warehouse → "Return Approved"
 * 5. Refund processed → "Refund Completed"
 *
 * Currently this endpoint handles step 1 (request) and step 5 (refund).
 * Steps 2-4 are manual (admin coordinates with courier).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  await ensureAllTables();

  try {
    const body = await req.json();
    const { orderId, reason, items } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: "Reason for return required" }, { status: 400 });
    }

    // Fetch the order — verify it belongs to this user
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM "Order" WHERE "id" = ? AND ("userId" = ? OR "guestEmail" = ?)`,
      orderId,
      user.id,
      user.email
    ) as any[];

    const order = rows[0];
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow returns for delivered orders
    if (order.status !== "Delivered") {
      return NextResponse.json(
        { error: `Returns only available for delivered orders. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Check return window (7 days from delivery — for now we use order date)
    const orderDate = new Date(order.createdAt);
    const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 7) {
      return NextResponse.json(
        { error: "Return window expired. Returns only available within 7 days of delivery." },
        { status: 400 }
      );
    }

    // Calculate refund amount
    let refundAmount = order.total;

    if (items && Array.isArray(items) && items.length > 0) {
      // Partial return — calculate refund for specific items
      const allItems = await db.$queryRawUnsafe(
        `SELECT * FROM "OrderItem" WHERE "orderId" = ?`,
        orderId
      ) as any[];

      refundAmount = 0;
      for (const item of allItems) {
        if (items.includes(item.id)) {
          refundAmount += item.price * item.quantity;
        }
      }

      if (refundAmount === 0) {
        return NextResponse.json({ error: "No valid items selected for return" }, { status: 400 });
      }
    }

    // Update order status to "Return Requested"
    await db.$executeRawUnsafe(
      `UPDATE "Order" SET "status" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
      "Return Requested",
      orderId
    );

    // If full return and paid via Razorpay, process refund immediately
    // (For partial returns, admin should verify before refunding)
    let refundMessage = "Return request submitted. Our team will review and process your refund.";
    if (!items && order.paymentId && order.paymentId.startsWith("pay_")) {
      const refundResult = await processRefund(
        order.paymentId,
        rupeesToPaise(refundAmount),
        "customers_request"
      );

      if (refundResult.success) {
        await db.$executeRawUnsafe(
          `UPDATE "Order" SET "refundStatus" = ?, "refundId" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
          refundResult.status || "pending",
          refundResult.refundId,
          orderId
        );
        refundMessage = "Return approved. Refund initiated — will reflect in 5-7 business days.";
      }
    }

    // Restore stock for returned items
    if (items && items.length > 0) {
      const returnItems = await db.$queryRawUnsafe(
        `SELECT "productId", "quantity" FROM "OrderItem" WHERE "orderId" = ? AND "id" IN (${items.map(() => "?").join(",")})`,
        orderId, ...items
      ) as any[];

      for (const item of returnItems) {
        if (!item.productId || item.productId === "unknown") continue;
        try {
          await db.$executeRawUnsafe(
            `UPDATE "Product" SET "inStock" = "inStock" + ? WHERE "id" = ? OR "slug" = ?`,
            item.quantity, item.productId, item.productId
          );
        } catch {}
      }
    } else {
      // Full return — restore all items
      const allItems = await db.$queryRawUnsafe(
        `SELECT "productId", "quantity" FROM "OrderItem" WHERE "orderId" = ?`,
        orderId
      ) as any[];

      for (const item of allItems) {
        if (!item.productId || item.productId === "unknown") continue;
        try {
          await db.$executeRawUnsafe(
            `UPDATE "Product" SET "inStock" = "inStock" + ? WHERE "id" = ? OR "slug" = ?`,
            item.quantity, item.productId, item.productId
          );
        } catch {}
      }
    }

    return NextResponse.json({
      ok: true,
      message: refundMessage,
      orderNumber: order.orderNumber,
      refundAmount,
      isPartial: !!(items && items.length > 0),
    });
  } catch (error: any) {
    console.error("[orders/return] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process return" },
      { status: 500 }
    );
  }
}
