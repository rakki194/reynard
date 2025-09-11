import { Component } from "solid-js";
import { useI18n } from "reynard-themes";
import { getDemoTranslation } from "../translations";
import DemoCard from "./DemoCard";
import CounterDemo from "./CounterDemo";
import PackageDemo from "./PackageDemo";
import StatusDemo from "./StatusDemo";

const TranslationDemo: Component = () => {
  const { t, locale } = useI18n();

  return (
    <div class="translation-demo">
      <h2>{getDemoTranslation(locale, "translationExamples")}</h2>

      <div class="demo-grid">
        <DemoCard title="basicActions">
          <div class="button-group">
            <button class="btn btn-primary">{t("common.save")}</button>
            <button class="btn btn-secondary">{t("common.cancel")}</button>
            <button class="btn btn-danger">{t("common.delete")}</button>
          </div>
        </DemoCard>

        <DemoCard title="navigation">
          <div class="nav-demo">
            <span>{t("common.home")}</span>
            <span>→</span>
            <span>{t("common.settings")}</span>
            <span>→</span>
            <span>{t("common.about")}</span>
          </div>
        </DemoCard>

        <DemoCard title="formElements">
          <div class="form-demo">
            <label>{t("common.name")}:</label>
            <input type="text" placeholder={t("common.search")} />
            <label>{t("common.description")}:</label>
            <textarea placeholder={t("common.description")} />
          </div>
        </DemoCard>

        <DemoCard title="counterDemo">
          <CounterDemo />
        </DemoCard>

        <DemoCard title="packageTranslations">
          <PackageDemo />
        </DemoCard>

        <DemoCard title="statusMessages">
          <StatusDemo />
        </DemoCard>
      </div>
    </div>
  );
};

export default TranslationDemo;
