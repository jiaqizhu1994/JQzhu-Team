import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "academic_admin_auth";
export const DEFAULT_ADMIN_EMAIL = "linzongtao25@mails.ucas.ac.cn";
export const SECONDARY_ADMIN_EMAIL = "jiaqizhu@ucas.ac.cn";

type AdminTokenPayload = {
  sub: string;
  iat: number;
  exp: number;
};

function base64UrlEncode(input: string | ArrayBuffer) {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

async function sign(input: string) {
  const secret = process.env.ADMIN_JWT_SECRET || "local-admin-jwt-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(input),
  );

  return base64UrlEncode(signature);
}

export function getAdminUsername() {
  return getAdminEmails()[0];
}

export function getAdminEmails() {
  const configured = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(
    new Set([DEFAULT_ADMIN_EMAIL, SECONDARY_ADMIN_EMAIL, ...configured]),
  );
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getAdminSessionMaxAge() {
  return Number(process.env.ADMIN_SESSION_MAX_AGE_SECONDS || 60 * 60 * 8);
}

export function shouldUseSecureAdminCookie(request: NextRequest) {
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  return forwardedProtocol
    ? forwardedProtocol === "https"
    : request.nextUrl.protocol === "https:";
}

export async function createAdminToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isAdminEmail(normalizedEmail)) {
    throw new Error("Invalid administrator email");
  }
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    sub: normalizedEmail,
    iat: now,
    exp: now + getAdminSessionMaxAge(),
  };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(signingInput);

  return `${signingInput}.${signature}`;
}

export async function verifyAdminToken(token?: string) {
  if (!token) {
    return false;
  }

  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    return false;
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = await sign(signingInput);

  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    return isAdminEmail(payload.sub) && payload.exp > now;
  } catch {
    return false;
  }
}

export async function isAdminRequest(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export function adminUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
