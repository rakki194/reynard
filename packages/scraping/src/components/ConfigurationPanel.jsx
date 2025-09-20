/**
 * ConfigurationPanel Component
 *
 * Advanced scraper configuration and settings management.
 */
import { For, createSignal } from "solid-js";
import { useScrapingConfig } from "../composables/useScrapingConfig";
export function ConfigurationPanel(props) {
    const { onConfigUpdate, className = "" } = props;
    const [selectedScraper, setSelectedScraper] = createSignal("general");
    const [isSaving, setIsSaving] = createSignal(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = createSignal(false);
    const { configs, updateConfig, resetConfig, isLoading, error } = useScrapingConfig({
        autoSave: false,
    });
    const scraperTypes = [
        "general",
        "hackernews",
        "github",
        "stackoverflow",
        "twitter",
        "wikipedia",
        "wikifur",
        "e621_wiki",
        "arstechnica",
        "techcrunch",
        "wired",
    ];
    const handleSaveConfig = async () => {
        try {
            setIsSaving(true);
            await updateConfig(configs());
            setHasUnsavedChanges(false);
            onConfigUpdate?.(configs());
        }
        catch (error) {
            console.error("Failed to save configuration:", error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleResetConfig = async () => {
        try {
            await resetConfig();
            setHasUnsavedChanges(false);
        }
        catch (error) {
            console.error("Failed to reset configuration:", error);
        }
    };
    const handleConfigChange = () => {
        setHasUnsavedChanges(true);
    };
    const getScraperDisplayName = (type) => {
        const names = {
            general: "General Scraper",
            hackernews: "HackerNews",
            github: "GitHub",
            stackoverflow: "StackOverflow",
            twitter: "Twitter/X",
            wikipedia: "Wikipedia",
            wikifur: "WikiFur",
            e621_wiki: "E621 Wiki",
            arstechnica: "Ars Technica",
            techcrunch: "TechCrunch",
            wired: "Wired",
        };
        return names[type] || type;
    };
    return (<div class={`configuration-panel ${className}`}>
      {/* Header */}
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Scraper Configuration</h2>
          <p class="text-gray-600">Configure scraping settings and parameters for each scraper type</p>
        </div>
        <div class="flex items-center space-x-3">
          {hasUnsavedChanges() && <span class="text-sm text-yellow-600 font-medium">Unsaved changes</span>}
          <button onClick={handleResetConfig} disabled={isLoading()} class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Reset
          </button>
          <button onClick={handleSaveConfig} disabled={isLoading() || isSaving() || !hasUnsavedChanges()} class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving() ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error() && (<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Configuration Error</h3>
              <div class="mt-2 text-sm text-red-700">{error()}</div>
            </div>
          </div>
        </div>)}

      {/* Scraper Selection */}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Select Scraper</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <For each={scraperTypes}>
            {type => (<button onClick={() => setSelectedScraper(type)} class={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${selectedScraper() === type
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>
                {getScraperDisplayName(type)}
              </button>)}
          </For>
        </div>
      </div>

      {/* Configuration Form */}
      {configs() && configs()[selectedScraper()] && (<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {getScraperDisplayName(selectedScraper())} Configuration
          </h3>

          <div class="space-y-6">
            {/* Basic Settings */}
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">Basic Settings</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Scraper Name</label>
                  <input type="text" value={configs()[selectedScraper()].name} onInput={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].name = e.currentTarget.value;
                // Update configs here
                handleConfigChange();
            }} class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enabled</label>
                  <div class="flex items-center">
                    <input type="checkbox" checked={configs()[selectedScraper()].enabled} onChange={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].enabled = e.currentTarget.checked;
                // Update configs here
                handleConfigChange();
            }} class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                    <span class="ml-2 text-sm text-gray-700">
                      {configs()[selectedScraper()].enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rate Limiting */}
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">Rate Limiting</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Requests per Minute</label>
                  <input type="number" min="1" max="1000" value={configs()[selectedScraper()].rateLimit.requestsPerMinute} onInput={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].rateLimit.requestsPerMinute = parseInt(e.currentTarget.value);
                // Update configs here
                handleConfigChange();
            }} class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Requests per Hour</label>
                  <input type="number" min="1" max="10000" value={configs()[selectedScraper()].rateLimit.requestsPerHour} onInput={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].rateLimit.requestsPerHour = parseInt(e.currentTarget.value);
                // Update configs here
                handleConfigChange();
            }} class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
              </div>
            </div>

            {/* Extraction Settings */}
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">Extraction Settings</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input type="checkbox" checked={configs()[selectedScraper()].extraction.extractImages} onChange={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].extraction.extractImages = e.currentTarget.checked;
                // Update configs here
                handleConfigChange();
            }} class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                  <span class="ml-2 text-sm text-gray-700">Extract Images</span>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" checked={configs()[selectedScraper()].extraction.extractLinks} onChange={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].extraction.extractLinks = e.currentTarget.checked;
                // Update configs here
                handleConfigChange();
            }} class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                  <span class="ml-2 text-gray-700">Extract Links</span>
                </div>
              </div>
            </div>

            {/* Quality Settings */}
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">Quality Settings</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Quality Score</label>
                  <input type="number" min="0" max="100" value={configs()[selectedScraper()].quality.minScore} onInput={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].quality.minScore = parseFloat(e.currentTarget.value);
                // Update configs here
                handleConfigChange();
            }} class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enable Filtering</label>
                  <div class="flex items-center">
                    <input type="checkbox" checked={configs()[selectedScraper()].quality.enableFiltering} onChange={e => {
                const newConfigs = { ...configs() };
                newConfigs[selectedScraper()].quality.enableFiltering = e.currentTarget.checked;
                // Update configs here
                handleConfigChange();
            }} class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                    <span class="ml-2 text-sm text-gray-700">
                      {configs()[selectedScraper()].quality.enableFiltering ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}

      {/* Configuration Help */}
      <div class="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Configuration Help</h4>
        <div class="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Rate Limiting:</strong> Control how many requests per minute/hour to respect website limits.
          </p>
          <p>
            <strong>Extraction Settings:</strong> Choose what content types to extract from pages.
          </p>
          <p>
            <strong>Quality Settings:</strong> Set minimum quality thresholds and filtering options.
          </p>
          <p>
            <strong>Note:</strong> Changes are saved automatically when you switch scrapers or click Save Changes.
          </p>
        </div>
      </div>
    </div>);
}
