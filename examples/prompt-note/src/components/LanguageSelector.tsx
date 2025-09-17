/**
 * LanguageSelector Component
 * Allows users to switch between available languages
 */

import { Component, For } from "solid-js";
import { Button } from "reynard-components";
import { useI18n } from "reynard-themes";

interface LanguageSelectorProps {
  setLocale?: (locale: string) => void;
}

export const LanguageSelector: Component<LanguageSelectorProps> = props => {
  const i18nContext = useI18n();
  const setLocale = props.setLocale || i18nContext.setLocale;

  // For demo, show just a few languages
  const availableLanguages = i18nContext.languages.filter((lang: { code: string; name: string }) =>
    (["en", "es", "fr"] as string[]).includes(lang.code)
  );

  const nextLanguage = () => {
    const currentIndex = availableLanguages.findIndex(lang => lang.code === i18nContext.locale);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    setLocale(availableLanguages[nextIndex].code);
  };

  const getCurrentLanguage = () => {
    return availableLanguages.find(lang => lang.code === i18nContext.locale) || availableLanguages[0];
  };

  return (
    <Button
      variant="secondary"
      onClick={nextLanguage}
      title={`Switch language (currently ${getCurrentLanguage()?.name})`}
    >
      🌐 {getCurrentLanguage()?.name}
    </Button>
  );
};
