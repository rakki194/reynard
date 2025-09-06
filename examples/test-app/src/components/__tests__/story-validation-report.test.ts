import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTutorialValidationReport, printTutorialValidationReport } from './story-validation-report';


// Mock the tutorialData import
vi.mock('../ReynardAdventure', () => ({
  tutorialData: [
    {
      id: 'introduction',
      title: 'Introduction to Reynard',
      description: 'Learn what Reynard is and why it exists',
      estimatedTime: '10 minutes',
      difficulty: 'beginner',
      content: [
        {
          type: 'text',
          content: '# What is Reynard?\n\nReynard is a comprehensive SolidJS framework...'
        },
        {
          type: 'code',
          title: 'Quick Installation',
          language: 'bash',
          content: 'npm install @reynard/core solid-js'
        }
      ]
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      description: 'Understanding Reynard\'s architecture and design principles',
      estimatedTime: '20 minutes',
      difficulty: 'beginner',
      prerequisites: ['introduction'],
      content: [
        {
          type: 'text',
          content: '# Core Architecture\n\nReynard follows a modular architecture...'
        },
        {
          type: 'code',
          title: 'Basic App Structure',
          language: 'tsx',
          content: 'import { createSignal } from "solid-js";\n// ...'
        }
      ]
    },
    {
      id: 'components',
      title: 'Component Library',
      description: 'Mastering Reynard\'s component system',
      estimatedTime: '30 minutes',
      difficulty: 'intermediate',
      prerequisites: ['core-concepts'],
      content: [
        {
          type: 'text',
          content: '# Component Library\n\nReynard provides a comprehensive set...'
        },
        {
          type: 'code',
          title: 'Button Component',
          language: 'tsx',
          content: 'import { Button } from "@reynard/components";\n// ...'
        }
      ]
    }
  ]
}));

describe('Tutorial Validation Report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTutorialValidationReport', () => {
    it('should generate a complete validation report with correct summary', () => {
      const report = generateTutorialValidationReport();

      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('sectionStats');

      // Check summary structure
      expect(report.summary).toHaveProperty('totalSections');
      expect(report.summary).toHaveProperty('totalContent');
      expect(report.summary).toHaveProperty('missingPrerequisites');
      expect(report.summary).toHaveProperty('invalidStructure');
      expect(report.summary).toHaveProperty('emptyContent');
      expect(report.summary).toHaveProperty('invalidDifficulties');

      // Check issues structure
      expect(report.issues).toHaveProperty('missingPrerequisites');
      expect(report.issues).toHaveProperty('invalidStructure');
      expect(report.issues).toHaveProperty('emptyContent');
      expect(report.issues).toHaveProperty('invalidDifficulties');
    });

    it('should correctly count total sections and content', () => {
      const report = generateTutorialValidationReport();

      expect(report.summary.totalSections).toBe(3); // introduction, core-concepts, components
      expect(report.summary.totalContent).toBe(6); // 2 content items per section
    });

    it('should detect missing prerequisites', () => {
      const report = generateTutorialValidationReport();

      // The mock data should not have missing prerequisites
      expect(report.summary.missingPrerequisites).toBe(0);
      expect(report.issues.missingPrerequisites).toHaveLength(0);
    });

    it('should detect invalid structure', () => {
      const report = generateTutorialValidationReport();

      // The mock data should have valid structure
      expect(report.summary.invalidStructure).toBe(0);
      expect(report.issues.invalidStructure).toHaveLength(0);
    });

    it('should detect empty content', () => {
      const report = generateTutorialValidationReport();

      // The mock data should not have empty content
      expect(report.summary.emptyContent).toBe(0);
      expect(report.issues.emptyContent).toHaveLength(0);
    });

    it('should detect invalid difficulties', () => {
      const report = generateTutorialValidationReport();

      // The mock data should have valid difficulties
      expect(report.summary.invalidDifficulties).toBe(0);
      expect(report.issues.invalidDifficulties).toHaveLength(0);
    });

    it('should correctly identify section statistics', () => {
      const report = generateTutorialValidationReport();

      // Check that sections have proper stats
      expect(report.sectionStats.introduction?.contentCount).toBe(2);
      expect(report.sectionStats.introduction?.hasCode).toBe(true);
      expect(report.sectionStats.introduction?.hasText).toBe(true);
      expect(report.sectionStats.introduction?.difficulty).toBe('beginner');
      expect(report.sectionStats.introduction?.estimatedTime).toBe('10 minutes');
    });
  });

  describe('printTutorialValidationReport', () => {
    it('should call generateTutorialValidationReport and return the report', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const report = printTutorialValidationReport();

      expect(consoleSpy).toHaveBeenCalled();
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('sectionStats');

      consoleSpy.mockRestore();
    });

    it('should print the report header and summary', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      printTutorialValidationReport();

      expect(consoleSpy).toHaveBeenCalledWith('\n=== REYNARD TUTORIAL VALIDATION REPORT ===\n');
      expect(consoleSpy).toHaveBeenCalledWith('SUMMARY:');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total Sections:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total Content Items:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing Prerequisites:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid Structure:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Empty Content:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid Difficulties:'));

      consoleSpy.mockRestore();
    });

    it('should print the report footer', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      printTutorialValidationReport();

      expect(consoleSpy).toHaveBeenCalledWith('\n=== END REPORT ===\n');

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle the mock tutorial data correctly', () => {
      const report = generateTutorialValidationReport();

      // Test that the function handles the mock data without errors
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.issues).toBeDefined();
      expect(report.sectionStats).toBeDefined();
    });

    it('should correctly identify all section types in mock data', () => {
      const report = generateTutorialValidationReport();

      // Test that the function correctly processes all sections in the mock data
      expect(report.summary.totalSections).toBe(3);
      expect(report.summary.totalContent).toBe(6);
      
      // Test that all sections are properly identified
      expect(report.sectionStats.introduction).toBeDefined();
      expect(report.sectionStats['core-concepts']).toBeDefined();
      expect(report.sectionStats.components).toBeDefined();
    });

    it('should handle sections with different content counts', () => {
      const report = generateTutorialValidationReport();

      // Test that sections with different numbers of content items are handled correctly
      expect(report.sectionStats.introduction?.contentCount).toBe(2);
      expect(report.sectionStats['core-concepts']?.contentCount).toBe(2);
      expect(report.sectionStats.components?.contentCount).toBe(2);
    });

  });
});
