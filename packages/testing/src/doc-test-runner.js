#!/usr/bin/env node

/**
 * Documentation Test Runner CLI
 * 
 * Command-line tool to run documentation tests across all packages
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const PACKAGES = [
  {
    name: 'reynard-core',
    path: 'packages/core',
    docPath: '../../packages/core/README.md',
    setup: `
      import { NotificationsProvider, createNotifications } from 'reynard-core';
    `
  },
  {
    name: 'reynard-components',
    path: 'packages/components',
    docPath: '../../packages/components/README.md',
    setup: `
      import { Button, Card, TextField, Modal, Tabs } from 'reynard-components';
      import { ReynardProvider } from 'reynard-themes';
      import 'reynard-themes/themes.css';
    `
  },
  {
    name: 'reynard-auth',
    path: 'packages/auth',
    docPath: '../../packages/auth/README.md',
    setup: `
      import { AuthProvider, LoginForm, RegisterForm, useAuth } from 'reynard-auth';
      import { ReynardProvider } from 'reynard-themes';
      import 'reynard-themes/themes.css';
    `
  },
  {
    name: 'reynard-chat',
    path: 'packages/chat',
    docPath: '../../packages/chat/README.md',
    setup: `
      import { ChatContainer, useChat, useStreamingChat, useP2PChat } from 'reynard-chat';
      import { ReynardProvider } from 'reynard-themes';
      import 'reynard-themes/themes.css';
    `
  },
  {
    name: 'reynard-testing',
    path: 'packages/testing',
    docPath: '../../packages/testing/README.md',
    setup: `
      import { renderWithProviders, mockFetch, createMockUser } from 'reynard-testing';
      import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
    `
  },
  {
    name: 'reynard-algorithms',
    path: 'packages/algorithms',
    docPath: '../../packages/algorithms/README.md',
    setup: `
      import { UnionFind, checkCollision, SpatialHash, PerformanceTimer } from 'reynard-algorithms';
    `
  },
  {
    name: 'reynard-file-processing',
    path: 'packages/file-processing',
    docPath: '../../packages/file-processing/README.md',
    setup: `
      import { FileProcessingPipeline, ThumbnailGenerator } from 'reynard-file-processing';
    `
  }
];

/**
 * Extract code examples from markdown documentation
 */
export function extractCodeExamples(docPath) {
  if (!existsSync(docPath)) {
    return [];
  }
  
  const content = readFileSync(docPath, 'utf-8');
  const lines = content.split('\n');
  const examples = [];
  
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockStart = 0;
  let currentLanguage = '';
  let currentContext = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track context (headers, descriptions)
    if (line.startsWith('#')) {
      currentContext = line.replace(/^#+\s*/, '').trim();
    }
    
    // Start of code block
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockStart = i + 1;
        currentLanguage = line.replace('```', '').trim();
        codeBlockContent = [];
      } else {
        // End of code block
        inCodeBlock = false;
        
        if (codeBlockContent.length > 0) {
          const code = codeBlockContent.join('\n');
          const isTypeScript = ['tsx', 'ts', 'typescript'].includes(currentLanguage);
          const isComponent = code.includes('function') && code.includes('return') && code.includes('<');
          
          examples.push({
            code,
            lineNumber: codeBlockStart,
            description: `${currentContext} - ${currentLanguage} example`,
            isTypeScript,
            isComponent
          });
        }
      }
    } else if (inCodeBlock) {
      codeBlockContent.push(line);
    }
  }
  
  return examples;
}

/**
 * Validate that all code examples in documentation are syntactically correct
 */
export function validateDocExamples(docPath) {
  const examples = extractCodeExamples(docPath);
  const errors = [];
  let valid = 0;
  let invalid = 0;
  
  examples.forEach((example, index) => {
    try {
      // Basic syntax validation
      if (example.isTypeScript) {
        // For TypeScript, we'll do basic validation
        if (example.code.includes('import') && !example.code.includes('from')) {
          throw new Error('Invalid import statement');
        }
        if (example.code.includes('function') && !example.code.includes('{')) {
          throw new Error('Invalid function syntax');
        }
      }
      
      // Check for common issues
      if (example.code.includes('undefined') && !example.code.includes('//')) {
        errors.push(`Example ${index + 1}: Contains undefined reference`);
        invalid++;
      } else {
        valid++;
      }
    } catch (error) {
      errors.push(`Example ${index + 1}: ${error.message}`);
      invalid++;
    }
  });
  
  return { valid, invalid, errors };
}

/**
 * Generate a documentation test report
 */
export function generateDocTestReport(docPath) {
  const examples = extractCodeExamples(docPath);
  const validation = validateDocExamples(docPath);
  
  const typeStats = examples.reduce((acc, example) => {
    const type = example.isComponent ? 'Component' : example.isTypeScript ? 'TypeScript' : 'JavaScript';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeStatsText = Object.entries(typeStats)
    .map(([type, count]) => `- ${type}: ${count}`)
    .join('\n');

  return `
# Documentation Test Report

## Summary
- **Total Examples**: ${examples.length}
- **Valid Examples**: ${validation.valid}
- **Invalid Examples**: ${validation.invalid}
- **Success Rate**: ${((validation.valid / examples.length) * 100).toFixed(1)}%

## Examples by Type
${typeStatsText}

## Issues Found
${validation.errors.length > 0 ? validation.errors.map(error => `- ${error}`).join('\n') : 'No issues found'}

## Recommendations
${validation.invalid > 0 ? 
  '- Review and fix invalid examples\n- Add proper error handling\n- Ensure all imports are correct' : 
  '- All examples are valid and ready for testing'}
`;
}

/**
 * Validate all documentation examples
 */
import process from 'process';

export function validateAllDocs(rootPath = process.cwd()) {
  // eslint-disable-next-line no-undef
  console.log('🦦 Validating documentation examples...');
  
  const reports = [];
  let totalValid = 0;
  let totalInvalid = 0;
  
  PACKAGES.forEach(pkg => {
    const docPath = join(rootPath, pkg.docPath);
    
    if (existsSync(docPath)) {
      const validation = validateDocExamples(docPath);
      const report = generateDocTestReport(docPath);
      
      totalValid += validation.valid;
      totalInvalid += validation.invalid;
      
      reports.push(`## ${pkg.name}\n${report}`);
      
      // eslint-disable-next-line no-undef
      console.log(`📊 ${pkg.name}: ${validation.valid} valid, ${validation.invalid} invalid`);
    } else {
      // eslint-disable-next-line no-undef
      console.log(`⚠️  ${pkg.name}: Documentation file not found at ${docPath}`);
    }
  });
  
  // Generate combined report
  const combinedReport = `
# Reynard Documentation Test Report

## Overall Summary
- **Total Examples**: ${totalValid + totalInvalid}
- **Valid Examples**: ${totalValid}
- **Invalid Examples**: ${totalInvalid}
- **Success Rate**: ${totalInvalid === 0 ? '100%' : ((totalValid / (totalValid + totalInvalid)) * 100).toFixed(1)}%

## Package Reports

${reports.join('\n\n')}

## Next Steps
${totalInvalid > 0 ? 
  '1. Review and fix invalid examples\n2. Run `npm run test:docs` to execute tests\n3. Update documentation as needed' :
  '1. All examples are valid!\n2. Run `npm run test:docs` to execute tests\n3. Consider adding more examples'}
`;
  
  const reportPath = join(rootPath, 'docs-test-report.md');
  writeFileSync(reportPath, combinedReport);
  
  // eslint-disable-next-line no-undef
  console.log(`📋 Full report saved to: ${reportPath}`);
  // eslint-disable-next-line no-undef
  console.log(`🎯 Overall: ${totalValid} valid, ${totalInvalid} invalid examples`);
}

/**
 * CLI interface
 */
export function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'validate':
      validateAllDocs();
      break;
      
    default:
      // eslint-disable-next-line no-undef
      console.log(`
🦊 Reynard Documentation Test Runner

Usage:
  npm run doc-tests <command>

Commands:
  validate    Validate all documentation examples

Examples:
  npm run doc-tests validate
`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
