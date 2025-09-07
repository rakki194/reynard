/**
 * Image Caption App - Reynard Framework Example
 * Demonstrates AI-powered caption generation with comprehensive Reynard features
 */

import {
  Component,
  createSignal,
  For,
  createResource,
  Show,
} from "solid-js";
import {
  ReynardProvider,
  useTheme,
} from "reynard-themes";
import {
  NotificationsProvider,
  useNotifications,
  createNotificationsModule,
} from "reynard-core";
import { Button, Modal, Tabs, TabPanel } from "reynard-components";
import { AnnotationManager, CaptionType, type CaptionTask, type CaptionResult } from "reynard-annotating";
import { TagBubble, CaptionInput } from "reynard-caption";
import { ImageGallery } from "./components/ImageGallery";
import { CaptionEditor } from "./components/CaptionEditor";
import { ModelSelector } from "./components/ModelSelector";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageSelector } from "./components/LanguageSelector";
import "reynard-themes/reynard-themes.css";
import "./styles.css";

interface ImageItem {
  id: string;
  name: string;
  url: string;
  file: File;
  caption?: string;
  tags?: string[];
  generatedAt?: Date;
  model?: string;
}

interface CaptionWorkflow {
  image: ImageItem;
  generatedCaption: string;
  editedCaption: string;
  tags: string[];
  isGenerating: boolean;
  isEditing: boolean;
}


const App: Component = () => {
  const [images, setImages] = createSignal<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = createSignal<ImageItem | null>(null);
  const [activeTab, setActiveTab] = createSignal("gallery");
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [annotationManager] = createSignal(new AnnotationManager());
  const [selectedModel, setSelectedModel] = createSignal("florence2");
  const [workflow, setWorkflow] = createSignal<CaptionWorkflow | null>(null);

  const themeContext = useTheme();
  const { notify } = useNotifications();

  // Initialize annotation manager
  const initializeAnnotationManager = async () => {
    try {
      await annotationManager().start();
      notify("AI models initialized successfully!", "success");
    } catch (error) {
      notify("Failed to initialize AI models", "error");
      console.error("Annotation manager initialization failed:", error);
    }
  };

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    const newImages: ImageItem[] = files.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    
    setImages(prev => [...prev, ...newImages]);
    notify(`Added ${files.length} image(s) to gallery`, "success");
  };

  // Generate caption for selected image
  const generateCaption = async (image: ImageItem) => {
    if (!annotationManager()) {
      notify("AI models not initialized", "error");
      return;
    }

    setWorkflow({
      image,
      generatedCaption: "",
      editedCaption: "",
      tags: [],
      isGenerating: true,
      isEditing: false,
    });

    try {
      const task: CaptionTask = {
        imagePath: image.url,
        generatorName: selectedModel(),
        config: { threshold: 0.8 },
        postProcess: true,
      };

      const service = annotationManager().getService();
      const result: CaptionResult = await service.generateCaption(task);
      
      const generatedCaption = result.caption || "No caption generated";
      const extractedTags = generatedCaption.split(/[,\s]+/).filter(tag => tag.length > 2);

      setWorkflow(prev => prev ? {
        ...prev,
        generatedCaption,
        editedCaption: generatedCaption,
        tags: extractedTags,
        isGenerating: false,
      } : null);

      // Update the image with generated caption
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              caption: generatedCaption, 
              tags: extractedTags,
              generatedAt: new Date(),
              model: selectedModel()
            }
          : img
      ));

      notify("Caption generated successfully!", "success");
    } catch (error) {
      setWorkflow(prev => prev ? { ...prev, isGenerating: false } : null);
      notify("Failed to generate caption", "error");
      console.error("Caption generation failed:", error);
    }
  };

  // Save edited caption
  const saveCaption = () => {
    const currentWorkflow = workflow();
    if (!currentWorkflow) return;

    setImages(prev => prev.map(img => 
      img.id === currentWorkflow.image.id 
        ? { 
            ...img, 
            caption: currentWorkflow.editedCaption,
            tags: currentWorkflow.tags
          }
        : img
    ));

    notify("Caption saved successfully!", "success");
    setIsModalOpen(false);
    setWorkflow(null);
  };

  // Delete image
  const deleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage()?.id === imageId) {
      setSelectedImage(null);
    }
    notify("Image deleted", "info");
  };

  // Initialize on mount
  createResource(() => initializeAnnotationManager());

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <h1>🦊 Image Caption App</h1>
          <p>AI-powered caption generation with Reynard framework</p>
          <div class="header-controls">
            <div class="theme-info">Current theme: {themeContext.theme}</div>
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main class="app-main">
        <Tabs
          activeTab={activeTab()}
          onTabChange={setActiveTab}
          items={[
            { id: "gallery", label: "📁 Gallery" },
            { id: "models", label: "🤖 AI Models" },
            { id: "workflow", label: "✏️ Caption Editor" },
          ]}
        >
          <TabPanel tabId="gallery" activeTab={activeTab()}>
            <ImageGallery
              images={images()}
              onFileUpload={handleFileUpload}
              onImageSelect={setSelectedImage}
              onGenerateCaption={generateCaption}
              onDeleteImage={deleteImage}
              selectedImage={selectedImage()}
            />
          </TabPanel>
          
          <TabPanel tabId="models" activeTab={activeTab()}>
            <ModelSelector
              selectedModel={selectedModel()}
              onModelChange={setSelectedModel}
              annotationManager={annotationManager()}
            />
          </TabPanel>
          
          <TabPanel tabId="workflow" activeTab={activeTab()}>
            <Show when={selectedImage()}>
              <CaptionEditor
                image={selectedImage()!}
                onEdit={() => {
                  setWorkflow({
                    image: selectedImage()!,
                    generatedCaption: selectedImage()!.caption || "",
                    editedCaption: selectedImage()!.caption || "",
                    tags: selectedImage()!.tags || [],
                    isGenerating: false,
                    isEditing: true,
                  });
                  setIsModalOpen(true);
                }}
                onGenerate={() => generateCaption(selectedImage()!)}
              />
            </Show>
          </TabPanel>
        </Tabs>
      </main>

      {/* Caption Editing Modal */}
      <Modal
        open={isModalOpen()}
        onClose={() => setIsModalOpen(false)}
        title="Edit Caption"
        size="lg"
      >
        <Show when={workflow()}>
          <div class="caption-editor-modal">
            <div class="image-preview">
              <img src={workflow()!.image.url} alt={workflow()!.image.name} />
              <h3>{workflow()!.image.name}</h3>
            </div>
            
            <div class="caption-editor">
              <CaptionInput
                caption={{
                  type: CaptionType.CAPTION,
                  content: workflow()!.editedCaption
                }}
                state="expanded"
                onClick={() => {}}
                onCaptionChange={(caption) => 
                  setWorkflow(prev => prev ? { ...prev, editedCaption: caption.content } : null)
                }
                onSave={saveCaption}
                placeholder="Enter your caption..."
              />
              
              <div class="tag-editor">
                <h4>Tags</h4>
                <div class="tag-bubbles">
                  <For each={workflow()!.tags}>
                    {(tag, index) => (
                      <TagBubble
                        tag={tag}
                        index={index()}
                        onEdit={(newTag) => {
                          const newTags = [...workflow()!.tags];
                          newTags[index()] = newTag;
                          setWorkflow(prev => prev ? { ...prev, tags: newTags } : null);
                        }}
                        onRemove={() => {
                          const newTags = workflow()!.tags.filter((_, i) => i !== index());
                          setWorkflow(prev => prev ? { ...prev, tags: newTags } : null);
                        }}
                        editable={true}
                        removable={true}
                      />
                    )}
                  </For>
                </div>
              </div>
              
              <div class="modal-actions">
                <Button onClick={() => setIsModalOpen(false)} variant="secondary">
                  Cancel
                </Button>
                <Button onClick={saveCaption} variant="primary">
                  Save Caption
                </Button>
              </div>
            </div>
          </div>
        </Show>
      </Modal>
    </div>
  );
};

const AppWithProviders: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <App />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default AppWithProviders;