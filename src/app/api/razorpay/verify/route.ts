import { NextRequest, NextResponse } from "next/server";
import { getRazorpay, verifyPaymentSignature } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

/**
 * Ensures the Order and OrderItem tables exist (self-healing).
 */
async function ensureOrderTables() {
  try {
    await db.$executeRawUnsafe(`SELECT 1 FROM "Order" LIMIT 1`);
  } catch {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderNumber" TEXT NOT NULL,
          "userId" TEXT,
          "guestEmail" TEXT,
          "status" TEXT NOT NULL DEFAULT 'Confirmed',
          "subtotal" INTEGER NOT NULL,
          "shipping" INTEGER NOT NULL,
          "tax" INTEGER NOT NULL,
          "total" INTEGER NOT NULL,
          "shippingAddress" TEXT NOT NULL,
          "trackingNumber" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        )
      `);
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`);
    } catch (e) {
      console.warn("[razorpay/verify] Could not create Order table:", e);
    }
  }

  try {
    await db.$executeRawUnsafe(`SELECT 1 FROM "OrderItem" LIMIT 1`);
  } catch {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "OrderItem" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderId" TEXT NOT NULL,
          "productId" TEXT,
          "name" TEXT NOT NULL,
          "image" TEXT NOT NULL,
          "size" TEXT NOT NULL,
          "color" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "price" INTEGER NOT NULL
        )
      `);
    } catch (e) {
      console.warn("[razorpay/verify] Could not create OrderItem table:", e);
    }
  }
}

/**
 * Creates an order using raw SQL — bypasses all foreign key constraints.
 * Uses ? placeholders (SQLite/LibSQL syntax, NOT $1 PostgreSQL syntax).
 * Includes detailed error logging to diagnose why items aren't saving.
 */
async function createOrderRaw(params: {
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: string;
  items: any[];
  paymentId?: string;
  paymentMethod?: string;
}): Promise<string> {
  const orderId = randomUUID();
  const now = new Date().toISOString();

  console.log("[createOrderRaw] Starting order creation:", {
    orderNumber: params.orderNumber,
    itemCount: params.items.length,
    paymentId: params.paymentId,
    paymentMethod: params.paymentMethod,
  });

  // Insert the order — now includes paymentId, paymentMethod, refundStatus
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO "Order" ("id", "orderNumber", "userId", "guestEmail", "status", "subtotal", "shipping", "tax", "total", "shippingAddress", "paymentId", "paymentMethod", "refundStatus", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      orderId,
      params.orderNumber,
      params.userId,
      params.guestEmail,
      "Confirmed",
      params.subtotal,
      params.shipping,
      params.tax,
      params.total,
      params.shippingAddress || "Not provided",
      params.paymentId || null,
      params.paymentMethod || "razorpay",
      null, // refundStatus — null until cancelled
      now,
      now
    );
    console.log("[createOrderRaw] Order inserted successfully, ID:", orderId);
  } catch (orderErr: any) {
    console.error("[createOrderRaw] Order INSERT FAILED:", orderErr?.message);
    throw orderErr;
  }

  // Step 2: Insert order items — try multiple approaches
  console.log("[createOrderRaw] Inserting", params.items.length, "items...");

  for (let i = 0; i < params.items.length; i++) {
    const item = params.items[i];
    const itemId = randomUUID();

    console.log(`[createOrderRaw] Inserting item ${i + 1}:`, {
      itemId,
      orderId,
      productId: item.productId || "unknown",
      name: item.name || "Product",
      quantity: item.quantity || 1,
      price: item.price || 0,
    });

    // Approach A: Raw SQL with ? placeholders
    try {
      await db.$executeRawUnsafe(
        `INSERT INTO "OrderItem" ("id", "orderId", "productId", "name", "image", "size", "color", "quantity", "price") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        itemId,
        orderId,
        item.productId || "unknown",
        item.name || "Product",
        item.image || "",
        item.size || "N/A",
        item.color || "N/A",
        item.quantity || 1,
        item.price || 0
      );
      console.log(`[createOrderRaw] Item ${i + 1} inserted via raw SQL ✓`);
    } catch (rawErr: any) {
      console.error(`[createOrderRaw] Item ${i + 1} raw SQL FAILED:`, rawErr?.message);

      // Approach B: Try Prisma's create method
      try {
        await db.orderItem.create({
          data: {
            id: itemId,
            orderId: orderId,
            productId: item.productId || "unknown",
            name: item.name || "Product",
            image: item.image || "",
            size: item.size || "N/A",
            color: item.color || "N/A",
            quantity: item.quantity || 1,
            price: item.price || 0,
          },
        });
        console.log(`[createOrderRaw] Item ${i + 1} inserted via Prisma ✓`);
      } catch (prismaErr: any) {
        console.error(`[createOrderRaw] Item ${i + 1} Prisma create FAILED:`, prismaErr?.message);

        // Approach C: Try without productId (in case FK constraint exists)
        try {
          await db.$executeRawUnsafe(
            `INSERT INTO "OrderItem" ("id", "orderId", "name", "image", "size", "color", "quantity", "price") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            itemId,
            orderId,
            item.name || "Product",
            item.image || "",
            item.size || "N/A",
            item.color || "N/A",
            item.quantity || 1,
            item.price || 0
          );
          console.log(`[createOrderRaw] Item ${i + 1} inserted without productId ✓`);
        } catch (finalErr: any) {
          console.error(`[createOrderRaw] Item ${i + 1} ALL approaches FAILED:`, finalErr?.message);
        }
      }
    }
  }

  // Verify items were saved
  try {
    const count = await db.$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM "OrderItem" WHERE "orderId" = ?`,
      orderId
    );
    console.log("[createOrderRaw] Items in DB for this order:", (count as any[])[0]?.cnt);
  } catch (e) {
    console.warn("[createOrderRaw] Could not verify item count:", e);
  }

  return orderId;
}

/**
 * Decrements product stock for each item in the order.
 * Uses ? placeholders (SQLite/LibSQL syntax).
 */
async function decrementStock(items: any[]) {
  for (const item of items) {
    if (!item.productId || item.productId === "unknown") continue;
    try {
      await db.$executeRawUnsafe(
        `UPDATE "Product" SET "inStock" = MAX(0, "inStock" - ?) WHERE "id" = ? OR "slug" = ?`,
        item.quantity || 1,
        item.productId,
        item.productId
      );
    } catch (e) {
      console.warn("[razorpay/verify] Stock decrement failed for", item.productId, ":", e);
    }
  }
}

/**
 * POST /api/razorpay/verify
 *
 * Verifies the payment signature after Razorpay checkout completes.
 * Creates an order record in the DB using raw SQL (bypasses foreign keys).
 * Decrements product stock.
 *
 * IMPORTANT: Payment has ALREADY succeeded at this point.
 * If anything fails, we still return success so the customer sees
 * the success page. Errors are logged for admin recovery.
 */
export async function POST(req: NextRequest) {
  let razorpay_order_id: string | undefined;
  let razorpay_payment_id: string | undefined;

  try {
    const body = await req.json();
    const { razorpay_signature, orderData } = body;
    razorpay_order_id = body.razorpay_order_id;
    razorpay_payment_id = body.razorpay_payment_id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error("[razorpay/verify] Invalid signature");
      return NextResponse.json(
        { error: "Payment verification failed — invalid signature" },
        { status: 400 }
      );
    }

    // Optionally fetch payment details from Razorpay
    const razorpay = getRazorpay();
    let paymentMethod = "unknown";
    if (razorpay) {
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        paymentMethod = payment.method || "unknown";
      } catch (e) {
        // Non-fatal
      }
    }

    // Get the current user (optional — supports guest checkout)
    let userId: string | null = null;
    let guestEmail: string | null = null;
    try {
      const session = await getServerSession(authOptions);
      userId = (session?.user as any)?.id || null;
      guestEmail = (session?.user as any)?.email || orderData?.email || null;
    } catch (e) {
      guestEmail = orderData?.email || null;
    }

    // Generate order number
    const orderNumber = `ME${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    // Create the order in our database using raw SQL
    try {
      // Ensure ALL tables exist and match schema (comprehensive migration)
      await ensureAllTables();
      await createOrderRaw({
        orderNumber,
        userId,
        guestEmail,
        subtotal: orderData.subtotal || 0,
        shipping: orderData.shipping || 0,
        tax: orderData.tax || 0,
        total: orderData.total || 0,
        shippingAddress: orderData.shippingAddress || "Not provided",
        items: orderData.items || [],
        paymentId: razorpay_payment_id,
        paymentMethod: paymentMethod,
      });

      // Decrement stock for each item
      await decrementStock(orderData.items || []);

      console.log(`[razorpay/verify] Order ${orderNumber} created in DB, paid via ${paymentMethod}`);
    } catch (dbError: any) {
      // DB creation failed — but payment already succeeded!
      console.error("[razorpay/verify] DB order creation FAILED (payment succeeded):", dbError?.message);
      console.error("[razorpay/verify] Recovery data:", {
        orderNumber,
        razorpay_order_id,
        razorpay_payment_id,
        paymentMethod,
        orderData,
      });
    }

    // ALWAYS return success if signature was valid
    return NextResponse.json({
      ok: true,
      orderNumber,
      paymentMethod,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("[razorpay/verify] Error:", error);
    if (razorpay_payment_id) {
      return NextResponse.json({
        ok: true,
        orderNumber: `ME${Date.now().toString(36).toUpperCase()}RECOVERY`,
        paymentId: razorpay_payment_id,
      });
    }
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
