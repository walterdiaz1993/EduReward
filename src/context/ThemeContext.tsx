import React, { createContext, useContext, useState, ReactNode } from 'react';
import { theme as baseTheme } from '../config/theme';

export const lightColors = {
  primary: '#1e40af',
  primaryDark: '#1e3a8a',
  secondary: '#0284c7',
  background: '#eef6ff',
  card: '#ffffff',
  surface: '#f8fafc',
  cardTranslucent: 'rgba(255, 255, 255, 0.92)',
  glassBg: 'rgba(255, 255, 255, 0.88)',
  glassBorder: 'rgba(30, 64, 175, 0.08)',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.4)',
};

export const darkColors: typeof lightColors = {
  primary: '#38bdf8',
  primaryDark: '#0284c7',
  secondary: '#60a5fa',
  background: '#090d16',
  card: '#131b2e',
  surface: '#1b2742',
  cardTranslucent: 'rgba(19, 27, 46, 0.75)',
  glassBg: 'rgba(19, 27, 46, 0.65)',
  glassBorder: 'rgba(56, 189, 248, 0.25)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  error: '#f87171',
  success: '#34d399',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export type ThemeColors = typeof lightColors;

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  theme: typeof baseTheme & { colors: ThemeColors };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? darkColors : lightColors;
  const toggleTheme = () => setIsDark((prev) => !prev);

  const theme = {
    ...baseTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;
