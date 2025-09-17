import { useI18n } from "reynard-i18n";
export const LoadingSpinner = (props) => {
    const { t } = useI18n();
    return (<div class="threejs-loading">
      <div class="loading-spinner"/>
      <span>{props.message || t("3d.loading3DVisualization")}</span>
    </div>);
};
