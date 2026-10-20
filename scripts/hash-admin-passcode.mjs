#!/usr/bin/env node
/**
 * Prints a value for NEXT_PUBLIC_ADMIN_PASSCODE_HASH.
 *
 *   npm run admin:hash -- "my passcode"
 *
 * Uses the same PBKDF2-SHA-256 parameters as src/features/admin/auth/passcode.ts.
 * Only the salted hash reaches the browser bundle, never the passcode itself.
 */
import { webcrypto as crypto } from "node:crypto";

const ITERATIONS = 150_000;
const passcode = process.argv[2];
if (!passcode || passcode.length < 4) {
  console.error('Usage: npm run admin:hash -- "<passcode of 4+ characters>"');
  process.exit(1);
}

const hex = (bytes) => Buffer.from(bytes).toString("hex");
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(passcode), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
  key,
  256,
);
console.log(`NEXT_PUBLIC_ADMIN_PASSCODE_HASH=${hex(salt)}:${hex(bits)}`);
