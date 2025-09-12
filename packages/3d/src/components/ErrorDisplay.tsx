import { Component } from "solid-js";
import { useI18n } from "reynard-i18n";

export interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay: Component<ErrorDisplayProps> = (props) => {
  const { t } = useI18n();

  return (
    <div class="threejs-error">
      <span>
        {t("3d.error")}: {props.error}
      </span>
      <button onClick={() => props.onRetry()}>{t("3d.retry")}</button>
    </div>
  );
};
