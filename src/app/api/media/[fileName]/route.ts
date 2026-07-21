import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await context.params;
  const safeName = path.basename(fileName);
  const extension = path.extname(safeName).toLowerCase();

  if (safeName !== fileName || !contentTypes[extension]) {
    return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
  }

  try {
    const bytes = await readFile(path.join(uploadDir, safeName));
    return new NextResponse(bytes, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(bytes.byteLength),
        "Content-Type": contentTypes[extension],
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
