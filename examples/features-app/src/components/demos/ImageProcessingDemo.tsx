/**
 * Image Processing Demo Component
 * Demonstrates feature-aware image processing capabilities
 */

import { createSignal } from "solid-js";
import { useFeatureAware, useFeatureStatus } from "reynard-features";
import { useLanguage } from "reynard-core";

export default function ImageProcessingDemo() {
  const { t } = useLanguage();
  const { shouldRender, fallback } = useFeatureAware(
    "image-processing",
    <div class="demo-content unavailable">
      <p>{t("demo.imageProcessing.unavailable")}</p>
    </div>
  );
  
  const status = useFeatureStatus("image-processing");
  const [uploadedImage, setUploadedImage] = createSignal<string | null>(null);

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div class="feature-demo">
      <h3>🖼️ {t("demo.imageProcessing.title")}</h3>
      <p>{t("demo.imageProcessing.description")}</p>
      
      {shouldRender() ? (
        <div class="demo-content">
          <p>{t("demo.imageProcessing.available")}</p>
          
          {status()?.degraded && (
            <div class="status-message warning">
              ⚠️ {status()?.message}
            </div>
          )}
          
          <div style="margin-top: var(--spacing);">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style="margin-bottom: var(--spacing);"
              aria-label="Upload image for processing"
            />
            
            {uploadedImage() && (
              <div>
                <img 
                  src={uploadedImage()!} 
                  alt="Uploaded" 
                  style="max-width: 100%; height: auto; border-radius: var(--border-radius);"
                />
                <p style="margin-top: calc(var(--spacing) / 2); font-size: 0.9rem; color: var(--text-secondary);">
                  Image uploaded successfully! Processing features would be available here.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        fallback
      )}
    </div>
  );
}
