"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, KeyRound, Loader2, Lock } from "lucide-react";
import { Button, buttonClasses, Card, Field, Input } from "@/components/ui";
import { Logo } from "@/components/layout/logo";
import { useAdminAuthStore } from "@/features/admin/auth/admin-auth-store";
import { PASSCODE_MIN_LENGTH, validatePasscode } from "@/features/admin/auth/passcode";
import { adminAuthConfig } from "@/features/admin/auth/session";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

/** Keeps the session alive while the admin is being used, and locks it once idle. */
function useIdleLock() {
  useEffect(() => {
    const { touch, checkIdle } = useAdminAuthStore.getState();
    let last = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - last < 5_000) return; // throttle storage writes
      last = now;
      touch();
    };
    const onVisible = () => document.visibilityState === "visible" && checkIdle();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(checkIdle, 15_000);
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, []);
}

function GateScreen({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm p-8">
        <Logo href="/" />
        <span className="mt-8 grid size-12 place-items-center rounded-full bg-muted">
          <Lock className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 rounded-md bg-muted/70 p-3 text-xs text-muted-foreground">
          Demo gate: the passcode is checked in your browser, not on a server. It keeps casual visitors out of the
          admin; it isn&apos;t real security.
        </p>
        <Link href="/" className={buttonClasses("ghost", "sm", "mt-4 -ml-3")}>
          <ArrowLeft className="size-4" /> Back to store
        </Link>
      </Card>
    </main>
  );
}

function UnlockForm() {
  const unlock = useAdminAuthStore((s) => s.unlock);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return setError("Enter the admin passcode.");
    setBusy(true);
    const result = await unlock(passcode);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setPasscode("");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Passcode" htmlFor="admin-passcode" error={error ?? undefined}>
        <Input
          id="admin-passcode"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={passcode}
          onChange={(e) => {
            setPasscode(e.target.value);
            setError(null);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "admin-passcode-error" : undefined}
        />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Unlock admin
      </Button>
    </form>
  );
}

function SetupForm() {
  const setup = useAdminAuthStore((s) => s.setup);
  const [values, setValues] = useState({ passcode: "", confirm: "" });
  const [errors, setErrors] = useState<{ passcode?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passcodeError = validatePasscode(values.passcode);
    const confirmError = values.confirm !== values.passcode ? "The passcodes don't match." : undefined;
    if (passcodeError || confirmError) {
      setErrors({ passcode: passcodeError ?? undefined, confirm: confirmError });
      document.getElementById(passcodeError ? "admin-new-passcode" : "admin-confirm-passcode")?.focus();
      return;
    }
    setBusy(true);
    await setup(values.passcode);
  };

  const bind = (key: "passcode" | "confirm", id: string) => ({
    id,
    type: "password",
    autoComplete: "new-password",
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
    },
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `${id}-error` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field
        label="New passcode"
        htmlFor="admin-new-passcode"
        error={errors.passcode}
        hint={`At least ${PASSCODE_MIN_LENGTH} characters.`}
      >
        <Input {...bind("passcode", "admin-new-passcode")} autoFocus />
      </Field>
      <Field label="Confirm passcode" htmlFor="admin-confirm-passcode" error={errors.confirm}>
        <Input {...bind("confirm", "admin-confirm-passcode")} />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Set passcode and enter
      </Button>
    </form>
  );
}

function UnlockedArea({ children }: { children: ReactNode }) {
  useIdleLock();
  return children;
}

/** Wraps the admin area: nothing inside renders until the passcode is entered. */
export function AdminGate({ children }: { children: ReactNode }) {
  const status = useAdminAuthStore((s) => s.status);
  const init = useAdminAuthStore((s) => s.init);
  useEffect(init, [init]);

  if (status === "unlocked") return <UnlockedArea>{children}</UnlockedArea>;
  if (status === "setup") {
    return (
      <GateScreen
        title="Set up admin access"
        description="Choose a passcode for the admin dashboard on this device. You'll need it each time you open the admin."
      >
        <SetupForm />
      </GateScreen>
    );
  }
  if (status === "locked") {
    return (
      <GateScreen
        title="Admin locked"
        description={`Enter the passcode to continue. The admin locks itself after ${Math.round(adminAuthConfig.idleMs / 60_000)} minutes of inactivity.`}
      >
        <UnlockForm />
      </GateScreen>
    );
  }
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Checking admin access">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
