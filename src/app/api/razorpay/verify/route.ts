import { NextRequest, NextResponse } from "next/server";
import { getRazorpay, verifyPaymentSignature } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/razorpay/verify
 * Verifies the payment signature after Razorpay checkout completes.
 * If valid, marks the order as paid and creates a record in our DB.
 *
 * Body:
 *   razorpay_order_id: string
 *   razorpay_payment_id: string
 *   razorpay_signature: string
 *   orderData: { items, shippingAddress, subtotal, shipping, tax, total }
 *
 * Returns:
 *   ok: boolean
 *   orderNumber: string  — our internal order number
 *   error?: string
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body;

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
    let paymentDetails: any = null;
    if (razorpay) {
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        paymentMethod = payment.method || "unknown"; // upi, card, netbanking, wallet
        paymentDetails = {
          method: payment.method,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          vpa: payment.vpa, // UPI ID (if UPI)
          bank: payment.bank,
          cardNetwork: payment.card_network,
          cardLast4: payment.last4,
        };
      } catch (e) {
        // Non-fatal — payment was already verified by signature
        console.warn("[razorpay/verify] Could not fetch payment details:", e);
      }
    }

    // Get the current user (optional — supports guest checkout)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;
    const guestEmail = (session?.user as any)?.email || orderData?.email || null;

    // Create the order in our database
    const orderNumber = `ME${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail,
        status: "Paid",
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        items: {
          create: orderData.items.map((item: any) => ({
            productId: item.productId,
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

    // Store payment info as a note on the order (we could add a Payment model later)
    console.log(`[razorpay/verify] Order ${orderNumber} paid via ${paymentMethod}`, paymentDetails);

    return NextResponse.json({
      ok: true,
      orderNumber,
      orderId: order.id,
      paymentMethod,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("[razorpay/verify] Error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
