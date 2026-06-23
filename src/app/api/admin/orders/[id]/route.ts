import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import { processRefund, rupeesToPaise } from "@/lib/razorpay";

const VALID_STATUSES = [
  "Processing",
  "Confirmed",
  "Paid",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

/**
 * Restores product stock when an order is cancelled.
 * Adds back the quantity of each item to Product.inStock.
 */
async function restoreStock(orderId: string) {
  try {
    // Fetch all items for this order
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
        console.log(`[restoreStock] Restored ${item.quantity} to product ${item.productId}`);
      } catch (e) {
        // Product might not exist in DB — non-fatal
      }
    }
  } catch (e) {
    console.warn("[restoreStock] Failed:", e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure all tables exist before updating
  await ensureAllTables();

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Valid: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  // Check if this is a cancellation — if so, restore stock AND process refund
  if (body.status === "Cancelled") {
    await restoreStock(id);

    // Auto-process refund if the order was paid via Razorpay
    try {
      const orderRows = await db.$queryRawUnsafe(
        `SELECT "paymentId", "total", "paymentMethod" FROM "Order" WHERE "id" = ?`,
        id
      ) as any[];
      const order = orderRows[0];

      if (order?.paymentId && order.paymentId.startsWith("pay_")) {
        // This was a Razorpay payment — process refund
        console.log(`[cancel] Processing refund for payment ${order.paymentId}, amount: ${order.total}`);

        const refundResult = await processRefund(
          order.paymentId,
          rupeesToPaise(order.total),
          "customers_request"
        );

        if (refundResult.success) {
          // Update order with refund details
          await db.$executeRawUnsafe(
            `UPDATE "Order" SET "refundStatus" = ?, "refundId" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
            refundResult.status || "pending",
            refundResult.refundId,
            id
          );
          console.log(`[cancel] Refund processed: ${refundResult.refundId}, status: ${refundResult.status}`);
        } else {
          // Refund failed — mark it
          await db.$executeRawUnsafe(
            `UPDATE "Order" SET "refundStatus" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
            "failed",
            id
          );
          console.error(`[cancel] Refund failed:`, refundResult.error);
        }
      }
    } catch (refundErr: any) {
      console.warn("[cancel] Refund processing error:", refundErr?.message);
    }
  }

  try {
    // Try Prisma first
    try {
      const data: any = { updatedAt: new Date() };
      if (body.status) data.status = body.status;
      if (body.trackingNumber !== undefined)
        data.trackingNumber = body.trackingNumber;

      const order = await db.order.update({
        where: { id },
        data,
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
      });

      return NextResponse.json({
        order: {
          ...order,
          customer: order.user
            ? { name: order.user.name, email: order.user.email }
            : { name: "Guest", email: order.guestEmail },
        },
      });
    } catch (prismaErr: any) {
      // Prisma failed — fall back to raw SQL (use ? placeholders for SQLite)
      console.warn("[admin/orders/[id]] Prisma update failed, using raw SQL:", prismaErr?.message);

      const updates: string[] = ['"updatedAt" = CURRENT_TIMESTAMP'];
      const values: any[] = [];
      let placeholder = "";

      if (body.status) {
        placeholder = "?";
        updates.push(`"status" = ${placeholder}`);
        values.push(body.status);
      }
      if (body.trackingNumber !== undefined) {
        placeholder = "?";
        updates.push(`"trackingNumber" = ${placeholder}`);
        values.push(body.trackingNumber);
      }
      values.push(id);

      await db.$executeRawUnsafe(
        `UPDATE "Order" SET ${updates.join(", ")} WHERE "id" = ?`,
        ...values
      );

      // Fetch the updated order
      const rows = await db.$queryRawUnsafe(
        `SELECT * FROM "Order" WHERE "id" = ?`,
        id
      );
      const order = (rows as any[])[0];

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Fetch items
      const items = await db.$queryRawUnsafe(
        `SELECT * FROM "OrderItem" WHERE "orderId" = ?`,
        id
      );

      return NextResponse.json({
        order: {
          ...order,
          customer: { name: "Guest", email: order.guestEmail },
          items: items,
        },
      });
    }
  } catch (error: any) {
    console.error("[admin/orders/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
