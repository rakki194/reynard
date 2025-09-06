/**
 * Feature Demonstrations Component
 * Shows interactive examples of feature-aware components
 */

import { useLanguage } from "reynard-core";
import ImageProcessingDemo from "./demos/ImageProcessingDemo";
import CaptionGenerationDemo from "./demos/CaptionGenerationDemo";
import ObjectDetectionDemo from "./demos/ObjectDetectionDemo";
import TextAnalysisDemo from "./demos/TextAnalysisDemo";
import GitIntegrationDemo from "./demos/GitIntegrationDemo";

export default function FeatureDemos() {
  const { t } = useLanguage();

  return (
    <div class="feature-demo">
      <h3>🎯 {t("demos.title")}</h3>
      <p>{t("demos.description")}</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing);">
        <ImageProcessingDemo />
        <CaptionGenerationDemo />
        <ObjectDetectionDemo />
        <TextAnalysisDemo />
        <GitIntegrationDemo />
      </div>
    </div>
  );
}
