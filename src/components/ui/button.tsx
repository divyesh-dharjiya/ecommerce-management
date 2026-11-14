import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary: "bg-muted text-foreground hover:bg-border",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  danger: "bg-danger text-white hover:bg-danger/90",
  dark: "bg-foreground text-background hover:bg-foreground/90",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "size-10 rounded-lg",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const buttonClasses = (
  variant: keyof typeof variants = "primary",
  size: keyof typeof sizes = "md",
  className?: string,
) =>
  cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
