/**
 * Abstract base class for all tools
 */
import { ParameterType, } from "./types";
export class BaseTool {
    constructor(definition) {
        Object.defineProperty(this, "definition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.definition = definition;
        this._metrics = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalExecutionTime: 0,
        };
    }
    get name() {
        return this.definition.name;
    }
    get description() {
        return this.definition.description;
    }
    get category() {
        return this.definition.category;
    }
    get tags() {
        return this.definition.tags;
    }
    get parameters() {
        return this.definition.parameters;
    }
    get permissions() {
        return this.definition.permissions || [];
    }
    get timeout() {
        return this.definition.timeout || 30000; // 30 seconds default
    }
    get retryCount() {
        return this.definition.retryCount || 3;
    }
    get metrics() {
        return {
            ...this._metrics,
            averageExecutionTime: this._metrics.totalCalls > 0
                ? this._metrics.totalExecutionTime / this._metrics.totalCalls
                : 0,
            errorRate: this._metrics.totalCalls > 0
                ? this._metrics.failedCalls / this._metrics.totalCalls
                : 0,
        };
    }
    /**
     * Execute the tool with the given parameters and context
     */
    async execute(parameters, context) {
        const startTime = Date.now();
        this._metrics.totalCalls++;
        this._metrics.lastCalled = new Date();
        try {
            // Validate parameters
            this.validateParameters(parameters);
            // Check permissions
            this.checkPermissions(context);
            // Execute the tool implementation
            const data = await this.executeImpl(parameters, context);
            const executionTime = Date.now() - startTime;
            this._metrics.successfulCalls++;
            this._metrics.totalExecutionTime += executionTime;
            return {
                success: true,
                data,
                executionTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this._metrics.failedCalls++;
            this._metrics.totalExecutionTime += executionTime;
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Validate parameters against the tool definition
     */
    validateParameters(parameters) {
        for (const param of this.definition.parameters) {
            const value = parameters[param.name];
            // Check required parameters
            if (param.required && (value === undefined || value === null)) {
                throw new Error(`Required parameter '${param.name}' is missing`);
            }
            // Skip validation if parameter is not provided and not required
            if (value === undefined || value === null) {
                continue;
            }
            // Type validation
            this.validateParameterType(param, value);
            // Additional validations
            this.validateParameterConstraints(param, value);
        }
    }
    /**
     * Validate parameter type
     */
    validateParameterType(param, value) {
        switch (param.type) {
            case ParameterType.STRING:
                if (typeof value !== "string") {
                    throw new Error(`Parameter '${param.name}' must be a string`);
                }
                break;
            case ParameterType.INTEGER:
                if (!Number.isInteger(value)) {
                    throw new Error(`Parameter '${param.name}' must be an integer`);
                }
                break;
            case ParameterType.NUMBER:
                if (typeof value !== "number" || isNaN(value)) {
                    throw new Error(`Parameter '${param.name}' must be a number`);
                }
                break;
            case ParameterType.BOOLEAN:
                if (typeof value !== "boolean") {
                    throw new Error(`Parameter '${param.name}' must be a boolean`);
                }
                break;
            case ParameterType.ARRAY:
                if (!Array.isArray(value)) {
                    throw new Error(`Parameter '${param.name}' must be an array`);
                }
                break;
            case ParameterType.OBJECT:
                if (typeof value !== "object" ||
                    value === null ||
                    Array.isArray(value)) {
                    throw new Error(`Parameter '${param.name}' must be an object`);
                }
                break;
        }
    }
    /**
     * Validate parameter constraints
     */
    validateParameterConstraints(param, value) {
        // String constraints
        if (param.type === ParameterType.STRING && typeof value === "string") {
            if (param.minLength !== undefined && value.length < param.minLength) {
                throw new Error(`Parameter '${param.name}' must be at least ${param.minLength} characters long`);
            }
            if (param.maxLength !== undefined && value.length > param.maxLength) {
                throw new Error(`Parameter '${param.name}' must be at most ${param.maxLength} characters long`);
            }
            if (param.pattern && !new RegExp(param.pattern).test(value)) {
                throw new Error(`Parameter '${param.name}' does not match required pattern`);
            }
        }
        // Number constraints
        if ((param.type === ParameterType.NUMBER ||
            param.type === ParameterType.INTEGER) &&
            typeof value === "number") {
            if (param.minimum !== undefined && value < param.minimum) {
                throw new Error(`Parameter '${param.name}' must be at least ${param.minimum}`);
            }
            if (param.maximum !== undefined && value > param.maximum) {
                throw new Error(`Parameter '${param.name}' must be at most ${param.maximum}`);
            }
        }
        // Enum constraints
        if (param.enum && !param.enum.includes(value)) {
            throw new Error(`Parameter '${param.name}' must be one of: ${param.enum.join(", ")}`);
        }
    }
    /**
     * Check if the user has required permissions
     */
    checkPermissions(context) {
        if (this.permissions.length === 0) {
            return; // No permissions required
        }
        for (const permission of this.permissions) {
            if (!context.permissions.includes(permission)) {
                throw new Error(`Permission '${permission}' is required to execute tool '${this.name}'`);
            }
        }
    }
    /**
     * Get tool definition as JSON schema
     */
    toJSONSchema() {
        return {
            name: this.name,
            description: this.description,
            parameters: {
                type: "object",
                properties: this.definition.parameters.reduce((props, param) => {
                    props[param.name] = this.parameterToJSONSchema(param);
                    return props;
                }, {}),
                required: this.definition.parameters
                    .filter((param) => param.required)
                    .map((param) => param.name),
            },
        };
    }
    /**
     * Convert parameter to JSON schema
     */
    parameterToJSONSchema(param) {
        const schema = {
            type: param.type,
            description: param.description,
        };
        if (param.default !== undefined) {
            schema.default = param.default;
        }
        if (param.enum) {
            schema.enum = param.enum;
        }
        if (param.minimum !== undefined) {
            schema.minimum = param.minimum;
        }
        if (param.maximum !== undefined) {
            schema.maximum = param.maximum;
        }
        if (param.minLength !== undefined) {
            schema.minLength = param.minLength;
        }
        if (param.maxLength !== undefined) {
            schema.maxLength = param.maxLength;
        }
        if (param.pattern) {
            schema.pattern = param.pattern;
        }
        if (param.items) {
            schema.items = this.parameterToJSONSchema(param.items);
        }
        if (param.properties) {
            schema.properties = Object.entries(param.properties).reduce((props, [key, value]) => {
                props[key] = this.parameterToJSONSchema(value);
                return props;
            }, {});
        }
        return schema;
    }
}
