/**
 * AI Main Content Component
 * 
 * Main content area with tabs for AI Gallery features.
 */

import { Component, Show, createSignal } from "solid-js";
import { Button, Tabs, TabPanel } from "reynard-components";
import { AIGalleryTab } from "./AIGalleryTab";
import { AIViewerTab } from "./AIViewerTab";
import { ModelMonitorTab } from "./ModelMonitorTab";
import { AIBatchDialog } from "./AIBatchDialog";
import type { FileItem, FolderItem, GalleryCaptionResult } from "reynard-gallery-ai";
import type { UseAppStateReturn } from "../composables/useAppState";
import type { UseWorkflowReturn } from "../composables/useWorkflow";
import type { UseAppHandlersReturn } from "../composables/useAppHandlers";

interface AIMainContentProps {
  appState: UseAppStateReturn;
  workflow: UseWorkflowReturn;
  handlers: UseAppHandlersReturn;
}

// Convert FileItem back to ImageItem
const convertToImageItem = (fileItem: FileItem) => ({
  id: fileItem.id,
  name: fileItem.name,
  url: fileItem.path,
  file: new File([], fileItem.name), // Create a dummy file
  caption: fileItem.metadata?.caption,
  tags: fileItem.metadata?.tags || [],
  model: fileItem.metadata?.model || "unknown",
  generatedAt: fileItem.metadata?.generatedAt
});

export const AIMainContent: Component<AIMainContentProps> = (props) => {
  const [showBatchDialog, setShowBatchDialog] = createSignal(false);
  const [selectedItems, setSelectedItems] = createSignal<FileItem[]>([]);

  // Handle item click
  const handleItemClick = (item: FileItem | FolderItem) => {
    if (item.type === "folder") return; // Skip folders
    const imageItem = convertToImageItem(item as FileItem);
    props.appState.setSelectedImage(imageItem);
  };

  // Handle item double click
  const handleItemDoubleClick = (item: FileItem | FolderItem) => {
    if (item.type === "folder") return; // Skip folders
    const imageItem = convertToImageItem(item as FileItem);
    props.appState.setSelectedImage(imageItem);
    // Open caption editor
    props.workflow.startWorkflow(imageItem, false);
    props.appState.setIsModalOpen(true);
  };

  // Handle selection change
  const handleSelectionChange = (item: FileItem | FolderItem, mode: "single" | "add" | "range") => {
    if (item.type === "folder") return; // Skip folders
    const fileItem = item as FileItem;
    if (mode === "single") {
      setSelectedItems([fileItem]);
    } else if (mode === "add") {
      setSelectedItems(prev => {
        const exists = prev.some(selected => selected.id === fileItem.id);
        if (exists) {
          return prev.filter(selected => selected.id !== fileItem.id);
        } else {
          return [...prev, fileItem];
        }
      });
    }
  };

  // Handle context menu
  const handleContextMenu = (_item: FileItem | FolderItem, _x: number, _y: number) => {
    console.log("Context menu requested");
  };

  // Handle batch processing
  const handleBatchProcess = () => {
    if (selectedItems().length > 0) {
      setShowBatchDialog(true);
    }
  };

  return (
    <main class="app-main">
      <Tabs
        activeTab={props.appState.activeTab()}
        onTabChange={props.appState.setActiveTab}
        items={[
          { id: "gallery", label: "🤖 AI Gallery" },
          { id: "viewer", label: "🖼️ AI Viewer" },
          { id: "models", label: "🤖 Model Monitor" },
          { id: "stats", label: "📊 System Stats" },
          { id: "workflow", label: "✏️ Caption Editor" },
        ]}
      >
        <TabPanel tabId="gallery" activeTab={props.appState.activeTab()}>
          <AIGalleryTab
            appState={props.appState}
            workflow={props.workflow}
            onBatchProcess={handleBatchProcess}
            selectedItems={selectedItems()}
            onSelectionChange={handleSelectionChange}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onContextMenu={handleContextMenu}
          />
        </TabPanel>

        <TabPanel tabId="viewer" activeTab={props.appState.activeTab()}>
          <AIViewerTab appState={props.appState} />
        </TabPanel>

        <TabPanel tabId="models" activeTab={props.appState.activeTab()}>
          <ModelMonitorTab appState={props.appState} />
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
            <div class="workflow-section">
              <h3>Caption Editor</h3>
              <p>Selected: {props.appState.selectedImage()!.name}</p>
              <div class="workflow-actions">
                <Button
                  onClick={() => {
                    props.workflow.startWorkflow(
                      props.appState.selectedImage()!,
                      false,
                    );
                    props.appState.setIsModalOpen(true);
                  }}
                  variant="primary"
                >
                  ✏️ Edit Caption
                </Button>
                <Button
                  onClick={() => props.handlers.generateCaption(props.appState.selectedImage()!)}
                  disabled={props.appState.isGenerating()}
                  variant="secondary"
                >
                  🤖 Generate New Caption
                </Button>
              </div>
            </div>
          </Show>
          <Show when={!props.appState.selectedImage()}>
            <div class="no-selection">
              <h3>No Image Selected</h3>
              <p>Select an image from the AI Gallery to edit its caption.</p>
            </div>
          </Show>
        </TabPanel>
      </Tabs>

      {/* Batch Processing Dialog */}
      <AIBatchDialog
        visible={showBatchDialog()}
        items={selectedItems()}
        onClose={() => setShowBatchDialog(false)}
        onComplete={(_results: GalleryCaptionResult[]) => {
          setShowBatchDialog(false);
          setSelectedItems([]);
        }}
        onError={(_error: Error) => {
          // Error handling is done in the dialog component
        }}
      />
    </main>
  );
};
