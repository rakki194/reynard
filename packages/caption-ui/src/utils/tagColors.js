/**
 * Tag Color Utilities
 *
 * Advanced OKLCH-based color generation for tags with intensity control
 * and theme integration. Leverages Reynard's existing OKLCH color system.
 */
export class TagColorGenerator {
    constructor() {
        Object.defineProperty(this, "usedColors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "baseHues", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [240, 300, 120, 60, 0, 180, 30, 270, 150, 90, 210, 330]
        }); // OKLCH hue values
    }
    getColor(tag, options = {}) {
        const normalizedTag = tag.toLowerCase().trim();
        const { intensity = 1.0, variant = "default" } = options;
        // Get consistent hue for this tag
        const hue = this.getTagHue(normalizedTag);
        // Generate OKLCH color with intensity control
        const baseColor = this.generateOKLCHColor(hue, intensity, variant);
        return {
            background: this.oklchToCSS(baseColor.l, baseColor.c, baseColor.h),
            text: this.oklchToCSS(Math.max(0, baseColor.l - 40), Math.min(0.3, baseColor.c + 0.1), baseColor.h),
            border: this.oklchToCSS(baseColor.l - 10, baseColor.c, baseColor.h),
            hover: this.oklchToCSS(Math.min(100, baseColor.l + 5), baseColor.c, baseColor.h),
            active: this.oklchToCSS(Math.max(0, baseColor.l - 5), baseColor.c, baseColor.h),
            focus: this.oklchToCSS(baseColor.l, Math.min(0.4, baseColor.c + 0.15), baseColor.h),
        };
    }
    getTagHue(tag) {
        if (this.usedColors.has(tag)) {
            const index = this.usedColors.get(tag);
            return this.baseHues[index % this.baseHues.length];
        }
        // Find the least used hue
        let leastUsedIndex = 0;
        let leastUsedCount = Infinity;
        for (let i = 0; i < this.baseHues.length; i++) {
            const count = Array.from(this.usedColors.values()).filter(v => v === i).length;
            if (count < leastUsedCount) {
                leastUsedCount = count;
                leastUsedIndex = i;
            }
        }
        this.usedColors.set(tag, leastUsedIndex);
        return this.baseHues[leastUsedIndex];
    }
    generateOKLCHColor(hue, intensity, variant) {
        const baseLightness = 70;
        const baseChroma = 0.15;
        let lightness = baseLightness;
        let chroma = baseChroma * intensity;
        // Adjust for variant
        switch (variant) {
            case "muted":
                chroma *= 0.6;
                lightness += 5;
                break;
            case "vibrant":
                chroma *= 1.4;
                lightness -= 5;
                break;
        }
        return {
            l: Math.max(20, Math.min(90, lightness)),
            c: Math.max(0.05, Math.min(0.4, chroma)),
            h: hue,
        };
    }
    oklchToCSS(l, c, h) {
        return `oklch(${l}% ${c} ${h})`;
    }
    getColorByIndex(index, options = {}) {
        const hue = this.baseHues[index % this.baseHues.length];
        const baseColor = this.generateOKLCHColor(hue, options.intensity || 1.0, options.variant || "default");
        return {
            background: this.oklchToCSS(baseColor.l, baseColor.c, baseColor.h),
            text: this.oklchToCSS(Math.max(0, baseColor.l - 40), Math.min(0.3, baseColor.c + 0.1), baseColor.h),
            border: this.oklchToCSS(baseColor.l - 10, baseColor.c, baseColor.h),
            hover: this.oklchToCSS(Math.min(100, baseColor.l + 5), baseColor.c, baseColor.h),
            active: this.oklchToCSS(Math.max(0, baseColor.l - 5), baseColor.c, baseColor.h),
            focus: this.oklchToCSS(baseColor.l, Math.min(0.4, baseColor.c + 0.15), baseColor.h),
        };
    }
    reset() {
        this.usedColors.clear();
    }
    getUsedColors() {
        return new Map(this.usedColors);
    }
}
export function createTagColorGenerator() {
    return new TagColorGenerator();
}
export function getTagColor(tag) {
    const generator = createTagColorGenerator();
    return generator.getColor(tag);
}
