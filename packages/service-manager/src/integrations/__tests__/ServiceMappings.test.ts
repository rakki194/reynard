/**
 * Service Mappings Tests
 * 
 * Tests for the service name mappings between feature system and actual services.
 */

import { describe, it, expect } from 'vitest';
import { 
  SERVICE_MAPPINGS, 
  REVERSE_SERVICE_MAPPINGS,
  getActualServiceName,
  getFeatureServiceName,
  getAllServiceMappings,
  getAllReverseServiceMappings
} from 'reynard-features';

describe('Service Mappings', () => {
  it('should have predefined service mappings', () => {
    expect(SERVICE_MAPPINGS).toBeDefined();
    expect(typeof SERVICE_MAPPINGS).toBe('object');
    expect(Object.keys(SERVICE_MAPPINGS).length).toBeGreaterThan(0);
  });

  it('should have reverse service mappings', () => {
    expect(REVERSE_SERVICE_MAPPINGS).toBeDefined();
    expect(typeof REVERSE_SERVICE_MAPPINGS).toBe('object');
    expect(Object.keys(REVERSE_SERVICE_MAPPINGS).length).toBeGreaterThan(0);
  });

  it('should map feature service names to actual service names', () => {
    // Test some known mappings
    expect(getActualServiceName('FileProcessingService')).toBe('file-processing');
    expect(getActualServiceName('AuthService')).toBe('auth');
    expect(getActualServiceName('AnnotationService')).toBe('annotation');
    expect(getActualServiceName('ServiceManager')).toBe('service-manager');
  });

  it('should map actual service names to feature service names', () => {
    // Test reverse mappings
    expect(getFeatureServiceName('file-processing')).toBe('FileProcessingService');
    expect(getFeatureServiceName('auth')).toBe('AuthService');
    expect(getFeatureServiceName('annotation')).toBe('AnnotationService');
    expect(getFeatureServiceName('service-manager')).toBe('ServiceManager');
  });

  it('should handle unmapped service names', () => {
    // Unmapped names should return themselves
    expect(getActualServiceName('UnmappedService')).toBe('UnmappedService');
    expect(getFeatureServiceName('unmapped-service')).toBe('unmapped-service');
  });

  it('should provide all service mappings', () => {
    const allMappings = getAllServiceMappings();
    expect(allMappings).toBeDefined();
    expect(typeof allMappings).toBe('object');
    expect(allMappings).toEqual(SERVICE_MAPPINGS);
  });

  it('should provide all reverse service mappings', () => {
    const allReverseMappings = getAllReverseServiceMappings();
    expect(allReverseMappings).toBeDefined();
    expect(typeof allReverseMappings).toBe('object');
    expect(allReverseMappings).toEqual(REVERSE_SERVICE_MAPPINGS);
  });

  it('should have consistent mappings', () => {
    // Test that mappings are consistent
    const featureName = 'FileProcessingService';
    const actualName = getActualServiceName(featureName);
    const backToFeature = getFeatureServiceName(actualName);
    
    expect(backToFeature).toBe(featureName);
  });

  it('should include core service mappings', () => {
    // Test that core services are mapped
    expect(SERVICE_MAPPINGS).toHaveProperty('FileProcessingService');
    expect(SERVICE_MAPPINGS).toHaveProperty('AuthService');
    expect(SERVICE_MAPPINGS).toHaveProperty('ServiceManager');
  });

  it('should include AI/ML service mappings', () => {
    // Test that AI/ML services are mapped
    expect(SERVICE_MAPPINGS).toHaveProperty('AnnotationService');
    expect(SERVICE_MAPPINGS).toHaveProperty('RAGService');
    expect(SERVICE_MAPPINGS).toHaveProperty('AIService');
  });

  it('should include UI service mappings', () => {
    // Test that UI services are mapped
    expect(SERVICE_MAPPINGS).toHaveProperty('ThemesService');
    expect(SERVICE_MAPPINGS).toHaveProperty('UIService');
    expect(SERVICE_MAPPINGS).toHaveProperty('ComponentsService');
  });
});
