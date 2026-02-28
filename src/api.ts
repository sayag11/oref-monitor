import {
  OrefAlert,
  HistoryAlert,
  CityInfo,
  AlertStatus,
  ALERT_CATEGORY,
  DANGER_CATEGORIES,
} from './types';

const GIVATAYIM_NAMES = ['גבעתיים', 'גבעתיים - מזרח', 'גבעתיים - מערב'];
const SHELTER_RUN_SECONDS = 90;

const STAY_NEAR_SHELTER_PHRASE = 'להישאר בקרבת';

export const URLS = {
  alerts: '/api/alerts',
  history: '/api/history',
  historyRange: '/api/history-range',
  cities: '/api/cities',
};

const orefHeaders: Record<string, string> = { Accept: 'application/json' };

const getCityNames = (cityName: string): string[] =>
  cityName === 'גבעתיים' ? GIVATAYIM_NAMES : [cityName];

const cityMatches = (alertData: string, cityName: string): boolean => {
  const names = getCityNames(cityName);
  return names.some((n) => alertData.includes(n) || n.includes(alertData));
};

const formatDateParam = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
};

export const fetchActiveAlerts = async (): Promise<OrefAlert[]> => {
  try {
    const response = await fetch(URLS.alerts, { headers: orefHeaders });
    if (!response.ok) return [];
    const text = await response.text();
    if (!text || text.trim() === '') return [];
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    if (data && data.data) return [data];
    return [];
  } catch {
    return [];
  }
};

export const fetchFullHistory = async (): Promise<HistoryAlert[]> => {
  try {
    const response = await fetch(URLS.history, { headers: orefHeaders });
    if (!response.ok) return [];
    const text = await response.text();
    if (!text || text.trim() === '') return [];
    return JSON.parse(text);
  } catch {
    return [];
  }
};

export const fetchHistoryRange = async (
  hoursBack: number = 6
): Promise<HistoryAlert[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const now = new Date();
    const from = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    const url = `${URLS.historyRange}?lang=he&fromDate=${formatDateParam(from)}&toDate=${formatDateParam(now)}&mode=0`;
    const response = await fetch(url, {
      headers: orefHeaders,
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const text = await response.text();
    if (!text || text.trim() === '') return [];
    return JSON.parse(text);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchCities = async (): Promise<CityInfo[]> => {
  try {
    const response = await fetch(URLS.cities, { headers: orefHeaders });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
};

export const isCityInActiveAlerts = (
  alerts: OrefAlert[],
  cityName: string
): boolean => {
  const names = getCityNames(cityName);
  return alerts.some(
    (alert) =>
      alert.data &&
      alert.data.some((city) =>
        names.some((name) => city.includes(name) || name.includes(city))
      )
  );
};

export const filterCityHistory = (
  history: HistoryAlert[],
  cityName: string
): HistoryAlert[] => history.filter((h) => cityMatches(h.data, cityName));

const mergeAndDeduplicate = (
  fullHistory: HistoryAlert[],
  rangeHistory: HistoryAlert[]
): HistoryAlert[] => {
  const seen = new Set<string>();
  const merged: HistoryAlert[] = [];

  const addUnique = (alert: HistoryAlert) => {
    const key = `${alert.alertDate}|${alert.data}|${alert.category}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(alert);
    }
  };

  fullHistory.forEach(addUnique);
  rangeHistory.forEach(addUnique);

  return merged.sort(
    (a, b) =>
      new Date(b.alertDate).getTime() - new Date(a.alertDate).getTime()
  );
};

export const buildCityTimeline = (
  fullHistory: HistoryAlert[],
  rangeHistory: HistoryAlert[],
  cityName: string,
  hoursBack: number = 6
): HistoryAlert[] => {
  const merged = mergeAndDeduplicate(fullHistory, rangeHistory);
  const cityAlerts = filterCityHistory(merged, cityName);
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
  return cityAlerts.filter(
    (a) => new Date(a.alertDate).getTime() >= cutoff
  );
};

export const determineStatusFromData = (
  activeAlerts: OrefAlert[],
  fullHistory: HistoryAlert[],
  rangeHistory: HistoryAlert[],
  cityName: string
): { status: AlertStatus; lastAlert: HistoryAlert | null } => {
  if (!cityName) return { status: 'safe', lastAlert: null };

  if (isCityInActiveAlerts(activeAlerts, cityName)) {
    return { status: 'go_to_shelter', lastAlert: null };
  }

  const merged = mergeAndDeduplicate(fullHistory, rangeHistory);
  const cityAlerts = filterCityHistory(merged, cityName);

  if (cityAlerts.length === 0) {
    return { status: 'safe', lastAlert: null };
  }

  const latest = cityAlerts[0];
  const now = Date.now();

  if (DANGER_CATEGORIES.has(latest.category)) {
    const elapsedSec =
      (now - new Date(latest.alertDate).getTime()) / 1000;
    if (elapsedSec < SHELTER_RUN_SECONDS) {
      return { status: 'go_to_shelter', lastAlert: latest };
    }
    return { status: 'in_shelter', lastAlert: latest };
  }

  if (latest.category === ALERT_CATEGORY.END) {
    const titleStr = (latest.title || latest.category_desc || '').toLowerCase();
    const stayNear = titleStr.includes(STAY_NEAR_SHELTER_PHRASE);
    if (stayNear) {
      return { status: 'near_shelter', lastAlert: latest };
    }
    return { status: 'safe', lastAlert: latest };
  }

  if (latest.category === ALERT_CATEGORY.PRE_ALERT) {
    return { status: 'pre_alert', lastAlert: latest };
  }

  return { status: 'safe', lastAlert: latest };
};
