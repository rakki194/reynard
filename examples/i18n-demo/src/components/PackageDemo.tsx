import { Component } from "solid-js";
import { useI18n } from "reynard-themes";
import { getDemoTranslation } from "../translations";

const PackageDemo: Component = () => {
  const { t, locale } = useI18n();

  return (
    <div class="package-demo">
      <h4>{getDemoTranslation(locale, "core")}</h4>
      <p>
        {t("core.notifications.title")}: {t("core.notifications.noNotifications")}
      </p>

      <h4>{getDemoTranslation(locale, "components")}</h4>
      <p>
        {t("components.modal.title")}: {t("components.modal.close")}
      </p>

      <h4>{getDemoTranslation(locale, "gallery")}</h4>
      <p>
        {t("gallery.upload.title")}: {t("gallery.upload.dragDrop")}
      </p>

      <h4>{getDemoTranslation(locale, "charts")}</h4>
      <p>
        {t("charts.types.line")}: {t("charts.data.noData")}
      </p>
    </div>
  );
};

export default PackageDemo;
