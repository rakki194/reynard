#!/usr/bin/env node

/**
 * Simple Documentation Validation
 * Validates that documentation examples are syntactically correct
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PACKAGES = [
  { name: 'reynard-core', path: 'packages/core', docPath: 'packages/core/README.md' },
  { name: 'reynard-components', path: 'packages/components', docPath: 'packages/components/README.md' },
  { name: 'reynard-auth', path: 'packages/auth', docPath: 'packages/auth/README.md' },
  { name: 'reynard-chat', path: 'packages/chat', docPath: 'packages/chat/README.md' },
  { name: 'reynard-testing', path: 'packages/testing', docPath: 'packages/testing/README.md' },
  { name: 'reynard-algorithms', path: 'packages/algorithms', docPath: 'packages/algorithms/README.md' },
  { name: 'reynard-file-processing', path: 'packages/file-processing', docPath: 'packages/file-processing/README.md' }
];

function extractCodeExamples(docPath) {
  if (!existsSync(docPath)) {
    return [];
  }
  
  const content = readFileSync(docPath, 'utf-8');
  const lines = content.split('\n');
  const examples = [];
  
  let inCodeBlock = false;
  let codeBlockContent = [];
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
            lineNumber: i - codeBlockContent.length + 1,
            description: `${currentContext} - ${currentLanguage} example`,
            isTypeScript,
            isComponent,
            language: currentLanguage
          });
        }
      }
    } else if (inCodeBlock) {
      codeBlockContent.push(line);
    }
  }
  
  return examples;
}

function validateExample(example, index) {
  const issues = [];
  
  // Basic syntax validation
  if (example.isTypeScript) {
    // Check for common issues
    if (example.code.includes('undefined') && !example.code.includes('//')) {
      issues.push('Contains undefined reference');
    }
    
    if (example.code.includes('import') && !example.code.includes('from')) {
      issues.push('Invalid import statement');
    }
    
    if (example.code.includes('function') && !example.code.includes('{')) {
      issues.push('Invalid function syntax');
    }
  }
  
  // Check for incomplete examples
  if (example.code.includes('// ...') || example.code.includes('/* ... */')) {
    issues.push('Incomplete example (contains placeholders)');
  }
  
  return issues;
}

function validatePackage(pkg) {
  const examples = extractCodeExamples(pkg.docPath);
  const validation = {
    package: pkg.name,
    totalExamples: examples.length,
    validExamples: 0,
    invalidExamples: 0,
    issues: []
  };
  
  examples.forEach((example, index) => {
    const issues = validateExample(example, index);
    
    if (issues.length === 0) {
      validation.validExamples++;
    } else {
      validation.invalidExamples++;
      validation.issues.push({
        example: index + 1,
        description: example.description,
        issues
      });
    }
  });
  
  return validation;
}

function main() {
  console.log('🦊🦦🐺 Reynard Documentation Validation\n');
  
  const results = PACKAGES.map(validatePackage);
  
  let totalValid = 0;
  let totalInvalid = 0;
  let totalExamples = 0;
  
  results.forEach(result => {
    totalValid += result.validExamples;
    totalInvalid += result.invalidExamples;
    totalExamples += result.totalExamples;
    
    console.log(`📦 ${result.package}`);
    console.log(`   Examples: ${result.totalExamples} (${result.validExamples} valid, ${result.invalidExamples} invalid)`);
    
    if (result.issues.length > 0) {
      console.log(`   Issues:`);
      result.issues.forEach(issue => {
        console.log(`     - Example ${issue.example}: ${issue.issues.join(', ')}`);
      });
    }
    console.log('');
  });
  
  // Summary
  console.log('📊 Validation Summary:');
  console.log(`   Total Examples: ${totalExamples}`);
  console.log(`   Valid Examples: ${totalValid}`);
  console.log(`   Invalid Examples: ${totalInvalid}`);
  console.log(`   Success Rate: ${totalExamples > 0 ? ((totalValid / totalExamples) * 100).toFixed(1) : 0}%`);
  
  if (totalInvalid === 0) {
    console.log('\n✅ All documentation examples are valid!');
    console.log('🎉 Ready for testing!');
  } else {
    console.log(`\n⚠️  ${totalInvalid} examples need attention`);
    console.log('🔧 Fix the issues above before running tests');
  }
  
  return totalInvalid === 0;
}

main();
