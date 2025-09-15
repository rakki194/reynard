/**
 * LanguageSelector Component
 * Allows users to switch between available languages
 */

import { Select } from "reynard-components";
import { useI18n, type LanguageCode } from "reynard-themes";
import { Component } from "solid-js";

interface LanguageSelectorProps {
  setLocale?: (locale: LanguageCode) => void;
}

export const LanguageSelector: Component<LanguageSelectorProps> = props => {
  const { locale, setLocale: themeSetLocale, languages } = useI18n();

  // For demo, show just a few languages
  const availableLanguages = languages.filter(lang =>
    (["en", "es", "fr"] as LanguageCode[]).includes(lang.code as LanguageCode)
  );

  return (
    <Select
      value={locale}
      onChange={e => {
        const newLocale = e.currentTarget.value as LanguageCode;
        console.log("Language selector changing locale to:", newLocale);
        // Use custom setLocale if provided, otherwise use theme setLocale
        const setLocale = props.setLocale || themeSetLocale;
        setLocale(newLocale);
      }}
      options={availableLanguages.map(lang => ({
        value: lang.code,
        label: `🌐 ${lang.name}`,
      }))}
      size="sm"
      variant="outlined"
      aria-label="Select language"
    />
  );
};
