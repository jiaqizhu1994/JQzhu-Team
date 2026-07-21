import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "论文 PDF 上传功能已停用" },
    { status: 410 },
  );
}
