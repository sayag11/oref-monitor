import styled, { keyframes, css } from 'styled-components';
import { AlertStatus } from './types';

const STATUS_COLORS: Record<AlertStatus, { glow: string; text: string }> = {
  safe:              { glow: '#22c55e', text: '#22c55e' },
  near_shelter:      { glow: '#06b6d4', text: '#06b6d4' },
  pre_alert:         { glow: '#eab308', text: '#eab308' },
  go_to_shelter:     { glow: '#f97316', text: '#f97316' },
  in_shelter:        { glow: '#ef4444', text: '#ef4444' },
  connection_lost:   { glow: '#a855f7', text: '#a855f7' },
};

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const V = (name: string) => `var(${name})`;

export const AppWrapper = styled.div`
  min-height: 100vh;
  background: ${V('--bg-primary')};
  background-image:
    radial-gradient(circle at 50% 0%, ${V('--grid-vignette')} 0%, transparent 50%),
    linear-gradient(${V('--grid-line')} 1px, transparent 1px),
    linear-gradient(90deg, ${V('--grid-line')} 1px, transparent 1px);
  background-size: 100% 100%, 48px 48px, 48px 48px;
  color: ${V('--text-primary')};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  direction: rtl;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

export const Header = styled.header`
  width: 100%;
  max-width: 800px;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const HeaderTitles = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: -1px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
`;

export const HeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ThemeToggleButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-primary')};
  color: ${V('--text-tertiary')};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    background: ${V('--bg-hover')};
    border-color: ${V('--text-faint')};
    color: ${V('--text-secondary')};
  }

  &:focus-visible {
    outline: 2px solid ${V('--accent')};
    outline-offset: 2px;
  }
`;

export const Title = styled.h1`
  font-size: 17px;
  font-weight: 700;
  color: ${V('--text-primary')};
  margin: 0;
  letter-spacing: -0.3px;
`;

export const Subtitle = styled.p`
  font-size: 12px;
  color: ${V('--text-muted')};
  margin: 0;
  font-weight: 400;
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 12px 20px 40px;
  max-width: 520px;
  width: 100%;
  animation: ${fadeIn} 0.4s ease-out;
`;

export const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 380px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 18px;
  padding-right: 40px;
  border: 1px solid ${V('--border-primary')};
  border-radius: 10px;
  background: ${V('--bg-surface')};
  color: ${V('--text-primary')};
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.3s;
  box-sizing: border-box;
  direction: rtl;

  &:focus {
    border-color: ${V('--accent')};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  &::placeholder {
    color: ${V('--text-faint')};
  }
`;

export const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${V('--text-faint')};
  font-size: 15px;
  pointer-events: none;
`;

export const AutocompleteList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  width: 100%;
  max-height: 220px;
  overflow-y: auto;
  background: ${V('--bg-elevated')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 10px;
  list-style: none;
  margin: 0;
  padding: 4px;
  z-index: 10;
  box-shadow: 0 16px 48px ${V('--shadow-drop')};
`;

export const AutocompleteItem = styled.li<{ $highlighted: boolean }>`
  padding: 9px 14px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 450;
  color: ${(p) => (p.$highlighted ? V('--text-primary') : V('--text-secondary'))};
  background: ${(p) => (p.$highlighted ? V('--bg-hover') : 'transparent')};
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${V('--bg-hover')};
    color: ${V('--text-primary')};
  }
`;

export const StatusCard = styled.div<{ $status: AlertStatus }>`
  width: 100%;
  border-radius: 16px;
  padding: 36px 28px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: ${V('--bg-secondary')};
  border: 1px solid ${(p) => STATUS_COLORS[p.$status].glow}20;
  box-shadow:
    0 0 60px ${(p) => STATUS_COLORS[p.$status].glow}08,
    0 1px 0 ${(p) => STATUS_COLORS[p.$status].glow}06 inset;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${(p) => STATUS_COLORS[p.$status].glow}60,
      transparent
    );
  }

  ${(p) =>
    p.$status !== 'safe' &&
    p.$status !== 'near_shelter' &&
    css`
      animation: ${shake} 0.5s ease-in-out;
    `}
`;

export const StatusIcon = styled.div<{ $status: AlertStatus }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  background: ${(p) => STATUS_COLORS[p.$status].glow}10;
  border: 1.5px solid ${(p) => STATUS_COLORS[p.$status].glow}25;

  ${(p) =>
    p.$status !== 'safe' &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

export const StatusTitle = styled.h2<{ $status: AlertStatus }>`
  font-size: 22px;
  font-weight: 700;
  color: ${(p) => STATUS_COLORS[p.$status].text};
  margin: 0;
  text-align: center;
  letter-spacing: -0.3px;
`;

export const StatusDescription = styled.p`
  font-size: 13px;
  color: ${V('--text-tertiary')};
  margin: 0;
  text-align: center;
  line-height: 1.7;
`;

export const CityLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 20px;
  font-size: 11px;
  color: ${V('--text-tertiary')};
  font-weight: 500;
  letter-spacing: 0.3px;
`;

export const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 20px;
  font-size: 10px;
  color: ${V('--text-muted')};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: ${pulse} 2s ease-in-out infinite;
`;

export const LastUpdate = styled.div`
  font-size: 11px;
  color: ${V('--text-muted')};
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
`;

export const PollingDot = styled.span<{ $active: boolean }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? '#22c55e' : V('--text-faint'))};
  display: inline-block;
  flex-shrink: 0;

  ${(p) =>
    p.$active &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

export const HistorySection = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const HistoryTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: ${V('--text-tertiary')};
  margin: 0;
  letter-spacing: -0.2px;
`;

export const HistoryCount = styled.span`
  font-size: 11px;
  color: ${V('--text-muted')};
  font-weight: 500;
  font-variant-numeric: tabular-nums;
`;

export const HistoryItem = styled.div`
  padding: 10px 14px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-subtle')};
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  transition: border-color 0.15s, background 0.3s;

  &:hover {
    border-color: ${V('--border-primary')};
  }
`;

export const HistoryDate = styled.span`
  color: ${V('--text-muted')};
  font-size: 11px;
  direction: ltr;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
`;

export const HistoryCategory = styled.span`
  color: ${V('--text-secondary')};
  font-weight: 450;
`;

export const ErrorBanner = styled.div`
  width: 100%;
  padding: 10px 14px;
  background: ${V('--bg-surface')};
  border: 1px solid #dc262640;
  border-radius: 8px;
  color: #f87171;
  font-size: 12px;
  text-align: center;
  font-weight: 450;
`;

export const DefaultCityWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const DefaultCityButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: ${V('--bg-surface')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 8px;
  color: ${V('--text-tertiary')};
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
  direction: rtl;

  &:hover {
    background: ${V('--bg-hover')};
    color: ${V('--text-secondary')};
  }

  &:focus-visible {
    outline: 2px solid ${V('--accent')};
    outline-offset: 2px;
  }
`;

export const DefaultCityDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 240px;
  background: ${V('--bg-elevated')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 10px;
  padding: 6px;
  z-index: 20;
  box-shadow: 0 16px 48px ${V('--shadow-drop')};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DefaultCityInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  background: ${V('--bg-primary')};
  border: 1px solid ${V('--border-primary')};
  border-radius: 6px;
  color: ${V('--text-primary')};
  font-size: 12px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  direction: rtl;
  margin-bottom: 2px;

  &:focus {
    border-color: ${V('--accent')};
  }

  &::placeholder {
    color: ${V('--text-faint')};
  }
`;

export const DefaultCityOption = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 7px 10px;
  background: ${(p) => (p.$active ? V('--bg-hover') : 'transparent')};
  border: none;
  border-radius: 6px;
  color: ${(p) => (p.$active ? V('--text-primary') : V('--text-tertiary'))};
  font-size: 12px;
  font-family: inherit;
  font-weight: 450;
  cursor: pointer;
  text-align: right;
  direction: rtl;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${V('--bg-hover')};
    color: ${V('--text-primary')};
  }
`;

export const DefaultCityList = styled.div`
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const DefaultCityLabel = styled.span`
  color: ${V('--text-muted')};
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: none;

  @media (min-width: 640px) {
    display: inline;
  }
`;

export const Footer = styled.footer`
  width: 100%;
  max-width: 520px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const FooterDisclaimer = styled.p`
  color: ${V('--text-faint')};
  font-size: 10px;
  text-align: center;
  font-weight: 400;
  line-height: 1.5;
`;

export const FooterCredit = styled.p`
  color: ${V('--text-faint')};
  font-size: 10px;
  text-align: center;
  font-weight: 400;

  a {
    color: ${V('--text-muted')};
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: ${V('--text-tertiary')};
    }
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const StatusLoading = styled.div`
  width: 100%;
  border-radius: 16px;
  padding: 48px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: ${V('--bg-secondary')};
  border: 1px solid ${V('--border-subtle')};
`;

export const StatusSpinner = styled.div`
  width: 28px;
  height: 28px;
  border: 2px solid ${V('--border-primary')};
  border-top-color: ${V('--accent')};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

export const StatusLoadingText = styled.p`
  font-size: 13px;
  color: ${V('--text-muted')};
  font-weight: 450;
`;

export const TransparencySection = styled.details`
  width: 100%;
  max-width: 520px;
  margin-top: 8px;
  border: 1px solid ${V('--border-subtle')};
  border-radius: 10px;
  background: ${V('--bg-surface')};
  overflow: hidden;
  transition: background 0.3s;

  &[open] > summary {
    border-bottom: 1px solid ${V('--border-subtle')};
  }
`;

export const TransparencySummary = styled.summary`
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${V('--text-muted')};
  cursor: pointer;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;

  &::-webkit-details-marker {
    display: none;
  }

  &::before {
    content: '▸';
    font-size: 10px;
    transition: transform 0.2s;
  }

  details[open] > &::before {
    transform: rotate(90deg);
  }

  &:hover {
    color: ${V('--text-tertiary')};
  }
`;

export const TransparencyBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const TransparencyBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TransparencyLabel = styled.h4`
  font-size: 11px;
  font-weight: 600;
  color: ${V('--text-tertiary')};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

export const TransparencyText = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: ${V('--text-muted')};
  margin: 0;
  line-height: 1.7;

  code {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 11px;
    padding: 1px 5px;
    background: ${V('--bg-hover')};
    border: 1px solid ${V('--border-subtle')};
    border-radius: 4px;
    color: ${V('--text-tertiary')};
    direction: ltr;
    unicode-bidi: isolate;
  }

  a {
    color: ${V('--accent')};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

export const TransparencyDivider = styled.hr`
  border: none;
  border-top: 1px solid ${V('--border-subtle')};
  margin: 2px 0;
`;
