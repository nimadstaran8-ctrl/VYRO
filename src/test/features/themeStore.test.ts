import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useThemeStore, applyTheme, getResolvedTheme } from '../../stores/themeStore';

describe('Theme Store', () => {
  beforeEach(() => {
    localStorage.removeItem('vyro_theme');
    useThemeStore.setState({ theme: 'system' });
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('light', 'dark');
  });

  it('defaults to system theme', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('toggles between light and dark', () => {
    const { toggleTheme } = useThemeStore.getState();
    toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
    toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('applies the resolved theme class to the document element', () => {
    const resolved = applyTheme('dark');
    expect(resolved).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('resolves system preference based on media query', () => {
    const resolved = getResolvedTheme('system');
    expect(['light', 'dark']).toContain(resolved);
  });

  it('persists the selected theme to localStorage', () => {
    useThemeStore.getState().setTheme('dark');
    const stored = localStorage.getItem('vyro_theme');
    expect(stored).toContain('dark');
  });
});
