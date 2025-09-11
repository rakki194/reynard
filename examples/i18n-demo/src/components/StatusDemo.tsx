import { Component } from "solid-js";
import { useI18n } from "reynard-themes";

const StatusDemo: Component = () => {
  const { t } = useI18n();

  return (
    <div class="status-demo">
      <div class="status success">{t("common.success")}</div>
      <div class="status warning">{t("common.warning")}</div>
      <div class="status error">{t("common.error")}</div>
      <div class="status info">{t("common.info")}</div>
    </div>
  );
};

export default StatusDemo;
