import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return adminUnauthorized();
  }

  try {
    const script = path.join(
      process.cwd(),
      "scripts",
      "publish-github-pages.mjs",
    );
    const { stdout } = await execFileAsync(process.execPath, [script], {
      cwd: process.cwd(),
      timeout: 120_000,
      windowsHide: true,
    });
    return NextResponse.json({
      ok: true,
      message: stdout.trim() || "已提交发布任务。",
    });
  } catch (error) {
    const detail =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr).trim()
        : error instanceof Error
          ? error.message
          : "发布失败";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
