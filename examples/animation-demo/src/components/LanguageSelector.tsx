/**
 * 🌍 Language Selector Component
 * 
 * Dropdown selector for changing languages in the animation demo
 */

import { Component, For } from "solid-js";
import { useI18n, languages, type LanguageCode } from "reynard-themes";

export const LanguageSelector: Component = () => {
  const { locale, setLocale } = useI18n();

  return (
    <div class="language-selector">
      <label for="language-select" class="selector-label">
        🌍 Language:
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => setLocale(e.currentTarget.value as LanguageCode)}
        class="selector-dropdown"
      >
        <For each={languages}>
          {(lang) => (
            <option value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          )}
        </For>
      </select>
    </div>
  );
};
