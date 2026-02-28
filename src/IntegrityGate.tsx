import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { runIntegrityChecks, IntegrityReport } from './integrityCheck';

interface IntegrityGateProps {
  children: React.ReactNode;
}

const OREF_URL = 'https://www.oref.org.il/';
const RED_ALERT_URL = 'https://www.tzevaadom.co.il/';
const REPO_URL = 'https://github.com/sayag11/oref-monitor';

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const V = (name: string) => `var(${name})`;

const isGeoBlocked = (report: IntegrityReport): boolean =>
  report.results.some((t) => !t.passed && t.detail.includes('403'));

const IntegrityGate: React.FC<IntegrityGateProps> = ({ children }) => {
  const [state, setState] = useState<'loading' | 'passed' | 'failed'>('loading');
  const [report, setReport] = useState<IntegrityReport | null>(null);

  const runChecks = useCallback(async () => {
    setState('loading');
    const result = await runIntegrityChecks();
    setReport(result);
    setState(result.passed ? 'passed' : 'failed');
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  if (state === 'loading') {
    return (
      <ScreenWrapper>
        <LoadingCard>
          <Spinner aria-hidden="true" />
          <LoadingTitle>OREF Monitor</LoadingTitle>
          <LoadingSubtitle>מאמת מקורות נתונים מפיקוד העורף...</LoadingSubtitle>
        </LoadingCard>
      </ScreenWrapper>
    );
  }

  if (state === 'failed' && report) {
    return <ErrorScreen report={report} onRetry={runChecks} />;
  }

  return <>{children}</>;
};

interface ErrorScreenProps {
  report: IntegrityReport;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ report, onRetry }) => {
  const geoBlocked = isGeoBlocked(report);

  return (
    <ScreenWrapper>
      <ErrorCard role="alert" aria-live="assertive">
        <ErrorIcon aria-hidden="true">{geoBlocked ? '🌍' : '⚠️'}</ErrorIcon>
        <ErrorTitle>
          {geoBlocked
            ? 'שרתי פיקוד העורף חסמו את הגישה'
            : 'שגיאה באימות מקורות המידע'}
        </ErrorTitle>

        {geoBlocked ? (
          <>
            <ErrorDescription>
              ממשקי פיקוד העורף נגישים <strong>רק מתוך ישראל</strong>.
              השרת שמארח את האתר הזה נמצא מחוץ לישראל, ולכן הגישה לנתונים נחסמה (שגיאה 403).
            </ErrorDescription>

            <GeoSection>
              <GeoTitle>איך להריץ את OREF Monitor?</GeoTitle>
              <GeoText>
                יש להריץ את האפליקציה <strong>מקומית על המחשב שלכם</strong> מתוך ישראל.
                השרת המקומי מתחבר ישירות לפיקוד העורף דרך ה-IP הישראלי שלכם.
              </GeoText>
              <CodeBlock dir="ltr">
                git clone {REPO_URL}.git{'\n'}
                cd oref-monitor{'\n'}
                npm install{'\n'}
                npm start
              </CodeBlock>
              <GeoText>
                האפליקציה תיפתח בכתובת{' '}
                <CodeInline dir="ltr">http://localhost:3000</CodeInline>
              </GeoText>
            </GeoSection>
          </>
        ) : (
          <ErrorDescription>
            המערכת לא הצליחה לאמת שהנתונים מפיקוד העורף זמינים ומדויקים.
            לביטחונכם, השתמשו במקורות הרשמיים:
          </ErrorDescription>
        )}

        <LinksSection>
          {geoBlocked && <LinksSectionLabel>מקורות רשמיים:</LinksSectionLabel>}
          <LinkCard
            href={OREF_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="אתר פיקוד העורף"
            tabIndex={0}
          >
            <LinkEmoji>🛡️</LinkEmoji>
            <LinkText>
              <LinkTitle>אתר פיקוד העורף</LinkTitle>
              <LinkUrl>oref.org.il</LinkUrl>
            </LinkText>
          </LinkCard>
          <LinkCard
            href={RED_ALERT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="צבע אדום"
            tabIndex={0}
          >
            <LinkEmoji>🔴</LinkEmoji>
            <LinkText>
              <LinkTitle>צבע אדום — Red Alert</LinkTitle>
              <LinkUrl>tzevaadom.co.il</LinkUrl>
            </LinkText>
          </LinkCard>
          {geoBlocked && (
            <LinkCard
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="קוד המקור ב-GitHub"
              tabIndex={0}
            >
              <LinkEmoji>💻</LinkEmoji>
              <LinkText>
                <LinkTitle>קוד מקור — GitHub</LinkTitle>
                <LinkUrl>github.com/sayag11/oref-monitor</LinkUrl>
              </LinkText>
            </LinkCard>
          )}
        </LinksSection>

        <TestResultsSection>
          <TestResultsTitle>אבחון:</TestResultsTitle>
          {report.results.map((test, i) => (
            <TestResultRow key={i}>
              <TestStatus $passed={test.passed}>
                {test.passed ? '✓' : '✗'}
              </TestStatus>
              <TestInfo>
                <TestName>{test.name}</TestName>
                <TestDetail>{test.detail}</TestDetail>
              </TestInfo>
            </TestResultRow>
          ))}
        </TestResultsSection>

        <RetryButton onClick={onRetry} aria-label="נסה שוב" tabIndex={0}>
          נסה שוב
        </RetryButton>
      </ErrorCard>
    </ScreenWrapper>
  );
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ScreenWrapper = styled.div`
  min-height: 100vh;
  background: ${V('--bg-primary')};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  direction: rtl;
  font-family: ${FONT};
  transition: background-color 0.3s ease;
`;

const LoadingCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid ${V('--border-primary')};
  border-top-color: ${V('--accent')};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const LoadingTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${V('--text-primary')};
  margin: 0;
`;

const LoadingSubtitle = styled.p`
  font-size: 13px;
  color: ${V('--text-muted')};
  margin: 0;
`;

const ErrorCard = styled.div`
  max-width: 500px;
  width: 100%;
  background: ${V('--bg-secondary')};
  border: 1px solid #dc262630;
  border-radius: 14px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ErrorIcon = styled.div`
  font-size: 40px;
`;

const ErrorTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: #f87171;
  margin: 0;
  text-align: center;
  letter-spacing: -0.3px;
`;

const ErrorDescription = styled.p`
  font-size: 13px;
  color: ${V('--text-tertiary')};
  margin: 0;
  text-align: center;
  line-height: 1.7;

  strong {
    color: ${V('--text-secondary')};
  }
`;

const GeoSection = styled.div`
  width: 100%;
  padding: 16px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GeoTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${V('--text-primary')};
  margin: 0;
`;

const GeoText = styled.p`
  font-size: 13px;
  color: ${V('--text-tertiary')};
  margin: 0;
  line-height: 1.6;

  strong {
    color: ${V('--text-secondary')};
  }
`;

const CodeBlock = styled.pre`
  padding: 12px 14px;
  background: ${V('--bg-primary')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 8px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  color: ${V('--text-secondary')};
  line-height: 1.8;
  overflow-x: auto;
  white-space: pre;
`;

const CodeInline = styled.code`
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: ${V('--bg-primary')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 4px;
  color: ${V('--accent')};
`;

const LinksSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LinksSectionLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${V('--text-muted')};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
`;

const LinkCard = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;

  &:hover {
    background: ${V('--bg-hover')};
  }

  &:focus-visible {
    outline: 2px solid ${V('--accent')};
    outline-offset: 2px;
  }
`;

const LinkEmoji = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const LinkText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const LinkTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${V('--text-primary')};
`;

const LinkUrl = styled.span`
  font-size: 11px;
  color: ${V('--text-muted')};
`;

const TestResultsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid ${V('--border-subtle')};
`;

const TestResultsTitle = styled.h3`
  font-size: 11px;
  font-weight: 600;
  color: ${V('--text-muted')};
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TestResultRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 0;
`;

const TestStatus = styled.span<{ $passed: boolean }>`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 9px;
  font-weight: 700;
  background: ${(p) => (p.$passed ? '#16532410' : '#dc262610')};
  color: ${(p) => (p.$passed ? '#4ade80' : '#f87171')};
  border: 1px solid ${(p) => (p.$passed ? '#4ade8025' : '#f8717125')};
`;

const TestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const TestName = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${V('--text-secondary')};
`;

const TestDetail = styled.span`
  font-size: 11px;
  color: ${V('--text-muted')};
`;

const RetryButton = styled.button`
  padding: 8px 24px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 8px;
  color: ${V('--text-primary')};
  font-size: 13px;
  font-weight: 500;
  font-family: ${FONT};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${V('--bg-hover')};
  }

  &:focus-visible {
    outline: 2px solid ${V('--accent')};
    outline-offset: 2px;
  }
`;

export default IntegrityGate;
