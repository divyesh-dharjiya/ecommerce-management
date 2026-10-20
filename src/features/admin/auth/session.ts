/** Pure rules for the admin demo gate's session: idle timeout and brute-force lockout. */

const minutes = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export interface AdminAuthConfig {
  idleMs: number;
  maxAttempts: number;
  cooldownMs: number;
}

export const adminAuthConfig: AdminAuthConfig = {
  /** Locks the admin after this long without interaction. */
  idleMs: minutes(process.env.NEXT_PUBLIC_ADMIN_IDLE_MINUTES, 15) * 60_000,
  /** Wrong guesses allowed before a cooldown. */
  maxAttempts: 5,
  cooldownMs: 30_000,
};

export interface AdminSession {
  /** Last interaction, epoch ms. */
  lastActive: number;
}

export const isSessionActive = (session: AdminSession | null, now: number, idleMs = adminAuthConfig.idleMs) =>
  !!session && Number.isFinite(session.lastActive) && now - session.lastActive < idleMs && session.lastActive <= now;

export interface AttemptState {
  failed: number;
  lockedUntil: number;
}

export const NO_ATTEMPTS: AttemptState = { failed: 0, lockedUntil: 0 };

/** Records a wrong guess; every `maxAttempts`-th failure starts a cooldown. */
export function registerFailure(state: AttemptState, now: number, config: AdminAuthConfig = adminAuthConfig) {
  const failed = state.failed + 1;
  const lockedUntil = failed % config.maxAttempts === 0 ? now + config.cooldownMs : state.lockedUntil;
  return { failed, lockedUntil } satisfies AttemptState;
}

export const cooldownRemaining = (state: AttemptState, now: number) => Math.max(0, state.lockedUntil - now);
