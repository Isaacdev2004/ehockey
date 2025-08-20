// src/lib/utils/simple-rate-limit.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function simpleRateLimit(
  request: NextRequest,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + config.windowMs });
    return null;
  }

  if (limit.count >= config.maxRequests) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  limit.count++;
  return null;
}