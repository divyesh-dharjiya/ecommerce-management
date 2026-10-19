/**
 * Brand colours that must exist as literal values in JavaScript — the
 * browser `theme-color` meta, the web manifest and the pre-paint theme
 * script all run before (or outside) the stylesheet.
 *
 * Keep in sync with `--background` in `src/app/globals.css`.
 */
export const THEME_COLORS = {
  light: "#f7f5f0",
  dark: "#141310",
} as const;

export const BRAND_ACCENT = "#d9482b";
