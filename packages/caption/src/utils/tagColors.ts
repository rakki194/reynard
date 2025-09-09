/**
 * Tag Color Utilities
 *
 * Utilities for generating consistent colors for tags.
 */

export interface TagColor {
  background: string;
  text: string;
  border: string;
}

export class TagColorGenerator {
  private colors: TagColor[] = [
    { background: "#e3f2fd", text: "#1976d2", border: "#bbdefb" },
    { background: "#f3e5f5", text: "#7b1fa2", border: "#e1bee7" },
    { background: "#e8f5e8", text: "#388e3c", border: "#c8e6c9" },
    { background: "#fff3e0", text: "#f57c00", border: "#ffcc02" },
    { background: "#fce4ec", text: "#c2185b", border: "#f8bbd9" },
    { background: "#e0f2f1", text: "#00796b", border: "#b2dfdb" },
    { background: "#f1f8e9", text: "#689f38", border: "#dcedc8" },
    { background: "#fff8e1", text: "#ffa000", border: "#ffecb3" },
    { background: "#e3f2fd", text: "#0288d1", border: "#b3e5fc" },
    { background: "#f3e5f5", text: "#8e24aa", border: "#e1bee7" },
    { background: "#e8f5e8", text: "#43a047", border: "#c8e6c9" },
    { background: "#fff3e0", text: "#fb8c00", border: "#ffcc02" },
    { background: "#fce4ec", text: "#e91e63", border: "#f8bbd9" },
    { background: "#e0f2f1", text: "#00acc1", border: "#b2dfdb" },
    { background: "#f1f8e9", text: "#7cb342", border: "#dcedc8" },
    { background: "#fff8e1", text: "#ffb300", border: "#ffecb3" },
  ];

  private usedColors = new Map<string, number>();

  getColor(tag: string): TagColor {
    const normalizedTag = tag.toLowerCase().trim();

    if (this.usedColors.has(normalizedTag)) {
      const index = this.usedColors.get(normalizedTag)!;
      return this.colors[index % this.colors.length];
    }

    // Find the least used color
    let leastUsedIndex = 0;
    let leastUsedCount = Infinity;

    for (let i = 0; i < this.colors.length; i++) {
      const count = Array.from(this.usedColors.values()).filter(
        (v) => v === i,
      ).length;
      if (count < leastUsedCount) {
        leastUsedCount = count;
        leastUsedIndex = i;
      }
    }

    this.usedColors.set(normalizedTag, leastUsedIndex);
    return this.colors[leastUsedIndex];
  }

  getColorByIndex(index: number): TagColor {
    return this.colors[index % this.colors.length];
  }

  reset(): void {
    this.usedColors.clear();
  }

  getUsedColors(): Map<string, number> {
    return new Map(this.usedColors);
  }
}

export function createTagColorGenerator(): TagColorGenerator {
  return new TagColorGenerator();
}

export function getTagColor(tag: string): TagColor {
  const generator = createTagColorGenerator();
  return generator.getColor(tag);
}
