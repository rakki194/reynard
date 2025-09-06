/**
 * Language Selector Component
 * Allows switching between different languages
 */

import { useLanguage } from "reynard-core";

export default function LanguageSelector() {
  const { t, currentLanguage, setCurrentLanguage, availableLanguages } = useLanguage();

  const handleLanguageChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    setCurrentLanguage(select.value);
  };

  return (
    <select 
      class="language-selector" 
      value={currentLanguage()} 
      onChange={handleLanguageChange}
      aria-label="Select language"
    >
      {availableLanguages().map(lang => (
        <option value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
