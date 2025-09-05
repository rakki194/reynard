import { Component } from "solid-js";
import { useI18n, type Locale } from "@reynard/core";
import { Select } from "@reynard/components";

const LanguageSelector: Component = () => {
  const { locale, setLocale, languages } = useI18n();

  const languageOptions = languages.map((l) => ({
    value: l.code,
    label: l.name,
  }));

  const handleLanguageChange = (e: Event & { target: HTMLSelectElement }) => {
    setLocale(e.target.value as Locale);
  };

  return (
    <div class="language-selector">
      <Select
        value={locale()}
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
