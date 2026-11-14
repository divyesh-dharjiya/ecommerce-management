"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { ease } from "@/lib/motion";
import { useTheme } from "@/components/providers/theme";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { SearchCommand } from "@/components/layout/search-command";
import { LiveEngine } from "@/features/live/components/live-engine";

// Animation engine is code-split: see lib/motion-features.ts.
const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { resolved } = useTheme();
  return (
    // Global motion defaults + honour the OS "reduce motion" setting everywhere.
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: ease.outExpo }}>
      <LazyMotion features={loadMotionFeatures} strict>
        <StoreHydrator />
        {/* Simulated orders and stock changes that feed the admin dashboard. */}
        <LiveEngine />
        {children}
        <SearchCommand />
        <Toaster
          theme={resolved}
          position="top-center"
          closeButton
          toastOptions={{ className: "!rounded-xl !border-border !bg-card !text-foreground !shadow-lift !font-sans" }}
        />
      </LazyMotion>
    </MotionConfig>
  );
}
