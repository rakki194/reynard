/**
 * LanguageSelector Component
 * Allows users to switch between available languages
 */

import { Component, For } from "solid-js";
import { useI18n, type LanguageCode } from "reynard-themes";

interface LanguageSelectorProps {
  setLocale?: (locale: LanguageCode) => void;
}

export const LanguageSelector: Component<LanguageSelectorProps> = (props) => {
  const { locale, setLocale: themeSetLocale, languages } = useI18n();
  const setLocale = props.setLocale || themeSetLocale;

  // For demo, show just a few languages
  const availableLanguages = languages.filter(
    (lang: { code: LanguageCode; name: string }) =>
      (["en", "es", "fr"] as LanguageCode[]).includes(lang.code),
  );

  return (
    <select
      class="language-selector"
      value={locale}
      onChange={(e) => {
        const newLocale = e.currentTarget.value as LanguageCode;
        console.log("Language selector changing locale to:", newLocale);
        setLocale(newLocale);
      }}
      aria-label="Select language"
      title="Select language"
    >
      <For each={availableLanguages}>
        {(lang) => (
          <option value={lang.code}>
            <span class="language-option">
              <span class="language-icon">🌐</span>
              {lang.name}
            </span>
          </option>
        )}
      </For>
    </select>
  );
};
