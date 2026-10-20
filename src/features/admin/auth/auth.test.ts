import { describe, expect, it } from "vitest";
import {
  createPasscodeRecord,
  formatPasscodeRecord,
  parsePasscodeRecord,
  validatePasscode,
  verifyPasscode,
} from "@/features/admin/auth/passcode";
import { cooldownRemaining, isSessionActive, NO_ATTEMPTS, registerFailure } from "@/features/admin/auth/session";

describe("passcode hashing", () => {
  it("verifies the right passcode and rejects others", async () => {
    const record = await createPasscodeRecord("2468");
    expect(record.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await verifyPasscode("2468", record)).toBe(true);
    expect(await verifyPasscode("2469", record)).toBe(false);
  });

  it("salts every record, so equal passcodes hash differently", async () => {
    const [a, b] = await Promise.all([createPasscodeRecord("same"), createPasscodeRecord("same")]);
    expect(a.hash).not.toBe(b.hash);
  });

  it("round-trips the salt:hash env format and rejects junk", async () => {
    const record = await createPasscodeRecord("1234");
    expect(parsePasscodeRecord(formatPasscodeRecord(record))).toEqual(record);
    expect(parsePasscodeRecord("1234")).toBeNull();
    expect(parsePasscodeRecord(undefined)).toBeNull();
  });

  it("enforces a minimum length", () => {
    expect(validatePasscode("12")).toMatch(/at least/);
    expect(validatePasscode("1234")).toBeNull();
  });
});

describe("admin session", () => {
  it("expires after the idle timeout", () => {
    expect(isSessionActive({ lastActive: 1_000 }, 1_000 + 59_000, 60_000)).toBe(true);
    expect(isSessionActive({ lastActive: 1_000 }, 1_000 + 60_000, 60_000)).toBe(false);
    expect(isSessionActive(null, 0, 60_000)).toBe(false);
  });

  it("rejects a session stamped in the future", () => {
    expect(isSessionActive({ lastActive: 5_000 }, 1_000, 60_000)).toBe(false);
  });

  it("starts a cooldown after repeated wrong guesses", () => {
    const config = { idleMs: 0, maxAttempts: 3, cooldownMs: 30_000 };
    let state = NO_ATTEMPTS;
    for (let i = 0; i < 2; i++) state = registerFailure(state, 0, config);
    expect(cooldownRemaining(state, 0)).toBe(0);
    state = registerFailure(state, 0, config);
    expect(cooldownRemaining(state, 10_000)).toBe(20_000);
    expect(cooldownRemaining(state, 30_000)).toBe(0);
  });
});
