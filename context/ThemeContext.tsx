import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { SettingsService, ThemePreference } from '../services/settings/settings.service';

interface ThemeContextType {
  theme: ThemePreference; // 'light' | 'dark' | 'system'
  effectiveTheme: 'light' | 'dark';
  setTheme: (newTheme: ThemePreference | 'claro' | 'escuro' | 'sistema') => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const normalizeTheme = (t?: string): ThemePreference => {
  if (!t) return 'system';
  if (t === 'escuro' || t === 'dark') return 'dark';
  if (t === 'claro' || t === 'light') return 'light';
  return 'system';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const authUser = useUserStore((state) => state.authUser);
  const updateProfileInStore = useUserStore((state) => state.updateProfile);

  // Read initial theme preference from localStorage, user profile, or default to 'system'
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const local = localStorage.getItem('grana_theme');
    if (local) return normalizeTheme(local);
    if (user?.theme) return normalizeTheme(user.theme);
    return 'system';
  });

  // Calculate effective theme ('light' or 'dark')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Synchronize theme if user object loads/changes from backend auth init
  useEffect(() => {
    if (user?.theme) {
      const backendTheme = normalizeTheme(user.theme);
      setThemeState(backendTheme);
    }
  }, [user?.theme]);

  // Apply theme class to <html> element whenever theme changes
  useEffect(() => {
    const computeEffective = (): 'light' | 'dark' => {
      if (theme === 'dark') return 'dark';
      if (theme === 'light') return 'light';
      // If 'system', check OS color scheme
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    };

    const currentEffective = computeEffective();
    setEffectiveTheme(currentEffective);

    const root = document.documentElement;
    if (currentEffective === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    localStorage.setItem('grana_theme', theme);

    // If 'system', listen for OS preference changes
    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e: MediaQueryListEvent) => {
        const newEffective = e.matches ? 'dark' : 'light';
        setEffectiveTheme(newEffective);
        if (newEffective === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
          root.style.colorScheme = 'light';
        }
      };

      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [theme]);

  const setTheme = useCallback(async (newThemeInput: ThemePreference | 'claro' | 'escuro' | 'sistema') => {
    const norm = normalizeTheme(newThemeInput);
    setThemeState(norm);
    localStorage.setItem('grana_theme', norm);

    // Update in Zustand userStore
    updateProfileInStore({ theme: norm as any });

    // Persist in Supabase settings table if logged in
    const currentUserId = authUser?.id;
    if (currentUserId) {
      await SettingsService.updateTheme(currentUserId, norm);
    }
  }, [authUser?.id, updateProfileInStore]);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
