import { createJSONStorage, type PersistOptions, type StateStorage } from "zustand/middleware";
import { storageKey } from "@/config/site";

/**
 * localStorage adapter that never throws: private mode, disabled storage and
 * quota errors degrade to in-memory behaviour instead of crashing the app.
 */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch (error) {
      console.warn(`[storage] Failed to persist "${name}"`, error);
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

/**
 * Shared persist options. `skipHydration` keeps the first client render
 * identical to the server render; <StoreHydrator/> rehydrates after mount.
 */
export function persistOptions<S, P = Partial<S>>(
  name: string,
  options: Omit<PersistOptions<S, P>, "name" | "storage" | "skipHydration"> = {},
): PersistOptions<S, P> {
  return {
    name: storageKey(name),
    storage: createJSONStorage(() => safeLocalStorage),
    skipHydration: true,
    ...options,
  } as PersistOptions<S, P>;
}
