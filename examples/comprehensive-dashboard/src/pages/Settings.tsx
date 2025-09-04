import { Component } from "solid-js";
import { useI18n } from "@reynard/core";
import { SettingsPanel } from "@reynard/settings";
import { Card } from "@reynard/components";
import { appSettingsSchema } from "../settings/schema";

const Settings: Component = () => {
  const { t } = useI18n();

  return (
    <div class="settings-page">
      <div class="settings-page__header">
        <h1 class="settings-page__title">{t("settings.title")}</h1>
        <p class="settings-page__description">
          Customize your dashboard experience and preferences.
        </p>
      </div>

      <Card class="settings-page__card">
        <SettingsPanel
          config={{
            schema: appSettingsSchema,
            storage: {
              default: "localStorage",
              prefix: "reynard-dashboard-settings_",
            },
          }}
          showSearch={true}
          showCategories={true}
          showImportExport={true}
          showReset={true}
          title=""
        />
      </Card>
    </div>
  );
};

export { Settings };
