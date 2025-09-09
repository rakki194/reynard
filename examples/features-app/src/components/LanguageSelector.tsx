/**
 * Language Selector Component
 * Allows switching between different languages
 */

import { For } from "solid-js";
import { useI18n, type LanguageCode } from "reynard-themes";

export default function LanguageSelector() {
  const { locale, setLocale, languages } = useI18n();

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
        setLocale(newLocale);
      }}
      aria-label="Select language"
    >
      <For each={availableLanguages}>
        {(lang) => <option value={lang.code}>🌐 {lang.name}</option>}
      </For>
    </select>
  );
}
