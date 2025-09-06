import { Component, For } from 'solid-js';
import { useI18n, languages, type LanguageCode } from 'reynard-themes';

const LanguageSelector: Component = () => {
  // Use real i18n system
  const { t, locale, setLocale } = useI18n();

  return (
    <div class="language-selector">
      <label for="language-select">
        {t('common.language')}:
      </label>
      <select 
        id="language-select"
        value={locale} 
        onChange={(e) => setLocale(e.currentTarget.value as LanguageCode)}
        class="select"
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

export default LanguageSelector;
