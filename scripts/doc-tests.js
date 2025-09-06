#!/usr/bin/env node

/**
 * Reynard Documentation Test Runner
 * 
 * This script manages documentation tests across all packages
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const PACKAGES = [
  { name: '@reynard/core', path: 'packages/core' },
  { name: '@reynard/components', path: 'packages/components' },
  { name: '@reynard/auth', path: 'packages/auth' },
  { name: '@reynard/chat', path: 'packages/chat' },
  { name: '@reynard/testing', path: 'packages/testing' },
  { name: '@reynard/algorithms', path: 'packages/algorithms' },
  { name: '@reynard/file-processing', path: 'packages/file-processing' }
];

function runCommand(command, cwd = process.cwd()) {
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

function generateDocTests() {
  console.log('🦊 Generating documentation test files...');
  
  // Run the testing package's doc-test-runner
  const success = runCommand('npm run doc-tests generate', 'packages/testing');
  
  if (success) {
    console.log('✅ Documentation test files generated successfully');
  } else {
    console.log('❌ Failed to generate documentation test files');
  }
  
  return success;
}

function validateDocs() {
  console.log('🦦 Validating documentation examples...');
  
  const success = runCommand('npm run doc-tests validate', 'packages/testing');
  
  if (success) {
    console.log('✅ Documentation validation completed');
  } else {
    console.log('❌ Documentation validation failed');
  }
  
  return success;
}

function runDocTests() {
  console.log('🐺 Running documentation tests...');
  
  const results = [];
  
  PACKAGES.forEach(pkg => {
    console.log(`\n🧪 Testing ${pkg.name}...`);
    
    const success = runCommand('npm run test:docs', pkg.path);
    results.push({ package: pkg.name, success });
    
    if (success) {
      console.log(`✅ ${pkg.name} documentation tests passed`);
    } else {
      console.log(`❌ ${pkg.name} documentation tests failed`);
    }
  });
  
  // Summary
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n📊 Documentation Test Summary:`);
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log(`\n❌ Failed packages:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.package}`);
    });
  }
  
  return failed === 0;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  console.log('🦊 Reynard Documentation Test Runner\n');
  
  let success = true;
  
  switch (command) {
    case 'generate':
      success = generateDocTests();
      break;
      
    case 'validate':
      success = validateDocs();
      break;
      
    case 'test':
      success = runDocTests();
      break;
      
    case 'all':
      console.log('Running all documentation test operations...\n');
      success = generateDocTests() && validateDocs() && runDocTests();
      break;
      
    default:
      console.log(`
Usage: npm run doc-tests <command>

Commands:
  generate    Generate documentation test files for all packages
  validate    Validate all documentation examples
  test        Run documentation tests for all packages
  all         Run all commands (generate, validate, test)

Examples:
  npm run doc-tests generate
  npm run doc-tests validate
  npm run doc-tests test
  npm run doc-tests all
`);
      return;
  }
  
  if (success) {
    console.log('\n🎉 All documentation test operations completed successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 Some documentation test operations failed!');
    process.exit(1);
  }
}

main();
