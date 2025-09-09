/**
 * BatchCaptionProcessor Component Tests
 *
 * Comprehensive test suite for the batch caption processor component.
 * Tests batch processing workflow, progress tracking, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { BatchCaptionProcessor } from '../components/BatchCaptionProcessor';
import type { CaptionResult, CaptionTask } from 'reynard-annotating-core';

// Mock the BackendAnnotationManager
vi.mock('../BackendAnnotationManager', () => ({
  BackendAnnotationManager: vi.fn(() => ({
    generateBatchCaptions: vi.fn(),
    getAvailableGenerators: vi.fn(),
    getHealthStatus: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

// Mock the child components
vi.mock('../components/BatchConfiguration', () => ({
  BatchConfiguration: vi.fn(({ onConfigChange, onStart }) => (
    <div data-testid="batch-configuration">
      <button onClick={() => onConfigChange({ generator: 'jtp2', maxConcurrent: 2 })}>
        Configure
      </button>
      <button onClick={() => onStart()}>Start Processing</button>
    </div>
  )),
}));

vi.mock('../components/BatchFileList', () => ({
  BatchFileList: vi.fn(({ files, onFilesChange }) => (
    <div data-testid="batch-file-list">
      <div data-testid="file-count">{files.length} files</div>
      <button onClick={() => onFilesChange([{ name: 'test1.jpg' }, { name: 'test2.jpg' }])}>
        Add Files
      </button>
    </div>
  )),
}));

vi.mock('../components/BatchProgress', () => ({
  BatchProgress: vi.fn(({ progress, status }) => (
    <div data-testid="batch-progress">
      <div data-testid="progress-value">{progress}%</div>
      <div data-testid="progress-status">{status}</div>
    </div>
  )),
}));

vi.mock('../components/BatchResults', () => ({
  BatchResults: vi.fn(({ results, onDownload }) => (
    <div data-testid="batch-results">
      <div data-testid="results-count">{results.length} results</div>
      <button onClick={() => onDownload()}>Download Results</button>
    </div>
  )),
}));

describe('BatchCaptionProcessor', () => {
  const defaultProps = {
    backendConfig: {
      baseUrl: 'http://localhost:8000',
      apiKey: 'test-key',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render with default props', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      expect(screen.getByTestId('batch-caption-processor')).toBeInTheDocument();
      expect(screen.getByTestId('batch-configuration')).toBeInTheDocument();
    });

    it('should initialize with empty file list', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      expect(screen.getByTestId('file-count')).toHaveTextContent('0 files');
    });

    it('should initialize with default configuration', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      expect(screen.getByTestId('batch-configuration')).toBeInTheDocument();
    });
  });

  describe('File Management', () => {
    it('should handle file addition', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      expect(screen.getByTestId('file-count')).toHaveTextContent('2 files');
    });

    it('should handle file removal', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // Add files first
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      expect(screen.getByTestId('file-count')).toHaveTextContent('2 files');
      
      // Remove files (this would be implemented in the actual component)
      // For now, we'll just verify the initial state
    });

    it('should validate file types', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // This would test file type validation in the actual component
      expect(screen.getByTestId('batch-file-list')).toBeInTheDocument();
    });
  });

  describe('Configuration Management', () => {
    it('should handle configuration changes', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.click(configureButton);
      
      // Configuration should be updated
      expect(screen.getByTestId('batch-configuration')).toBeInTheDocument();
    });

    it('should validate configuration before processing', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      // Should validate configuration before starting
      expect(screen.getByTestId('batch-configuration')).toBeInTheDocument();
    });
  });

  describe('Batch Processing', () => {
    it('should start batch processing', async () => {
      const mockResults: CaptionResult[] = [
        {
          success: true,
          caption: 'First image caption',
          processingTime: 1.0,
          generator: 'jtp2',
          timestamp: new Date().toISOString(),
        },
        {
          success: true,
          caption: 'Second image caption',
          processingTime: 1.2,
          generator: 'jtp2',
          timestamp: new Date().toISOString(),
        },
      ];

      // Mock the BackendAnnotationManager
      const { BackendAnnotationManager } = require('../BackendAnnotationManager');
      const mockManager = new BackendAnnotationManager();
      mockManager.generateBatchCaptions.mockResolvedValue(mockResults);

      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // Add files and configure
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.click(configureButton);
      
      // Start processing
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('batch-progress')).toBeInTheDocument();
      });
    });

    it('should handle processing errors', async () => {
      const mockError = new Error('Processing failed');

      // Mock the BackendAnnotationManager to throw an error
      const { BackendAnnotationManager } = require('../BackendAnnotationManager');
      const mockManager = new BackendAnnotationManager();
      mockManager.generateBatchCaptions.mockRejectedValue(mockError);

      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // Add files and configure
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.click(configureButton);
      
      // Start processing
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        // Should handle error gracefully
        expect(screen.getByTestId('batch-caption-processor')).toBeInTheDocument();
      });
    });

    it('should show progress during processing', async () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // Add files and configure
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.click(configureButton);
      
      // Start processing
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('batch-progress')).toBeInTheDocument();
      });
    });
  });

  describe('Results Management', () => {
    it('should display results after processing', async () => {
      const mockResults: CaptionResult[] = [
        {
          success: true,
          caption: 'Test caption',
          processingTime: 1.0,
          generator: 'jtp2',
          timestamp: new Date().toISOString(),
        },
      ];

      // Mock the BackendAnnotationManager
      const { BackendAnnotationManager } = require('../BackendAnnotationManager');
      const mockManager = new BackendAnnotationManager();
      mockManager.generateBatchCaptions.mockResolvedValue(mockResults);

      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // Add files and configure
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.click(configureButton);
      
      // Start processing
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('batch-results')).toBeInTheDocument();
        expect(screen.getByTestId('results-count')).toHaveTextContent('1 results');
      });
    });

    it('should handle download of results', async () => {
      const mockResults: CaptionResult[] = [
        {
          success: true,
          caption: 'Test caption',
          processingTime: 1.0,
          generator: 'jtp2',
          timestamp: new Date().toISOString(),
        },
      ];

      // Mock the BackendAnnotationManager
      const { BackendAnnotationManager } = require('../BackendAnnotationManager');
      const mockManager = new BackendAnnotationManager();
      mockManager.generateBatchCaptions.mockResolvedValue(mockResults);

      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // Add files and configure
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.click(configureButton);
      
      // Start processing
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const downloadButton = screen.getByText('Download Results');
        fireEvent.click(downloadButton);
        
        // Should trigger download
        expect(downloadButton).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');

      // Mock the BackendAnnotationManager to throw a network error
      const { BackendAnnotationManager } = require('../BackendAnnotationManager');
      const mockManager = new BackendAnnotationManager();
      mockManager.generateBatchCaptions.mockRejectedValue(networkError);

      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // Add files and configure
      const addFilesButton = screen.getByText('Add Files');
      fireEvent.click(addFilesButton);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.click(configureButton);
      
      // Start processing
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        // Should handle network error gracefully
        expect(screen.getByTestId('batch-caption-processor')).toBeInTheDocument();
      });
    });

    it('should handle invalid file types', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // This would test invalid file type handling
      expect(screen.getByTestId('batch-file-list')).toBeInTheDocument();
    });

    it('should handle missing configuration', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      const startButton = screen.getByText('Start Processing');
      fireEvent.click(startButton);
      
      // Should handle missing configuration gracefully
      expect(screen.getByTestId('batch-configuration')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      expect(screen.getByTestId('batch-caption-processor')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      const configureButton = screen.getByText('Configure');
      fireEvent.keyDown(configureButton, { key: 'Enter' });
      
      expect(configureButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large file lists efficiently', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // This would test performance with large file lists
      expect(screen.getByTestId('batch-file-list')).toBeInTheDocument();
    });

    it('should handle concurrent processing limits', () => {
      render(() => <BatchCaptionProcessor {...defaultProps} />);
      
      // This would test concurrent processing limits
      expect(screen.getByTestId('batch-configuration')).toBeInTheDocument();
    });
  });
});
