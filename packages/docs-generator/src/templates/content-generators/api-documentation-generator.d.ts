/**
 * @fileoverview API documentation content generator
 */
import type { PackageInfo } from "../../config/types/package";
/**
 * Generates API documentation content
 */
export declare class ApiDocumentationGenerator {
    /**
     * Generate API page content
     */
    generateContent(packageInfo: PackageInfo): string;
    /**
     * Generate API documentation for a single API
     */
    private generateApiDocumentation;
    /**
     * Generate parameters section
     */
    private generateParametersSection;
    /**
     * Generate examples section
     */
    private generateExamplesSection;
    /**
     * Group APIs by type
     */
    private groupApisByType;
    /**
     * Capitalize first letter
     */
    private capitalize;
}
