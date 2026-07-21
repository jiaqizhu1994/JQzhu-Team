import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  shouldUseSecureAdminCookie,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureAdminCookie(request),
    path: "/",
    maxAge: 0,
  });

  return response;
}
