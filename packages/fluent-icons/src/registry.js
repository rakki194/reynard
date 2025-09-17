/**
 * Icon Registry
 *
 * Central registry for managing multiple icon packages
 * in the Reynard design system.
 */
class ReynardIconRegistry {
    constructor() {
        Object.defineProperty(this, "packages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    register(pkg) {
        if (this.packages.has(pkg.id)) {
            console.warn(`Icon package '${pkg.id}' is already registered. Overwriting.`);
        }
        this.packages.set(pkg.id, pkg);
    }
    unregister(packageId) {
        this.packages.delete(packageId);
    }
    getIcon(name, packageId) {
        if (packageId) {
            const pkg = this.packages.get(packageId);
            return pkg?.getIcon(name) || null;
        }
        // Search all packages for the icon
        for (const pkg of this.packages.values()) {
            const icon = pkg.getIcon(name);
            if (icon) {
                return icon;
            }
        }
        return null;
    }
    getAllIconNames() {
        const allNames = new Set();
        for (const pkg of this.packages.values()) {
            const names = pkg.getIconNames();
            names.forEach((name) => allNames.add(name));
        }
        return Array.from(allNames);
    }
    getPackages() {
        return Array.from(this.packages.values());
    }
    searchIcons(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        for (const pkg of this.packages.values()) {
            const iconNames = pkg.getIconNames();
            for (const name of iconNames) {
                let score = 0;
                // Exact match gets highest score
                if (name === lowerQuery) {
                    score = 100;
                }
                // Starts with query gets high score
                else if (name.startsWith(lowerQuery)) {
                    score = 80;
                }
                // Contains query gets medium score
                else if (name.includes(lowerQuery)) {
                    score = 60;
                }
                // Check metadata keywords
                else if (pkg.getIconMetadata) {
                    const metadata = pkg.getIconMetadata(name);
                    if (metadata?.keywords) {
                        const keywordMatch = metadata.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery));
                        if (keywordMatch) {
                            score = 40;
                        }
                    }
                }
                if (score > 0) {
                    results.push({
                        name,
                        packageId: pkg.id,
                        packageName: pkg.name,
                        metadata: pkg.getIconMetadata?.(name) || undefined,
                        score,
                    });
                }
            }
        }
        // Sort by score (highest first)
        return results.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
}
// Global registry instance
export const iconRegistry = new ReynardIconRegistry();
// Convenience functions
export const registerIconPackage = (pkg) => iconRegistry.register(pkg);
export const unregisterIconPackage = (packageId) => iconRegistry.unregister(packageId);
export const getIcon = (name, packageId) => iconRegistry.getIcon(name, packageId);
export const getAllIconNames = () => iconRegistry.getAllIconNames();
export const getIconPackages = () => iconRegistry.getPackages();
export const searchIcons = (query) => iconRegistry.searchIcons(query);
