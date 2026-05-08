import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorMode, variant } = useAppSelector((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    // Apply dark/light
    if (colorMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', colorMode === 'dark');
    }
  }, [colorMode]);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme attributes then set the new one
    root.removeAttribute('data-theme');
    if (variant !== 'indigo') {
      root.setAttribute('data-theme', variant);
    }
  }, [variant]);

  return <>{children}</>;
}
