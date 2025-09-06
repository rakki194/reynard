/**
 * Service Controls Component
 * Allows toggling service availability to demonstrate feature adaptation
 */

import { createMemo } from "solid-js";
import { useLanguage } from "reynard-core";

interface ServiceControlsProps {
  serviceAvailability: () => Record<string, boolean>;
  setServiceAvailability: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}

export default function ServiceControls(props: ServiceControlsProps) {
  const { t } = useLanguage();

  const services = createMemo(() => [
    { name: "DataSourceService", label: "Data Source Service", category: "Core" },
    { name: "AuthService", label: "Authentication Service", category: "Core" },
    { name: "DatabaseService", label: "Database Service", category: "Core" },
    { name: "ImageProcessingService", label: "Image Processing Service", category: "ML" },
    { name: "CaptionGeneratorService", label: "Caption Generator Service", category: "ML" },
    { name: "DetectionModelsService", label: "Detection Models Service", category: "ML" },
    { name: "NLPService", label: "Natural Language Processing Service", category: "ML" },
    { name: "TrainingService", label: "Model Training Service", category: "ML" },
    { name: "GitService", label: "Git Integration Service", category: "Integration" },
    { name: "APIGateway", label: "API Gateway", category: "Integration" },
    { name: "CloudStorageService", label: "Cloud Storage Service", category: "Integration" },
    { name: "NotificationService", label: "Notification Service", category: "Integration" },
    { name: "CacheService", label: "Cache Service", category: "Utility" },
    { name: "LoggingService", label: "Logging Service", category: "Utility" },
    { name: "MonitoringService", label: "Monitoring Service", category: "Utility" },
    { name: "BackupService", label: "Backup Service", category: "Utility" },
    { name: "ExportService", label: "Export Service", category: "Data" },
    { name: "ImportService", label: "Import Service", category: "Data" },
    { name: "ValidationService", label: "Validation Service", category: "Data" },
    { name: "SearchService", label: "Search Service", category: "Data" },
  ]);

  const toggleService = (serviceName: string) => {
    props.setServiceAvailability(prev => ({
      ...prev,
      [serviceName]: !prev[serviceName]
    }));
  };

  const toggleAllServices = (enabled: boolean) => {
    props.setServiceAvailability(prev => {
      const newState = { ...prev };
      services().forEach(service => {
        newState[service.name] = enabled;
      });
      return newState;
    });
  };

  const availableCount = createMemo(() => 
    services().filter(service => props.serviceAvailability()[service.name]).length
  );

  const totalCount = createMemo(() => services().length);

  return (
    <div class="service-controls">
      <h3>🔧 {t("services.controls")}</h3>
      <p>{t("services.description")}</p>
      
      {/* Bulk Controls */}
      <div style="display: flex; gap: calc(var(--spacing) / 2); margin-bottom: var(--spacing);">
        <button 
          class="btn btn-secondary"
          onClick={() => toggleAllServices(true)}
        >
          Enable All ({availableCount()}/{totalCount()})
        </button>
        <button 
          class="btn btn-secondary"
          onClick={() => toggleAllServices(false)}
        >
          Disable All
        </button>
      </div>

      {/* Service Grid */}
      <div class="service-grid">
        {services().map(service => (
          <label class="service-toggle">
            <input
              type="checkbox"
              checked={props.serviceAvailability()[service.name]}
              onChange={() => toggleService(service.name)}
            />
            <div class="service-label">
              <div style="font-weight: 500;">{service.label}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">
                {service.category}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
