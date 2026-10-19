"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { ease } from "@/lib/motion";
import { useTheme } from "@/components/providers/theme";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { SearchCommand } from "@/components/layout/search-command";
import { LiveEngine } from "@/features/live/components/live-engine";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { resolved } = useTheme();
  return (
    // Global motion defaults + honour the OS "reduce motion" setting everywhere.
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: ease.outExpo }}>
      <StoreHydrator />
      <LiveEngine />
      {children}
      <SearchCommand />
      <Toaster
        theme={resolved}
        position="top-right"
        closeButton
        toastOptions={{ className: "!rounded-2xl !border-border !bg-card !text-foreground !shadow-lift !font-sans" }}
      />
    </MotionConfig>
  );
}
