import { NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/adminAuth";
import { updateAdminPassword } from "@/lib/adminCredentials";
import {
  clearPasswordResetCode,
  verifyPasswordResetCode,
} from "@/lib/adminPasswordReset";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { email?: string; code?: string; newPassword?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() || "";
  const code = body.code?.trim() || "";
  const newPassword = body.newPassword || "";

  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "管理员邮箱不正确" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "请输入 6 位数字验证码" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "新密码至少需要 8 个字符" }, { status: 400 });
  }
  if (!(await verifyPasswordResetCode(email, code))) {
    return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
  }

  await updateAdminPassword(email, newPassword);
  await clearPasswordResetCode();
  return NextResponse.json({ ok: true });
}
