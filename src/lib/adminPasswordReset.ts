import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { isAdminEmail } from "@/lib/adminAuth";

const contentDir = path.join(process.cwd(), "content");
const resetFile = path.join(contentDir, "admin-password-reset.json");
const codeLifetimeMs = 10 * 60 * 1000;
const resendIntervalMs = 60 * 1000;

type PasswordResetRecord = {
  email: string;
  codeHash: string;
  createdAt: number;
  expiresAt: number;
};

function hashCode(email: string, code: string) {
  const secret = process.env.ADMIN_JWT_SECRET || "local-admin-jwt-secret";
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}:${secret}`)
    .digest("hex");
}

async function readResetRecord(): Promise<PasswordResetRecord | null> {
  try {
    return JSON.parse(await readFile(resetFile, "utf-8")) as PasswordResetRecord;
  } catch {
    return null;
  }
}

function createTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT || 465);

  if (!host || !user || !pass) {
    throw new Error("邮件服务尚未配置，请设置 SMTP_HOST、SMTP_USER 和 SMTP_PASS");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetCode(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isAdminEmail(normalizedEmail)) {
    return;
  }

  const existing = await readResetRecord();
  if (existing && Date.now() - existing.createdAt < resendIntervalMs) {
    const waitSeconds = Math.ceil(
      (resendIntervalMs - (Date.now() - existing.createdAt)) / 1000,
    );
    throw new Error(`请在 ${waitSeconds} 秒后重新发送验证码`);
  }

  const code = String(randomInt(100000, 1000000));
  const now = Date.now();
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim(),
      to: normalizedEmail,
      subject: "学术主页管理后台密码重置验证码",
      text: `您的验证码是 ${code}，10 分钟内有效。若非本人操作，请忽略此邮件。`,
      html: `<p>您的验证码是：</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>验证码 10 分钟内有效。若非本人操作，请忽略此邮件。</p>`,
    });
  } catch (error) {
    const responseCode =
      error && typeof error === "object" && "responseCode" in error
        ? Number(error.responseCode)
        : 0;

    if (responseCode === 535) {
      throw new Error(
        "邮箱 SMTP 认证失败，请在中科院邮箱中重新生成客户端专用密码，并更新 SMTP_PASS",
      );
    }

    throw new Error("验证码邮件发送失败，请检查 SMTP 配置或网络连接");
  }

  await mkdir(contentDir, { recursive: true });
  const record: PasswordResetRecord = {
    email: normalizedEmail,
    codeHash: hashCode(normalizedEmail, code),
    createdAt: now,
    expiresAt: now + codeLifetimeMs,
  };
  await writeFile(resetFile, JSON.stringify(record, null, 2), "utf-8");
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const record = await readResetRecord();

  if (
    !record ||
    record.email !== normalizedEmail ||
    record.expiresAt <= Date.now()
  ) {
    return false;
  }

  const expected = Buffer.from(record.codeHash, "hex");
  const actual = Buffer.from(hashCode(normalizedEmail, code), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function clearPasswordResetCode() {
  await rm(resetFile, { force: true });
}
