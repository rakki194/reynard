/**
 * Tool Validator
 *
 * Validates NLWeb tools before registration to ensure they meet all requirements.
 */
/**
 * Validates a tool before registration
 */
export function validateTool(tool) {
    if (!tool.name || typeof tool.name !== "string") {
        throw new Error("Tool name is required and must be a string");
    }
    if (!tool.description || typeof tool.description !== "string") {
        throw new Error("Tool description is required and must be a string");
    }
    if (!tool.category || typeof tool.category !== "string") {
        throw new Error("Tool category is required and must be a string");
    }
    if (!Array.isArray(tool.tags)) {
        throw new Error("Tool tags must be an array");
    }
    if (!tool.path || typeof tool.path !== "string") {
        throw new Error("Tool path is required and must be a string");
    }
    if (!["GET", "POST", "PUT", "DELETE"].includes(tool.method)) {
        throw new Error("Tool method must be one of: GET, POST, PUT, DELETE");
    }
    if (!Array.isArray(tool.parameters)) {
        throw new Error("Tool parameters must be an array");
    }
    if (!Array.isArray(tool.examples)) {
        throw new Error("Tool examples must be an array");
    }
    if (typeof tool.enabled !== "boolean") {
        throw new Error("Tool enabled must be a boolean");
    }
    if (typeof tool.priority !== "number" || tool.priority < 0) {
        throw new Error("Tool priority must be a non-negative number");
    }
    if (typeof tool.timeout !== "number" || tool.timeout <= 0) {
        throw new Error("Tool timeout must be a positive number");
    }
}
