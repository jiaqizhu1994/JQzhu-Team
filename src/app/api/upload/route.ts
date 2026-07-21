import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { adminUnauthorized, isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const maxImageSize = 15 * 1024 * 1024;
const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const imageExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function safeFileName(name: string, type: string) {
  const originalExt = path.extname(name).toLowerCase();
  const base = path
    .basename(name, originalExt)
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${base || "image"}-${Date.now()}${imageExtensions[type]}`;
}

function optimizedFileName(name: string) {
  const originalExt = path.extname(name).toLowerCase();
  const base = path
    .basename(name, originalExt)
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${base || "image"}-${Date.now()}.webp`;
}

function hasValidImageSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (type === "image/gif") {
    const signature = new TextDecoder().decode(bytes.slice(0, 4));
    return signature === "GIF8";
  }
  if (type === "image/webp") {
    const riff = new TextDecoder().decode(bytes.slice(0, 4));
    const webp = new TextDecoder().decode(bytes.slice(8, 12));
    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return adminUnauthorized();
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!supportedImageTypes.has(file.type)) {
    return NextResponse.json(
      { error: "仅支持 JPG、PNG、WebP 和 GIF 图片" },
      { status: 400 },
    );
  }

  if (file.size > maxImageSize) {
    return NextResponse.json(
      { error: "单张图片不能超过 15 MB" },
      { status: 413 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  if (!hasValidImageSignature(file.type, bytes)) {
    return NextResponse.json(
      { error: "图片内容与文件格式不匹配" },
      { status: 400 },
    );
  }

  await mkdir(uploadDir, { recursive: true });

  const originalBuffer = Buffer.from(arrayBuffer);
  let fileName: string;
  let outputBuffer: Buffer;

  if (file.type === "image/gif") {
    fileName = safeFileName(file.name, file.type);
    outputBuffer = originalBuffer;
  } else {
    fileName = optimizedFileName(file.name);
    outputBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 86, effort: 5, smartSubsample: true })
      .toBuffer();
  }

  await writeFile(path.join(uploadDir, fileName), outputBuffer);

  return NextResponse.json({
    path: `/uploads/${fileName}`,
    optimized: file.type !== "image/gif",
    originalSize: file.size,
    savedSize: outputBuffer.length,
  });
}
