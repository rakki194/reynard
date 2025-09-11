import { Component } from "solid-js";
import { useI18n } from "reynard-themes";
import { getDemoTranslation } from "../translations";

const FeaturesSection: Component = () => {
  const { locale } = useI18n();
  
  return (
    <div class="demo-section">
      <h2>{getDemoTranslation(locale, "features")}</h2>
      <ul class="features-list">
        <li>✅ {getDemoTranslation(locale, "featuresList.languages")}</li>
        <li>✅ {getDemoTranslation(locale, "featuresList.pluralization")}</li>
        <li>✅ {getDemoTranslation(locale, "featuresList.rtlSupport")}</li>
        <li>✅ {getDemoTranslation(locale, "featuresList.typeSafe")}</li>
        <li>✅ {getDemoTranslation(locale, "featuresList.dynamicLoading")}</li>
        <li>✅ {getDemoTranslation(locale, "featuresList.culturalAdaptations")}</li>
        <li>✅ {getDemoTranslation(locale, "featuresList.packageSpecific")}</li>
        <li>✅ {getDemoTranslation(locale, "featuresList.fallbackSystem")}</li>
      </ul>
    </div>
  );
};

export default FeaturesSection;
