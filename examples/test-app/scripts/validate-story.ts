#!/usr/bin/env tsx

import { printStoryValidationReport } from '../src/components/__tests__/story-validation-report.js';

console.log('Running Reynard Adventure Story Validation...\n');

const report = printStoryValidationReport();

// Exit with error code if there are issues
if (report.summary.missingScenes > 0 || report.summary.unreachableScenes > 0 || report.summary.circularReferences > 0) {
  console.log('❌ Story validation failed! Please fix the issues above.');
  process.exit(1);
} else {
  console.log('✅ Story validation passed! All choices point to existing scenes.');
  process.exit(0);
}
