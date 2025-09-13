/**
 * Test suite for validate-markdown-toc.js
 * 
 * Tests the markdown Table of Contents validation functionality
 * including heading extraction, ToC generation, and validation logic.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import { execSync } from 'child_process';
import {
  validateMarkdownToC,
  autoFixToC,
  validateMarkdownFile,
  generateToC,
  extractHeadings
} from './validate-markdown-toc.js';

// Mock fs module
vi.mock('fs');
vi.mock('child_process');

describe('validate-markdown-toc.js', () => {
  let mockReadFileSync;
  let mockWriteFileSync;
  let mockExecSync;

  beforeEach(() => {
    mockReadFileSync = vi.mocked(fs.readFileSync);
    mockWriteFileSync = vi.mocked(fs.writeFileSync);
    mockExecSync = vi.mocked(execSync);
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractHeadings', () => {
    it('should extract headings from markdown content', () => {
      const content = `# Main Title
Some content here.

## First H2
Content under first H2.

### H3 Heading
Content under H3.

## Second H2
More content.

#### H4 Heading
Deep content.`;

      const headings = extractHeadings(content);

      expect(headings).toHaveLength(5);
      expect(headings[0]).toEqual({
        level: 1,
        text: 'Main Title',
        lineNumber: 1,
        raw: '# Main Title'
      });
      expect(headings[1]).toEqual({
        level: 2,
        text: 'First H2',
        lineNumber: 4,
        raw: '## First H2'
      });
      expect(headings[2]).toEqual({
        level: 3,
        text: 'H3 Heading',
        lineNumber: 7,
        raw: '### H3 Heading'
      });
    });

    it('should handle headings with special characters', () => {
      const content = `##  Reynard Framework
## API Reference (v2.0)
## Configuration & Setup`;

      const headings = extractHeadings(content);

      expect(headings).toHaveLength(3);
      expect(headings[0].text).toBe('🦊 Reynard Framework');
      expect(headings[1].text).toBe('API Reference (v2.0)');
      expect(headings[2].text).toBe('Configuration & Setup');
    });

    it('should return empty array for content without headings', () => {
      const content = `Just some regular text.
No headings here.
Just paragraphs.`;

      const headings = extractHeadings(content);

      expect(headings).toHaveLength(0);
    });
  });

  describe('generateToC', () => {
    it('should generate a proper ToC from headings', () => {
      const headings = [
        { level: 2, text: 'Installation', lineNumber: 1, raw: '## Installation' },
        { level: 2, text: 'Configuration', lineNumber: 5, raw: '## Configuration' },
        { level: 3, text: 'Basic Setup', lineNumber: 7, raw: '### Basic Setup' },
        { level: 3, text: 'Advanced Options', lineNumber: 10, raw: '### Advanced Options' },
        { level: 2, text: 'API Reference', lineNumber: 15, raw: '## API Reference' }
      ];

      const toc = generateToC(headings, 2);

      expect(toc).toContain('## Table of Contents');
      expect(toc).toContain('- [Installation](#installation)');
      expect(toc).toContain('- [Configuration](#configuration)');
      expect(toc).toContain('  - [Basic Setup](#basic-setup)');
      expect(toc).toContain('  - [Advanced Options](#advanced-options)');
      expect(toc).toContain('- [API Reference](#api-reference)');
    });

    it('should exclude ToC headings from generated ToC', () => {
      const headings = [
        { level: 2, text: 'Table of Contents', lineNumber: 1, raw: '## Table of Contents' },
        { level: 2, text: 'Installation', lineNumber: 5, raw: '## Installation' },
        { level: 2, text: 'TOC', lineNumber: 7, raw: '## TOC' },
        { level: 2, text: 'Configuration', lineNumber: 10, raw: '## Configuration' }
      ];

      const toc = generateToC(headings, 2);

      expect(toc).not.toContain('- [Table of Contents]');
      expect(toc).not.toContain('- [TOC]');
      expect(toc).toContain('- [Installation](#installation)');
      expect(toc).toContain('- [Configuration](#configuration)');
    });

    it('should handle special characters in anchor generation', () => {
      const headings = [
        { level: 2, text: '🦊 Reynard Framework', lineNumber: 1, raw: '##  Reynard Framework' },
        { level: 2, text: 'API Reference (v2.0)', lineNumber: 3, raw: '## API Reference (v2.0)' },
        { level: 2, text: 'Configuration & Setup', lineNumber: 5, raw: '## Configuration & Setup' }
      ];

      const toc = generateToC(headings, 2);

      expect(toc).toContain('- [🦊 Reynard Framework](#reynard-framework)');
      expect(toc).toContain('- [API Reference (v2.0)](#api-reference-v20)');
      expect(toc).toContain('- [Configuration & Setup](#configuration-setup)');
    });

    it('should return empty string for no headings', () => {
      const headings = [];
      const toc = generateToC(headings, 2);
      expect(toc).toBe('');
    });
  });

  describe('validateMarkdownFile', () => {
    it('should validate a file with proper ToC', () => {
      const content = `# Main Title

## Installation

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)

## Configuration

Some content here.`;

      mockReadFileSync.mockReturnValue(content);

      const result = validateMarkdownFile('test.md');

      expect(result.valid).toBe(true);
      expect(result.file).toBe('test.md');
      expect(result.tocLineCount).toBeGreaterThan(0);
    });

    it('should fail validation for missing ToC', () => {
      const content = `# Main Title

## Installation

Some content here.

## Configuration

More content.`;

      mockReadFileSync.mockReturnValue(content);

      const result = validateMarkdownFile('test.md');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No Table of Contents found after first H2 heading');
      expect(result.suggestion).toContain('Add a "## Table of Contents" section');
    });

    it('should fail validation for missing H2 heading', () => {
      const content = `# Main Title

Some content here.

### H3 Heading

More content.`;

      mockReadFileSync.mockReturnValue(content);

      const result = validateMarkdownFile('test.md');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No H2 heading found');
    });

    it('should fail validation for outdated ToC', () => {
      const content = `# Main Title

## Installation

## Table of Contents

- [Installation](#installation)
- [Old Section](#old-section)

## Configuration

Some content here.

## New Section

New content.`;

      mockReadFileSync.mockReturnValue(content);

      const result = validateMarkdownFile('test.md');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Table of Contents is out of date');
      expect(result.expectedToC).toContain('New Section');
      expect(result.expectedToC).not.toContain('Old Section');
    });

    it('should handle file read errors', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = validateMarkdownFile('nonexistent.md');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Failed to read file');
    });
  });

  describe('validateMarkdownToC', () => {
    it('should validate multiple files successfully', () => {
      const content1 = `# File 1
## Installation
## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
## Configuration`;

      const content2 = `# File 2
## Setup
## Table of Contents
- [Setup](#setup)
- [Usage](#usage)
## Usage`;

      mockReadFileSync
        .mockReturnValueOnce(content1)
        .mockReturnValueOnce(content2);

      const result = validateMarkdownToC(['file1.md', 'file2.md']);

      expect(result).toBe(true);
    });

    it('should fail validation when any file is invalid', () => {
      const content1 = `# File 1
## Installation
## Table of Contents
- [Installation](#installation)
## Configuration`;

      const content2 = `# File 2
## Setup
## Configuration`;

      mockReadFileSync
        .mockReturnValueOnce(content1)
        .mockReturnValueOnce(content2);

      const result = validateMarkdownToC(['file1.md', 'file2.md']);

      expect(result).toBe(false);
    });

    it('should handle empty file list', () => {
      const result = validateMarkdownToC([]);
      expect(result).toBe(true);
    });
  });

  describe('autoFixToC', () => {
    it('should add missing ToC to file', () => {
      const originalContent = `# Main Title

## Installation

Some content here.

## Configuration

More content.`;

      mockReadFileSync.mockReturnValue(originalContent);
      mockWriteFileSync.mockImplementation(() => {});

      const result = autoFixToC(['test.md']);

      expect(result).toBe(true);
      expect(mockWriteFileSync).toHaveBeenCalledWith('test.md', expect.stringContaining('## Table of Contents'), 'utf8');
    });

    it('should update existing ToC', () => {
      const originalContent = `# Main Title

## Installation

## Table of Contents

- [Installation](#installation)
- [Old Section](#old-section)

## Configuration

Some content here.

## New Section

New content.`;

      mockReadFileSync.mockReturnValue(originalContent);
      mockWriteFileSync.mockImplementation(() => {});

      const result = autoFixToC(['test.md']);

      expect(result).toBe(true);
      expect(mockWriteFileSync).toHaveBeenCalledWith('test.md', expect.stringContaining('New Section'), 'utf8');
      expect(mockWriteFileSync).toHaveBeenCalledWith('test.md', expect.not.stringContaining('Old Section'), 'utf8');
    });

    it('should handle files without H2 headings', () => {
      const originalContent = `# Main Title

Some content here.

### H3 Heading

More content.`;

      mockReadFileSync.mockReturnValue(originalContent);

      const result = autoFixToC(['test.md']);

      expect(result).toBe(true);
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it('should handle file write errors', () => {
      const originalContent = `# Main Title

## Installation

Some content here.

## Configuration

More content.`;

      mockReadFileSync.mockReturnValue(originalContent);
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = autoFixToC(['test.md']);

      expect(result).toBe(false);
    });
  });

  describe('getStagedMarkdownFiles integration', () => {
    it('should get staged markdown files from git', () => {
      const mockGitOutput = 'docs/README.md\nbackend/README.md\nsrc/guide.md\n';
      mockExecSync.mockReturnValue(mockGitOutput);

      // We need to test this indirectly through validateMarkdownToC
      const content = `# Test
## Installation
## Table of Contents
- [Installation](#installation)
## Configuration`;

      mockReadFileSync.mockReturnValue(content);

      validateMarkdownToC(); // No files passed, should use git

      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff --cached --name-only --diff-filter=ACM',
        { encoding: 'utf8' }
      );
    });

    it('should handle git command errors', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      const result = validateMarkdownToC(); // No files passed, should use git

      expect(result).toBe(true); // Should return true for no files
    });
  });

  describe('edge cases', () => {
    it('should handle ToC with different case variations', () => {
      const content = `# Main Title

## Installation

## table of contents

- [Installation](#installation)
- [Configuration](#configuration)

## Configuration`;

      mockReadFileSync.mockReturnValue(content);

      const result = validateMarkdownFile('test.md');

      expect(result.valid).toBe(true);
    });

    it('should handle ToC with extra whitespace', () => {
      const content = `# Main Title

## Installation

##   Table of Contents   

- [Installation](#installation)
- [Configuration](#configuration)

## Configuration`;

      mockReadFileSync.mockReturnValue(content);

      const result = validateMarkdownFile('test.md');

      expect(result.valid).toBe(true);
    });

    it('should handle complex heading hierarchies', () => {
      const content = `# Main Title

## Installation

## Table of Contents

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Step by Step](#step-by-step)
- [Configuration](#configuration)
  - [Basic Setup](#basic-setup)
  - [Advanced Options](#advanced-options)
    - [Environment Variables](#environment-variables)
    - [Custom Themes](#custom-themes)

### Prerequisites

### Step by Step

## Configuration

### Basic Setup

### Advanced Options

#### Environment Variables

#### Custom Themes`;

      mockReadFileSync.mockReturnValue(content);

      const result = validateMarkdownFile('test.md');

      expect(result.valid).toBe(true);
    });
  });
});
