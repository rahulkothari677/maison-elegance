import { NextRequest, NextResponse } from "next/server";
import { getRazorpay, rupeesToPaise } from "@/lib/razorpay";

/**
 * POST /api/razorpay/create-order
 * Creates a Razorpay order and returns the order ID + key ID for client-side checkout.
 *
 * Body:
 *   items: [{ name, price, quantity, image, size, color }]
 *   total: number (in rupees, includes shipping + tax)
 *   shippingAddress: string
 *   email: string
 *   currency: "INR" (default)
 *
 * Returns:
 *   orderId: string  — Razorpay order ID (starts with "order_")
 *   keyId: string    — Public key for client checkout
 *   amount: number   — Amount in paise
 *   currency: string
 *   demo: boolean    — true if Razorpay not configured
 */
export async function POST(req: NextRequest) {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      // Demo mode — no keys configured
      return NextResponse.json({
        demo: true,
        message: "Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable UPI/card payments.",
      });
    }

    const body = await req.json();
    const { items, total, shippingAddress, email, currency = "INR" } = body;

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than 0" },
        { status: 400 }
      );
    }

    const amountPaise = rupeesToPaise(total);

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        email: email || "guest",
        items: items?.map((i: any) => `${i.name} (${i.size}/${i.color}) x${i.quantity}`).join(", ").slice(0, 200) || "",
        shippingAddress: (shippingAddress || "").slice(0, 200),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency,
      demo: false,
    });
  } catch (error: any) {
    console.error("[razorpay/create-order] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
