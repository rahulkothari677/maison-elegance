import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS: Record<string, { window: number; max: number }> = {
  "/api/auth/register": { window: 3600000, max: 5 }, // 5 per hour
  "/api/auth/[...nextauth]": { window: 60000, max: 10 }, // 10 per minute
  "/api/products/[slug]/reviews": { window: 3600000, max: 3 }, // 3 per hour
  "/api/products/[slug]/questions": { window: 600000, max: 5 }, // 5 per 10 min
  "/api/style-posts": { window: 3600000, max: 10 }, // 10 per hour
  "/api/admin/upload": { window: 60000, max: 10 }, // 10 per minute
};

export function rateLimit(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;
  
  // Find matching rate limit rule
  let rule: { window: number; max: number } | null = null;
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    // Simple pattern matching
    const cleanPattern = pattern.replace(/\[.*?\]/g, "").replace(/\/$/, "");
    if (pathname.startsWith(cleanPattern) || pathname.includes(pattern.split("/").pop() || "")) {
      rule = config;
      break;
    }
  }

  if (!rule) return null;

  // Get client IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || 
             req.headers.get("x-real-ip") || 
             "unknown";
  const key = `${ip}:${pathname}`;
  const now = Date.now();

  const existing = rateLimitMap.get(key);
  if (existing && now < existing.resetTime) {
    if (existing.count >= rule.max) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: { "Retry-After": String(Math.ceil((existing.resetTime - now) / 1000)) }
        }
      );
    }
    existing.count++;
  } else {
    rateLimitMap.set(key, { count: 1, resetTime: now + rule.window });
  }

  return null;
}

// Input sanitization — strips potential XSS
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/<img[^>]+on\w+/gi, "")
    .trim();
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") return sanitizeInput(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}
