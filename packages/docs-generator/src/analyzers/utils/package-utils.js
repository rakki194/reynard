import { promises as fs } from "fs";
import path from "path";
export async function readPackageJson(packageJsonPath) {
    const content = await fs.readFile(packageJsonPath, "utf-8");
    return JSON.parse(content);
}
export async function readFileIfExists(filePath) {
    try {
        return await fs.readFile(filePath, "utf-8");
    }
    catch {
        return undefined;
    }
}
export function extractDisplayName(packageJson) {
    return (packageJson.displayName ||
        packageJson.title ||
        formatPackageName(packageJson.name));
}
function formatPackageName(name) {
    const nameWithoutScope = name.replace(/^@[^/]+\//, "");
    return nameWithoutScope
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
export async function extractExports(_packagePath, packageJson) {
    const result = {};
    if (packageJson.exports) {
        for (const [key, value] of Object.entries(packageJson.exports)) {
            if (typeof value === "string") {
                result[key] = value;
            }
            else if (typeof value === "object" && value !== null) {
                const exportValue = value;
                if (exportValue.import)
                    result[key] = exportValue.import;
                else if (exportValue.require)
                    result[key] = exportValue.require;
                else if (exportValue.default)
                    result[key] = exportValue.default;
            }
        }
    }
    else {
        if (packageJson.main)
            result["."] = packageJson.main;
        if (packageJson.module)
            result["./module"] = packageJson.module;
        if (packageJson.types)
            result["./types"] = packageJson.types;
    }
    return result;
}
export async function extractTypes(packagePath, packageJson) {
    const result = {};
    if (packageJson.types)
        result["."] = packageJson.types;
    if (packageJson.exports) {
        for (const [key, value] of Object.entries(packageJson.exports)) {
            if (typeof value === "object" && value !== null && value.types) {
                result[key] = value.types;
            }
        }
    }
    try {
        const distPath = path.join(packagePath, "dist");
        const distExists = await fs
            .access(distPath)
            .then(() => true)
            .catch(() => false);
        if (distExists) {
            const typeFiles = await findTypeFiles(distPath);
            for (const typeFile of typeFiles) {
                const relativePath = path.relative(distPath, typeFile);
                const exportKey = `./${relativePath.replace(/\.d\.ts$/, "")}`;
                result[exportKey] = relativePath;
            }
        }
    }
    catch {
        // ignore
    }
    return result;
}
async function findTypeFiles(dir) {
    const files = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const subFiles = await findTypeFiles(fullPath);
                files.push(...subFiles);
            }
            else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
                files.push(fullPath);
            }
        }
    }
    catch {
        // ignore
    }
    return files;
}
