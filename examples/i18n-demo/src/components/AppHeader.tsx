import { Component } from "solid-js";
import { useI18n, useTheme } from "reynard-themes";
import { getDemoTranslation } from "../translations";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";

const AppHeader: Component = () => {
  const { t, locale } = useI18n();
  const themeContext = useTheme();

  return (
    <header class="header">
      <div class="header-content">
        <h1 class="title">{getDemoTranslation(locale, "title")}</h1>
        <p class="subtitle">
          {t("common.description")} - {t("themes.theme")}:{" "}
          {themeContext.theme}
        </p>
        <div class="controls">
          <LanguageSelector />
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
