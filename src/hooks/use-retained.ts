"use client";

import { useState } from "react";

/**
 * Returns `value`, or the last non-null value once it is cleared.
 *
 * Dialogs are usually opened with "the thing being edited" and closed by
 * setting it to null. Their exit animation still renders, so without this the
 * closing dialog flashes empty content or titles like `Delete “undefined”?`.
 */
export function useRetained<T>(value: T | null | undefined): T | null | undefined {
  const [kept, setKept] = useState(value);
  if (value != null && value !== kept) setKept(value);
  return value ?? kept;
}
