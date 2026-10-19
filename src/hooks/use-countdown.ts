"use client";

import { useNow } from "@/hooks/use-now";

/** Countdown to the next occurrence of `resetHour:00` local time (daily deals). */
export function useDailyCountdown(resetHour = 24) {
  const now = useNow(1000);
  const end = new Date(now);
  end.setHours(resetHour, 0, 0, 0);
  if (end.getTime() <= now) end.setDate(end.getDate() + 1);
  const diff = Math.max(0, end.getTime() - now);
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}
