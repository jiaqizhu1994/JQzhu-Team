import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/adminAuth";

const protectedPagePrefixes = ["/admin", "/admin-json"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isProtectedPage = protectedPagePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtectedPage) {
    return NextResponse.next();
  }

  const isLoggedIn = await verifyAdminToken(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value,
  );

  if (isLoggedIn) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/admin-json/:path*"],
};
