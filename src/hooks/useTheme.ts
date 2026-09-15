import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types/question';
import { LocalStorageManager } from '../lib/storage';

const THEME_TOPBAR_COLORS: Record<ThemeMode, string> = {
  light: '#f1f5f9',
  dark: '#07090e',
  reading: '#fbf5e8',
  night: '#100300',
};

export const applyThemeToDOM = (themeMode: ThemeMode) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeMode);

  // ONLY 'dark' mode uses Tailwind's .dark class (AMOLED Slate / Electric Indigo).
  // 'night' is the dedicated zero-blue circadian amber theme (no blue pixels).
  // 'reading' is warm paper sepia, and 'light' is daylight.
  if (themeMode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Dynamic top bar & status bar color (for Windows title bar and Android status bar in PWA/browser)
  const topBarColor = THEME_TOPBAR_COLORS[themeMode] || '#ffffff';
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', topBarColor);
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return LocalStorageManager.getPreferences().theme || 'light';
  });

  useEffect(() => {
    applyThemeToDOM(theme);
    LocalStorageManager.savePreferences({
      ...LocalStorageManager.getPreferences(),
      theme,
    });
  }, [theme]);

  const handleToggleTheme = useCallback((newTheme: ThemeMode) => {
    if (newTheme === theme) return;
    applyThemeToDOM(newTheme);
    setTheme(newTheme);
    LocalStorageManager.savePreferences({
      ...LocalStorageManager.getPreferences(),
      theme: newTheme,
    });
  }, [theme]);

  return {
    theme,
    setTheme,
    handleToggleTheme,
  };
}
