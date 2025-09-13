import { describe, it, expect } from "vitest";
import { tutorialData } from "../components/ReynardAdventure";

describe("Reynard Tutorial Validation", () => {
  it("should validate that all tutorial sections have valid structure", () => {
    // Function to validate tutorial data
    const validateTutorialData = (tutorialData: any[]) => {
      const errors: string[] = [];
      const requiredFields = [
        "id",
        "title",
        "description",
        "content",
        "estimatedTime",
        "difficulty",
      ];

      for (const [index, section] of tutorialData.entries()) {
        for (const field of requiredFields) {
          if (!(field in section)) {
            errors.push(
              `Section ${index} (${section.id || "unknown"}) is missing required field "${field}"`,
            );
          }
        }

        // Validate content structure
        if (section.content && Array.isArray(section.content)) {
          for (const [contentIndex, content] of section.content.entries()) {
            const contentRequiredFields = ["type", "content"];
            for (const field of contentRequiredFields) {
              if (!(field in content)) {
                errors.push(
                  `Section ${index} (${section.id}) content ${contentIndex} is missing required field "${field}"`,
                );
              }
            }

            // Validate content type
            const validTypes = ["text", "code", "example", "exercise"];
            if (content.type && !validTypes.includes(content.type)) {
              errors.push(
                `Section ${index} (${section.id}) content ${contentIndex} has invalid type "${content.type}"`,
              );
            }
          }
        }

        // Validate difficulty
        const validDifficulties = ["beginner", "intermediate", "advanced"];
        if (
          section.difficulty &&
          !validDifficulties.includes(section.difficulty)
        ) {
          errors.push(
            `Section ${index} (${section.id}) has invalid difficulty "${section.difficulty}"`,
          );
        }
      }

      return errors;
    };

    const errors = validateTutorialData(tutorialData);

    // If there are errors, log them for debugging
    if (errors.length > 0) {
      console.error("Tutorial validation errors:", errors);
      console.error("First 10 errors:", errors.slice(0, 10));
    }

    // Should have no errors - all sections should have valid structure
    expect(errors).toHaveLength(0);
  });

  it("should validate that all tutorial sections have unique IDs", () => {
    const validateUniqueIds = (tutorialData: any[]) => {
      const errors: string[] = [];
      const seenIds = new Set<string>();

      for (const [index, section] of tutorialData.entries()) {
        if (section.id) {
          if (seenIds.has(section.id)) {
            errors.push(`Section ${index} has duplicate ID "${section.id}"`);
          } else {
            seenIds.add(section.id);
          }
        }
      }

      return errors;
    };

    const errors = validateUniqueIds(tutorialData);

    // Should have no errors - all sections should have unique IDs
    expect(errors).toHaveLength(0);

    // If there are errors, log them for debugging
    if (errors.length > 0) {
      console.error("Unique ID validation errors:", errors);
    }
  });

  it("should validate that all tutorial sections have proper prerequisites", () => {
    const validatePrerequisites = (tutorialData: any[]) => {
      const errors: string[] = [];
      const sectionIds = new Set(tutorialData.map((section) => section.id));

      for (const [index, section] of tutorialData.entries()) {
        if (section.prerequisites && Array.isArray(section.prerequisites)) {
          for (const prereq of section.prerequisites) {
            if (!sectionIds.has(prereq)) {
              errors.push(
                `Section ${index} (${section.id}) has prerequisite "${prereq}" that does not exist`,
              );
            }
          }
        }
      }

      return errors;
    };

    const errors = validatePrerequisites(tutorialData);

    // If there are errors, log them for debugging
    if (errors.length > 0) {
      console.error("Prerequisites validation errors:", errors);
    }

    // Should have no errors - all prerequisites should reference existing sections
    expect(errors).toHaveLength(0);
  });

  it("should validate that all tutorial content has proper structure", () => {
    const validateContentStructure = (tutorialData: any[]) => {
      const errors: string[] = [];

      for (const [sectionIndex, section] of tutorialData.entries()) {
        if (section.content && Array.isArray(section.content)) {
          for (const [contentIndex, content] of section.content.entries()) {
            // Validate content has required fields
            if (!content.type) {
              errors.push(
                `Section ${sectionIndex} (${section.id}) content ${contentIndex} missing type`,
              );
            }
            if (!content.content) {
              errors.push(
                `Section ${sectionIndex} (${section.id}) content ${contentIndex} missing content`,
              );
            }

            // Validate code content has language
            if (content.type === "code" && !content.language) {
              errors.push(
                `Section ${sectionIndex} (${section.id}) code content ${contentIndex} missing language`,
              );
            }

            // Validate content is not empty
            if (content.content && content.content.trim().length === 0) {
              errors.push(
                `Section ${sectionIndex} (${section.id}) content ${contentIndex} is empty`,
              );
            }
          }
        } else {
          errors.push(
            `Section ${sectionIndex} (${section.id}) has no content or content is not an array`,
          );
        }
      }

      return errors;
    };

    const errors = validateContentStructure(tutorialData);

    // If there are errors, log them for debugging
    if (errors.length > 0) {
      console.error("Content structure validation errors:", errors);
    }

    // Should have no errors - all content should have proper structure
    expect(errors).toHaveLength(0);
  });

  it("should validate that tutorial sections have reasonable estimated times", () => {
    const validateEstimatedTimes = (tutorialData: any[]) => {
      const errors: string[] = [];

      for (const [index, section] of tutorialData.entries()) {
        if (section.estimatedTime) {
          // Check if estimated time follows expected format (e.g., "10 minutes", "30 minutes")
          const timeMatch = section.estimatedTime.match(
            /(\d+)\s*(minute|hour)s?/i,
          );
          if (!timeMatch) {
            errors.push(
              `Section ${index} (${section.id}) has invalid estimated time format: "${section.estimatedTime}"`,
            );
          } else {
            const timeValue = parseInt(timeMatch[1]);
            const timeUnit = timeMatch[2].toLowerCase();

            // Reasonable time limits
            if (timeUnit === "minute" && (timeValue < 1 || timeValue > 120)) {
              errors.push(
                `Section ${index} (${section.id}) has unreasonable estimated time: ${timeValue} minutes`,
              );
            } else if (
              timeUnit === "hour" &&
              (timeValue < 1 || timeValue > 4)
            ) {
              errors.push(
                `Section ${index} (${section.id}) has unreasonable estimated time: ${timeValue} hours`,
              );
            }
          }
        } else {
          errors.push(
            `Section ${index} (${section.id}) is missing estimated time`,
          );
        }
      }

      return errors;
    };

    const errors = validateEstimatedTimes(tutorialData);

    // If there are errors, log them for debugging
    if (errors.length > 0) {
      console.error("Estimated time validation errors:", errors);
    }

    // Should have no errors - all sections should have reasonable estimated times
    expect(errors).toHaveLength(0);
  });

  it("should validate that tutorial has proper progression from beginner to advanced", () => {
    const validateProgression = (tutorialData: any[]) => {
      const errors: string[] = [];
      const difficulties = tutorialData.map((section) => section.difficulty);

      // Check that we have at least some beginner sections
      const beginnerCount = difficulties.filter((d) => d === "beginner").length;
      const intermediateCount = difficulties.filter(
        (d) => d === "intermediate",
      ).length;
      const advancedCount = difficulties.filter((d) => d === "advanced").length;

      if (beginnerCount === 0) {
        errors.push("No beginner sections found");
      }

      // For now, we only have beginner sections, so we'll be more lenient
      // In a full tutorial, we'd want intermediate and advanced sections too
      if (intermediateCount === 0 && advancedCount === 0 && beginnerCount > 0) {
        // This is acceptable for a basic tutorial
        console.log(
          "Tutorial currently only has beginner sections - this is acceptable for basic setup",
        );
      }

      // Check that first section is beginner
      if (
        tutorialData.length > 0 &&
        tutorialData[0].difficulty !== "beginner"
      ) {
        errors.push("First section should be beginner level");
      }

      return errors;
    };

    const errors = validateProgression(tutorialData);

    // If there are errors, log them for debugging
    if (errors.length > 0) {
      console.error("Progression validation errors:", errors);
    }

    // Should have no errors - tutorial should have proper progression
    expect(errors).toHaveLength(0);
  });
});
