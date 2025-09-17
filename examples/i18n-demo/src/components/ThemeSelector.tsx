import { Component, For } from "solid-js";
import { useTheme, useI18n, themes, type ThemeName } from "reynard-themes";

const ThemeSelector: Component = () => {
  // Use unified Reynard theme and i18n systems
  const themeContext = useTheme();
  const { t } = useI18n();
  const availableThemes = Object.keys(themes) as ThemeName[];

  return (
    <div class="theme-selector">
      <label for="theme-select">{t("themes.theme")}:</label>
      <select
        id="theme-select"
        value={themeContext.theme}
        onChange={e => themeContext.setTheme(e.currentTarget.value as ThemeName)}
        class="select"
      >
        <For each={availableThemes}>{themeName => <option value={themeName}>{t(`themes.${themeName}`)}</option>}</For>
      </select>
    </div>
  );
};

export default ThemeSelector;
