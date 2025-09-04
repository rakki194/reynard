import { Component } from "solid-js";
import { useI18n } from "@reynard/core";
import { useSettings, SettingsPanel } from "@reynard/settings";
import { Card } from "@reynard/components";
import { appSettingsSchema } from "../settings/schema";

const Settings: Component = () => {
  const { t } = useI18n();

  const settings = useSettings({
    schema: appSettingsSchema,
    storageKey: "reynard-dashboard-settings",
    autoSave: true,
  });

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
          settings={settings}
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
