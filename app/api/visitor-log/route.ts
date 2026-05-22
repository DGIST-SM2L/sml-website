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
  timestampKst: string;
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

function getKstTimestamp(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace("Z", "+09:00");
}

async function insertSupabaseVisitorLog(event: VisitorLogEvent) {
  const supabaseUrl = process.env.SML_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SML_SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SML_SUPABASE_VISITOR_TABLE || "visitor_logs";

  if (!supabaseUrl || !serviceKey) return;

  const record = {
    site: "sml-web",
    event: event.event,
    timestamp: event.timestamp,
    timestamp_kst: event.timestampKst,
    path: event.path,
    referrer: event.referrer,
    user_agent: event.userAgent,
    language: event.language,
    client_timezone: event.clientTimezone,
    screen: event.screen,
    ip_raw: event.ip.raw,
    ip_anonymized: event.ip.anonymized,
    ip_hash: event.ip.hash,
    geo: {
      ...event.geo,
      timestamp_kst: event.timestampKst,
    },
  };

  const postRecord = async (candidate: typeof record | Omit<typeof record, "timestamp_kst">) => fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(candidate),
  });

  let response = await postRecord(record);
  if (!response.ok) {
    const errorText = await response.text();
    if (errorText.includes("timestamp_kst")) {
      const { timestamp_kst: _timestampKst, ...fallbackRecord } = record;
      response = await postRecord(fallbackRecord);
      if (response.ok) return;
      throw new Error(`Supabase visitor log insert failed: ${response.status} ${await response.text()}; original=${errorText}`);
    }
    throw new Error(`Supabase visitor log insert failed: ${response.status} ${errorText}`);
  }
}

export async function POST(request: NextRequest) {
  let body: VisitorEventBody = {};

  try {
    body = await request.json();
  } catch {
    // sendBeacon can occasionally arrive without a parseable JSON body.
  }

  const ip = getClientIp(request);
  const now = new Date();
  const event = {
    event: "visitor_pageview",
    timestamp: now.toISOString(),
    timestampKst: getKstTimestamp(now),
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

  try {
    await insertSupabaseVisitorLog(event);
  } catch (error) {
    console.error("visitor_log_supabase_insert_failed", error);
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
