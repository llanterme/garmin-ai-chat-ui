'use client';

import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'athlete-iq-theme';

function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const resolved: Theme = stored === 'light' ? 'light' : 'dark';
    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return { theme, setTheme, toggleTheme };
}
