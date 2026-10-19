import { liveConfig, storageKey } from "@/config/site";

const LEADER_KEY = storageKey("live-leader");

interface Lease {
  id: string;
  ts: number;
}

function readLease(): Lease | null {
  try {
    return JSON.parse(localStorage.getItem(LEADER_KEY) ?? "null") as Lease | null;
  } catch {
    return null;
  }
}

/**
 * Cross-tab leader election using a localStorage lease + heartbeat.
 * Exactly one tab holds the lease; if it closes or freezes, another tab
 * takes over after `leaderTimeoutMs`. Returns a stop function.
 */
export function startLeaderElection(tabId: string) {
  const isLeaderCandidate = () => {
    const lease = readLease();
    return !lease || lease.id === tabId || Date.now() - lease.ts > liveConfig.leaderTimeoutMs;
  };

  const beat = () => {
    if (!isLeaderCandidate()) return;
    try {
      localStorage.setItem(LEADER_KEY, JSON.stringify({ id: tabId, ts: Date.now() }));
    } catch {
      /* storage unavailable — the tab simply acts alone */
    }
  };

  const release = () => {
    if (readLease()?.id === tabId) localStorage.removeItem(LEADER_KEY);
  };

  beat();
  const interval = setInterval(beat, liveConfig.leaderHeartbeatMs);
  window.addEventListener("beforeunload", release);

  return {
    isLeader: () => readLease()?.id === tabId,
    stop: () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", release);
      release();
    },
  };
}
