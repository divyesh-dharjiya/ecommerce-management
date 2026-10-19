"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { commerceConfig } from "@/config/site";

const MESSAGES = [
  `Free express shipping on orders over $${commerceConfig.freeShippingThreshold}`,
  "New here? Use code WELCOME10 for 10% off",
  "Spend $200+ and use LUXE20 for 20% off",
  "30-day hassle-free returns on everything",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-9 overflow-hidden border-b border-white/10 bg-[oklch(0.17_0.02_286)] text-white/90" role="region" aria-label="Announcements">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={index}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 grid place-items-center px-4 text-center text-xs font-medium tracking-wide"
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
