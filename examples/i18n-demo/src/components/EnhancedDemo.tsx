import { Component, createSignal, createEffect, For } from "solid-js";
import { Toggle } from "reynard-components";
import { createI18nModule, type EnhancedI18nModule, migrateTranslations, type MigrationOptions } from "reynard-i18n";

const EnhancedDemo: Component = () => {
  const [i18n, setI18n] = createSignal<EnhancedI18nModule | null>(null);
  const [debugMode, setDebugMode] = createSignal(false);
  const [performanceMode, setPerformanceMode] = createSignal(false);
  const [selectedNamespace, setSelectedNamespace] = createSignal("common");
  const [migrationResult, setMigrationResult] = createSignal<any>(null);

  // Initialize enhanced i18n module
  createEffect(() => {
    const enhancedI18n = createI18nModule({
      enableDebug: debugMode(),
      enablePerformanceMonitoring: performanceMode(),
      usedNamespaces: ["common", "themes", "core"],
      preloadLocales: ["en", "es", "fr"],
      intlConfig: {
        timeZone: "UTC",
        currency: "USD",
      },
    });
    setI18n(enhancedI18n);
  });

  // Demo migration from solid-i18n
  const demoMigration = () => {
    const mockSolidI18nTranslations = {
      "common.language": "Language",
      "common.save": "Save",
      "themes.dark": "Dark Theme",
      "core.loading": "Loading...",
      "components.button": "Button",
    };

    const options: MigrationOptions = {
      sourceLibrary: "solid-i18n",
      sourceTranslations: mockSolidI18nTranslations,
      targetLocale: "en",
    };

    const result = migrateTranslations(options);
    setMigrationResult(result);
  };

  // Demo namespace loading
  const loadNamespaceDemo = async () => {
    const currentI18n = i18n();
    if (currentI18n) {
      try {
        const namespaceData = await currentI18n.loadNamespace(selectedNamespace());
        console.log(`Loaded namespace ${selectedNamespace()}:`, namespaceData);
      } catch (error) {
        console.error("Failed to load namespace:", error);
      }
    }
  };

  // Demo template translator
  const templateDemo = () => {
    const currentI18n = i18n();
    if (currentI18n) {
      const template = currentI18n.templateTranslator`Hello ${"World"}! You have ${5} messages.`;
      console.log("Template translation:", template);
    }
  };

  // Demo plural translator
  const pluralDemo = () => {
    const currentI18n = i18n();
    if (currentI18n) {
      const plural1 = currentI18n.pluralTranslator("common.items", 1);
      const plural5 = currentI18n.pluralTranslator("common.items", 5);
      console.log("Plural translations:", { plural1, plural5 });
    }
  };

  // Demo Intl formatting
  const intlDemo = () => {
    const currentI18n = i18n();
    if (currentI18n) {
      const number = currentI18n.intlFormatter.number.format(1234.56, "currency");
      const date = currentI18n.intlFormatter.date.format(new Date(), "long");
      const relative = currentI18n.intlFormatter.relativeTime.formatSmart(new Date(Date.now() - 86400000));

      console.log("Intl formatting:", { number, date, relative });
    }
  };

  // Demo analytics
  const analyticsDemo = () => {
    const currentI18n = i18n();
    if (currentI18n) {
      const stats = currentI18n.analytics.getUsageStats();
      console.log("Analytics:", stats);
    }
  };

  // Demo cache management
  const cacheDemo = () => {
    const currentI18n = i18n();
    if (currentI18n) {
      const stats = currentI18n.getCacheStats();
      console.log("Cache stats:", stats);
    }
  };

  // Demo debugging
  const debugDemo = () => {
    const currentI18n = i18n();
    if (currentI18n) {
      currentI18n.debugger.printReport(currentI18n.translations());
    }
  };

  return (
    <div class="enhanced-demo">
      <h2>🦊 Enhanced i18n Features Demo</h2>

      <div class="demo-section">
        <h3>Configuration</h3>
        <label>
          <Toggle size="sm" checked={debugMode()} onChange={e => setDebugMode(e.currentTarget.checked)} />
          Enable Debug Mode
        </label>
        <label>
          <Toggle size="sm" checked={performanceMode()} onChange={e => setPerformanceMode(e.currentTarget.checked)} />
          Enable Performance Monitoring
        </label>
      </div>

      <div class="demo-section">
        <h3>Namespace Loading</h3>
        <select value={selectedNamespace()} onChange={e => setSelectedNamespace(e.currentTarget.value)}>
          <option value="common">Common</option>
          <option value="themes">Themes</option>
          <option value="core">Core</option>
          <option value="components">Components</option>
        </select>
        <button onClick={loadNamespaceDemo}>Load Namespace</button>
      </div>

      <div class="demo-section">
        <h3>Enhanced Translation Features</h3>
        <button onClick={templateDemo}>Template Translator Demo</button>
        <button onClick={pluralDemo}>Plural Translator Demo</button>
        <button onClick={intlDemo}>Intl Formatting Demo</button>
      </div>

      <div class="demo-section">
        <h3>Enterprise Features</h3>
        <button onClick={analyticsDemo}>Analytics Demo</button>
        <button onClick={cacheDemo}>Cache Stats Demo</button>
        <button onClick={debugDemo}>Debug Report</button>
      </div>

      <div class="demo-section">
        <h3>Migration Tools</h3>
        <button onClick={demoMigration}>Demo Migration from solid-i18n</button>
        {migrationResult() && (
          <div class="migration-result">
            <h4>Migration Result:</h4>
            <p>Success: {migrationResult().success ? "✅" : "❌"}</p>
            <p>Migrated Keys: {migrationResult().statistics.migratedKeys}</p>
            <p>Errors: {migrationResult().errors.length}</p>
            <p>Warnings: {migrationResult().warnings.length}</p>
            {migrationResult().warnings.length > 0 && (
              <ul>
                <For each={migrationResult().warnings}>{warning => <li>{warning}</li>}</For>
              </ul>
            )}
          </div>
        )}
      </div>

      <div class="demo-section">
        <h3>Performance Metrics</h3>
        {i18n() && (
          <div class="metrics">
            <p>Translation Calls: {i18n()!.performanceMonitor.getMetrics().translationCalls}</p>
            <p>
              Average Load Time: {i18n()!.performanceMonitor.getMetrics().averageLoadTime.toFixed(2)}
              ms
            </p>
            <p>Cache Hit Rate: {(i18n()!.performanceMonitor.getMetrics().cacheHitRate * 100).toFixed(1)}%</p>
          </div>
        )}
      </div>

      <div class="demo-section">
        <h3>Debug Information</h3>
        {i18n() && debugMode() && (
          <div class="debug-info">
            <p>Used Keys: {i18n()!.debugger.getUsedKeys().length}</p>
            <p>Missing Keys: {i18n()!.debugger.getMissingKeys().length}</p>
            <button onClick={() => i18n()!.debugger.clear()}>Clear Debug Data</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDemo;
