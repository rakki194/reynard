import { useI18n } from "reynard-i18n";
export const ErrorDisplay = (props) => {
    const { t } = useI18n();
    return (<div class="threejs-error">
      <span>
        {t("3d.error")}: {props.error}
      </span>
      <button onClick={() => props.onRetry()}>{t("3d.retry")}</button>
    </div>);
};
