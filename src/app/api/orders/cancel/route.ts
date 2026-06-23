import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import { processRefund, rupeesToPaise } from "@/lib/razorpay";

/**
 * POST /api/orders/cancel
 * Allows a customer to cancel their own order.
 * Only works if the order is still in "Confirmed" or "Processing" status
 * (can't cancel once shipped).
 *
 * Body: { orderId: string }
 *
 * Restores product stock when cancelled.
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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
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

    // Only allow cancellation if not yet shipped
    const cancellableStatuses = ["Confirmed", "Processing", "Paid"];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status "${order.status}". Contact support.` },
        { status: 400 }
      );
    }

    // Restore product stock
    try {
      const items = await db.$queryRawUnsafe(
        `SELECT "productId", "quantity" FROM "OrderItem" WHERE "orderId" = ?`,
        orderId
      ) as any[];

      for (const item of items) {
        if (!item.productId || item.productId === "unknown") continue;
        try {
          await db.$executeRawUnsafe(
            `UPDATE "Product" SET "inStock" = "inStock" + ? WHERE "id" = ? OR "slug" = ?`,
            item.quantity,
            item.productId,
            item.productId
          );
        } catch {}
      }
    } catch (e) {
      console.warn("[orders/cancel] Stock restore failed:", e);
    }

    // Update order status to Cancelled
    await db.$executeRawUnsafe(
      `UPDATE "Order" SET "status" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
      "Cancelled",
      orderId
    );

    // Auto-process refund if the order was paid via Razorpay
    try {
      if (order.paymentId && order.paymentId.startsWith("pay_")) {
        console.log(`[orders/cancel] Processing refund for payment ${order.paymentId}`);

        const refundResult = await processRefund(
          order.paymentId,
          rupeesToPaise(order.total),
          "customers_request"
        );

        if (refundResult.success) {
          await db.$executeRawUnsafe(
            `UPDATE "Order" SET "refundStatus" = ?, "refundId" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
            refundResult.status || "pending",
            refundResult.refundId,
            orderId
          );
          console.log(`[orders/cancel] Refund processed: ${refundResult.refundId}`);
        } else {
          await db.$executeRawUnsafe(
            `UPDATE "Order" SET "refundStatus" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
            "failed",
            orderId
          );
          console.error(`[orders/cancel] Refund failed:`, refundResult.error);
        }
      }
    } catch (refundErr: any) {
      console.warn("[orders/cancel] Refund processing error:", refundErr?.message);
    }

    return NextResponse.json({
      ok: true,
      message: order.paymentId
        ? "Order cancelled. Refund initiated — will reflect in 5-7 business days."
        : "Order cancelled successfully",
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("[orders/cancel] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
