import { isEmail, isPhone, isPostalCode, minLength, type FieldErrors } from "@/lib/validation";
import type { CustomerDetails } from "@/types";

export function validateCustomer(c: CustomerDetails): FieldErrors<CustomerDetails> {
  const e: FieldErrors<CustomerDetails> = {};
  if (!minLength(c.fullName, 2)) e.fullName = "Please enter your full name.";
  if (!isEmail(c.email)) e.email = "Enter a valid email address.";
  if (!isPhone(c.phone)) e.phone = "Enter a valid phone number.";
  if (!minLength(c.address, 5)) e.address = "Enter your street address.";
  if (!minLength(c.city, 2)) e.city = "Enter your city.";
  if (!isPostalCode(c.postalCode)) e.postalCode = "Enter a valid postal code.";
  if (!minLength(c.country, 2)) e.country = "Select your country.";
  return e;
}
