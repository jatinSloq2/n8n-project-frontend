import { createContext, useContext, useEffect, useState } from 'react';

const ThemeProviderContext = createContext({
  theme: 'light',
  setTheme: () => null,
});

export function ThemeProvider({ children, defaultTheme = 'light', storageKey = 'theme', ...props }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      console.log('Initial theme from storage:', stored);
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    console.log('Applying theme:', theme);

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the current theme
    root.classList.add(theme);

    // Store in localStorage
    localStorage.setItem(storageKey, theme);

    console.log('HTML classes:', root.className);
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      console.log('setTheme called with:', newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};