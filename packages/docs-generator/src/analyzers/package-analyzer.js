/**
 * @fileoverview Package analyzer for extracting package information
 */
import { readPackageJson, readFileIfExists, extractDisplayName, extractExports, extractTypes, } from "./utils/package-utils";
/**
 * Analyzes a package directory and extracts information
 */
export class PackageAnalyzer {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = config;
    }
    /**
     * Analyze a package directory
     */
    async analyze(packagePath) {
        const packageJsonPath = `${packagePath}/package.json`;
        const readmePath = `${packagePath}/README.md`;
        const changelogPath = `${packagePath}/CHANGELOG.md`;
        // Read package.json
        const packageJson = await readPackageJson(packageJsonPath);
        // Read README if it exists
        const readme = await readFileIfExists(readmePath);
        // Read CHANGELOG if it exists
        const changelog = await readFileIfExists(changelogPath);
        // Extract exports and types
        const exports = await extractExports(packagePath, packageJson);
        const types = await extractTypes(packagePath, packageJson);
        return {
            name: packageJson.name,
            displayName: extractDisplayName(packageJson),
            description: packageJson.description || "",
            version: packageJson.version || "0.0.0",
            path: packagePath,
            category: this.config.category || "Other",
            keywords: packageJson.keywords || [],
            dependencies: Object.keys(packageJson.dependencies || {}),
            peerDependencies: Object.keys(packageJson.peerDependencies || {}),
            devDependencies: Object.keys(packageJson.devDependencies || {}),
            exports,
            types,
            api: [], // Will be populated by TypeScript analyzer
            examples: [], // Will be populated by example analyzer
            readme,
            changelog,
            license: packageJson.license,
            repository: packageJson.repository,
            homepage: packageJson.homepage,
            bugs: packageJson.bugs,
            author: packageJson.author,
            contributors: packageJson.contributors,
        };
    }
}
