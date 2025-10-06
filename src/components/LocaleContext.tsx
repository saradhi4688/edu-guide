import React, { createContext, useContext, useEffect, useState } from 'react';

type Locale = 'en' | 'hi';

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    eduguide: 'EduGuide',
    welcome: 'Welcome',
    profile_complete: 'Profile {percent}% Complete',
    complete_your_profile: 'Complete Your Profile',
    complete_profile: 'Complete Profile',
    skill_analysis: 'Skill Analysis',
    recent_alerts: 'Recent Alerts',
    ai_recommendations: 'AI Recommendations',
    view_all: 'View All',
    loading: 'Loading...',
  },
  hi: {
    eduguide: 'एडुगाइड',
    welcome: 'स्वागत है',
    profile_complete: 'प्रोफ़ाइल {percent}% पूर्ण',
    complete_your_profile: 'अपनी प्रोफ़ाइल पूरा करें',
    complete_profile: 'प्रोफ़ाइल पूरा करें',
    skill_analysis: 'कौशल विश्लेषण',
    recent_alerts: 'हाल के अलर्ट',
    ai_recommendations: 'एआई सिफारिशें',
    view_all: 'सभी देखें',
    loading: 'लौड हो रहा है...',
  }
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('locale');
      return (saved as Locale) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('locale', locale);
    } catch {}
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
  }

  function t(key: string, params?: Record<string, string | number>) {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return text;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
