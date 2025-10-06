import React from 'react';
import { useLocale } from './LocaleContext';
import { Button } from './ui/button';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="sr-only">Language</label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        className="rounded-md border px-2 py-1 bg-background text-foreground"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </select>
    </div>
  );
}
