import { useState, useEffect, useCallback } from 'react';
import { storage, ThemeMode } from '../../storage';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.SYSTEM);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await storage.themeMode.get();
      setThemeMode(savedTheme);
      applyTheme(savedTheme);
    };

    void loadTheme();

    const unsubscribe = storage.themeMode.onChange((newTheme) => {
      setThemeMode(newTheme);
      applyTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    void storage.themeMode.set(mode);
  }, []);

  return { themeMode, setTheme };
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
}
