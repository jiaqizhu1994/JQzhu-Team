import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/adminAuth";
import { cleanupUnusedUploads, isCompleteSiteData } from "@/lib/uploadCleanup";

export const runtime = "nodejs";

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
      { error: "Incomplete site data; cleanup was cancelled" },
      { status: 400 },
    );
  }

  const cleanup = await cleanupUnusedUploads(data);
  return NextResponse.json({ ok: true, cleanup });
}
