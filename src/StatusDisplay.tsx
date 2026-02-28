import React from 'react';
import { AlertStatus, HistoryAlert } from './types';
import {
  StatusCard,
  StatusIcon,
  StatusTitle,
  StatusDescription,
  CityLabel,
} from './styles';

interface StatusDisplayProps {
  status: AlertStatus;
  cityName: string;
  lastAlert: HistoryAlert | null;
}

const STATUS_CONFIG: Record<
  AlertStatus,
  { icon: string; title: string; description: string }
> = {
  safe: {
    icon: '✅',
    title: 'אין איום — ניתן לצאת',
    description: 'לא זוהו התרעות פעילות באזורך. ניתן להמשיך בשגרה.',
  },
  near_shelter: {
    icon: '⚠️',
    title: 'ניתן לצאת — הישארו קרוב למרחב מוגן',
    description:
      'פיקוד העורף עדכן שניתן לצאת, אך יש להישאר בקרבת מרחב מוגן ולהיות מוכנים לחזור.',
  },
  pre_alert: {
    icon: '⚡',
    title: 'צפויות התרעות באזורך',
    description:
      'התקבלה הנחיה מקדימה — בדקות הקרובות צפויות התרעות. הישארו בקרבת מרחב מוגן.',
  },
  go_to_shelter: {
    icon: '🚨',
    title: 'היכנסו למרחב מוגן — עכשיו!',
    description:
      'זוהתה התרעה פעילה באזורך! היכנסו מיידית לממ"ד, מקלט או חדר פנימי.',
  },
  in_shelter: {
    icon: '🛡️',
    title: 'הישארו במרחב המוגן',
    description:
      'התרעה פעילה באזורך. אין לצאת עד להודעת "ניתן לצאת" מפיקוד העורף.',
  },
  connection_lost: {
    icon: '📡',
    title: 'אין חיבור — המצב לא ידוע',
    description:
      'החיבור לפיקוד העורף נותק. לא ניתן לקבוע אם האזור בטוח. הישארו בקרבת מרחב מוגן עד לחזרת החיבור.',
  },
};

const formatAlertTime = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  status,
  cityName,
  lastAlert,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <StatusCard
      $status={status}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <StatusIcon $status={status} aria-hidden="true">
        {config.icon}
      </StatusIcon>
      <CityLabel>{cityName}</CityLabel>
      <StatusTitle $status={status}>{config.title}</StatusTitle>
      <StatusDescription>{config.description}</StatusDescription>
      {lastAlert && (
        <StatusDescription>
          {lastAlert.title || lastAlert.category_desc} — {formatAlertTime(lastAlert.alertDate)}
        </StatusDescription>
      )}
    </StatusCard>
  );
};

export default StatusDisplay;
