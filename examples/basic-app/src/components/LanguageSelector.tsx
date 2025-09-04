/**
 * LanguageSelector Component
 * Allows users to switch between available languages
 */

import { Component, For } from 'solid-js';
import { useI18n } from '@reynard/core';

export const LanguageSelector: Component = () => {
  const { locale, setLocale, languages } = useI18n();

  // For demo, show just a few languages
  const availableLanguages = languages.filter((lang: { code: string; name: string }) => 
    ['en', 'es', 'fr'].includes(lang.code)
  );

  const getLanguageEmoji = (code: string) => {
    const emojis: Record<string, string> = {
      en: '🇺🇸',
      es: '🇪🇸', 
      fr: '🇫🇷',
    };
    return emojis[code] || '🌐';
  };

  return (
    <select 
      class="language-selector"
      value={locale()}
      onChange={(e) => setLocale(e.currentTarget.value as any)}
      aria-label="Select language"
      title="Select language"
    >
      <For each={availableLanguages}>
        {(lang) => (
          <option value={lang.code}>
            {getLanguageEmoji(lang.code)} {lang.name}
          </option>
        )}
      </For>
    </select>
  );
};
