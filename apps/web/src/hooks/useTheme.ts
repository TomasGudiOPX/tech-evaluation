import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const themeStorageKey = 'theme';

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initialTheme(): Theme {
  const saved = localStorage.getItem(themeStorageKey);
  return saved === 'light' || saved === 'dark' ? saved : systemTheme();
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(themeStorageKey, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
