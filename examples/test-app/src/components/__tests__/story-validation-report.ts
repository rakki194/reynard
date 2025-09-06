import { tutorialData } from '../ReynardAdventure';

// Function to validate tutorial data and generate a comprehensive report
export function generateTutorialValidationReport() {
  const report = {
    summary: {
      totalSections: 0,
      totalContent: 0,
      missingPrerequisites: 0,
      invalidStructure: 0,
      emptyContent: 0,
      invalidDifficulties: 0
    },
    issues: {
      missingPrerequisites: [] as string[],
      invalidStructure: [] as string[],
      emptyContent: [] as string[],
      invalidDifficulties: [] as string[]
    },
    sectionStats: {} as Record<string, { 
      contentCount: number; 
      hasCode: boolean; 
      hasText: boolean; 
      difficulty: string;
      estimatedTime: string;
    }>
  };

  // Get all section IDs
  const sectionIds = new Set(tutorialData.map(section => section.id));
  report.summary.totalSections = tutorialData.length;

  // Validate tutorial structure
  for (const section of tutorialData) {
    const sectionId = section.id;
    const contentCount = section.content ? section.content.length : 0;
    const hasCode = section.content ? section.content.some((c: any) => c.type === 'code') : false;
    const hasText = section.content ? section.content.some((c: any) => c.type === 'text') : false;
    
    report.summary.totalContent += contentCount;
    report.sectionStats[sectionId] = { 
      contentCount, 
      hasCode, 
      hasText, 
      difficulty: section.difficulty || 'unknown',
      estimatedTime: section.estimatedTime || 'unknown'
    };

    // Validate prerequisites
    if (section.prerequisites && Array.isArray(section.prerequisites)) {
      for (const prereq of section.prerequisites) {
        if (!sectionIds.has(prereq)) {
          report.issues.missingPrerequisites.push(
            `Section "${sectionId}" has prerequisite "${prereq}" that does not exist`
          );
        }
      }
    }

    // Validate structure
    const requiredFields = ['id', 'title', 'description', 'content', 'estimatedTime', 'difficulty'];
    for (const field of requiredFields) {
      if (!(field in section)) {
        report.issues.invalidStructure.push(
          `Section "${sectionId}" is missing required field "${field}"`
        );
      }
    }

    // Validate content
    if (section.content && Array.isArray(section.content)) {
      for (const [contentIndex, content] of section.content.entries()) {
        if (!content.content || content.content.trim().length === 0) {
          report.issues.emptyContent.push(
            `Section "${sectionId}" content ${contentIndex} is empty`
          );
        }
      }
    } else {
      report.issues.invalidStructure.push(
        `Section "${sectionId}" has no content or content is not an array`
      );
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (section.difficulty && !validDifficulties.includes(section.difficulty)) {
      report.issues.invalidDifficulties.push(
        `Section "${sectionId}" has invalid difficulty "${section.difficulty}"`
      );
    }
  }

  report.summary.missingPrerequisites = report.issues.missingPrerequisites.length;
  report.summary.invalidStructure = report.issues.invalidStructure.length;
  report.summary.emptyContent = report.issues.emptyContent.length;
  report.summary.invalidDifficulties = report.issues.invalidDifficulties.length;

  // Validate estimated times
  for (const section of tutorialData) {
    if (section.estimatedTime) {
      const timeMatch = section.estimatedTime.match(/(\d+)\s*(minute|hour)s?/i);
      if (!timeMatch) {
        report.issues.invalidStructure.push(
          `Section "${section.id}" has invalid estimated time format: "${section.estimatedTime}"`
        );
      }
    }
  }

  return report;
}

// Function to print a formatted report
export function printTutorialValidationReport() {
  const report = generateTutorialValidationReport();
  
  console.log('\n=== REYNARD TUTORIAL VALIDATION REPORT ===\n');
  
  console.log('SUMMARY:');
  console.log(`  Total Sections: ${report.summary.totalSections}`);
  console.log(`  Total Content Items: ${report.summary.totalContent}`);
  console.log(`  Missing Prerequisites: ${report.summary.missingPrerequisites}`);
  console.log(`  Invalid Structure: ${report.summary.invalidStructure}`);
  console.log(`  Empty Content: ${report.summary.emptyContent}`);
  console.log(`  Invalid Difficulties: ${report.summary.invalidDifficulties}`);
  
  if (report.issues.missingPrerequisites.length > 0) {
    console.log('\nMISSING PREREQUISITES:');
    report.issues.missingPrerequisites.slice(0, 10).forEach(error => {
      console.log(`  ❌ ${error}`);
    });
    if (report.issues.missingPrerequisites.length > 10) {
      console.log(`  ... and ${report.issues.missingPrerequisites.length - 10} more`);
    }
  }
  
  if (report.issues.invalidStructure.length > 0) {
    console.log('\nINVALID STRUCTURE:');
    report.issues.invalidStructure.slice(0, 10).forEach(error => {
      console.log(`  ❌ ${error}`);
    });
    if (report.issues.invalidStructure.length > 10) {
      console.log(`  ... and ${report.issues.invalidStructure.length - 10} more`);
    }
  }
  
  if (report.issues.emptyContent.length > 0) {
    console.log('\nEMPTY CONTENT:');
    report.issues.emptyContent.slice(0, 10).forEach(error => {
      console.log(`  ❌ ${error}`);
    });
    if (report.issues.emptyContent.length > 10) {
      console.log(`  ... and ${report.issues.emptyContent.length - 10} more`);
    }
  }
  
  if (report.issues.invalidDifficulties.length > 0) {
    console.log('\nINVALID DIFFICULTIES:');
    report.issues.invalidDifficulties.forEach(error => {
      console.log(`  ❌ ${error}`);
    });
  }
  
  console.log('\n=== END REPORT ===\n');
  
  return report;
}

// Run the report if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  printTutorialValidationReport();
}
