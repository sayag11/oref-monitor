import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertStatus, HistoryAlert } from './types';
import {
  fetchActiveAlerts,
  fetchFullHistory,
  fetchHistoryRange,
  buildCityTimeline,
  determineStatusFromData,
} from './api';

const POLL_INTERVAL = 5000;
const HISTORY_POLL_INTERVAL = 15000;
const HOURS_BACK = 6;
const MAX_CONSECUTIVE_FAILURES = 3;
const STALE_THRESHOLD_MS = 60 * 1000;

interface UseAlertsReturn {
  status: AlertStatus | null;
  lastAlert: HistoryAlert | null;
  cityHistory: HistoryAlert[];
  isPolling: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useAlerts = (cityName: string): UseAlertsReturn => {
  const [status, setStatus] = useState<AlertStatus | null>(null);
  const [lastAlert, setLastAlert] = useState<HistoryAlert | null>(null);
  const [cityHistory, setCityHistory] = useState<HistoryAlert[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fullHistoryRef = useRef<HistoryAlert[]>([]);
  const rangeHistoryRef = useRef<HistoryAlert[]>([]);
  const historyLoadedRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const lastSuccessRef = useRef<number>(0);

  const loadHistory = useCallback(async () => {
    const fullPromise = fetchFullHistory();
    const rangePromise = fetchHistoryRange(HOURS_BACK).catch(() => [] as HistoryAlert[]);

    const [full, range] = await Promise.all([fullPromise, rangePromise]);

    if (full.length === 0) {
      throw new Error('Empty history response');
    }

    fullHistoryRef.current = full;
    rangeHistoryRef.current = range;
    historyLoadedRef.current = true;
    consecutiveFailuresRef.current = 0;
    lastSuccessRef.current = Date.now();
    return { full, range };
  }, []);

  const computeAndSetStatus = useCallback(
    (city: string) => {
      const full = fullHistoryRef.current;
      const range = rangeHistoryRef.current;

      const activeAlerts: never[] = [];
      const { status: newStatus, lastAlert: newLastAlert } =
        determineStatusFromData(activeAlerts, full, range, city);

      const timeline = buildCityTimeline(full, range, city, HOURS_BACK);
      setCityHistory(timeline);
      setStatus(newStatus);
      setLastAlert(newLastAlert);
    },
    []
  );

  const markConnectionLost = useCallback((msg: string) => {
    setError(msg);
    setStatus('connection_lost');
  }, []);

  useEffect(() => {
    if (!cityName) return;
    let cancelled = false;

    setStatus(null);
    setLastChecked(null);
    setCityHistory([]);
    setError(null);
    consecutiveFailuresRef.current = 0;

    const init = async () => {
      try {
        await loadHistory();
        if (cancelled) return;
        computeAndSetStatus(cityName);
        setLastChecked(new Date());
        setError(null);
      } catch {
        if (!cancelled) {
          markConnectionLost('לא ניתן להתחבר לשרתי פיקוד העורף.');
        }
      }
    };

    init();

    const historyInterval = setInterval(async () => {
      if (cancelled) return;
      try {
        await loadHistory();
        if (!cancelled) {
          computeAndSetStatus(cityName);
          setLastChecked(new Date());
          setError(null);
        }
      } catch {
        if (cancelled) return;
        consecutiveFailuresRef.current++;
        const sinceLastSuccess = Date.now() - lastSuccessRef.current;

        if (
          consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES ||
          (lastSuccessRef.current > 0 && sinceLastSuccess > STALE_THRESHOLD_MS)
        ) {
          markConnectionLost(
            `החיבור לפיקוד העורף נותק (${consecutiveFailuresRef.current} ניסיונות כושלים).`
          );
        }
      }
    }, HISTORY_POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(historyInterval);
    };
  }, [cityName, loadHistory, computeAndSetStatus, markConnectionLost]);

  const pollAlerts = useCallback(async () => {
    if (!cityName || !historyLoadedRef.current) return;

    try {
      setIsPolling(true);
      const activeAlerts = await fetchActiveAlerts();

      const { status: newStatus, lastAlert: newLastAlert } =
        determineStatusFromData(
          activeAlerts,
          fullHistoryRef.current,
          rangeHistoryRef.current,
          cityName
        );

      const timeline = buildCityTimeline(
        fullHistoryRef.current,
        rangeHistoryRef.current,
        cityName,
        HOURS_BACK
      );
      setCityHistory(timeline);
      setStatus(newStatus);
      setLastAlert(newLastAlert);
      setLastChecked(new Date());
      setError(null);
      consecutiveFailuresRef.current = 0;
      lastSuccessRef.current = Date.now();
    } catch {
      consecutiveFailuresRef.current++;
      const sinceLastSuccess = Date.now() - lastSuccessRef.current;

      if (
        consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES ||
        (lastSuccessRef.current > 0 && sinceLastSuccess > STALE_THRESHOLD_MS)
      ) {
        markConnectionLost(
          `החיבור לפיקוד העורף נותק (${consecutiveFailuresRef.current} ניסיונות כושלים).`
        );
      }
    } finally {
      setIsPolling(false);
    }
  }, [cityName, markConnectionLost]);

  useEffect(() => {
    if (!cityName) return;
    const interval = setInterval(pollAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [cityName, pollAlerts]);

  return { status, lastAlert, cityHistory, isPolling, lastChecked, error };
};
