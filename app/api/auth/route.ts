import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin access not configured" },
      { status: 503 }
    );
  }

  if (password === adminPassword) {
    const token = crypto.randomBytes(32).toString("hex");
    const response = NextResponse.json({ success: true, token });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 4, // 4 hours
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
