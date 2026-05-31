import { NextRequest, NextResponse } from "next/server";
import {
  anonymizeIp,
  combineGeo,
  getClientIp,
  getRequestGeo,
  hashIp,
  IpapiGeo,
  normalizeIpapiResponse,
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
  geo: ReturnType<typeof combineGeo>;
};

type SupabaseConfig = {
  url: string;
  serviceKey: string;
  visitorTable: string;
  ipGeoCacheTable: string | null;
};

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SML_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SML_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return {
    url,
    serviceKey,
    visitorTable: process.env.SML_SUPABASE_VISITOR_TABLE || "visitor_logs",
    ipGeoCacheTable: process.env.SML_SUPABASE_IP_GEO_CACHE_TABLE || null,
  };
}

function supabaseHeaders(config: SupabaseConfig, prefer?: string) {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function ipapiCacheTtlDays() {
  const configured = Number(process.env.IPAPI_CACHE_TTL_DAYS || 30);
  if (!Number.isFinite(configured) || configured <= 0) return 30;
  return Math.min(configured, 365);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function cachedIpapiGeoFromValue(value: unknown, fetchedAt?: string, expiresAt?: string): IpapiGeo | null {
  const geo = value as IpapiGeo | null;
  if (!geo || geo.provider !== "ipapi.co") return null;

  const cacheExpiresAt = expiresAt || geo.expires_at;
  if (!cacheExpiresAt || Date.parse(cacheExpiresAt) <= Date.now()) return null;

  return {
    ...geo,
    fetched_at: fetchedAt || geo.fetched_at,
    expires_at: cacheExpiresAt,
    cached: true,
  };
}

async function readDedicatedIpapiGeoCache(config: SupabaseConfig, ip: string): Promise<IpapiGeo | null> {
  if (!config.ipGeoCacheTable) return null;

  const params = new URLSearchParams({
    select: "geo,fetched_at,expires_at",
    ip: `eq.${ip}`,
    provider: "eq.ipapi.co",
    expires_at: `gt.${new Date().toISOString()}`,
    limit: "1",
  });

  const response = await fetch(`${config.url}/rest/v1/${config.ipGeoCacheTable}?${params}`, {
    headers: supabaseHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase IP geo cache read failed: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as Array<{
    geo?: IpapiGeo;
    fetched_at?: string;
    expires_at?: string;
  }>;

  return cachedIpapiGeoFromValue(rows[0]?.geo, rows[0]?.fetched_at, rows[0]?.expires_at);
}

async function readVisitorLogIpapiGeoCache(config: SupabaseConfig, ip: string): Promise<IpapiGeo | null> {
  const params = new URLSearchParams({
    select: "geo,timestamp,created_at",
    ip_raw: `eq.${ip}`,
    order: "created_at.desc",
    limit: "20",
  });

  const response = await fetch(`${config.url}/rest/v1/${config.visitorTable}?${params}`, {
    headers: supabaseHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase visitor log IP geo cache read failed: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as Array<{
    geo?: { ipapi?: IpapiGeo | null };
    timestamp?: string;
    created_at?: string;
  }>;

  for (const row of rows) {
    const cached = cachedIpapiGeoFromValue(row.geo?.ipapi, row.timestamp || row.created_at);
    if (cached) return cached;
  }

  return null;
}

async function fetchIpapiGeo(ip: string): Promise<IpapiGeo | null> {
  const now = new Date();
  const fetchedAt = now.toISOString();
  const expiresAt = addDays(now, ipapiCacheTtlDays()).toISOString();
  const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "sml-website-visitor-analytics/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ipapi.co lookup failed: ${response.status} ${await response.text()}`);
  }

  return normalizeIpapiResponse(await response.json(), fetchedAt, expiresAt);
}

async function writeCachedIpapiGeo(config: SupabaseConfig, ip: string, geo: IpapiGeo) {
  if (!config.ipGeoCacheTable) return;

  const record = {
    ip,
    provider: "ipapi.co",
    geo,
    fetched_at: geo.fetched_at,
    expires_at: geo.expires_at,
  };

  const response = await fetch(`${config.url}/rest/v1/${config.ipGeoCacheTable}`, {
    method: "POST",
    headers: supabaseHeaders(config, "resolution=merge-duplicates,return=minimal"),
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error(`Supabase IP geo cache write failed: ${response.status} ${await response.text()}`);
  }
}

async function getCachedIpapiGeo(config: SupabaseConfig | null, ip: string | null): Promise<IpapiGeo | null> {
  if (!config || !ip) return null;

  try {
    const cached = await readDedicatedIpapiGeoCache(config, ip);
    if (cached) return cached;
  } catch (error) {
    // If the dedicated cache table is not created yet, fall back to previous visitor logs.
    console.error("visitor_log_ipapi_cache_read_failed", error);
  }

  try {
    const cached = await readVisitorLogIpapiGeoCache(config, ip);
    if (cached) return cached;
  } catch (error) {
    console.error("visitor_log_ipapi_visitor_cache_read_failed", error);
  }

  try {
    const fresh = await fetchIpapiGeo(ip);
    if (!fresh) return null;

    try {
      await writeCachedIpapiGeo(config, ip, fresh);
    } catch (error) {
      // The visitor log itself also stores geo.ipapi, so caching still works even
      // before the optional dedicated cache table is created.
      console.error("visitor_log_ipapi_cache_write_failed", error);
    }

    return fresh;
  } catch (error) {
    console.error("visitor_log_ipapi_lookup_failed", error);
    return null;
  }
}

async function insertSupabaseVisitorLog(config: SupabaseConfig | null, event: VisitorLogEvent) {
  if (!config) return;

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

  const response = await fetch(`${config.url}/rest/v1/${config.visitorTable}`, {
    method: "POST",
    headers: supabaseHeaders(config, "return=minimal"),
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error(`Supabase visitor log insert failed: ${response.status} ${await response.text()}`);
  }
}

export async function POST(request: NextRequest) {
  let body: VisitorEventBody = {};

  try {
    body = await request.json();
  } catch {
    // sendBeacon can occasionally arrive without a parseable JSON body.
  }

  const config = getSupabaseConfig();
  const ip = getClientIp(request);
  const ipapiGeo = await getCachedIpapiGeo(config, ip);
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
    geo: combineGeo(getRequestGeo(request), ipapiGeo),
  };

  // Vercel keeps this in function logs. Raw IP is intentionally not logged.
  console.info(JSON.stringify(event));

  try {
    await insertSupabaseVisitorLog(config, event);
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
