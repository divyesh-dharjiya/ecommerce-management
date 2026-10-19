import { Banknote, CreditCard, Smartphone, type LucideIcon } from "lucide-react";
import type { CustomerDetails, PaymentMethod } from "@/types";

export const COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "Singapore",
  "United Arab Emirates",
] as const;

export const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string; icon: LucideIcon }[] = [
  { id: "card", label: "Card", description: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "upi", label: "UPI", description: "Pay with any UPI app", icon: Smartphone },
  { id: "cod", label: "Cash on delivery", description: "Pay when it arrives", icon: Banknote },
];

export const PAYMENT_LABEL: Record<PaymentMethod, string> = { card: "Card", upi: "UPI", cod: "Cash on delivery" };

export const EMPTY_CUSTOMER: CustomerDetails = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "United States",
};
