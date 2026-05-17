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

export function truncate(value: unknown, maxLength = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}
