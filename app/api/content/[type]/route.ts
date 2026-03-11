import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const VALID_TYPES = ["publications", "members", "research", "news", "gallery", "contact"];

function getContentPath(type: string) {
  return path.join(process.cwd(), "content", `${type}.json`);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  try {
    const filePath = getContentPath(type);
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const filePath = getContentPath(type);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
