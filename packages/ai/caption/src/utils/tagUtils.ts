/**
 * Tag Utilities
 *
 * Utilities for working with tags including parsing, validation, and formatting.
 */

export function splitAndCleanTags(tagString: string): string[] {
  if (!tagString || typeof tagString !== "string") {
    return [];
  }

  return tagString
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => cleanTag(tag));
}

export function cleanTag(tag: string): string {
  if (!tag || typeof tag !== "string") {
    return "";
  }

  return tag
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[^\w\s\-_]/g, "") // Remove special characters except word chars, spaces, hyphens, underscores
    .trim();
}

export function validateTag(tag: string): boolean {
  if (!tag || typeof tag !== "string") {
    return false;
  }

  const cleaned = cleanTag(tag);

  // Check if tag is empty after cleaning
  if (cleaned.length === 0) {
    return false;
  }

  // Check minimum length
  if (cleaned.length < 1) {
    return false;
  }

  // Check maximum length
  if (cleaned.length > 50) {
    return false;
  }

  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  if (!/^[\w\s\-_]+$/.test(cleaned)) {
    return false;
  }

  return true;
}

export function formatTags(tags: string[]): string {
  if (!Array.isArray(tags)) {
    return "";
  }

  return tags
    .filter(tag => validateTag(tag))
    .map(tag => cleanTag(tag))
    .join(", ");
}

export function removeDuplicateTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = cleanTag(tag);
    const normalized = cleaned.toLowerCase();

    if (cleaned && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(cleaned);
    }
  }

  return result;
}

export function sortTags(
  tags: string[],
  sortOrder: "alphabetical" | "length" | "frequency" = "alphabetical"
): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const cleanedTags = tags.map(tag => cleanTag(tag)).filter(tag => tag);

  switch (sortOrder) {
    case "alphabetical":
      return cleanedTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    case "length":
      return cleanedTags.sort((a, b) => a.length - b.length);

    case "frequency":
      const frequency = new Map<string, number>();
      for (const tag of cleanedTags) {
        const normalized = tag.toLowerCase();
        frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
      }
      return cleanedTags.sort((a, b) => {
        const freqA = frequency.get(a.toLowerCase()) || 0;
        const freqB = frequency.get(b.toLowerCase()) || 0;
        return freqB - freqA;
      });

    default:
      return cleanedTags;
  }
}

export function filterTags(tags: string[], query: string): string[] {
  if (!Array.isArray(tags) || !query) {
    return tags || [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  return tags.filter(tag => {
    const normalizedTag = tag.toLowerCase();
    return normalizedTag.includes(normalizedQuery);
  });
}

export function getTagSuggestions(tags: string[], query: string, maxSuggestions: number = 10): string[] {
  if (!Array.isArray(tags) || !query) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const suggestions = tags
    .filter(tag => {
      const normalizedTag = tag.toLowerCase();
      return normalizedTag.includes(normalizedQuery) && normalizedTag !== normalizedQuery;
    })
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();

      // Prioritize exact matches at the beginning
      const aStartsWith = aLower.startsWith(normalizedQuery);
      const bStartsWith = bLower.startsWith(normalizedQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Then sort by length (shorter first)
      return a.length - b.length;
    })
    .slice(0, maxSuggestions);

  return suggestions;
}

export function mergeTags(tags1: string[], tags2: string[]): string[] {
  const allTags = [...(tags1 || []), ...(tags2 || [])];
  return removeDuplicateTags(allTags);
}

export function getTagStats(tags: string[]): {
  total: number;
  unique: number;
  duplicates: number;
  averageLength: number;
  longestTag: string;
  shortestTag: string;
} {
  if (!Array.isArray(tags)) {
    return {
      total: 0,
      unique: 0,
      duplicates: 0,
      averageLength: 0,
      longestTag: "",
      shortestTag: "",
    };
  }

  const cleanedTags = tags.map(tag => cleanTag(tag)).filter(tag => tag);
  const uniqueTags = removeDuplicateTags(cleanedTags);

  const total = cleanedTags.length;
  const unique = uniqueTags.length;
  const duplicates = total - unique;

  const lengths = cleanedTags.map(tag => tag.length);
  const averageLength = lengths.length > 0 ? lengths.reduce((sum, len) => sum + len, 0) / lengths.length : 0;

  const longestTag = cleanedTags.reduce(
    (longest, current) => (current.length > longest.length ? current : longest),
    ""
  );

  const shortestTag = cleanedTags.reduce(
    (shortest, current) => (current.length < shortest.length ? current : shortest),
    cleanedTags[0] || ""
  );

  return {
    total,
    unique,
    duplicates,
    averageLength: Math.round(averageLength * 100) / 100,
    longestTag,
    shortestTag,
  };
}
