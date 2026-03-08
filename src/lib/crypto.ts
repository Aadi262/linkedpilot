import crypto from "crypto";

/**
 * AES-256-GCM Encryption Utility
 * ENCRYPTION_KEY env var must be exactly 64 hex chars (= 32 bytes).
 */

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Got ${hex?.length ?? 0} chars.`
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: `${iv}:${authTag}:${encrypted}` (all hex-encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt an AES-256-GCM ciphertext string.
 * Expects format: `${ivHex}:${authTagHex}:${encryptedHex}`
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid ciphertext format. Expected iv:authTag:encrypted");
  }
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * Check if a value looks like an encrypted string (3 colon-separated hex strings).
 */
export function isEncrypted(value: string): boolean {
  return /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value);
}

// ─── Self-test ──────────────────────────────────────────────────────────────────
if (require.main === module) {
  // Use a test key if ENCRYPTION_KEY is not set
  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
  }
  const original = "test-cookie-value-12345";
  const enc = encrypt(original);
  const dec = decrypt(enc);
  console.assert(dec === original, "Crypto self-test FAILED");
  console.log("Crypto self-test PASSED");
  console.log("  encrypted:", enc);
  console.log("  decrypted:", dec);
  console.log("  isEncrypted:", isEncrypted(enc));
}
