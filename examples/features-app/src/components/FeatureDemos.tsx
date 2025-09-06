/**
 * Feature Demonstrations Component
 * Shows interactive examples of feature-aware components
 */

import { useI18n } from "reynard-themes";
import ImageProcessingDemo from "./demos/ImageProcessingDemo";
import CaptionGenerationDemo from "./demos/CaptionGenerationDemo";
import ObjectDetectionDemo from "./demos/ObjectDetectionDemo";
import TextAnalysisDemo from "./demos/TextAnalysisDemo";
import GitIntegrationDemo from "./demos/GitIntegrationDemo";

export default function FeatureDemos() {
  const { t } = useI18n();

  return (
    <div class="feature-demo">
      <h3>🎯 Feature Demonstrations</h3>
      <p>Interactive examples of feature-aware components</p>
      
      <div class="feature-demo-grid">
        <ImageProcessingDemo />
        <CaptionGenerationDemo />
        <ObjectDetectionDemo />
        <TextAnalysisDemo />
        <GitIntegrationDemo />
      </div>
    </div>
  );
}
