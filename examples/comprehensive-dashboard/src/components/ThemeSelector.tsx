import { Component } from "solid-js";
import { useTheme } from "@reynard/core";
import { Select } from "@reynard/components";

const ThemeSelector: Component = () => {
  const { theme, setTheme, themes, themeIconMap } = useTheme();

  const themeOptions = themes.map((t) => ({
    value: t,
    label: `${themeIconMap[t] ? themeIconMap[t] : ""} ${t}`,
  }));

  const handleThemeChange = (e: Event & { target: HTMLSelectElement }) => {
    setTheme(e.target.value as any);
  };

  return (
    <div class="theme-selector">
      <Select
        value={theme()}
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
