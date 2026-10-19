"use client";

import { useRef, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { setThemePreference, themeStore, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { DropdownMenu, SegmentedControl } from "@/components/ui";

export function useTheme() {
  const { preference, resolved } = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );
  return { preference, resolved, isDark: resolved === "dark", setTheme: setThemePreference };
}

const OPTIONS = [
  { value: "light", label: "Light", icon: <Sun className="size-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="size-4" /> },
  { value: "system", label: "System", icon: <Monitor className="size-4" /> },
] as const satisfies readonly { value: ThemePreference; label: string; icon: React.ReactNode }[];

/** Centre of an element — the theme reveal animation grows from here. */
const centreOf = (el: HTMLElement | null) => {
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined;
};

/** Icon button + menu (header / admin top bar). */
export function ThemeMenu({ className }: { className?: string }) {
  const { preference, setTheme } = useTheme();
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <DropdownMenu
      className={className}
      items={OPTIONS}
      value={preference}
      onSelect={(v) => setTheme(v, centreOf(trigger.current))}
      trigger={(props) => (
        <button
          ref={trigger}
          type="button"
          aria-label="Change theme"
          className="relative grid size-10 place-items-center rounded-full text-foreground/80 transition hover:bg-muted hover:text-foreground"
          {...props}
        >
          {/* Pure CSS swap keyed off the `.dark` class — correct on first paint, no hydration flash. */}
          <Sun className="size-[18px] rotate-0 scale-100 transition-all duration-500 ease-[var(--ease-out-expo)] dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[18px] rotate-90 scale-0 transition-all duration-500 ease-[var(--ease-out-expo)] dark:rotate-0 dark:scale-100" />
        </button>
      )}
    />
  );
}

/** Inline three-way switch (mobile menu, settings). */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { preference, setTheme } = useTheme();
  return (
    <div className={cn(className)}>
      <SegmentedControl
        label="Theme"
        size="sm"
        value={preference}
        onChange={(v) => setTheme(v)}
        options={OPTIONS.map((o) => ({ value: o.value, label: o.icon, ariaLabel: o.label }))}
      />
    </div>
  );
}
