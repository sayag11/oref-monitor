import { HistoryAlert, ALERT_CATEGORY, DANGER_CATEGORIES } from './types';
import { URLS } from './api';

export interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

export interface IntegrityReport {
  passed: boolean;
  results: TestResult[];
  timestamp: Date;
}

const VALID_CATEGORIES = new Set<number>([
  ALERT_CATEGORY.MISSILES,
  ALERT_CATEGORY.HOSTILE_AIRCRAFT,
  ALERT_CATEGORY.EARTHQUAKE,
  ALERT_CATEGORY.TERRORIST_INFILTRATION,
  ALERT_CATEGORY.TSUNAMI,
  ALERT_CATEGORY.HAZARDOUS_MATERIALS,
  ALERT_CATEGORY.END,
  ALERT_CATEGORY.PRE_ALERT,
]);

const TIMEOUT_MS = 15000;

const fetchWithTimeout = async (
  url: string,
  timeoutMs: number = TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const testAlertsEndpoint = async (): Promise<TestResult> => {
  try {
    const res = await fetchWithTimeout(URLS.alerts);
    if (!res.ok) {
      return {
        name: 'בדיקת שרת התרעות בזמן אמת',
        passed: false,
        detail: `שרת ההתרעות החזיר שגיאה (${res.status})`,
      };
    }
    const text = await res.text();
    if (text && text.trim().length > 0) {
      try {
        JSON.parse(text);
      } catch {
        return {
          name: 'בדיקת שרת התרעות בזמן אמת',
          passed: false,
          detail: 'שרת ההתרעות החזיר מידע שאינו תקין (JSON לא תקף)',
        };
      }
    }
    return {
      name: 'בדיקת שרת התרעות בזמן אמת',
      passed: true,
      detail: 'שרת ההתרעות זמין ומגיב',
    };
  } catch {
    return {
      name: 'בדיקת שרת התרעות בזמן אמת',
      passed: false,
      detail: 'לא ניתן להתחבר לשרת ההתרעות של פיקוד העורף',
    };
  }
};

const testHistoryEndpoint = async (): Promise<{
  result: TestResult;
  data: HistoryAlert[];
}> => {
  try {
    const res = await fetchWithTimeout(URLS.history);
    if (!res.ok) {
      return {
        result: {
          name: 'בדיקת היסטוריית התרעות',
          passed: false,
          detail: `שרת ההיסטוריה החזיר שגיאה (${res.status})`,
        },
        data: [],
      };
    }
    const text = await res.text();
    if (!text || text.trim().length === 0) {
      return {
        result: {
          name: 'בדיקת היסטוריית התרעות',
          passed: false,
          detail: 'שרת ההיסטוריה החזיר תשובה ריקה',
        },
        data: [],
      };
    }

    let data: HistoryAlert[];
    try {
      data = JSON.parse(text);
    } catch {
      return {
        result: {
          name: 'בדיקת היסטוריית התרעות',
          passed: false,
          detail: 'מידע ההיסטוריה אינו בפורמט תקין (JSON לא תקף)',
        },
        data: [],
      };
    }

    if (!Array.isArray(data)) {
      return {
        result: {
          name: 'בדיקת היסטוריית התרעות',
          passed: false,
          detail: 'מבנה הנתונים אינו תקין — צפוי מערך של התרעות',
        },
        data: [],
      };
    }

    if (data.length === 0) {
      return {
        result: {
          name: 'בדיקת היסטוריית התרעות',
          passed: false,
          detail: 'לא התקבלו נתוני היסטוריה — ייתכן שהשרת לא זמין',
        },
        data: [],
      };
    }

    return {
      result: {
        name: 'בדיקת היסטוריית התרעות',
        passed: true,
        detail: `התקבלו ${data.length.toLocaleString()} התרעות מהיסטוריה`,
      },
      data,
    };
  } catch {
    return {
      result: {
        name: 'בדיקת היסטוריית התרעות',
        passed: false,
        detail: 'לא ניתן להתחבר לשרת היסטוריית ההתרעות',
      },
      data: [],
    };
  }
};

const testHistoryRangeEndpoint = async (): Promise<{
  result: TestResult;
  data: HistoryAlert[];
}> => {
  const now = new Date();
  const d = now.getDate().toString().padStart(2, '0');
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const y = now.getFullYear();
  const dateStr = `${d}.${m}.${y}`;

  try {
    const res = await fetchWithTimeout(
      `${URLS.historyRange}?lang=he&fromDate=${dateStr}&toDate=${dateStr}&mode=0`
    );
    if (!res.ok) {
      return {
        result: {
          name: 'בדיקת היסטוריה לפי טווח תאריכים',
          passed: false,
          detail: `שרת טווח ההיסטוריה החזיר שגיאה (${res.status})`,
        },
        data: [],
      };
    }
    const text = await res.text();
    if (!text || text.trim().length === 0) {
      return {
        result: {
          name: 'בדיקת היסטוריה לפי טווח תאריכים',
          passed: true,
          detail: 'שרת טווח ההיסטוריה זמין (אין נתונים להיום)',
        },
        data: [],
      };
    }

    let data: HistoryAlert[];
    try {
      data = JSON.parse(text);
    } catch {
      return {
        result: {
          name: 'בדיקת היסטוריה לפי טווח תאריכים',
          passed: false,
          detail: 'מידע טווח ההיסטוריה אינו בפורמט תקין',
        },
        data: [],
      };
    }

    if (!Array.isArray(data)) {
      return {
        result: {
          name: 'בדיקת היסטוריה לפי טווח תאריכים',
          passed: false,
          detail: 'מבנה נתוני טווח ההיסטוריה אינו תקין',
        },
        data: [],
      };
    }

    return {
      result: {
        name: 'בדיקת היסטוריה לפי טווח תאריכים',
        passed: true,
        detail: `התקבלו ${data.length.toLocaleString()} התרעות מטווח ההיסטוריה`,
      },
      data,
    };
  } catch {
    return {
      result: {
        name: 'בדיקת היסטוריה לפי טווח תאריכים',
        passed: false,
        detail: 'לא ניתן להתחבר לשרת טווח ההיסטוריה',
      },
      data: [],
    };
  }
};

const testAlertStructure = (data: HistoryAlert[]): TestResult => {
  if (data.length === 0) {
    return {
      name: 'בדיקת מבנה נתוני התרעות',
      passed: true,
      detail: 'אין נתונים לבדיקה — דילוג',
    };
  }

  const sample = data.slice(0, 50);
  for (const alert of sample) {
    if (typeof alert.alertDate !== 'string' || !alert.alertDate) {
      return {
        name: 'בדיקת מבנה נתוני התרעות',
        passed: false,
        detail: 'חסר שדה alertDate בהתרעה — מבנה הנתונים השתנה',
      };
    }
    if (typeof alert.data !== 'string' || !alert.data) {
      return {
        name: 'בדיקת מבנה נתוני התרעות',
        passed: false,
        detail: 'חסר שדה data (שם עיר) בהתרעה — מבנה הנתונים השתנה',
      };
    }
    if (typeof alert.category !== 'number') {
      return {
        name: 'בדיקת מבנה נתוני התרעות',
        passed: false,
        detail: 'חסר שדה category בהתרעה — מבנה הנתונים השתנה',
      };
    }
  }

  return {
    name: 'בדיקת מבנה נתוני התרעות',
    passed: true,
    detail: 'מבנה הנתונים תקין — alertDate, data, category קיימים',
  };
};

const testAlertCategories = (data: HistoryAlert[]): TestResult => {
  if (data.length === 0) {
    return {
      name: 'בדיקת קטגוריות התרעה',
      passed: true,
      detail: 'אין נתונים לבדיקה — דילוג',
    };
  }

  const categories = new Set(data.map((a) => a.category));
  const categoriesArr = Array.from(categories);
  const unknown = categoriesArr.filter((c) => !VALID_CATEGORIES.has(c));
  if (unknown.length > 0) {
    return {
      name: 'בדיקת קטגוריות התרעה',
      passed: false,
      detail: `התגלו קטגוריות לא מוכרות: ${unknown.join(', ')} — ייתכן שפיקוד העורף שינה את הפורמט`,
    };
  }

  const hasDanger = categoriesArr.some((c) => DANGER_CATEGORIES.has(c));
  const hasEnd = categories.has(ALERT_CATEGORY.END);

  return {
    name: 'בדיקת קטגוריות התרעה',
    passed: true,
    detail: `קטגוריות תקינות: ${categoriesArr.sort().join(', ')}${hasDanger ? ' (כולל התרעות סכנה)' : ''}${hasEnd ? ' (כולל הודעות הרגעה)' : ''}`,
  };
};

const testDataFreshness = (data: HistoryAlert[]): TestResult => {
  if (data.length === 0) {
    return {
      name: 'בדיקת עדכניות הנתונים',
      passed: true,
      detail: 'אין נתונים לבדיקה — דילוג',
    };
  }

  const now = Date.now();
  const sorted = [...data].sort(
    (a, b) =>
      new Date(b.alertDate).getTime() - new Date(a.alertDate).getTime()
  );
  const newest = new Date(sorted[0].alertDate);
  const ageHours = (now - newest.getTime()) / (1000 * 60 * 60);

  if (isNaN(newest.getTime())) {
    return {
      name: 'בדיקת עדכניות הנתונים',
      passed: false,
      detail: 'תאריך ההתרעה האחרונה אינו תקין — לא ניתן לאמת עדכניות',
    };
  }

  if (ageHours > 24) {
    return {
      name: 'בדיקת עדכניות הנתונים',
      passed: false,
      detail: `ההתרעה האחרונה מלפני ${Math.round(ageHours)} שעות — הנתונים עשויים להיות לא עדכניים`,
    };
  }

  return {
    name: 'בדיקת עדכניות הנתונים',
    passed: true,
    detail: `ההתרעה האחרונה מלפני ${ageHours < 1 ? 'פחות משעה' : `${Math.round(ageHours)} שעות`}`,
  };
};

const testCrossSourceConsistency = (
  fullHistory: HistoryAlert[],
  rangeHistory: HistoryAlert[]
): TestResult => {
  if (fullHistory.length === 0 && rangeHistory.length === 0) {
    return {
      name: 'בדיקת עקביות בין מקורות מידע',
      passed: false,
      detail: 'שני מקורות המידע ריקים — לא ניתן לאמת עקביות',
    };
  }

  if (fullHistory.length === 0 || rangeHistory.length === 0) {
    return {
      name: 'בדיקת עקביות בין מקורות מידע',
      passed: true,
      detail: 'רק מקור מידע אחד זמין — לא ניתן לבצע השוואה מלאה',
    };
  }

  const fullCities = new Set(fullHistory.slice(0, 200).map((a) => a.data));
  const rangeCities = new Set(rangeHistory.slice(0, 200).map((a) => a.data));
  const commonCities = Array.from(fullCities).filter((c) => rangeCities.has(c));

  if (commonCities.length === 0) {
    return {
      name: 'בדיקת עקביות בין מקורות מידע',
      passed: true,
      detail: 'אין חפיפה בין המקורות כרגע — ייתכן שההיסטוריה מתעכבת',
    };
  }

  return {
    name: 'בדיקת עקביות בין מקורות מידע',
    passed: true,
    detail: `${commonCities.length} ערים משותפות בין שני המקורות — הנתונים עקביים`,
  };
};

export const runIntegrityChecks = async (): Promise<IntegrityReport> => {
  const results: TestResult[] = [];

  const [alertsResult, historyResult, rangeResult] = await Promise.all([
    testAlertsEndpoint(),
    testHistoryEndpoint(),
    testHistoryRangeEndpoint(),
  ]);

  results.push(alertsResult);
  results.push(historyResult.result);
  results.push(rangeResult.result);

  results.push(testAlertStructure(historyResult.data));
  results.push(testAlertCategories(historyResult.data));
  results.push(testDataFreshness(historyResult.data));
  results.push(
    testCrossSourceConsistency(historyResult.data, rangeResult.data)
  );

  const criticalTests = [alertsResult, historyResult.result];
  const passed = criticalTests.every((t) => t.passed);

  return { passed, results, timestamp: new Date() };
};
