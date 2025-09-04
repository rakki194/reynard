import { Component } from 'solid-js';
import { useI18n } from '@reynard/core';
import { Select } from '@reynard/components';

const LanguageSelector: Component = () => {
  const { locale, setLocale, availableLocales } = useI18n();

  const languageOptions = availableLocales().map(l => ({
    value: l.code,
    label: `${l.flag || '🏳️'} ${l.name}`,
  }));

  const handleLanguageChange = (localeCode: string) => {
    setLocale(localeCode);
  };

  return (
    <div class="language-selector">
      <Select
        value={locale().code}
        onChange={handleLanguageChange}
        options={languageOptions}
        variant="outlined"
        size="sm"
        class="language-selector__select"
      />
    </div>
  );
};

export default LanguageSelector;


