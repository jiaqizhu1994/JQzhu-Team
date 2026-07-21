import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  getAdminSessionMaxAge,
  shouldUseSecureAdminCookie,
} from "@/lib/adminAuth";
import { verifyAdminCredentials } from "@/lib/adminCredentials";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "登录请求格式不正确" }, { status: 400 });
  }

  const isValid = await verifyAdminCredentials(
    body.username || "",
    body.password || "",
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "邮箱或密码不正确" },
      { status: 401 },
    );
  }

  const email = (body.username || "").trim().toLowerCase();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: await createAdminToken(email),
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureAdminCookie(request),
    path: "/",
    maxAge: getAdminSessionMaxAge(),
  });

  return response;
}
