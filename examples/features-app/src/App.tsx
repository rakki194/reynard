/**
 * Features Demo App
 * Showcasing Reynard feature management system with interactive examples
 */

import { createSignal, createEffect } from "solid-js";
import { 
  FeatureProvider, 
  COMMON_FEATURES, 
  FEATURE_CATEGORIES,
  FEATURE_PRIORITIES 
} from "reynard-features";
import { ThemeProvider, useTheme } from "reynard-themes";
import { LanguageProvider, useLanguage } from "reynard-core";
import { translations } from "./translations";
import FeatureDashboard from "./components/FeatureDashboard";
import ServiceControls from "./components/ServiceControls";
import FeatureDemos from "./components/FeatureDemos";
import ThemeToggle from "./components/ThemeToggle";
import LanguageSelector from "./components/LanguageSelector";

// Service availability simulation
const [serviceAvailability, setServiceAvailability] = createSignal<Record<string, boolean>>({
  DataSourceService: true,
  AuthService: true,
  DatabaseService: true,
  ImageProcessingService: true,
  CaptionGeneratorService: false, // Start with this disabled to show degraded state
  DetectionModelsService: true,
  NLPService: false, // Start with this disabled
  TrainingService: false,
  GitService: true,
  APIGateway: false,
  CloudStorageService: false,
  NotificationService: false,
  CacheService: true,
  LoggingService: true,
  MonitoringService: false,
  BackupService: false,
  ExportService: true,
  ImportService: true,
  ValidationService: true,
  SearchService: true,
});

// Service checker function
const serviceChecker = (serviceName: string): boolean => {
  return serviceAvailability()[serviceName] ?? false;
};

// Feature configuration
const featureConfig = {
  features: COMMON_FEATURES,
  serviceChecker,
  autoRefresh: true,
  refreshInterval: 5000, // Refresh every 5 seconds
  onStatusChange: (featureId: string, status: any) => {
    console.log(`Feature ${featureId} status changed:`, status);
  },
  onAvailabilityChange: (featureId: string, available: boolean) => {
    console.log(`Feature ${featureId} availability changed:`, available);
  }
};

function App() {
  const [currentTheme, setCurrentTheme] = useTheme();
  const [currentLanguage, setCurrentLanguage] = useLanguage();

  return (
    <ThemeProvider>
      <LanguageProvider translations={translations}>
        <FeatureProvider config={featureConfig}>
          <div class="app">
            <header class="app-header">
              <h1>
                <div class="reynard-logo">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                Reynard Features Demo
              </h1>
              <p>Interactive demonstration of the Reynard feature management system</p>
              <div class="header-controls">
                <div class="theme-info">
                  Current theme: <strong>{currentTheme()}</strong>
                </div>
                <ThemeToggle />
                <LanguageSelector />
              </div>
            </header>

            <main class="app-main">
              <FeatureDashboard />
              <ServiceControls 
                serviceAvailability={serviceAvailability}
                setServiceAvailability={setServiceAvailability}
              />
              <FeatureDemos />
            </main>

            <footer class="app-footer">
              <p>
                This demo showcases how the Reynard features package manages application capabilities, 
                dependencies, and graceful degradation. Toggle services above to see features adapt in real-time!
              </p>
            </footer>
          </div>
        </FeatureProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
