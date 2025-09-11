import { Component } from "solid-js";
import { useI18n } from "reynard-themes";
import { getDemoTranslation } from "../translations";

const IntroSection: Component = () => {
  const { t, locale } = useI18n();

  return (
    <div class="demo-section">
      <h2>{t("common.about")} Reynard i18n</h2>
      <p>
        {getDemoTranslation(locale, "description")}
      </p>
    </div>
  );
};

export default IntroSection;
