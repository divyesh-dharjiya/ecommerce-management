import { Field, Input, Select } from "@/components/ui";
import { COUNTRIES } from "@/features/checkout/config";
import type { FieldErrors } from "@/lib/validation";
import type { CustomerDetails } from "@/types";

type Bind = (key: keyof CustomerDetails & string) => React.InputHTMLAttributes<HTMLInputElement> & { value: string };

const FIELDS: {
  key: keyof CustomerDetails & string;
  label: string;
  wide?: boolean;
  input?: React.InputHTMLAttributes<HTMLInputElement>;
}[] = [
  { key: "fullName", label: "Full name", wide: true, input: { autoComplete: "name", placeholder: "Jane Appleseed" } },
  { key: "email", label: "Email", input: { type: "email", autoComplete: "email", placeholder: "jane@example.com" } },
  { key: "phone", label: "Phone", input: { type: "tel", autoComplete: "tel", placeholder: "+1 555 0100" } },
  {
    key: "address",
    label: "Street address",
    wide: true,
    input: { autoComplete: "street-address", placeholder: "123 Market Street, Apt 4" },
  },
  { key: "city", label: "City", input: { autoComplete: "address-level2" } },
  { key: "postalCode", label: "Postal code", input: { autoComplete: "postal-code" } },
];

/** Declarative contact + shipping fields bound through `useForm`. */
export function ShippingFields({ bind, errors }: { bind: Bind; errors: FieldErrors<CustomerDetails> }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {FIELDS.map((f) => (
        <Field
          key={f.key}
          label={f.label}
          htmlFor={f.key}
          error={errors[f.key]}
          className={f.wide ? "sm:col-span-2" : undefined}
        >
          <Input {...bind(f.key)} {...f.input} />
        </Field>
      ))}
      <Field label="Country" htmlFor="country" error={errors.country} className="sm:col-span-2">
        <Select {...(bind("country") as React.SelectHTMLAttributes<HTMLSelectElement>)} autoComplete="country-name">
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
