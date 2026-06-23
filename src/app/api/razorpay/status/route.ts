import { NextResponse } from "next/server";
import { isRazorpayConfigured, getRazorpayKeyId } from "@/lib/razorpay";

/**
 * GET /api/razorpay/status
 * Public — returns whether Razorpay is configured and the public key ID
 * (needed client-side to open the Razorpay checkout modal).
 */
export async function GET() {
  const configured = isRazorpayConfigured();
  const keyId = getRazorpayKeyId();

  return NextResponse.json({
    configured,
    keyId: configured ? keyId : null,
    // Test mode if key starts with rzp_test_
    isTestMode: keyId?.startsWith("rzp_test_") || false,
  });
}
