export type AlertStatus =
  | 'safe'
  | 'near_shelter'
  | 'pre_alert'
  | 'go_to_shelter'
  | 'in_shelter';

export interface OrefAlert {
  cat: string;
  data: string[];
  desc: string;
  title: string;
}

export interface HistoryAlert {
  alertDate: string;
  data: string;
  category: number;
  category_desc?: string;
  title?: string;
  matrix_id?: number;
  rid?: number;
}

export interface CityInfo {
  id: number;
  label: string;
  value: string;
  areaid: number;
  aession: number;
  shelter_time: number;
  label_he: string;
}

export const ALERT_CATEGORY = {
  MISSILES: 1,
  HOSTILE_AIRCRAFT: 2,
  EARTHQUAKE: 7,
  TERRORIST_INFILTRATION: 10,
  TSUNAMI: 11,
  HAZARDOUS_MATERIALS: 12,
  END: 13,
  PRE_ALERT: 14,
} as const;

export const DANGER_CATEGORIES = new Set<number>([
  ALERT_CATEGORY.MISSILES,
  ALERT_CATEGORY.HOSTILE_AIRCRAFT,
  ALERT_CATEGORY.TERRORIST_INFILTRATION,
  ALERT_CATEGORY.HAZARDOUS_MATERIALS,
]);
