import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!key || !webhookSecret) {
    return NextResponse.json({ received: true, demo: true });
  }

  const stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
        // Payment successful — create order in DB, send confirmation email
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Payment received:", session.id, session.amount_total);
        break;
      case "payment_intent.payment_failed":
        console.log("❌ Payment failed:", event.data.object);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
