import { NextRequest, NextResponse } from "next/server";

// Email templates — in production, wire up with Resend, SendGrid, or AWS SES
const emailTemplates = {
  "order-confirmation": (data: any) => ({
    subject: `Order Confirmed — ${data.orderNumber} | MAISON ÉLÉGANCE`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c2418;">
        <h1 style="text-align: center; font-size: 24px; letter-spacing: 0.25em; margin-bottom: 30px;">MAISON ÉLÉGANCE</h1>
        <h2 style="font-size: 20px; color: #c19a45;">Order Confirmed</h2>
        <p>Dear ${data.customerName},</p>
        <p>Thank you for your order. We're delighted to confirm your purchase and will begin preparing your pieces in our atelier.</p>
        <div style="background: #f0ebe0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #75695a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">Order Number</p>
          <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold;">${data.orderNumber}</p>
          <p style="margin: 15px 0 0; color: #75695a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">Total</p>
          <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold;">$${data.total}</p>
        </div>
        <p style="font-size: 14px; color: #75695a;">Your order will be hand-prepared within 24 hours and shipped via express delivery. You'll receive a tracking number shortly.</p>
        <hr style="border: none; border-top: 1px solid #e5dfd3; margin: 30px 0;">
        <p style="font-size: 12px; color: #75695a; text-align: center;">MAISON ÉLÉGANCE · Paris · Florence · Tokyo<br>Lifetime repairs included with every piece.</p>
      </div>
    `,
  }),
  "shipping-update": (data: any) => ({
    subject: `Your order has shipped — ${data.orderNumber} | MAISON ÉLÉGANCE`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c2418;">
        <h1 style="text-align: center; font-size: 24px; letter-spacing: 0.25em; margin-bottom: 30px;">MAISON ÉLÉGANCE</h1>
        <h2 style="font-size: 20px; color: #c19a45;">Your Order Has Shipped</h2>
        <p>Dear ${data.customerName},</p>
        <p>Good news — your order is on its way!</p>
        <div style="background: #f0ebe0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #75695a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">Tracking Number</p>
          <p style="margin: 5px 0 0; font-family: monospace; font-size: 16px; font-weight: bold;">${data.trackingNumber}</p>
        </div>
        <p style="font-size: 14px;">Estimated delivery: 1-2 business days (express shipping).</p>
        <p style="font-size: 14px; color: #75695a;">Thank you for choosing MAISON ÉLÉGANCE.</p>
      </div>
    `,
  }),
  "back-in-stock": (data: any) => ({
    subject: `Back in stock — ${data.productName} | MAISON ÉLÉGANCE`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c2418;">
        <h1 style="text-align: center; font-size: 24px; letter-spacing: 0.25em; margin-bottom: 30px;">MAISON ÉLÉGANCE</h1>
        <h2 style="font-size: 20px; color: #c19a45;">Good News — It's Back!</h2>
        <p>The ${data.productName} you were interested in is back in stock.</p>
        ${data.image ? `<img src="${data.image}" alt="${data.productName}" style="width: 100%; max-width: 300px; border-radius: 8px; margin: 20px auto; display: block;">` : ""}
        <a href="${data.productUrl}" style="display: block; text-align: center; background: #c19a45; color: #2c2418; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; max-width: 250px; margin: 20px auto;">Shop Now</a>
        <p style="font-size: 12px; color: #75695a; text-align: center;">Stock is limited — order soon to secure yours.</p>
      </div>
    `,
  }),
  "abandoned-cart": (data: any) => ({
    subject: `You left something behind | MAISON ÉLÉGANCE`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c2418;">
        <h1 style="text-align: center; font-size: 24px; letter-spacing: 0.25em; margin-bottom: 30px;">MAISON ÉLÉGANCE</h1>
        <h2 style="font-size: 20px; color: #c19a45;">Your Pieces Are Waiting</h2>
        <p>Dear ${data.customerName},</p>
        <p>We noticed you left some beautiful pieces in your bag. They're still available — but our stock is limited.</p>
        <div style="background: #f0ebe0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Items in your bag:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${data.items.map((item: any) => `<li style="margin: 5px 0;">${item.name} — $${item.price}</li>`).join("")}
          </ul>
          <p style="margin: 10px 0 0; font-weight: bold;">Total: $${data.total}</p>
        </div>
        <a href="${data.cartUrl}" style="display: block; text-align: center; background: #c19a45; color: #2c2418; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; max-width: 250px; margin: 20px auto;">Complete Your Order</a>
        <p style="font-size: 12px; color: #75695a; text-align: center;">Complimentary express shipping on orders over $250.</p>
      </div>
    `,
  }),
  "welcome": (data: any) => ({
    subject: `Welcome to the Maison | MAISON ÉLÉGANCE`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c2418;">
        <h1 style="text-align: center; font-size: 24px; letter-spacing: 0.25em; margin-bottom: 30px;">MAISON ÉLÉGANCE</h1>
        <h2 style="font-size: 20px; color: #c19a45;">Welcome, ${data.name}</h2>
        <p>Thank you for joining the MAISON ÉLÉGANCE family. As a welcome gift, we've credited your account with <strong>100 bonus loyalty points</strong>.</p>
        <p>Your membership includes:</p>
        <ul style="color: #75695a; line-height: 1.8;">
          <li>Access to our full collection of handcrafted pieces</li>
          <li>Complimentary express shipping on orders over $250</li>
          <li>30-day free returns</li>
          <li>Lifetime repairs on every MAISON piece</li>
          <li>AI-powered personal stylist (Ask Camille)</li>
        </ul>
        <a href="#" style="display: block; text-align: center; background: #c19a45; color: #2c2418; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; max-width: 250px; margin: 20px auto;">Explore the Collection</a>
      </div>
    `,
  }),
};

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    const email = template(data);

    // In production: send via Resend, SendGrid, or AWS SES
    // For now, log the email (demo mode)
    console.log(`📧 Email sent: ${email.subject}`);
    console.log(`   To: ${data.email || data.customerEmail || "user@example.com"}`);
    console.log(`   Type: ${type}`);

    // If RESEND_API_KEY is set, actually send the email
    if (process.env.RESEND_API_KEY) {
      // const { Resend } = await import('resend');
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: 'MAISON ÉLÉGANCE <noreply@maison-elegance.com>',
      //   to: data.email || data.customerEmail,
      //   subject: email.subject,
      //   html: email.html,
      // });
      console.log("   ✅ Email sent via Resend");
    } else {
      console.log("   📝 Demo mode — email logged but not sent (add RESEND_API_KEY to .env)");
    }

    return NextResponse.json({ success: true, type, subject: email.subject });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
