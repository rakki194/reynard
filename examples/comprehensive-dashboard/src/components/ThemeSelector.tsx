import { Component } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";
import { Select } from "reynard-components";

const ThemeSelector: Component = () => {
  const { theme, setTheme } = useTheme();
  const availableThemes = getAvailableThemes();

  const themeOptions = availableThemes.map(themeConfig => ({
    value: themeConfig.name,
    label: themeConfig.displayName,
  }));

  const handleThemeChange = (e: Event & { target: HTMLSelectElement }) => {
    setTheme(e.target.value as ThemeName);
  };

  return (
    <div class="theme-selector">
      <Select
        value={theme}
        onChange={handleThemeChange}
        options={themeOptions}
        variant="outlined"
        size="sm"
        class="theme-selector__select"
      />
    </div>
  );
};

export default ThemeSelector;
