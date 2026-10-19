import { storageKey } from "@/config/site";
import { EMPTY_CUSTOMER } from "@/features/checkout/config";
import type { CustomerDetails } from "@/types";

const KEY = storageKey("last-address");

/** Remembers the last shipping address on this device to pre-fill checkout. */
export function loadSavedAddress(): CustomerDetails {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? { ...EMPTY_CUSTOMER, ...(JSON.parse(saved) as Partial<CustomerDetails>) } : EMPTY_CUSTOMER;
  } catch {
    return EMPTY_CUSTOMER;
  }
}

export function saveAddress(details: CustomerDetails) {
  try {
    localStorage.setItem(KEY, JSON.stringify(details));
  } catch {
    /* non-critical */
  }
}
