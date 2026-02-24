/**
 * useStatus Hook
 * 1. Polls /status endpoint every 30 seconds (Server Sync)
 * 2. Ticks locally every 1 second for smooth UI (Local Tick)
 * 3. Re-syncs immediately when app comes to foreground (AppState Sync)
 */

import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import api, { StatusResponse } from "../services/api";
import { STATUS_POLL_INTERVAL } from "@env";

interface UseStatusReturn {
  status: StatusResponse | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useStatus = (enabled = true): UseStatusReturn => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [localSeconds, setLocalSeconds] = useState<number>(0);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getStatus();
      setStatus(data);
      setError(null);

      if (data.next_deadline) {
        const deadlineMs = new Date(data.next_deadline).getTime();
        const nowMs = new Date().getTime();
        const diffSeconds = Math.max(
          0,
          Math.floor((deadlineMs - nowMs) / 1000),
        );
        setLocalSeconds(diffSeconds);
      } else {
        setLocalSeconds(data.seconds_remaining || 0);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchStatus();

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          fetchStatus();
        }
      },
    );

    return () => subscription.remove();
  }, [enabled, fetchStatus]);

  useEffect(() => {
    if (!enabled) return;

    const tickInterval = setInterval(() => {
      setLocalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const pollInterval = parseInt(STATUS_POLL_INTERVAL, 10) || 30000;
    const interval = setInterval(() => {
      fetchStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, fetchStatus]);

  const returnedStatus = status
    ? { ...status, seconds_remaining: localSeconds }
    : null;

  return {
    status: returnedStatus,
    isLoading,
    error,
    refresh: fetchStatus,
  };
};

/**
 * Format seconds remaining into digital clock format
 * Examples: "47:32:05", "02:15:09", "00:45:30", "You're dead"
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "You're dead";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const pad = (num: number): string => String(num).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};
