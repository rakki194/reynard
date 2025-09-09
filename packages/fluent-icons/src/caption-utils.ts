/**
 * Natural Language Caption Utilities
 *
 * Utility functions for generating, managing, and working with natural language captions
 * for icons in the Reynard icon system.
 */

import type { IconMetadata } from "./types";

/**
 * Generate a natural language caption for an icon based on its metadata
 *
 * @param metadata - The icon metadata containing name, tags, and description
 * @returns A natural language caption describing the icon's purpose and appearance
 */
export function generateCaption(metadata: IconMetadata): string {
  const { name, tags = [] } = metadata;

  // If caption already exists, return it
  if (metadata.caption) {
    return metadata.caption;
  }

  // Generate caption based on available information
  const category = tags[0] || "icon";
  const action = tags[1] || "";
  const modifier = tags[2] || "";

  // Build caption based on icon name and tags
  let caption = `A ${name} icon`;

  if (action) {
    caption += ` for ${action}`;
  }

  if (modifier) {
    caption += ` or ${modifier}`;
  }

  // Add category context
  if (category !== "icon") {
    caption += ` representing ${category} functionality`;
  }

  return caption;
}

/**
 * Search for icons by natural language description
 *
 * @param icons - Object containing icon data
 * @param query - Natural language search query
 * @returns Array of matching icon names and their captions
 */
export function searchIconsByCaption<
  T extends Record<string, { metadata: IconMetadata }>,
>(
  icons: T,
  query: string,
): Array<{ name: string; caption: string; score: number }> {
  const searchTerms = query.toLowerCase().split(/\s+/);
  const results: Array<{ name: string; caption: string; score: number }> = [];

  for (const [name, iconData] of Object.entries(icons)) {
    const caption =
      iconData.metadata.caption || generateCaption(iconData.metadata);
    const captionLower = caption.toLowerCase();
    const nameLower = name.toLowerCase();

    let score = 0;

    // Check for exact matches in caption
    for (const term of searchTerms) {
      if (captionLower.includes(term)) {
        score += 10;
      }
      if (nameLower.includes(term)) {
        score += 5;
      }
    }

    // Check for partial matches
    for (const term of searchTerms) {
      if (captionLower.includes(term.substring(0, 3))) {
        score += 2;
      }
    }

    if (score > 0) {
      results.push({ name, caption, score });
    }
  }

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get all captions for a set of icons
 *
 * @param icons - Object containing icon data
 * @returns Object mapping icon names to their captions
 */
export function getAllCaptions<
  T extends Record<string, { metadata: IconMetadata }>,
>(icons: T): Record<string, string> {
  const captions: Record<string, string> = {};

  for (const [name, iconData] of Object.entries(icons)) {
    captions[name] =
      iconData.metadata.caption || generateCaption(iconData.metadata);
  }

  return captions;
}

/**
 * Validate that an icon has a proper caption
 *
 * @param metadata - The icon metadata to validate
 * @returns True if the icon has a valid caption, false otherwise
 */
export function validateCaption(metadata: IconMetadata): boolean {
  if (!metadata.caption) {
    return false;
  }

  // Check if caption is meaningful (not just the name)
  const caption = metadata.caption.toLowerCase();
  const name = metadata.name.toLowerCase();

  // Caption should be more descriptive than just the name
  return caption.length > name.length + 10;
}

/**
 * Suggest improvements for an icon caption
 *
 * @param metadata - The icon metadata to analyze
 * @returns Array of suggestions for improving the caption
 */
export function suggestCaptionImprovements(metadata: IconMetadata): string[] {
  const suggestions: string[] = [];

  if (!metadata.caption) {
    suggestions.push(
      "Add a natural language caption describing the icon's purpose",
    );
    return suggestions;
  }

  const caption = metadata.caption;

  // Check for common issues
  if (caption.length < 20) {
    suggestions.push("Caption could be more descriptive");
  }

  if (!caption.includes("icon")) {
    suggestions.push("Consider mentioning that this is an icon");
  }

  if (!caption.includes("for") && !caption.includes("representing")) {
    suggestions.push("Consider explaining what the icon is used for");
  }

  if (caption === metadata.description) {
    suggestions.push(
      "Caption should be more detailed than the basic description",
    );
  }

  return suggestions;
}

/**
 * Generate captions for all icons in a category that don't have them
 *
 * @param icons - Object containing icon data
 * @returns Object with generated captions for icons that were missing them
 */
export function generateMissingCaptions<
  T extends Record<string, { metadata: IconMetadata }>,
>(icons: T): Record<string, string> {
  const generated: Record<string, string> = {};

  for (const [name, iconData] of Object.entries(icons)) {
    if (!iconData.metadata.caption) {
      generated[name] = generateCaption(iconData.metadata);
    }
  }

  return generated;
}

/**
 * Export captions to a format suitable for AI/LLM consumption
 *
 * @param icons - Object containing icon data
 * @param format - Output format ('json' | 'markdown' | 'text')
 * @returns Formatted string containing all captions
 */
export function exportCaptions<
  T extends Record<string, { metadata: IconMetadata }>,
>(icons: T, format: "json" | "markdown" | "text" = "json"): string {
  const captions = getAllCaptions(icons);

  switch (format) {
    case "json":
      return JSON.stringify(captions, null, 2);

    case "markdown":
      let markdown = "# Icon Captions\n\n";
      for (const [name, caption] of Object.entries(captions)) {
        markdown += `## ${name}\n${caption}\n\n`;
      }
      return markdown;

    case "text":
      let text = "Icon Captions:\n\n";
      for (const [name, caption] of Object.entries(captions)) {
        text += `${name}: ${caption}\n`;
      }
      return text;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
