import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'jac' | 'retro80s';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: { id: ThemeName; name: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEMES = [
  { id: 'jac' as ThemeName, name: 'JAC Modern', description: 'Clean, dark modern chat theme' },
  { id: 'retro80s' as ThemeName, name: '80s Retro', description: 'Retro Windows 95/98 aesthetic' },
];

const getInitialTheme = (): ThemeName => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('jac-theme');
      if (saved === 'jac' || saved === 'retro80s') {
        return saved;
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage:', e);
    }
  }
  return 'jac';
};

// Apply theme class immediately to prevent flash
const applyThemeClass = (theme: ThemeName) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('theme-jac', 'theme-retro80s');
    document.documentElement.classList.add(`theme-${theme}`);
  }
};

// Apply initial theme immediately on script load
const initialTheme = getInitialTheme();
applyThemeClass(initialTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('jac-theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
    applyThemeClass(newTheme);
  };

  // Ensure theme class is applied on mount (in case of hydration mismatch)
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
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
