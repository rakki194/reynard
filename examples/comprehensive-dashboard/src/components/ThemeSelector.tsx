import { Component } from 'solid-js';
import { useTheme } from '@reynard/core';
import { Select } from '@reynard/components';

const ThemeSelector: Component = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  const themeOptions = availableThemes().map(t => ({
    value: t.name,
    label: `${t.emoji} ${t.displayName}`,
  }));

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
  };

  return (
    <div class="theme-selector">
      <Select
        value={theme().name}
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


