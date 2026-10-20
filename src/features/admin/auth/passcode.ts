/**
 * Admin passcode hashing with the Web Crypto API (PBKDF2-SHA-256).
 *
 * DEMO GATE, NOT SECURITY: everything runs in the browser and the data it
 * protects lives in the same browser's localStorage. It keeps casual visitors
 * out of the admin screens of a demo; a real store needs server-side auth.
 */

const ITERATIONS = 150_000;
const encoder = new TextEncoder();

export const PASSCODE_MIN_LENGTH = 4;
export const PASSCODE_MAX_LENGTH = 64;

/** A stored credential: `salt` and `hash` are hex strings. */
export interface PasscodeRecord {
  salt: string;
  hash: string;
}

const toHex = (bytes: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");

const fromHex = (hex: string) => new Uint8Array((hex.match(/../g) ?? []).map((h) => parseInt(h, 16)));

export function validatePasscode(passcode: string): string | null {
  if (passcode.length < PASSCODE_MIN_LENGTH) return `Use at least ${PASSCODE_MIN_LENGTH} characters.`;
  if (passcode.length > PASSCODE_MAX_LENGTH) return `Use at most ${PASSCODE_MAX_LENGTH} characters.`;
  return null;
}

export const generateSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

export async function hashPasscode(passcode: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(passcode), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(salt), iterations: ITERATIONS },
    key,
    256,
  );
  return toHex(bits);
}

export async function createPasscodeRecord(passcode: string): Promise<PasscodeRecord> {
  const salt = generateSalt();
  return { salt, hash: await hashPasscode(passcode, salt) };
}

/** Constant-time comparison, so a wrong guess takes as long as a nearly right one. */
function equalHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPasscode(passcode: string, record: PasscodeRecord): Promise<boolean> {
  return equalHex(await hashPasscode(passcode, record.salt), record.hash);
}

/** Parses the `salt:hash` format used by NEXT_PUBLIC_ADMIN_PASSCODE_HASH. */
export function parsePasscodeRecord(value: string | undefined): PasscodeRecord | null {
  const match = value?.trim().match(/^([0-9a-f]{32}):([0-9a-f]{64})$/i);
  return match ? { salt: match[1]!.toLowerCase(), hash: match[2]!.toLowerCase() } : null;
}

export const formatPasscodeRecord = (r: PasscodeRecord) => `${r.salt}:${r.hash}`;
