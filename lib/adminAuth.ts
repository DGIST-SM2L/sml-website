import crypto from "crypto";
import { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_token";
const MAX_AGE_SECONDS = 60 * 60 * 4; // 4 hours
const MAX_AGE_MS = MAX_AGE_SECONDS * 1000;

type AdminTokenPayload = {
  iat: number;
  exp: number;
};

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD;
}

function sign(body: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return aBuf.length === bBuf.length && crypto.timingSafeEqual(aBuf, bBuf);
}

export function createAdminToken() {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Admin access not configured");
  }

  const now = Date.now();
  const payload: AdminTokenPayload = {
    iat: now,
    exp: now + MAX_AGE_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body, secret);
  return `${body}.${signature}`;
}

export function verifyAdminRequest(request: NextRequest) {
  const secret = getAdminSecret();
  if (!secret) return false;

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return false;

  const expected = sign(body, secret);
  if (!safeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as Partial<AdminTokenPayload>;

    return (
      typeof payload.iat === "number" &&
      typeof payload.exp === "number" &&
      payload.iat <= Date.now() &&
      payload.exp > Date.now() &&
      payload.exp - payload.iat <= MAX_AGE_MS
    );
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: MAX_AGE_SECONDS,
  path: "/",
};
