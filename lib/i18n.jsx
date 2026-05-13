'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';

const messages = { fr, en };
const STORAGE_KEY = 'finarent_lang';

const LanguageContext = createContext({ locale: 'fr', t: (key) => key, setLocale: () => {} });

function getNestedValue(obj, path) {
  // First try direct key lookup (for keys like "nav.solutions" that contain dots)
  if (obj?.[path] !== undefined) return obj[path];
  // Then try nested path traversal
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current === undefined || current === null) return undefined;
    // Try joining remaining parts as a direct key first
    const remaining = parts.slice(i).join('.');
    if (current[remaining] !== undefined) return current[remaining];
    current = current[parts[i]];
  }
  return current;
}

export function LanguageProvider({ children }) {
  const [locale] = useState('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    document.documentElement.lang = 'fr';
    setMounted(true);
  }, []);

  const setLocale = useCallback(() => {
    // i18n verrouillé sur le français — la bascule de langue a été retirée.
  }, []);

  const t = useCallback((key) => {
    const value = getNestedValue(messages[locale], key);
    if (value === undefined) {
      console.warn(`[i18n] Missing translation: ${key} (${locale})`);
      return getNestedValue(messages.fr, key) || key;
    }
    return value;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
