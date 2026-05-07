import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, adminCookieOptions } from "@/lib/adminAuth";

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
    const token = createAdminToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, adminCookieOptions);
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
