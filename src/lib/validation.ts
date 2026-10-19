/** Generic, domain-agnostic validation primitives. Domain rules live in each feature. */

/** Field-level error map. An empty object means the input is valid. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const hasErrors = <T>(errors: FieldErrors<T>) => Object.values(errors).some(Boolean);

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^\+?[\d\s()-]{7,20}$/.test(v.trim());
export const isPostalCode = (v: string) => /^[A-Za-z0-9\s-]{3,10}$/.test(v.trim());
export const isHexColor = (v: string) => /^#[0-9a-f]{6}$/i.test(v);
export const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};
export const minLength = (v: string, n: number) => v.trim().length >= n;
