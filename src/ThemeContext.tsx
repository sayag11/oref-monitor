import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'oref_theme';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);

const DARK = {
  '--bg-primary': '#06060b',
  '--bg-secondary': '#0c0c14',
  '--bg-surface': '#0d0d14',
  '--bg-elevated': '#111119',
  '--bg-hover': '#1a1a26',
  '--border-primary': '#1e293b',
  '--border-subtle': '#151522',
  '--text-primary': '#f1f5f9',
  '--text-secondary': '#c8cfd8',
  '--text-tertiary': '#8b95a5',
  '--text-muted': '#5e6a7a',
  '--text-faint': '#3d4654',
  '--accent': '#3b82f6',
  '--grid-line': 'rgba(15, 23, 42, 0.3)',
  '--grid-vignette': '#0f172a',
  '--shadow-drop': 'rgba(0, 0, 0, 0.5)',
  '--scrollbar': '#1e293b',
  '--scrollbar-hover': '#334155',
};

const LIGHT = {
  '--bg-primary': '#f8fafc',
  '--bg-secondary': '#f1f5f9',
  '--bg-surface': '#ffffff',
  '--bg-elevated': '#ffffff',
  '--bg-hover': '#e2e8f0',
  '--border-primary': '#cbd5e1',
  '--border-subtle': '#e2e8f0',
  '--text-primary': '#0f172a',
  '--text-secondary': '#1e293b',
  '--text-tertiary': '#475569',
  '--text-muted': '#64748b',
  '--text-faint': '#94a3b8',
  '--accent': '#2563eb',
  '--grid-line': 'rgba(203, 213, 225, 0.35)',
  '--grid-vignette': '#e2e8f0',
  '--shadow-drop': 'rgba(0, 0, 0, 0.08)',
  '--scrollbar': '#cbd5e1',
  '--scrollbar-hover': '#94a3b8',
};

const applyThemeVars = (mode: ThemeMode): void => {
  const vars = mode === 'dark' ? DARK : LIGHT;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  useEffect(() => {
    applyThemeVars(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
