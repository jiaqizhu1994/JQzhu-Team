import { NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/adminAuth";
import { sendPasswordResetCode } from "@/lib/adminPasswordReset";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() || "";
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "该邮箱不是管理员账号" }, { status: 400 });
  }

  try {
    await sendPasswordResetCode(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "验证码发送失败" },
      { status: 503 },
    );
  }
}
