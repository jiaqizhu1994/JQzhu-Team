import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { isAdminEmail } from "@/lib/adminAuth";

const scryptAsync = promisify(scrypt);
const contentDir = path.join(process.cwd(), "content");
const credentialsFile = path.join(contentDir, "admin-auth.json");

type StoredCredentials = {
  email: string;
  passwordHash: string;
};

type StoredCredentialStore = {
  accounts: Record<string, string>;
};

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyHash(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function readStoredCredentials(): Promise<StoredCredentialStore> {
  try {
    const stored = JSON.parse(await readFile(credentialsFile, "utf-8")) as
      | StoredCredentials
      | StoredCredentialStore;
    if ("accounts" in stored && stored.accounts) {
      return stored;
    }
    if ("email" in stored && stored.email && stored.passwordHash) {
      return {
        accounts: { [stored.email.toLowerCase()]: stored.passwordHash },
      };
    }
  } catch {
    // Missing credentials use the configured initial password.
  }
  return { accounts: {} };
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isAdminEmail(normalizedEmail)) {
    return false;
  }

  const stored = await readStoredCredentials();
  const passwordHash = stored.accounts[normalizedEmail];
  if (passwordHash) {
    return verifyHash(password, passwordHash);
  }

  return password === (process.env.ADMIN_PASSWORD || "admin123");
}

export async function updateAdminPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isAdminEmail(normalizedEmail)) {
    throw new Error("Invalid administrator email");
  }
  await mkdir(contentDir, { recursive: true });
  const credentials = await readStoredCredentials();
  credentials.accounts[normalizedEmail] = await hashPassword(password);
  await writeFile(credentialsFile, JSON.stringify(credentials, null, 2), "utf-8");
}
