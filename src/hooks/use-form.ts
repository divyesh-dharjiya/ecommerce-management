"use client";

import { useCallback, useState } from "react";
import { hasErrors, type FieldErrors } from "@/lib/validation";

/**
 * Minimal, typed form state: values, field errors, validation and
 * accessible input bindings. Errors clear as the user fixes a field.
 */
export function useForm<T extends object>(initial: T | (() => T), validate: (values: T) => FieldErrors<T>) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<FieldErrors<T>>({});

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  /** Validates; returns the first invalid field name, or null when valid. */
  const runValidation = useCallback(
    (override?: T) => {
      const found = validate(override ?? values);
      const clean = Object.fromEntries(Object.entries(found).filter(([, msg]) => msg)) as FieldErrors<T>;
      setErrors(clean);
      return hasErrors(clean) ? (Object.keys(clean)[0] as keyof T) : null;
    },
    [validate, values],
  );

  /** Spread onto <Input>/<Textarea>/<Select> for string fields. */
  const bind = <K extends keyof T & string>(key: K) => ({
    id: key,
    name: key,
    value: String(values[key] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setField(key, e.target.value as T[K]),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return { values, setValues, errors, setField, validate: runValidation, bind };
}
