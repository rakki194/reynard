#!/usr/bin/env node

/**
 * Demo script showing the documentation testing system in action
 */

import { execSync } from 'child_process';

console.log('🦊🦦🐺 Reynard Documentation Testing System Demo\n');

console.log('🦊 The fox has strategically designed a system to test documentation examples...');
console.log('🦦 The otter playfully explores each code example to ensure it works...');
console.log('🐺 The wolf adversarially validates that all examples are bulletproof...\n');

console.log('📚 Running documentation tests for reynard-core...\n');

try {
  // Run the documentation tests
  execSync('cd packages/core && npm run test:docs', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Documentation tests passed!');
  console.log('🎉 All code examples in the documentation are working correctly!');
  console.log('\n🦊 Strategic: Examples are automatically validated');
  console.log('🦦 Playful: Testing documentation is now fun and interactive');
  console.log('🐺 Adversarial: Broken examples are caught before they reach users');
  
} catch (error) {
  console.log('\n❌ Documentation tests failed!');
  console.log('This means some examples in the documentation need to be fixed.');
  console.log('The system is working - it caught broken examples! 🐺');
}

console.log('\n🚀 To run documentation tests for all packages:');
console.log('   npm run doc-tests');
console.log('\n📖 To learn more about the system:');
console.log('   See DOCUMENTATION_TESTING.md');
