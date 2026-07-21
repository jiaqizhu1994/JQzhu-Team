import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/adminAuth";
import { cleanupUnusedUploads, isCompleteSiteData } from "@/lib/uploadCleanup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentDir = path.join(process.cwd(), "content");
const dataFile = path.join(contentDir, "site-data.json");

async function readSavedData() {
  try {
    const raw = await readFile(dataFile, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const data = await readSavedData();
  if (!data) {
    return NextResponse.json(
      { error: "Site data not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return adminUnauthorized();
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 });
  }

  if (!isCompleteSiteData(data)) {
    return NextResponse.json(
      { error: "Incomplete site data" },
      { status: 400 },
    );
  }

  await mkdir(contentDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
  const cleanup = await cleanupUnusedUploads(data);

  return NextResponse.json({ ok: true, cleanup });
}
