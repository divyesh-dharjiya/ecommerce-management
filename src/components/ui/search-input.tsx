"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size"> {
  value: string;
  onValueChange: (value: string) => void;
  size?: "md" | "lg";
}

/** Text input with a search icon and a clear button. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onValueChange, size = "md", className, placeholder = "Search…", ...props },
  ref,
) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        aria-label={props["aria-label"] ?? placeholder}
        className={cn(
          "w-full rounded-md border border-border bg-card pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden",
          size === "md" ? "h-10" : "h-11",
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
});
