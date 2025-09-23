/**
 * Configuration Panel Component
 *
 * Provides a comprehensive configuration interface for gallery-dl settings.
 * Includes extractor settings, download options, and postprocessor configuration.
 */
import { Component, createSignal, createEffect, Show, For } from "solid-js";
import { Card, Button, TextField, Icon } from "reynard-components-core";

export interface ConfigurationPanelProps {
  onConfigChange?: (config: GalleryConfig) => void;
  initialConfig?: Partial<GalleryConfig>;
  class?: string;
}

export interface GalleryConfig {
  // Download settings
  outputDirectory: string;
  filename: string;
  maxConcurrent: number;
  retries: number;
  timeout: number;
  
  // File filtering
  minFileSize: number;
  maxFileSize: number;
  allowedExtensions: string[];
  blockedExtensions: string[];
  
  // Post-processing
  postprocessors: string[];
  skipExisting: boolean;
  skipDuplicates: boolean;
  
  // Extractor-specific settings
  extractorOptions: Record<string, any>;
  
  // Advanced settings
  userAgent: string;
  cookies: string;
  headers: Record<string, string>;
  proxy: string;
}

const defaultConfig: GalleryConfig = {
  outputDirectory: "./downloads",
  filename: "{title}_{id}",
  maxConcurrent: 5,
  retries: 3,
  timeout: 30,
  minFileSize: 0,
  maxFileSize: 0,
  allowedExtensions: [],
  blockedExtensions: [],
  postprocessors: [],
  skipExisting: true,
  skipDuplicates: true,
  extractorOptions: {},
  userAgent: "",
  cookies: "",
  headers: {},
  proxy: "",
};

export const ConfigurationPanel: Component<ConfigurationPanelProps> = (props) => {
  const [config, setConfig] = createSignal<GalleryConfig>({
    ...defaultConfig,
    ...props.initialConfig
  });
  const [activeTab, setActiveTab] = createSignal<'basic' | 'advanced' | 'extractors'>('basic');
  const [isDirty, setIsDirty] = createSignal(false);
  const [saveStatus, setSaveStatus] = createSignal<'idle' | 'saving' | 'saved' | 'error'>('idle');

  createEffect(() => {
    setIsDirty(true);
    props.onConfigChange?.(config());
  });

  const updateConfig = (updates: Partial<GalleryConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const saveConfig = async () => {
    setSaveStatus('saving');
    try {
      // Save configuration locally for now
      localStorage.setItem('gallery-config', JSON.stringify(config()));
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  const renderBasicSettings = () => (
    <div class="config-section">
      <h3>Basic Settings</h3>
      
      <div class="config-group">
        <label>Output Directory</label>
        <TextField
          value={config().outputDirectory}
          onInput={(e) => updateConfig({ outputDirectory: e.currentTarget.value })}
          placeholder="./downloads"
        />
      </div>
      
      <div class="config-group">
        <label>Filename Format</label>
        <TextField
          value={config().filename}
          onInput={(e) => updateConfig({ filename: e.currentTarget.value })}
          placeholder="{title}_{id}"
        />
        <small>Available variables: {"{title}"}, {"{id}"}, {"{date}"}, {"{ext}"}</small>
      </div>
      
      <div class="config-row">
        <div class="config-group">
          <label>Max Concurrent Downloads</label>
          <TextField
            type="number"
            value={config().maxConcurrent}
            onInput={(e) => updateConfig({ maxConcurrent: parseInt(e.currentTarget.value) || 5 })}
            min="1"
            max="20"
          />
        </div>
        
        <div class="config-group">
          <label>Retries</label>
          <TextField
            type="number"
            value={config().retries}
            onInput={(e) => updateConfig({ retries: parseInt(e.currentTarget.value) || 3 })}
            min="0"
            max="10"
          />
        </div>
      </div>
      
      <div class="config-group">
        <label>Timeout (seconds)</label>
        <TextField
          type="number"
          value={config().timeout}
          onInput={(e) => updateConfig({ timeout: parseInt(e.currentTarget.value) || 30 })}
          min="5"
          max="300"
        />
      </div>
      
      <div class="config-row">
        <div class="config-group">
          <label>Min File Size (bytes)</label>
          <TextField
            type="number"
            value={config().minFileSize}
            onInput={(e) => updateConfig({ minFileSize: parseInt(e.currentTarget.value) || 0 })}
            min="0"
          />
        </div>
        
        <div class="config-group">
          <label>Max File Size (bytes)</label>
          <TextField
            type="number"
            value={config().maxFileSize}
            onInput={(e) => updateConfig({ maxFileSize: parseInt(e.currentTarget.value) || 0 })}
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div class="config-section">
      <h3>Advanced Settings</h3>
      
      <div class="config-group">
        <label>User Agent</label>
        <TextField
          value={config().userAgent}
          onInput={(e) => updateConfig({ userAgent: e.currentTarget.value })}
          placeholder="Mozilla/5.0..."
        />
      </div>
      
      <div class="config-group">
        <label>Cookies</label>
        <TextField
          value={config().cookies}
          onInput={(e) => updateConfig({ cookies: e.currentTarget.value })}
          placeholder="name=value; name2=value2"
        />
      </div>
      
      <div class="config-group">
        <label>Proxy</label>
        <TextField
          value={config().proxy}
          onInput={(e) => updateConfig({ proxy: e.currentTarget.value })}
          placeholder="http://proxy:port"
        />
      </div>
      
      <div class="config-group">
        <label>Custom Headers</label>
        <textarea
          value={Object.entries(config().headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
          onInput={(e) => {
            const headers: Record<string, string> = {};
            e.currentTarget.value.split('\n').forEach(line => {
              const [key, value] = line.split(': ');
              if (key && value) headers[key] = value;
            });
            updateConfig({ headers });
          }}
          placeholder="Header-Name: Header-Value"
          rows={3}
        />
      </div>
      
      <div class="config-group">
        <label>Post-processors</label>
        <select
          multiple
          value={config().postprocessors}
          onChange={(e) => {
            const selected = Array.from(e.currentTarget.selectedOptions, option => option.value);
            updateConfig({ postprocessors: selected });
          }}
        >
          <option value="metadata">Extract Metadata</option>
          <option value="resize">Resize Images</option>
          <option value="compress">Compress Files</option>
          <option value="watermark">Add Watermark</option>
        </select>
      </div>
      
      <div class="config-row">
        <div class="config-group">
          <label>
            <input
              type="checkbox"
              checked={config().skipExisting}
              onChange={(e) => updateConfig({ skipExisting: e.currentTarget.checked })}
            />
            Skip Existing Files
          </label>
        </div>
        
        <div class="config-group">
          <label>
            <input
              type="checkbox"
              checked={config().skipDuplicates}
              onChange={(e) => updateConfig({ skipDuplicates: e.currentTarget.checked })}
            />
            Skip Duplicates
          </label>
        </div>
      </div>
    </div>
  );

  const renderExtractorSettings = () => (
    <div class="config-section">
      <h3>Extractor Settings</h3>
      <p>Configure extractor-specific options for different sites.</p>
      
      <div class="extractor-list">
        <For each={Object.entries(config().extractorOptions)}>
          {([extractor, options]) => (
            <div class="extractor-config">
              <h4>{extractor}</h4>
              <div class="extractor-options">
                <For each={Object.entries(options)}>
                  {([key, value]) => (
                    <div class="config-group">
                      <label>{key}</label>
                      <TextField
                        value={String(value)}
                        onInput={(e) => updateConfig({
                          extractorOptions: {
                            ...config().extractorOptions,
                            [extractor]: {
                              ...config().extractorOptions[extractor],
                              [key]: e.currentTarget.value
                            }
                          }
                        })}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );

  return (
    <div class={`configuration-panel ${props.class || ""}`}>
      <Card class="config-card">
        <div class="config-header">
          <div class="header-title">
            <Icon name="Settings" class="header-icon" />
            <h2>Gallery Configuration</h2>
          </div>
          
          <div class="header-actions">
            <Button
              onClick={saveConfig}
              disabled={!isDirty() || saveStatus() === 'saving'}
              variant="primary"
            >
              <Show when={saveStatus() === 'saving'}>
                <Icon name="RefreshCw" class="spinning" />
              </Show>
              <Show when={saveStatus() === 'saved'}>
                <Icon name="CheckCircle" />
              </Show>
              <Show when={saveStatus() === 'error'}>
                <Icon name="AlertCircle" />
              </Show>
              <Show when={saveStatus() === 'idle'}>
                <Icon name="Save" />
              </Show>
              Save
            </Button>
            
            <Button onClick={resetConfig} variant="secondary">
              <Icon name="RefreshCw" />
              Reset
            </Button>
          </div>
        </div>
        
        <div class="config-tabs">
          <Button
            onClick={() => setActiveTab('basic')}
            variant={activeTab() === 'basic' ? 'primary' : 'secondary'}
          >
            <Icon name="Download" />
            Basic
          </Button>
          <Button
            onClick={() => setActiveTab('advanced')}
            variant={activeTab() === 'advanced' ? 'primary' : 'secondary'}
          >
            <Icon name="Settings" />
            Advanced
          </Button>
          <Button
            onClick={() => setActiveTab('extractors')}
            variant={activeTab() === 'extractors' ? 'primary' : 'secondary'}
          >
            <Icon name="FileText" />
            Extractors
          </Button>
        </div>
        
        <div class="config-content">
          <Show when={activeTab() === 'basic'}>
            {renderBasicSettings()}
          </Show>
          <Show when={activeTab() === 'advanced'}>
            {renderAdvancedSettings()}
          </Show>
          <Show when={activeTab() === 'extractors'}>
            {renderExtractorSettings()}
          </Show>
        </div>
      </Card>
    </div>
  );
};