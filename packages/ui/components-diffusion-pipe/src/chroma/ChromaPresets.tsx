/**
 * 🦊 Chroma Presets Component
 * 
 * Pre-configured Chroma training presets with optimization
 * following Reynard's preset component patterns.
 */

import { Show, createSignal, createEffect, Component } from 'solid-js';
import { Card } from 'reynard-components-core/primitives';
import { Button } from 'reynard-components-core/primitives';
import { Badge } from 'reynard-components-core/primitives';
import { fluentIconsPackage } from 'reynard-fluent-icons';
import type { TrainingConfig } from '../config/ConfigBuilder';

export interface ChromaPreset {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'quality' | 'balanced' | 'experimental';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  memoryRequirement: string;
  config: TrainingConfig;
  tags: string[];
  recommended: boolean;
  experimental?: boolean;
}

export interface ChromaPresetsProps {
  onPresetSelect?: (preset: ChromaPreset) => void;
  onPresetLoad?: (config: TrainingConfig) => void;
  compact?: boolean;
}

export const ChromaPresets: Component<ChromaPresetsProps> = (props) => {
  const [selectedCategory, setSelectedCategory] = createSignal<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = createSignal<string>('all');
  const [searchTerm, setSearchTerm] = createSignal('');
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Chroma presets
  const chromaPresets: ChromaPreset[] = [
    {
      id: 'e6ai-512-fast',
      name: 'E6AI 512 Fast',
      description: 'Quick E6AI training optimized for speed with 512 resolution',
      category: 'performance',
      difficulty: 'beginner',
      estimatedTime: '2-4 hours',
      memoryRequirement: '8GB VRAM',
      config: {
        output_dir: '/home/kade/runeset/diffusion-pipe/output/e6ai_512_fast',
        epochs: 500,
        micro_batch_size_per_gpu: 4,
        pipeline_stages: 1,
        gradient_accumulation_steps: 1,
        gradient_clipping: 1.0,
        warmup_steps: 50,
        model: {
          type: 'chroma',
          diffusers_path: '/home/kade/flux_schnell_diffusers',
          transformer_path: '/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors',
          dtype: 'bfloat16',
          transformer_dtype: 'float8',
          flux_shift: true
        },
        adapter: {
          type: 'lora',
          rank: 16,
          dtype: 'bfloat16'
        },
        optimizer: {
          type: 'adamw_optimi',
          lr: 1e-3,
          betas: [0.9, 0.99],
          weight_decay: 0.01,
          eps: 1e-8
        },
        monitoring: {
          enable_wandb: false
        },
        dataset: 'train/e6ai_dataset_512.toml'
      },
      tags: ['fast', 'e6ai', '512', 'beginner'],
      recommended: true
    },
    {
      id: 'e6ai-512-balanced',
      name: 'E6AI 512 Balanced',
      description: 'Balanced E6AI training with good quality and reasonable time',
      category: 'balanced',
      difficulty: 'intermediate',
      estimatedTime: '6-8 hours',
      memoryRequirement: '12GB VRAM',
      config: {
        output_dir: '/home/kade/runeset/diffusion-pipe/output/e6ai_512_balanced',
        epochs: 1000,
        micro_batch_size_per_gpu: 2,
        pipeline_stages: 1,
        gradient_accumulation_steps: 1,
        gradient_clipping: 1.0,
        warmup_steps: 100,
        model: {
          type: 'chroma',
          diffusers_path: '/home/kade/flux_schnell_diffusers',
          transformer_path: '/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors',
          dtype: 'bfloat16',
          transformer_dtype: 'float8',
          flux_shift: true
        },
        adapter: {
          type: 'lora',
          rank: 32,
          dtype: 'bfloat16'
        },
        optimizer: {
          type: 'adamw_optimi',
          lr: 2.5e-4,
          betas: [0.9, 0.99],
          weight_decay: 0.01,
          eps: 1e-8
        },
        monitoring: {
          enable_wandb: true,
          wandb_api_key: '',
          wandb_tracker_name: 'e6ai-lora',
          wandb_run_name: 'e6ai-512-balanced'
        },
        dataset: 'train/e6ai_dataset_512.toml'
      },
      tags: ['balanced', 'e6ai', '512', 'intermediate'],
      recommended: true
    },
    {
      id: 'e6ai-1024-quality',
      name: 'E6AI 1024 Quality',
      description: 'High-quality E6AI training with 1024 resolution for best results',
      category: 'quality',
      difficulty: 'advanced',
      estimatedTime: '12-16 hours',
      memoryRequirement: '16GB VRAM',
      config: {
        output_dir: '/home/kade/runeset/diffusion-pipe/output/e6ai_1024_quality',
        epochs: 1000,
        micro_batch_size_per_gpu: 1,
        pipeline_stages: 1,
        gradient_accumulation_steps: 1,
        gradient_clipping: 1.0,
        warmup_steps: 100,
        model: {
          type: 'chroma',
          diffusers_path: '/home/kade/flux_schnell_diffusers',
          transformer_path: '/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors',
          dtype: 'bfloat16',
          transformer_dtype: 'float8',
          flux_shift: true
        },
        adapter: {
          type: 'lora',
          rank: 64,
          dtype: 'bfloat16'
        },
        optimizer: {
          type: 'adamw_optimi',
          lr: 1e-4,
          betas: [0.9, 0.99],
          weight_decay: 0.01,
          eps: 1e-8
        },
        monitoring: {
          enable_wandb: true,
          wandb_api_key: '',
          wandb_tracker_name: 'e6ai-lora',
          wandb_run_name: 'e6ai-1024-quality'
        },
        dataset: 'train/e6ai_dataset_1024.toml'
      },
      tags: ['quality', 'e6ai', '1024', 'advanced'],
      recommended: true
    },
    {
      id: 'experimental-high-rank',
      name: 'Experimental High Rank',
      description: 'Experimental preset with very high LoRA rank for maximum quality',
      category: 'experimental',
      difficulty: 'advanced',
      estimatedTime: '20-24 hours',
      memoryRequirement: '24GB VRAM',
      config: {
        output_dir: '/home/kade/runeset/diffusion-pipe/output/experimental_high_rank',
        epochs: 1500,
        micro_batch_size_per_gpu: 1,
        pipeline_stages: 1,
        gradient_accumulation_steps: 2,
        gradient_clipping: 0.5,
        warmup_steps: 200,
        model: {
          type: 'chroma',
          diffusers_path: '/home/kade/flux_schnell_diffusers',
          transformer_path: '/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors',
          dtype: 'bfloat16',
          transformer_dtype: 'float8',
          flux_shift: true
        },
        adapter: {
          type: 'lora',
          rank: 128,
          dtype: 'bfloat16'
        },
        optimizer: {
          type: 'adamw_optimi',
          lr: 5e-5,
          betas: [0.9, 0.999],
          weight_decay: 0.005,
          eps: 1e-8
        },
        monitoring: {
          enable_wandb: true,
          wandb_api_key: '',
          wandb_tracker_name: 'chroma-experimental',
          wandb_run_name: 'high-rank-experiment'
        },
        dataset: 'train/e6ai_dataset_1024.toml'
      },
      tags: ['experimental', 'high-rank', '1024', 'advanced'],
      recommended: false,
      experimental: true
    },
    {
      id: 'custom-dataset-512',
      name: 'Custom Dataset 512',
      description: 'Template for training with custom datasets at 512 resolution',
      category: 'balanced',
      difficulty: 'intermediate',
      estimatedTime: '6-10 hours',
      memoryRequirement: '10GB VRAM',
      config: {
        output_dir: '/home/kade/runeset/diffusion-pipe/output/custom_dataset_512',
        epochs: 1000,
        micro_batch_size_per_gpu: 2,
        pipeline_stages: 1,
        gradient_accumulation_steps: 1,
        gradient_clipping: 1.0,
        warmup_steps: 100,
        model: {
          type: 'chroma',
          diffusers_path: '/home/kade/flux_schnell_diffusers',
          transformer_path: '/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors',
          dtype: 'bfloat16',
          transformer_dtype: 'float8',
          flux_shift: true
        },
        adapter: {
          type: 'lora',
          rank: 32,
          dtype: 'bfloat16'
        },
        optimizer: {
          type: 'adamw_optimi',
          lr: 2.5e-4,
          betas: [0.9, 0.99],
          weight_decay: 0.01,
          eps: 1e-8
        },
        monitoring: {
          enable_wandb: true,
          wandb_api_key: '',
          wandb_tracker_name: 'custom-dataset',
          wandb_run_name: 'custom-512'
        },
        dataset: 'train/custom_dataset_512.toml'
      },
      tags: ['custom', 'template', '512', 'intermediate'],
      recommended: false
    }
  ];

  // Filter presets
  const filteredPresets = () => {
    let filtered = chromaPresets;

    // Filter by category
    if (selectedCategory() !== 'all') {
      filtered = filtered.filter(preset => preset.category === selectedCategory());
    }

    // Filter by difficulty
    if (selectedDifficulty() !== 'all') {
      filtered = filtered.filter(preset => preset.difficulty === selectedDifficulty());
    }

    // Filter by search term
    if (searchTerm()) {
      const term = searchTerm().toLowerCase();
      filtered = filtered.filter(preset => 
        preset.name.toLowerCase().includes(term) ||
        preset.description.toLowerCase().includes(term) ||
        preset.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  // Select preset
  const selectPreset = (preset: ChromaPreset) => {
    props.onPresetSelect?.(preset);
    props.onPresetLoad?.(preset.config);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return fluentIconsPackage.getIcon('speed');
      case 'quality':
        return fluentIconsPackage.getIcon('star');
      case 'balanced':
        return fluentIconsPackage.getIcon('balance');
      case 'experimental':
        return fluentIconsPackage.getIcon('flask');
      default:
        return fluentIconsPackage.getIcon('cube');
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'secondary';
      case 'quality':
        return 'default';
      case 'balanced':
        return 'outline';
      case 'experimental':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'secondary';
      case 'intermediate':
        return 'outline';
      case 'advanced':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card class={`chroma-presets ${props.compact ? 'compact' : ''}`}>
      <div class="presets-header">
        <div class="presets-title">
          <h3>Chroma Training Presets</h3>
          <Badge variant="secondary">
            {filteredPresets().length} Presets
          </Badge>
        </div>
        
        <div class="presets-actions">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded())}
          >
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? 'chevron-up' : 'chevron-down')?.outerHTML || ''}
            />
          </Button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="presets-content">
          {/* Filters */}
          <div class="presets-filters">
            <div class="filter-group">
              <input
                type="text"
                placeholder="Search presets..."
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
                class="search-input"
              />
            </div>
            <div class="filter-group">
              <select
                value={selectedCategory()}
                onChange={(e) => setSelectedCategory(e.currentTarget.value)}
              >
                <option value="all">All Categories</option>
                <option value="performance">Performance</option>
                <option value="quality">Quality</option>
                <option value="balanced">Balanced</option>
                <option value="experimental">Experimental</option>
              </select>
            </div>
            <div class="filter-group">
              <select
                value={selectedDifficulty()}
                onChange={(e) => setSelectedDifficulty(e.currentTarget.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Presets Grid */}
          <div class="presets-grid">
            {filteredPresets().map(preset => (
              <div 
                class={`preset-card ${preset.recommended ? 'recommended' : ''} ${preset.experimental ? 'experimental' : ''}`}
                onClick={() => selectPreset(preset)}
              >
                <div class="preset-header">
                  <div class="preset-title">
                    <h4>{preset.name}</h4>
                    <div class="preset-badges">
                      {preset.recommended && <Badge variant="secondary">Recommended</Badge>}
                      {preset.experimental && <Badge variant="destructive">Experimental</Badge>}
                    </div>
                  </div>
                  <div class="preset-category">
                    <Badge variant={getCategoryColor(preset.category)}>
                      <span class="category-icon">
                        <div
                          // eslint-disable-next-line solid/no-innerhtml
                          innerHTML={getCategoryIcon(preset.category)?.outerHTML || ''}
                        />
                      </span>
                      {preset.category}
                    </Badge>
                  </div>
                </div>
                
                <div class="preset-description">
                  <p>{preset.description}</p>
                </div>
                
                <div class="preset-details">
                  <div class="detail-item">
                    <span class="detail-label">Difficulty:</span>
                    <Badge variant={getDifficultyColor(preset.difficulty)}>
                      {preset.difficulty}
                    </Badge>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{preset.estimatedTime}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Memory:</span>
                    <span class="detail-value">{preset.memoryRequirement}</span>
                  </div>
                </div>
                
                <div class="preset-config">
                  <div class="config-item">
                    <span class="config-label">Epochs:</span>
                    <span class="config-value">{preset.config.epochs}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Batch Size:</span>
                    <span class="config-value">{preset.config.micro_batch_size_per_gpu}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">LoRA Rank:</span>
                    <span class="config-value">{preset.config.adapter.rank}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Learning Rate:</span>
                    <span class="config-value">{preset.config.optimizer.lr}</span>
                  </div>
                </div>
                
                <div class="preset-tags">
                  {preset.tags.map(tag => (
                    <Badge variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div class="preset-actions">
                  <Button variant="primary" size="sm">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon('play')?.outerHTML || ''}
                    />
                    Use Preset
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <Show when={filteredPresets().length === 0}>
            <div class="presets-empty">
              <div class="empty-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon('search')?.outerHTML || ''}
                />
              </div>
              <h4>No presets found</h4>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </Show>
        </div>
      </Show>
    </Card>
  );
};

export default ChromaPresets;
