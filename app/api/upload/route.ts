import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_FOLDERS = ["gallery", "news", "members", "research", "home"];

async function getFileSha(
  repo: string,
  filePath: string,
  branch: string,
  token: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO;
  const githubBranch = process.env.GITHUB_BRANCH || "main";

  if (!githubToken || !githubRepo) {
    return NextResponse.json({ error: "GitHub integration not configured" }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "members";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!VALID_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: jpg, png, webp, gif" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const repoPath = `public/images/${folder}/${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Content = buffer.toString("base64");

    const sha = await getFileSha(githubRepo, repoPath, githubBranch, githubToken);
    const body: Record<string, string> = {
      message: `Upload image: ${folder}/${safeName}`,
      content: base64Content,
      branch: githubBranch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${githubRepo}/contents/${repoPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "GitHub upload failed");
    }

    const publicPath = `/images/${folder}/${safeName}`;
    return NextResponse.json({ url: publicPath });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
