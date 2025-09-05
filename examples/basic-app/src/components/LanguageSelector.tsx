/**
 * LanguageSelector Component
 * Allows users to switch between available languages
 */

import { Component, For } from "solid-js";
import { useI18n } from "@reynard/core";
import { fluentIconsPackage } from "@reynard/fluent-icons";

export const LanguageSelector: Component = () => {
  const { locale, setLocale, languages } = useI18n();

  // For demo, show just a few languages
  const availableLanguages = languages.filter(
    (lang: { code: string; name: string }) =>
      ["en", "es", "fr"].includes(lang.code),
  );

  const getLanguageIcon = (code: string) => {
    const icons: Record<string, string> = {
      en: "globe",
      es: "globe",
      fr: "globe",
    };
    return icons[code] || "globe";
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
            <span class="language-option">
              <span class="language-icon">
                {fluentIconsPackage.getIcon(getLanguageIcon(lang.code)) && (
                  <div
                    innerHTML={
                      fluentIconsPackage.getIcon(getLanguageIcon(lang.code))
                        ?.outerHTML
                    }
                  />
                )}
              </span>
              {lang.name}
            </span>
          </option>
        )}
      </For>
    </select>
  );
};
