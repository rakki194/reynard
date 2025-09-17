/**
 * @fileoverview Package overview content generator
 */
import type { PackageInfo } from "../../config/types/package";
/**
 * Generates package overview content
 */
export declare class PackageOverviewGenerator {
    private readmeProcessor;
    constructor();
    /**
     * Generate package overview content
     */
    generateContent(packageInfo: PackageInfo): string;
    /**
     * Generate installation section
     */
    private generateInstallationSection;
    /**
     * Generate quick start section
     */
    private generateQuickStartSection;
    /**
     * Generate features section
     */
    private generateFeaturesSection;
    /**
     * Generate API section
     */
    private generateApiSection;
    /**
     * Generate examples section
     */
    private generateExamplesSection;
    /**
     * Generate links section
     */
    private generateLinksSection;
}
