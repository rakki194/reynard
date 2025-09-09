/**
 * Main application content component
 */

import { Component, Show } from "solid-js";
import { Button, Tabs, TabPanel } from "reynard-components";
import { ImageGallery } from "./ImageGallery";
import { CaptionEditor } from "./CaptionEditor";
import { ModelSelector } from "./ModelSelector";
import { CaptionModal } from "./CaptionModal";
import type { UseAppStateReturn } from "../composables/useAppState";
import type { UseWorkflowReturn } from "../composables/useWorkflow";
import type { UseAppHandlersReturn } from "../composables/useAppHandlers";

interface AppContentProps {
  appState: UseAppStateReturn;
  workflow: UseWorkflowReturn;
  handlers: UseAppHandlersReturn;
}

export const AppContent: Component<AppContentProps> = (props) => {
  return (
    <main class="app-main">
      <Tabs
        activeTab={props.appState.activeTab()}
        onTabChange={props.appState.setActiveTab}
        items={[
          { id: "gallery", label: "📁 Gallery" },
          { id: "models", label: "🤖 Model Monitor" },
          { id: "stats", label: "📊 System Stats" },
          { id: "workflow", label: "✏️ Caption Editor" },
        ]}
      >
        <TabPanel tabId="gallery" activeTab={props.appState.activeTab()}>
          <div class="gallery-section">
            <div class="gallery-controls">
              <select
                value={props.appState.selectedModel()}
                onChange={(e) =>
                  props.appState.setSelectedModel(e.currentTarget.value)
                }
                disabled={props.appState.isGenerating()}
                title="Select AI model for caption generation"
              >
                <option value="jtp2">JTP2 (Furry Tags)</option>
                <option value="joycaption">
                  JoyCaption (Detailed Captions)
                </option>
                <option value="florence2">Florence2 (General Purpose)</option>
                <option value="wdv3">WDv3 (Anime Tags)</option>
              </select>

              <Button
                onClick={props.handlers.batchGenerateCaptions}
                disabled={
                  props.appState.isGenerating() ||
                  props.appState.images().every((img) => img.caption)
                }
                variant="primary"
              >
                {props.appState.isGenerating()
                  ? "Generating..."
                  : "Batch Generate All"}
              </Button>
            </div>

            {props.appState.batchProgress() && (
              <div class="progress-card">
                <h3>Batch Processing Progress</h3>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style={{
                      width: `${props.appState.batchProgress()!.progress}%`,
                    }}
                  />
                </div>
                <p>
                  {props.appState.batchProgress()!.completed}/
                  {props.appState.batchProgress()!.total} images
                </p>
                {props.appState.batchProgress()?.current && (
                  <p>Current: {props.appState.batchProgress()?.current}</p>
                )}
              </div>
            )}

            <ImageGallery
              images={props.appState.images()}
              onFileUpload={props.handlers.handleFileUpload}
              onImageSelect={props.appState.setSelectedImage}
              onGenerateCaption={props.handlers.generateCaption}
              onDeleteImage={props.handlers.deleteImage}
              selectedImage={props.appState.selectedImage()}
              isGenerating={props.appState.isGenerating()}
            />
          </div>
        </TabPanel>

        <TabPanel tabId="models" activeTab={props.appState.activeTab()}>
          <ModelSelector
            selectedModel={props.appState.selectedModel()}
            onModelChange={props.appState.setSelectedModel}
            backendUrl={props.appState.backendUrl()}
            systemStats={props.appState.systemStats()}
          />
        </TabPanel>

        <TabPanel tabId="stats" activeTab={props.appState.activeTab()}>
          <div class="stats-section">
            <h3>System Statistics</h3>
            {props.appState.systemStats() ? (
              <div class="stats-grid">
                <div class="stat-card">
                  <h4>Total Processed</h4>
                  <p class="stat-value">
                    {props.appState.systemStats()!.totalProcessed || 0}
                  </p>
                </div>
                <div class="stat-card">
                  <h4>Loaded Models</h4>
                  <p class="stat-value">
                    {props.appState.systemStats()!.loadedModels}
                  </p>
                </div>
                <div class="stat-card">
                  <h4>System Health</h4>
                  <p
                    class={`stat-value ${props.appState.systemStats()!.isHealthy ? "healthy" : "unhealthy"}`}
                  >
                    {props.appState.systemStats()!.isHealthy
                      ? "✅ Healthy"
                      : "❌ Unhealthy"}
                  </p>
                </div>
                <div class="stat-card">
                  <h4>Active Tasks</h4>
                  <p class="stat-value">
                    {props.appState.systemStats()!.activeTasks || 0}
                  </p>
                </div>
              </div>
            ) : (
              <p>Loading system statistics...</p>
            )}
          </div>
        </TabPanel>

        <TabPanel tabId="workflow" activeTab={props.appState.activeTab()}>
          <Show when={props.appState.selectedImage()}>
            <CaptionEditor
              image={props.appState.selectedImage()!}
              onEdit={() => {
                props.workflow.startWorkflow(
                  props.appState.selectedImage()!,
                  false,
                );
                props.appState.setIsModalOpen(true);
              }}
              onGenerate={() =>
                props.handlers.generateCaption(props.appState.selectedImage()!)
              }
            />
          </Show>
        </TabPanel>
      </Tabs>

      {/* Caption Editing Modal */}
      <CaptionModal
        open={props.appState.isModalOpen()}
        workflow={props.workflow.workflow()}
        onClose={() => props.appState.setIsModalOpen(false)}
        onSave={props.handlers.saveCaption}
        onCaptionChange={(caption) =>
          props.workflow.updateWorkflow({ editedCaption: caption })
        }
        onTagEdit={(index, newTag) => {
          const newTags = [...props.workflow.workflow()!.tags];
          newTags[index] = newTag;
          props.workflow.updateWorkflow({ tags: newTags });
        }}
        onTagRemove={(index) => {
          const newTags = props.workflow
            .workflow()!
            .tags.filter((_, i) => i !== index);
          props.workflow.updateWorkflow({ tags: newTags });
        }}
      />
    </main>
  );
};
