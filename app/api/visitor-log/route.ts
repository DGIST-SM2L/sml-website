import { NextRequest, NextResponse } from "next/server";
import {
  anonymizeIp,
  getClientIp,
  getRequestGeo,
  hashIp,
  truncate,
} from "@/lib/visitorAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VisitorEventBody = {
  path?: unknown;
  referrer?: unknown;
  screen?: unknown;
  language?: unknown;
  timezone?: unknown;
};

export async function POST(request: NextRequest) {
  let body: VisitorEventBody = {};

  try {
    body = await request.json();
  } catch {
    // sendBeacon can occasionally arrive without a parseable JSON body.
  }

  const ip = getClientIp(request);
  const event = {
    event: "visitor_pageview",
    timestamp: new Date().toISOString(),
    path: truncate(body.path, 200) || "/",
    referrer: truncate(body.referrer, 500),
    userAgent: truncate(request.headers.get("user-agent"), 500),
    language: truncate(body.language, 80) || truncate(request.headers.get("accept-language"), 200),
    clientTimezone: truncate(body.timezone, 80),
    screen: truncate(body.screen, 80),
    ip: {
      anonymized: anonymizeIp(ip),
      hash: hashIp(ip),
    },
    geo: getRequestGeo(request),
  };

  // Vercel keeps this in function logs. Raw IP is intentionally not logged.
  console.info(JSON.stringify(event));

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
