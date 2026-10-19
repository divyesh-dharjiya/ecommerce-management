import { THEME_COLORS } from "@/config/brand";
import { storageKey } from "@/config/site";

/**
 * Framework-agnostic theme engine (an external store for useSyncExternalStore).
 *
 * - Three preferences: light, dark, system (follows the OS live).
 * - Persisted to localStorage and synced across tabs.
 * - Applies the `.dark` class, `color-scheme` and `<meta name="theme-color">`.
 * - Animated switch via the View Transitions API (circular reveal from the
 *   pointer), falling back to an instant swap where unsupported.
 */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = storageKey("theme");
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isPreference = (v: unknown): v is ThemePreference => v === "light" || v === "dark" || v === "system";

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(v) ? v : "system";
  } catch {
    return "system";
  }
}

const systemTheme = (): ResolvedTheme => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

export const resolveTheme = (pref: ThemePreference): ResolvedTheme => (pref === "system" ? systemTheme() : pref);

function apply(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[resolved]);
}

// ── External store ───────────────────────────────────────────────────────────
interface Snapshot {
  preference: ThemePreference;
  resolved: ResolvedTheme;
}

const SERVER_SNAPSHOT: Snapshot = { preference: "system", resolved: "light" };
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();
let wired = false;

function refresh() {
  const preference = readPreference();
  const resolved = resolveTheme(preference);
  if (snapshot?.preference !== preference || snapshot?.resolved !== resolved) {
    snapshot = { preference, resolved };
    apply(resolved);
    listeners.forEach((l) => l());
  }
}

function wire() {
  if (wired) return;
  wired = true;
  window.matchMedia(DARK_QUERY).addEventListener("change", refresh);
  window.addEventListener("storage", (e) => e.key === THEME_STORAGE_KEY && refresh());
}

export const themeStore = {
  subscribe(listener: () => void) {
    wire();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): Snapshot {
    if (!snapshot) {
      const preference = readPreference();
      snapshot = { preference, resolved: resolveTheme(preference) };
    }
    return snapshot;
  },
  getServerSnapshot: () => SERVER_SNAPSHOT,
};

/** Changes the theme; `origin` (viewport coords) centres the reveal animation. */
export function setThemePreference(preference: ThemePreference, origin?: { x: number; y: number }) {
  const next = resolveTheme(preference);
  const current = themeStore.getSnapshot().resolved;
  const commit = () => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* storage unavailable — still apply for this session */
    }
    refresh();
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (next === current || reduceMotion || !document.startViewTransition) {
    commit();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(commit);
  void transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

/** Inlined in <head> so the correct theme paints on the very first frame. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');var d=p==='dark'||((p!=='light')&&window.matchMedia('${DARK_QUERY}').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',d?'${THEME_COLORS.dark}':'${THEME_COLORS.light}');}catch(e){}})();`;
