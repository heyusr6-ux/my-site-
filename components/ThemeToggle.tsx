'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bl-theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch {
      /* storage blocked: keep default */
    }
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('bl-theme', next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button type="button" className="btn" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
