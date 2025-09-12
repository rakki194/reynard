/**
 * NLWeb Router Scoring Core
 *
 * Core scoring logic for the NLWeb router.
 */

import { NLWebTool, NLWebContext } from "../types/index.js";

export interface ToolScore {
  tool: NLWebTool;
  score: number;
  reasoning: string;
}

/**
 * Score tool based on query
 */
export function scoreTool(
  tool: NLWebTool,
  query: string,
  context: NLWebContext,
): ToolScore {
  const normalizedQuery = query.toLowerCase();
  let score = 0;
  const reasoning: string[] = [];

  // Base score from tool priority
  score += tool.priority * 0.1;
  reasoning.push(`Base priority: ${tool.priority}`);

  // Name matching
  if (tool.name.toLowerCase().includes(normalizedQuery)) {
    score += 40;
    reasoning.push("Tool name matches query");
  }

  // Description matching
  const descriptionWords = tool.description.toLowerCase().split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);
  const matchingWords = queryWords.filter((word) =>
    descriptionWords.includes(word),
  );

  if (matchingWords.length > 0) {
    score += matchingWords.length * 10;
    reasoning.push(`Description matches: ${matchingWords.join(", ")}`);
  }

  // Tag matching
  if (tool.tags) {
    const matchingTags = tool.tags.filter((tag) =>
      normalizedQuery.includes(tag.toLowerCase()),
    );
    if (matchingTags.length > 0) {
      score += matchingTags.length * 15;
      reasoning.push(`Tag matches: ${matchingTags.join(", ")}`);
    }
  }

  // Context relevance
  if (context.userPreferences?.preferredTools?.includes(tool.name)) {
    score += 20;
    reasoning.push("User preference match");
  }

  // Category relevance
  if (context.applicationState?.currentCategory === tool.category) {
    score += 15;
    reasoning.push("Category relevance");
  }

  return {
    tool,
    score: Math.max(0, Math.min(100, score)),
    reasoning: reasoning.join("; "),
  };
}
