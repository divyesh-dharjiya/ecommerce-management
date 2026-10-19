// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { liveConfig } from "@/config/site";
import { startLeaderElection } from "@/features/live/services/leader-election";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("startLeaderElection", () => {
  it("elects exactly one leader among simultaneous tabs", () => {
    const a = startLeaderElection("tab-a");
    const b = startLeaderElection("tab-b");
    expect([a.isLeader(), b.isLeader()].filter(Boolean)).toHaveLength(1);
    a.stop();
    b.stop();
  });

  it("hands over when the leader goes away", () => {
    const a = startLeaderElection("tab-a");
    const b = startLeaderElection("tab-b");
    expect(a.isLeader()).toBe(true);
    a.stop(); // releases the lease
    vi.advanceTimersByTime(liveConfig.leaderHeartbeatMs + 10);
    expect(b.isLeader()).toBe(true);
    b.stop();
  });

  it("takes over a stale lease from a frozen tab", () => {
    localStorage.setItem("luxe:v1:live-leader", JSON.stringify({ id: "ghost", ts: Date.now() }));
    const b = startLeaderElection("tab-b");
    expect(b.isLeader()).toBe(false); // lease still fresh
    vi.advanceTimersByTime(liveConfig.leaderTimeoutMs + liveConfig.leaderHeartbeatMs + 10);
    expect(b.isLeader()).toBe(true);
    b.stop();
  });
});
