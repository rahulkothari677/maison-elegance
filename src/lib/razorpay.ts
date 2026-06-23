import Razorpay from "razorpay";

/**
 * Razorpay instance — lazily initialized.
 * Returns null if keys aren't configured (demo mode).
 *
 * Env vars (set in Vercel):
 *   RAZORPAY_KEY_ID     — starts with "rzp_test_" or "rzp_live_"
 *   RAZORPAY_KEY_SECRET — the secret key
 *   RAZORPAY_WEBHOOK_SECRET — for webhook signature verification (optional)
 */
let cachedInstance: Razorpay | null | undefined = undefined;

export function getRazorpay(): Razorpay | null {
  if (cachedInstance !== undefined) return cachedInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    cachedInstance = null;
    return null;
  }

  try {
    cachedInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return cachedInstance;
  } catch (e) {
    console.error("[razorpay] Failed to initialize:", e);
    cachedInstance = null;
    return null;
  }
}

export function isRazorpayConfigured(): boolean {
  return getRazorpay() !== null;
}

/**
 * Get the public key ID for client-side checkout.
 * This is safe to expose to the browser (it's the public key).
 */
export function getRazorpayKeyId(): string | null {
  return process.env.RAZORPAY_KEY_ID || null;
}

/**
 * Convert INR amount (float, e.g. 2999.00) to paise (integer, e.g. 299900).
 * Razorpay expects amounts in the smallest currency unit.
 */
export function rupeesToPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert paise back to rupees.
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Verify Razorpay payment signature using HMAC SHA256.
 * Used to verify that a payment was genuinely completed (not tampered).
 *
 * Signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    return expectedSignature === signature;
  } catch (e) {
    console.error("[razorpay] Signature verification failed:", e);
    return false;
  }
}

/**
 * Process a refund via Razorpay API.
 *
 * @param paymentId - Razorpay payment ID (starts with "pay_")
 * @param amount - Amount to refund in paise (e.g. 299900 for ₹2999)
 * @param reason - "duplicate" | "fraudulent" | "order_changed" | "customers_request"
 * @returns Refund details from Razorpay
 */
export async function processRefund(
  paymentId: string,
  amount: number,
  reason: string = "customers_request"
): Promise<{ success: boolean; refundId?: string; status?: string; error?: string }> {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return { success: false, error: "Razorpay not configured" };
  }

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount,
      notes: {
        reason: reason,
        refunded_by: "maison-elegance",
        refunded_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status, // "pending", "processed", "failed"
    };
  } catch (error: any) {
    console.error("[razorpay] Refund failed:", error);
    return {
      success: false,
      error: error.message || "Refund processing failed",
    };
  }
}

/**
 * Fetch refund status from Razorpay.
 */
export async function getRefundStatus(
  paymentId: string
): Promise<{ status: string; amount?: number } | null> {
  const razorpay = getRazorpay();
  if (!razorpay) return null;

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.refunds?.items?.length > 0) {
      const latestRefund = payment.refunds.items[0];
      return {
        status: latestRefund.status,
        amount: latestRefund.amount,
      };
    }
    return null;
  } catch (error) {
    console.error("[razorpay] Fetch refund status failed:", error);
    return null;
  }
}
