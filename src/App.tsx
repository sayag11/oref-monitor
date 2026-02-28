import React, { useState, useEffect } from 'react';
import CitySearch from './CitySearch';
import StatusDisplay from './StatusDisplay';
import DefaultCitySelector, { getStoredCity, storeCity } from './DefaultCitySelector';
import { useAlerts } from './useAlerts';
import { useTheme } from './ThemeContext';
import { fetchCities } from './api';
import { ALERT_CATEGORY, DANGER_CATEGORIES } from './types';
import {
  AppWrapper,
  Header,
  HeaderTitles,
  LogoMark,
  HeaderTextGroup,
  HeaderActions,
  ThemeToggleButton,
  Title,
  Subtitle,
  MainContent,
  LiveBadge,
  LiveDot,
  LastUpdate,
  PollingDot,
  HistorySection,
  HistoryHeader,
  HistoryTitle,
  HistoryCount,
  HistoryItem,
  HistoryDate,
  HistoryCategory,
  ErrorBanner,
  Footer,
  FooterDisclaimer,
  FooterCredit,
  StatusLoading,
  StatusSpinner,
  StatusLoadingText,
  TransparencySection,
  TransparencySummary,
  TransparencyBody,
  TransparencyBlock,
  TransparencyLabel,
  TransparencyText,
  TransparencyDivider,
} from './styles';

const FALLBACK_DEFAULT = 'גבעתיים';

const getCategoryEmoji = (category: number): string => {
  if (DANGER_CATEGORIES.has(category)) return '🚀';
  if (category === ALERT_CATEGORY.END) return '✅';
  if (category === ALERT_CATEGORY.PRE_ALERT) return '⚡';
  if (category === ALERT_CATEGORY.EARTHQUAKE) return '🌍';
  return '⚠️';
};

const App: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const [selectedCity, setSelectedCity] = useState(
    () => getStoredCity() || FALLBACK_DEFAULT
  );
  const [cities, setCities] = useState<string[]>([]);
  const { status, lastAlert, cityHistory, isPolling, lastChecked, error } =
    useAlerts(selectedCity);

  useEffect(() => {
    const loadCities = async () => {
      const data = await fetchCities();
      if (data.length > 0) {
        setCities(data.map((c) => c.label || c.label_he).filter(Boolean));
      } else {
        setCities(FALLBACK_CITIES);
      }
    };
    loadCities();
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
  };

  const handleDefaultCityChange = (city: string) => {
    storeCity(city);
    setSelectedCity(city);
  };

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const formatAlertDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AppWrapper>
      <Header>
        <HeaderTitles>
          <LogoMark aria-hidden="true">O</LogoMark>
          <HeaderTextGroup>
            <Title>OREF Monitor</Title>
            <Subtitle>מצב נוכחי בזמן אמת — פיקוד העורף</Subtitle>
          </HeaderTextGroup>
        </HeaderTitles>
        <HeaderActions>
          <DefaultCitySelector
            cities={cities}
            currentCity={selectedCity}
            onCityChange={handleDefaultCityChange}
          />
          <ThemeToggleButton
            onClick={toggleTheme}
            aria-label={mode === 'dark' ? 'מעבר לתצוגה בהירה' : 'מעבר לתצוגה כהה'}
            tabIndex={0}
          >
            {mode === 'dark' ? '☀️' : '🌙'}
          </ThemeToggleButton>
        </HeaderActions>
      </Header>

      <MainContent>
        <CitySearch
          cities={cities}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
        />

        {selectedCity && status === null && (
          <StatusLoading>
            <StatusSpinner />
            <StatusLoadingText>טוען מצב נוכחי עבור {selectedCity}...</StatusLoadingText>
          </StatusLoading>
        )}

        {selectedCity && status !== null && (
          <StatusDisplay
            status={status}
            cityName={selectedCity}
            lastAlert={lastAlert}
          />
        )}

        {error && <ErrorBanner role="alert">{error}</ErrorBanner>}

        {lastChecked && (
          <LastUpdate>
            <PollingDot $active={isPolling} />
            <span>סנכרון אחרון: {formatTime(lastChecked)}</span>
            <LiveBadge>
              <LiveDot />
              LIVE
            </LiveBadge>
          </LastUpdate>
        )}

        {cityHistory.length > 0 && (
          <HistorySection>
            <HistoryHeader>
              <HistoryTitle>פעילות אחרונה — {selectedCity}</HistoryTitle>
              <HistoryCount>{cityHistory.length} אירועים</HistoryCount>
            </HistoryHeader>
            {cityHistory.map((alert, index) => (
              <HistoryItem key={`${alert.alertDate}-${alert.rid ?? index}`}>
                <HistoryCategory>
                  {getCategoryEmoji(alert.category)} {alert.title || alert.category_desc || `קטגוריה ${alert.category}`}
                </HistoryCategory>
                <HistoryDate>{formatAlertDate(alert.alertDate)}</HistoryDate>
              </HistoryItem>
            ))}
          </HistorySection>
        )}

        {cityHistory.length === 0 && lastChecked && (
          <HistorySection>
            <HistoryTitle>
              אין פעילות ב{selectedCity} ב-6 שעות האחרונות
            </HistoryTitle>
          </HistorySection>
        )}
      </MainContent>

      <Footer>
        <TransparencySection>
          <TransparencySummary>
            איך המידע מגיע? שקיפות ואמינות
          </TransparencySummary>
          <TransparencyBody>
            <TransparencyBlock>
              <TransparencyLabel>מקורות המידע</TransparencyLabel>
              <TransparencyText>
                המערכת שואבת נתונים ישירות משרתי פיקוד העורף (<a href="https://www.oref.org.il" target="_blank" rel="noopener noreferrer">oref.org.il</a>).
                אלו אינם ממשקים רשמיים מתועדים — הם נקודות קצה (API) ציבוריות שהאתר והאפליקציה של פיקוד העורף עצמם משתמשים בהן.
              </TransparencyText>
            </TransparencyBlock>

            <TransparencyDivider />

            <TransparencyBlock>
              <TransparencyLabel>נקודות קצה (APIs)</TransparencyLabel>
              <TransparencyText>
                <strong>1. התרעות בזמן אמת</strong> — <code>oref.org.il/warningMessages/alert/Alerts.json</code><br />
                מחזיר את ההתרעות הפעילות ברגע זה. נבדק כל 5 שניות. כשאין התרעה — התשובה ריקה.
              </TransparencyText>
              <TransparencyText>
                <strong>2. היסטוריית התרעות מלאה</strong> — <code>oref.org.il/warningMessages/alert/History/AlertsHistory.json</code><br />
                כולל את כל סוגי ההתרעות: ירי רקטות (קטגוריה 1), הנחיה מקדימה (14), וניתן לצאת מהמרחב המוגן (13).
                זהו מקור המידע העיקרי לקביעת המצב הנוכחי.
              </TransparencyText>
              <TransparencyText>
                <strong>3. היסטוריה לפי טווח תאריכים</strong> — <code>alerts-history.oref.org.il/Shared/Ajax/GetAlarmsHistory.aspx</code><br />
                מקור משלים שמחזיר התרעות לפי תאריכים. לעיתים אינו זמין — המערכת ממשיכה לפעול בלעדיו.
              </TransparencyText>
            </TransparencyBlock>

            <TransparencyDivider />

            <TransparencyBlock>
              <TransparencyLabel>כיצד נקבע המצב</TransparencyLabel>
              <TransparencyText>
                המערכת ממזגת את שני מקורות ההיסטוריה, מסננת לפי העיר הנבחרת, ובודקת את ההתרעה האחרונה:<br />
                — אם האחרונה היא קטגוריה 1 (ירי רקטות) ← <strong>הישארו במרחב מוגן</strong><br />
                — אם האחרונה היא קטגוריה 13 עם "להישאר בקרבתו" ← <strong>ניתן לצאת, הישארו קרוב</strong><br />
                — אם האחרונה היא קטגוריה 13 בלבד ← <strong>אין איום</strong><br />
                — אם האחרונה היא קטגוריה 14 ← <strong>צפויות התרעות</strong><br />
                בנוסף, בכל 5 שניות נבדק אם יש התרעה פעילה חדשה בזמן אמת.
              </TransparencyText>
            </TransparencyBlock>

            <TransparencyDivider />

            <TransparencyBlock>
              <TransparencyLabel>אמינות ומגבלות</TransparencyLabel>
              <TransparencyText>
                — ממשקי פיקוד העורף נגישים <strong>רק מישראל</strong>. מחוץ לישראל המערכת לא תפעל.<br />
                — הנתונים עוברים דרך שרת proxy מקומי לעקיפת הגבלות CORS בדפדפן.<br />
                — קיים עיכוב אפשרי של עד דקה בין ההתרעה בשטח לעדכון במערכת.<br />
                — ייתכנו הפסקות זמניות בזמינות השרתים של פיקוד העורף.<br />
                — המערכת מבצעת בדיקות תקינות אוטומטיות בטעינה — אם הנתונים אינם אמינים, תוצג שגיאה עם קישור למקורות רשמיים.<br />
                — <strong>מערכת זו אינה תחליף להתרעות הרשמיות</strong> של פיקוד העורף, אפליקציית פיקוד העורף, או צופרי ההתרעה.
              </TransparencyText>
            </TransparencyBlock>

            <TransparencyDivider />

            <TransparencyBlock>
              <TransparencyLabel>קוד פתוח</TransparencyLabel>
              <TransparencyText>
                קוד המקור של המערכת פתוח לעיון ב-<a href="https://github.com/sayag11/oref-monitor" target="_blank" rel="noopener noreferrer">GitHub</a>. כל הלוגיקה — כולל אופן קביעת המצב, מיזוג המקורות, ובדיקות התקינות — גלויה וניתנת לביקורת.
              </TransparencyText>
            </TransparencyBlock>
          </TransparencyBody>
        </TransparencySection>

        <FooterDisclaimer>
          מקור הנתונים: פיקוד העורף — oref.org.il | המערכת אינה תחליף להתרעות רשמיות
        </FooterDisclaimer>
        <FooterCredit>
          made by: <a href="mailto:sayag11@gmail.com">sayag11@gmail.com</a>
        </FooterCredit>
      </Footer>
    </AppWrapper>
  );
};

const FALLBACK_CITIES = [
  'גבעתיים',
  'תל אביב - דרום העיר ויפו',
  'תל אביב - מזרח',
  'תל אביב - מרכז העיר',
  'תל אביב - עבר הירקון',
  'רמת גן - דרום',
  'רמת גן - מזרח',
  'רמת גן - מערב',
  'בני ברק',
  'חולון',
  'בת ים',
  'ירושלים - דרום',
  'ירושלים - מזרח',
  'ירושלים - מערב',
  'ירושלים - צפון',
  'חיפה - כרמל ועיר תחתית',
  'חיפה - מפרץ',
  'חיפה - נווה שאנן ורמות',
  'באר שבע - דרום',
  'באר שבע - מזרח',
  'באר שבע - מערב',
  'באר שבע - צפון',
  'אשדוד - א, ב',
  'אשדוד - ג, ד, ה',
  'אשדוד - ו, ז, ח, ט, יז',
  'אשקלון - דרום',
  'אשקלון - צפון',
  'נתניה',
  'ראשון לציון - מזרח',
  'ראשון לציון - מערב',
  'פתח תקוה',
  'הרצליה',
  'כפר סבא',
  'רעננה',
  'הוד השרון',
  'רחובות',
  'נס ציונה',
  'לוד',
  'רמלה',
  'מודיעין מכבים רעות',
  'שדרות, איבים, ניר עם',
  'עוטף עזה',
];

export default App;
