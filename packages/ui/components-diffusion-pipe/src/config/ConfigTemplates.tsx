/**
 * 🦊 Config Templates Component
 *
 * Save/load configuration templates
 * following Reynard's template management patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { TextField } from "reynard-components-core/primitives";
import { Badge } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import type { TrainingConfig } from "./ConfigBuilder";

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  category: "chroma" | "sdxl" | "flux" | "custom";
  config: TrainingConfig;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface ConfigTemplatesProps {
  onTemplateLoad: (config: TrainingConfig) => void;
  onTemplateSave: (config: TrainingConfig) => void;
  currentConfig: TrainingConfig;
  compact?: boolean;
}

export const ConfigTemplates: Component<ConfigTemplatesProps> = props => {
  const [templates, setTemplates] = createSignal<ConfigTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = createSignal<string>("all");
  const [searchTerm, setSearchTerm] = createSignal("");
  const [isSaving, setIsSaving] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [showSaveDialog, setShowSaveDialog] = createSignal(false);
  const [newTemplateName, setNewTemplateName] = createSignal("");
  const [newTemplateDescription, setNewTemplateDescription] = createSignal("");
  const [newTemplateCategory, setNewTemplateCategory] = createSignal<string>("custom");
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Load templates from storage/API
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // This would typically load from API or local storage
      // const client = createDiffusionPipeClient();
      // const templates = await client.getConfigTemplates();

      // Mock templates for now
      const mockTemplates: ConfigTemplate[] = [
        {
          id: "1",
          name: "Chroma E6AI 512",
          description: "Optimized Chroma configuration for E6AI dataset at 512 resolution",
          category: "chroma",
          config: {
            output_dir: "/home/kade/runeset/diffusion-pipe/output/e6ai_512",
            epochs: 1000,
            micro_batch_size_per_gpu: 4,
            pipeline_stages: 1,
            gradient_accumulation_steps: 1,
            gradient_clipping: 1.0,
            warmup_steps: 100,
            model: {
              type: "chroma",
              diffusers_path: "/home/kade/flux_schnell_diffusers",
              transformer_path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors",
              dtype: "bfloat16",
              transformer_dtype: "float8",
              flux_shift: true,
            },
            adapter: {
              type: "lora",
              rank: 32,
              dtype: "bfloat16",
            },
            optimizer: {
              type: "adamw_optimi",
              lr: 2.5e-4,
              betas: [0.9, 0.99],
              weight_decay: 0.01,
              eps: 1e-8,
            },
            monitoring: {
              enable_wandb: true,
              wandb_api_key: "",
              wandb_tracker_name: "e6ai-lora",
              wandb_run_name: "e6ai-512-2",
            },
            dataset: "train/e6ai_dataset_512.toml",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ["chroma", "e6ai", "512", "lora"],
        },
        {
          id: "2",
          name: "Chroma E6AI 1024",
          description: "Optimized Chroma configuration for E6AI dataset at 1024 resolution",
          category: "chroma",
          config: {
            output_dir: "/home/kade/runeset/diffusion-pipe/output/e6ai_1024",
            epochs: 1000,
            micro_batch_size_per_gpu: 1,
            pipeline_stages: 1,
            gradient_accumulation_steps: 1,
            gradient_clipping: 1.0,
            warmup_steps: 100,
            model: {
              type: "chroma",
              diffusers_path: "/home/kade/flux_schnell_diffusers",
              transformer_path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors",
              dtype: "bfloat16",
              transformer_dtype: "float8",
              flux_shift: true,
            },
            adapter: {
              type: "lora",
              rank: 32,
              dtype: "bfloat16",
            },
            optimizer: {
              type: "adamw_optimi",
              lr: 2.5e-4,
              betas: [0.9, 0.99],
              weight_decay: 0.01,
              eps: 1e-8,
            },
            monitoring: {
              enable_wandb: true,
              wandb_api_key: "",
              wandb_tracker_name: "e6ai-lora",
              wandb_run_name: "e6ai-1024-7-quad-lr",
            },
            dataset: "train/e6ai_dataset_1024.toml",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ["chroma", "e6ai", "1024", "lora"],
        },
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save current config as template
  const saveTemplate = async () => {
    if (!newTemplateName()) return;

    setIsSaving(true);
    try {
      const newTemplate: ConfigTemplate = {
        id: Date.now().toString(),
        name: newTemplateName(),
        description: newTemplateDescription(),
        category: newTemplateCategory() as any,
        config: props.currentConfig,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [],
      };

      // This would typically save to API or local storage
      // const client = createDiffusionPipeClient();
      // await client.saveConfigTemplate(newTemplate);

      setTemplates(prev => [...prev, newTemplate]);
      setShowSaveDialog(false);
      setNewTemplateName("");
      setNewTemplateDescription("");
      setNewTemplateCategory("custom");
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Load template
  const loadTemplate = (template: ConfigTemplate) => {
    props.onTemplateLoad(template.config);
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    try {
      // This would typically delete from API or local storage
      // const client = createDiffusionPipeClient();
      // await client.deleteConfigTemplate(templateId);

      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  // Filter templates
  const filteredTemplates = () => {
    let filtered = templates();

    // Filter by category
    if (selectedCategory() !== "all") {
      filtered = filtered.filter(template => template.category === selectedCategory());
    }

    // Filter by search term
    if (searchTerm()) {
      const term = searchTerm().toLowerCase();
      filtered = filtered.filter(
        template =>
          template.name.toLowerCase().includes(term) ||
          template.description.toLowerCase().includes(term) ||
          template.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "chroma":
        return fluentIconsPackage.getIcon("image");
      case "sdxl":
        return fluentIconsPackage.getIcon("picture");
      case "flux":
        return fluentIconsPackage.getIcon("sparkle");
      case "custom":
        return fluentIconsPackage.getIcon("document");
      default:
        return fluentIconsPackage.getIcon("cube");
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "chroma":
        return "secondary";
      case "sdxl":
        return "outline";
      case "flux":
        return "default";
      case "custom":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Load templates on mount
  createEffect(() => {
    loadTemplates();
  });

  return (
    <Card class={`config-templates ${props.compact ? "compact" : ""}`}>
      <div class="templates-header">
        <div class="templates-title">
          <h3>Configuration Templates</h3>
          <Badge variant="secondary">{templates().length} Templates</Badge>
        </div>

        <div class="templates-actions">
          <Button variant="primary" size="sm" onClick={() => setShowSaveDialog(true)}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("save")?.outerHTML || ""}
            />
            Save Template
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="templates-content">
          {/* Filters */}
          <div class="templates-filters">
            <div class="filter-group">
              <TextField
                placeholder="Search templates..."
                value={searchTerm()}
                onInput={e => setSearchTerm(e.currentTarget.value)}
                size="sm"
              />
            </div>
            <div class="filter-group">
              <select value={selectedCategory()} onChange={e => setSelectedCategory(e.currentTarget.value)}>
                <option value="all">All Categories</option>
                <option value="chroma">Chroma</option>
                <option value="sdxl">SDXL</option>
                <option value="flux">Flux</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Templates List */}
          <div class="templates-list">
            <Show
              when={isLoading()}
              fallback={
                <Show
                  when={filteredTemplates().length > 0}
                  fallback={
                    <div class="templates-empty">
                      <div class="empty-icon">
                        <div
                          // eslint-disable-next-line solid/no-innerhtml
                          innerHTML={fluentIconsPackage.getIcon("document-text")?.outerHTML || ""}
                        />
                      </div>
                      <p>No templates found</p>
                      <Show when={searchTerm() || selectedCategory() !== "all"}>
                        <p>Try adjusting your filters</p>
                      </Show>
                    </div>
                  }
                >
                  {filteredTemplates().map(template => (
                    <div class="template-card">
                      <div class="template-header">
                        <div class="template-info">
                          <div class="template-icon">
                            <div
                              // eslint-disable-next-line solid/no-innerhtml
                              innerHTML={getCategoryIcon(template.category)?.outerHTML || ""}
                            />
                          </div>
                          <div class="template-details">
                            <h4>{template.name}</h4>
                            <p>{template.description}</p>
                            <div class="template-tags">
                              {template.tags.map(tag => (
                                <Badge variant="outline" size="sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div class="template-actions">
                          <Badge variant={getCategoryColor(template.category)}>{template.category}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => loadTemplate(template)}>
                            Load
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                            <div
                              // eslint-disable-next-line solid/no-innerhtml
                              innerHTML={fluentIconsPackage.getIcon("delete")?.outerHTML || ""}
                            />
                          </Button>
                        </div>
                      </div>
                      <div class="template-meta">
                        <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </Show>
              }
            >
              <div class="templates-loading">
                <div class="loading-spinner" />
                <p>Loading templates...</p>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Save Dialog */}
      <Show when={showSaveDialog()}>
        <div class="save-dialog-overlay">
          <div class="save-dialog">
            <div class="save-dialog-header">
              <h3>Save Configuration Template</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("dismiss")?.outerHTML || ""}
                />
              </Button>
            </div>
            <div class="save-dialog-content">
              <div class="form-group">
                <TextField
                  label="Template Name"
                  value={newTemplateName()}
                  onInput={e => setNewTemplateName(e.currentTarget.value)}
                  placeholder="Enter template name"
                  fullWidth
                />
              </div>
              <div class="form-group">
                <TextField
                  label="Description"
                  value={newTemplateDescription()}
                  onInput={e => setNewTemplateDescription(e.currentTarget.value)}
                  placeholder="Enter template description"
                  fullWidth
                />
              </div>
              <div class="form-group">
                <label>Category</label>
                <select value={newTemplateCategory()} onChange={e => setNewTemplateCategory(e.currentTarget.value)}>
                  <option value="custom">Custom</option>
                  <option value="chroma">Chroma</option>
                  <option value="sdxl">SDXL</option>
                  <option value="flux">Flux</option>
                </select>
              </div>
            </div>
            <div class="save-dialog-actions">
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveTemplate} disabled={!newTemplateName() || isSaving()}>
                <Show when={isSaving()} fallback="Save Template">
                  <span class="spinner" />
                  Saving...
                </Show>
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </Card>
  );
};

export default ConfigTemplates;
