import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jsQR from "jsqr";
import QRCode from "qrcode";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultUrl = "https://jiaqizhu1994.github.io/JQzhu-Team/";
const targetUrl = process.argv[2] || defaultUrl;
const outputPath = path.join(root, "public", "images", "jqzhu-team-qrcode.png");

await mkdir(path.dirname(outputPath), { recursive: true });
await QRCode.toFile(outputPath, targetUrl, {
  type: "png",
  errorCorrectionLevel: "H",
  width: 1200,
  margin: 6,
  color: {
    dark: "#082B60",
    light: "#FFFFFFFF",
  },
});

const { data, info } = await sharp(outputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const decoded = jsQR(
  new Uint8ClampedArray(data),
  info.width,
  info.height,
);

if (decoded?.data !== targetUrl) {
  throw new Error("Generated QR code could not be verified.");
}

console.log(`QR code generated: ${outputPath}`);
console.log(`Target URL: ${targetUrl}`);
console.log("Verification: passed");
