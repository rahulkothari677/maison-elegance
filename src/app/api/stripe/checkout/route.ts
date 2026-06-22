import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize Stripe only if secret key is set
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      // Demo mode — no Stripe keys configured
      return NextResponse.json({
        demo: true,
        message: "Stripe not configured. Add STRIPE_SECRET_KEY to .env to enable real payments.",
        checkoutUrl: null,
      });
    }

    const body = await req.json();
    const { items, total, shippingAddress, email } = body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      // Enable Apple Pay, Google Pay, and other wallet payments
      allow_promotion_codes: true,
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ["US", "GB", "FR", "IT", "DE", "ES", "IN", "AE", "JP", "AU", "CA"],
      },
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: `${item.color} · Size ${item.size}`,
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?payment=cancelled`,
      metadata: {
        orderTotal: total.toString(),
        shippingAddress,
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Complimentary Express",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
      ],
      custom_text: {
        submit: {
          message: "Your payment is secured by 256-bit SSL encryption.",
        },
      },
    });

    return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Payment initialization failed" },
      { status: 500 }
    );
  }
}
