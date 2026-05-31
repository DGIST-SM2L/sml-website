import { createHash } from "crypto";
import type { NextRequest } from "next/server";

const IP_HEADERS = [
  "cf-connecting-ip",
  "x-real-ip",
  "x-forwarded-for",
  "x-client-ip",
  "x-vercel-forwarded-for",
];

function getFirstHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

export function getClientIp(request: NextRequest): string | null {
  for (const header of IP_HEADERS) {
    const ip = getFirstHeaderValue(request.headers.get(header));
    if (ip) return ip;
  }
  return null;
}

export function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null;

  // IPv4: keep /24 only, e.g. 203.0.113.42 -> 203.0.113.0
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }

  // IPv6: keep roughly /48 only.
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return `${parts.slice(0, 3).join(":")}::`;
  }

  return null;
}

export function hashIp(ip: string | null): string | null {
  const salt = process.env.VISITOR_ANALYTICS_SALT;
  if (!ip || !salt) return null;

  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex")
    .slice(0, 24);
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getRequestGeo(request: NextRequest) {
  const h = request.headers;

  return {
    country:
      h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null,
    region:
      decodeHeader(h.get("x-vercel-ip-country-region")) ||
      decodeHeader(h.get("x-vercel-ip-country-region-name")) ||
      null,
    city: decodeHeader(h.get("x-vercel-ip-city")),
    latitude: h.get("x-vercel-ip-latitude"),
    longitude: h.get("x-vercel-ip-longitude"),
    timezone: h.get("x-vercel-ip-timezone"),
    // Most edge providers do not expose district/dong-level data. Keep fields
    // explicit so a future GeoIP provider can populate them without schema churn.
    district: null as string | null,
    neighborhood: null as string | null,
  };
}

export type RequestGeo = ReturnType<typeof getRequestGeo>;

export type IpapiGeo = {
  provider: "ipapi.co";
  ip: string | null;
  network: string | null;
  version: string | null;
  city: string | null;
  region: string | null;
  region_code: string | null;
  country: string | null;
  country_name: string | null;
  postal: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  utc_offset: string | null;
  org: string | null;
  asn: string | null;
  fetched_at: string;
  expires_at: string;
  cached: boolean;
};

export type CombinedGeo = RequestGeo & {
  source: "headers" | "headers+ipapi";
  org: string | null;
  asn: string | null;
  ipapi: IpapiGeo | null;
};

function stringOrNull(value: unknown, maxLength = 200): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeIpapiResponse(
  data: unknown,
  fetchedAt: string,
  expiresAt: string,
): IpapiGeo | null {
  if (!data || typeof data !== "object") return null;
  const source = data as Record<string, unknown>;
  if (source.error === true) return null;

  return {
    provider: "ipapi.co",
    ip: stringOrNull(source.ip, 80),
    network: stringOrNull(source.network, 120),
    version: stringOrNull(source.version, 20),
    city: stringOrNull(source.city, 120),
    region: stringOrNull(source.region, 120),
    region_code: stringOrNull(source.region_code, 40),
    country: stringOrNull(source.country, 20),
    country_name: stringOrNull(source.country_name, 120),
    postal: stringOrNull(source.postal, 40),
    latitude: numberOrNull(source.latitude),
    longitude: numberOrNull(source.longitude),
    timezone: stringOrNull(source.timezone, 120),
    utc_offset: stringOrNull(source.utc_offset, 20),
    org: stringOrNull(source.org, 200),
    asn: stringOrNull(source.asn, 40),
    fetched_at: fetchedAt,
    expires_at: expiresAt,
    cached: false,
  };
}

export function combineGeo(headersGeo: RequestGeo, ipapiGeo: IpapiGeo | null): CombinedGeo {
  return {
    ...headersGeo,
    country: headersGeo.country || ipapiGeo?.country || null,
    region: headersGeo.region || ipapiGeo?.region || ipapiGeo?.region_code || null,
    city: headersGeo.city || ipapiGeo?.city || null,
    latitude: headersGeo.latitude || (ipapiGeo?.latitude != null ? String(ipapiGeo.latitude) : null),
    longitude: headersGeo.longitude || (ipapiGeo?.longitude != null ? String(ipapiGeo.longitude) : null),
    timezone: headersGeo.timezone || ipapiGeo?.timezone || null,
    source: ipapiGeo ? "headers+ipapi" : "headers",
    org: ipapiGeo?.org || null,
    asn: ipapiGeo?.asn || null,
    ipapi: ipapiGeo,
  };
}

export function truncate(value: unknown, maxLength = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}
