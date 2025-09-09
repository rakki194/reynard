/**
 * CaptionGenerator Component Tests
 *
 * Comprehensive test suite for the main caption generator component.
 * Tests component initialization, prop handling, and integration with composables.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { CaptionGenerator } from '../CaptionGenerator';
import type { CaptionResult } from 'reynard-annotating';

// Mock the composables
vi.mock('../../composables', () => ({
  useCaptionGeneratorState: vi.fn(),
  useCaptionGeneratorHandlers: vi.fn(),
  useCaptionGeneratorBackend: vi.fn(),
}));

// Mock the view component
vi.mock('../CaptionGeneratorView', () => ({
  CaptionGeneratorView: vi.fn(({ state, handlers, class: className, fileInputRef }) => (
    <div data-testid="caption-generator-view" class={className}>
      <div data-testid="state-info">
        Selected Model: {state.selectedModel()}
        Is Generating: {state.isGenerating().toString()}
        Has Image: {state.imageFile() ? 'true' : 'false'}
      </div>
      <div data-testid="handlers-info">
        Has Generate Handler: {handlers ? 'true' : 'false'}
      </div>
      <input ref={fileInputRef} type="file" data-testid="file-input" aria-label="Select image file" />
    </div>
  )),
}));

describe('CaptionGenerator', () => {
  let mockState: any;
  let mockHandlers: any;
  let mockBackend: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock state
    mockState = {
      selectedModel: vi.fn(() => 'jtp2'),
      setSelectedModel: vi.fn(),
      imageFile: vi.fn(() => null),
      setImageFile: vi.fn(),
      imagePreview: vi.fn(() => null),
      setImagePreview: vi.fn(),
      isGenerating: vi.fn(() => false),
      setIsGenerating: vi.fn(),
      generationProgress: vi.fn(() => 0),
      setGenerationProgress: vi.fn(),
      result: vi.fn(() => null),
      setResult: vi.fn(),
      error: vi.fn(() => null),
      setError: vi.fn(),
      availableGenerators: vi.fn(() => []),
      setAvailableGenerators: vi.fn(),
      isDragOver: vi.fn(() => false),
      setIsDragOver: vi.fn(),
    };

    // Create mock handlers
    mockHandlers = {
      handleFileSelect: vi.fn(),
      handleGenerate: vi.fn(),
      handleModelChange: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragLeave: vi.fn(),
      handleDrop: vi.fn(),
    };

    // Create mock backend
    mockBackend = {
      manager: {
        generateCaption: vi.fn(),
        getAvailableGenerators: vi.fn(),
      },
      isLoading: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    // Setup mock implementations
    const { useCaptionGeneratorState, useCaptionGeneratorHandlers, useCaptionGeneratorBackend } = 
      await import('../../composables');
    
    (useCaptionGeneratorState as any).mockReturnValue(mockState);
    (useCaptionGeneratorHandlers as any).mockReturnValue(mockHandlers);
    (useCaptionGeneratorBackend as any).mockReturnValue(mockBackend);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render with default props', () => {
      render(() => <CaptionGenerator />);
      
      expect(screen.getByTestId('caption-generator-view')).toBeInTheDocument();
      expect(screen.getByTestId('state-info')).toHaveTextContent('Selected Model: jtp2');
      expect(screen.getByTestId('state-info')).toHaveTextContent('Is Generating: false');
      expect(screen.getByTestId('state-info')).toHaveTextContent('Has Image: false');
    });

    it('should apply custom className', () => {
      render(() => <CaptionGenerator className="custom-class" />);
      
      const view = screen.getByTestId('caption-generator-view');
      expect(view).toHaveClass('custom-class');
    });

    it('should initialize with initial image path', () => {
      render(() => <CaptionGenerator initialImagePath="/test/image.jpg" />);
      
      expect(screen.getByTestId('caption-generator-view')).toBeInTheDocument();
    });
  });

  describe('Backend Configuration', () => {
    it('should pass backend config to backend composable', () => {
      const backendConfig = {
        baseUrl: 'http://localhost:8000',
        apiKey: 'test-key',
      };

      render(() => <CaptionGenerator backendConfig={backendConfig} />);
      
      // Verify that useCaptionGeneratorBackend was called with the config
      const { useCaptionGeneratorBackend } = require('../../composables');
      expect(useCaptionGeneratorBackend).toHaveBeenCalledWith(mockState, backendConfig);
    });

    it('should work without backend config', () => {
      render(() => <CaptionGenerator />);
      
      const { useCaptionGeneratorBackend } = require('../../composables');
      expect(useCaptionGeneratorBackend).toHaveBeenCalledWith(mockState, undefined);
    });
  });

  describe('Event Handlers', () => {
    it('should pass onCaptionGenerated callback to handlers', () => {
      const onCaptionGenerated = vi.fn();
      
      render(() => <CaptionGenerator onCaptionGenerated={onCaptionGenerated} />);
      
      const { useCaptionGeneratorHandlers } = require('../../composables');
      expect(useCaptionGeneratorHandlers).toHaveBeenCalledWith(
        mockState,
        mockBackend.manager,
        onCaptionGenerated,
        undefined
      );
    });

    it('should pass onGenerationError callback to handlers', () => {
      const onGenerationError = vi.fn();
      
      render(() => <CaptionGenerator onGenerationError={onGenerationError} />);
      
      const { useCaptionGeneratorHandlers } = require('../../composables');
      expect(useCaptionGeneratorHandlers).toHaveBeenCalledWith(
        mockState,
        mockBackend.manager,
        undefined,
        onGenerationError
      );
    });

    it('should pass both callbacks to handlers', () => {
      const onCaptionGenerated = vi.fn();
      const onGenerationError = vi.fn();
      
      render(() => (
        <CaptionGenerator 
          onCaptionGenerated={onCaptionGenerated}
          onGenerationError={onGenerationError}
        />
      ));
      
      const { useCaptionGeneratorHandlers } = require('../../composables');
      expect(useCaptionGeneratorHandlers).toHaveBeenCalledWith(
        mockState,
        mockBackend.manager,
        onCaptionGenerated,
        onGenerationError
      );
    });
  });

  describe('Advanced Options', () => {
    it('should handle showAdvanced prop', () => {
      render(() => <CaptionGenerator showAdvanced={true} />);
      
      expect(screen.getByTestId('caption-generator-view')).toBeInTheDocument();
    });

    it('should handle showAdvanced prop as false', () => {
      render(() => <CaptionGenerator showAdvanced={false} />);
      
      expect(screen.getByTestId('caption-generator-view')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should create file input ref', () => {
      render(() => <CaptionGenerator />);
      
      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('should pass state and handlers to view component', () => {
      render(() => <CaptionGenerator />);
      
      expect(screen.getByTestId('state-info')).toBeInTheDocument();
      expect(screen.getByTestId('handlers-info')).toHaveTextContent('Has Generate Handler: true');
    });
  });

  describe('Error Handling', () => {
    it('should handle composable errors gracefully', () => {
      const { useCaptionGeneratorState } = require('../../composables');
      (useCaptionGeneratorState as any).mockImplementation(() => {
        throw new Error('State initialization failed');
      });

      expect(() => {
        render(() => <CaptionGenerator />);
      }).toThrow('State initialization failed');
    });
  });

  describe('Accessibility', () => {
    it('should have proper file input for accessibility', () => {
      render(() => <CaptionGenerator />);
      
      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });
});
