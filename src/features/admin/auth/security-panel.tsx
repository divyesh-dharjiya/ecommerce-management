"use client";

import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Input } from "@/components/ui";
import { Panel } from "@/features/admin/components/admin-page";
import { useAdminAuthStore } from "@/features/admin/auth/admin-auth-store";
import { validatePasscode } from "@/features/admin/auth/passcode";
import { adminAuthConfig } from "@/features/admin/auth/session";

const EMPTY = { current: "", next: "", confirm: "" };
type Values = typeof EMPTY;

function ChangePasscodeForm() {
  const changePasscode = useAdminAuthStore((s) => s.changePasscode);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found: Partial<Values> = {
      current: values.current ? undefined : "Enter your current passcode.",
      next: validatePasscode(values.next) ?? undefined,
      confirm: values.confirm === values.next ? undefined : "The passcodes don't match.",
    };
    const first = (Object.keys(found) as (keyof Values)[]).find((k) => found[k]);
    setErrors(found);
    if (first) return document.getElementById(`passcode-${first}`)?.focus();
    setBusy(true);
    const result = await changePasscode(values.current, values.next);
    setBusy(false);
    if (!result.ok) {
      setErrors({ current: result.error });
      return document.getElementById("passcode-current")?.focus();
    }
    setValues(EMPTY);
    toast.success("Admin passcode changed");
  };

  const field = (key: keyof Values, label: string, autoComplete: string) => (
    <Field label={label} htmlFor={`passcode-${key}`} error={errors[key]}>
      <Input
        id={`passcode-${key}`}
        type="password"
        autoComplete={autoComplete}
        value={values[key]}
        onChange={(e) => {
          setValues((v) => ({ ...v, [key]: e.target.value }));
          setErrors((er) => ({ ...er, [key]: undefined }));
        }}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `passcode-${key}-error` : undefined}
      />
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {field("current", "Current passcode", "current-password")}
      {field("next", "New passcode", "new-password")}
      {field("confirm", "Confirm new", "new-password")}
      <div className="sm:col-span-3">
        <Button type="submit" variant="outline" disabled={busy}>
          Change passcode
        </Button>
      </div>
    </form>
  );
}

/** Settings → Security: how the demo gate is configured, change passcode, lock now. */
export function SecurityPanel() {
  const source = useAdminAuthStore((s) => s.source);
  const lock = useAdminAuthStore((s) => s.lock);
  return (
    <Panel
      title={
        <>
          <ShieldCheck className="size-4 text-primary" /> Admin access
        </>
      }
      action={
        <Button variant="outline" size="sm" onClick={lock}>
          <Lock className="size-4" /> Lock now
        </Button>
      }
    >
      <p className="mb-5 text-sm text-muted-foreground">
        The admin locks after {Math.round(adminAuthConfig.idleMs / 60_000)} minutes of inactivity and when this tab
        closes. This is a demo gate checked in the browser, not server-side authentication.
      </p>
      {source === "env" ? (
        <p className="rounded-md bg-muted/60 p-4 text-sm">
          The passcode is set by the deployment (
          <code className="font-mono text-xs">NEXT_PUBLIC_ADMIN_PASSCODE_HASH</code>
          ). Generate a new value with <code className="font-mono text-xs">npm run admin:hash</code>.
        </p>
      ) : (
        <ChangePasscodeForm />
      )}
    </Panel>
  );
}
