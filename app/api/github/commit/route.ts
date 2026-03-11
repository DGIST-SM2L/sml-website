import { NextRequest, NextResponse } from "next/server";

const CONTENT_FILES: Record<string, string> = {
  publications: "content/publications.json",
  members: "content/members.json",
  research: "content/research.json",
  news: "content/news.json",
  gallery: "content/gallery.json",
  contact: "content/contact.json",
};

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
  return data.sha;
}

async function commitFile(
  repo: string,
  filePath: string,
  content: string,
  message: string,
  branch: string,
  token: string
) {
  const sha = await getFileSha(repo, filePath, branch, token);
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "GitHub API error");
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  const adminToken = request.cookies.get("admin_token")?.value;
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO;
  const githubBranch = process.env.GITHUB_BRANCH || "main";

  if (!githubToken || !githubRepo) {
    return NextResponse.json(
      { error: "GitHub integration not configured" },
      { status: 503 }
    );
  }

  try {
    const { message, files } = await request.json();
    // files: { [type]: data } — content sent directly from frontend
    if (!files || typeof files !== "object") {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];
    for (const [type, data] of Object.entries(files)) {
      const repoPath = CONTENT_FILES[type];
      if (!repoPath) continue;
      const content = JSON.stringify(data, null, 2);
      const result = await commitFile(
        githubRepo,
        repoPath,
        content,
        message || `Update ${type} via admin dashboard`,
        githubBranch,
        githubToken
      );
      results.push({ type, sha: result.content?.sha });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
