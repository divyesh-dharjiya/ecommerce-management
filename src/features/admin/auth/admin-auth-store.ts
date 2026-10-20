"use client";

import { create } from "zustand";
import { storageKey } from "@/config/site";
import {
  createPasscodeRecord,
  parsePasscodeRecord,
  verifyPasscode,
  type PasscodeRecord,
} from "@/features/admin/auth/passcode";
import {
  adminAuthConfig,
  cooldownRemaining,
  isSessionActive,
  NO_ATTEMPTS,
  registerFailure,
  type AdminSession,
  type AttemptState,
} from "@/features/admin/auth/session";

/**
 * Admin demo gate state.
 *
 * - The passcode comes from NEXT_PUBLIC_ADMIN_PASSCODE_HASH when set
 *   ("env"), otherwise the first visitor on a device chooses one ("device"),
 *   stored hashed in localStorage.
 * - Unlocking lasts for the browser tab's session (sessionStorage) and ends
 *   after a period of inactivity or on "Lock admin".
 */
export type AdminAuthStatus = "checking" | "setup" | "locked" | "unlocked";

const ENV_RECORD = parsePasscodeRecord(process.env.NEXT_PUBLIC_ADMIN_PASSCODE_HASH);
const CREDENTIAL_KEY = storageKey("admin-passcode");
const SESSION_KEY = storageKey("admin-session");

function read<T>(storage: () => Storage, key: string): T | null {
  try {
    const raw = storage().getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: unknown) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the gate still works for this page view */
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

const deviceRecord = () => {
  const r = read<PasscodeRecord>(local, CREDENTIAL_KEY);
  return r && typeof r.salt === "string" && typeof r.hash === "string" ? r : null;
};
const credential = () => ENV_RECORD ?? deviceRecord();

export type UnlockResult = { ok: true } | { ok: false; error: string };

interface AdminAuthState {
  status: AdminAuthStatus;
  source: "env" | "device";
  attempts: AttemptState;
  /** Reads storage and decides which screen to show. Call once on mount. */
  init: () => void;
  setup: (passcode: string) => Promise<void>;
  unlock: (passcode: string) => Promise<UnlockResult>;
  lock: () => void;
  /** Records activity; locks instead if the session already went idle. */
  touch: () => void;
  /** Locks if the session has been idle too long. */
  checkIdle: () => void;
  changePasscode: (current: string, next: string) => Promise<UnlockResult>;
}

export const useAdminAuthStore = create<AdminAuthState>()((set, get) => ({
  status: "checking",
  source: ENV_RECORD ? "env" : "device",
  attempts: NO_ATTEMPTS,

  init: () => {
    if (!credential()) return set({ status: "setup" });
    const active = isSessionActive(read<AdminSession>(session, SESSION_KEY), Date.now());
    set({ status: active ? "unlocked" : "locked" });
  },

  setup: async (passcode) => {
    if (credential()) return; // someone set it in another tab meanwhile
    write(local, CREDENTIAL_KEY, await createPasscodeRecord(passcode));
    write(session, SESSION_KEY, { lastActive: Date.now() } satisfies AdminSession);
    set({ status: "unlocked", attempts: NO_ATTEMPTS });
  },

  unlock: async (passcode) => {
    const now = Date.now();
    const wait = cooldownRemaining(get().attempts, now);
    if (wait > 0) return { ok: false, error: `Too many attempts. Try again in ${Math.ceil(wait / 1000)}s.` };
    const record = credential();
    if (!record) {
      set({ status: "setup" });
      return { ok: false, error: "No passcode is set yet." };
    }
    if (!(await verifyPasscode(passcode, record))) {
      const attempts = registerFailure(get().attempts, Date.now());
      set({ attempts });
      const locked = cooldownRemaining(attempts, Date.now());
      return {
        ok: false,
        error: locked ? `Too many attempts. Try again in ${Math.ceil(locked / 1000)}s.` : "That passcode isn't right.",
      };
    }
    write(session, SESSION_KEY, { lastActive: Date.now() } satisfies AdminSession);
    set({ status: "unlocked", attempts: NO_ATTEMPTS });
    return { ok: true };
  },

  lock: () => {
    write(session, SESSION_KEY, null);
    if (get().status === "unlocked") set({ status: "locked" });
  },

  touch: () => {
    if (get().status !== "unlocked") return;
    if (!isSessionActive(read<AdminSession>(session, SESSION_KEY), Date.now())) return get().lock();
    write(session, SESSION_KEY, { lastActive: Date.now() } satisfies AdminSession);
  },

  checkIdle: () => {
    if (get().status !== "unlocked") return;
    if (!isSessionActive(read<AdminSession>(session, SESSION_KEY), Date.now())) get().lock();
  },

  changePasscode: async (current, next) => {
    if (ENV_RECORD) return { ok: false, error: "The passcode is set by the deployment and can't be changed here." };
    const record = deviceRecord();
    if (!record || !(await verifyPasscode(current, record))) {
      return { ok: false, error: "Your current passcode isn't right." };
    }
    write(local, CREDENTIAL_KEY, await createPasscodeRecord(next));
    return { ok: true };
  },
}));

export { adminAuthConfig };
