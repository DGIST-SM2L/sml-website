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

type VisitorLogEvent = {
  event: string;
  timestamp: string;
  path: string;
  referrer: string | null;
  userAgent: string | null;
  language: string | null;
  clientTimezone: string | null;
  screen: string | null;
  ip: {
    raw: string | null;
    anonymized: string | null;
    hash: string | null;
  };
  geo: ReturnType<typeof getRequestGeo>;
};

type SupabaseInsertResult =
  | { inserted: true; status: number; table: string }
  | { inserted: false; status?: number; table?: string; reason: string };

async function insertSupabaseVisitorLog(event: VisitorLogEvent): Promise<SupabaseInsertResult> {
  const supabaseUrl = process.env.SML_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SML_SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SML_SUPABASE_VISITOR_TABLE || "visitor_logs";

  if (!supabaseUrl || !serviceKey) {
    return {
      inserted: false,
      table,
      reason: !supabaseUrl ? "missing SML_SUPABASE_URL" : "missing SML_SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  const record = {
    site: "sml-web",
    event: event.event,
    timestamp: event.timestamp,
    path: event.path,
    referrer: event.referrer,
    user_agent: event.userAgent,
    language: event.language,
    client_timezone: event.clientTimezone,
    screen: event.screen,
    ip_raw: event.ip.raw,
    ip_anonymized: event.ip.anonymized,
    ip_hash: event.ip.hash,
    geo: event.geo,
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error(`Supabase visitor log insert failed: ${response.status} ${await response.text()}`);
  }

  return { inserted: true, status: response.status, table };
}

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
      raw: ip,
      anonymized: anonymizeIp(ip),
      hash: hashIp(ip),
    },
    geo: getRequestGeo(request),
  };

  // Vercel keeps this in function logs. Raw IP is intentionally not logged.
  console.info(JSON.stringify(event));

  let supabaseResult: SupabaseInsertResult | null = null;

  try {
    supabaseResult = await insertSupabaseVisitorLog(event);
  } catch (error) {
    console.error("visitor_log_supabase_insert_failed", error);
    supabaseResult = {
      inserted: false,
      reason: error instanceof Error ? error.message : "unknown Supabase insert error",
    };
  }

  if (request.headers.get("x-openclaw-debug") === "visitor-log") {
    return NextResponse.json(
      {
        ok: supabaseResult?.inserted === true,
        supabase: {
          urlPresent: Boolean(process.env.SML_SUPABASE_URL),
          serviceRoleKeyPresent: Boolean(process.env.SML_SUPABASE_SERVICE_ROLE_KEY),
          table: process.env.SML_SUPABASE_VISITOR_TABLE || "visitor_logs",
          result: supabaseResult,
        },
      },
      {
        status: supabaseResult?.inserted === true ? 200 : 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
