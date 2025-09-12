import { Component } from "solid-js";
import { useI18n, useTheme } from "reynard-themes";
import { getDemoTranslation } from "../translations";

interface StatusSectionProps {
  currentTime: Date;
}

const StatusSection: Component<StatusSectionProps> = (props) => {
  const { t, locale, isRTL } = useI18n();
  const themeContext = useTheme();

  return (
    <div class="demo-section">
      <h2>{getDemoTranslation(locale, "currentStatus")}</h2>
      <div class="status-grid">
        <div class="status-item">
          <strong>{t("common.language")}:</strong> {locale}
        </div>
        <div class="status-item">
          <strong>{t("themes.theme")}:</strong> {themeContext.theme}
        </div>
        <div class="status-item">
          <strong>{getDemoTranslation(locale, "rtl")}:</strong>{" "}
          {isRTL
            ? getDemoTranslation(locale, "yes")
            : getDemoTranslation(locale, "no")}
        </div>
        <div class="status-item">
          <strong>{t("core.dateTime.now")}:</strong>{" "}
          {props.currentTime.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default StatusSection;
