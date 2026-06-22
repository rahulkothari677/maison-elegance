import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security";

export function middleware(req: NextRequest) {
  // Apply rate limiting to API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const limited = rateLimit(req);
    if (limited) return limited;
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
