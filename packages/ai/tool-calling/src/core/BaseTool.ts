/**
 * Abstract base class for all tools
 */

import { ToolDefinition, ToolResult, ToolExecutionContext, ToolParameter, ParameterType } from "./types";

export abstract class BaseTool {
  protected definition: ToolDefinition;
  private _metrics: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    totalExecutionTime: number;
    lastCalled?: Date;
  };

  constructor(definition: ToolDefinition) {
    this.definition = definition;
    this._metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalExecutionTime: 0,
    };
  }

  get name(): string {
    return this.definition.name;
  }

  get description(): string {
    return this.definition.description;
  }

  get category(): string {
    return this.definition.category;
  }

  get tags(): string[] {
    return this.definition.tags;
  }

  get parameters(): ToolParameter[] {
    return this.definition.parameters;
  }

  get permissions(): string[] {
    return this.definition.permissions || [];
  }

  get timeout(): number {
    return this.definition.timeout || 30000; // 30 seconds default
  }

  get retryCount(): number {
    return this.definition.retryCount || 3;
  }

  get metrics() {
    return {
      ...this._metrics,
      averageExecutionTime:
        this._metrics.totalCalls > 0 ? this._metrics.totalExecutionTime / this._metrics.totalCalls : 0,
      errorRate: this._metrics.totalCalls > 0 ? this._metrics.failedCalls / this._metrics.totalCalls : 0,
    };
  }

  /**
   * Execute the tool with the given parameters and context
   */
  async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult> {
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
    } catch (error) {
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
   * Abstract method that must be implemented by subclasses
   */
  protected abstract executeImpl(parameters: Record<string, any>, context: ToolExecutionContext): Promise<any>;

  /**
   * Validate parameters against the tool definition
   */
  protected validateParameters(parameters: Record<string, any>): void {
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
  protected validateParameterType(param: ToolParameter, value: any): void {
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
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          throw new Error(`Parameter '${param.name}' must be an object`);
        }
        break;
    }
  }

  /**
   * Validate parameter constraints
   */
  protected validateParameterConstraints(param: ToolParameter, value: any): void {
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
    if ((param.type === ParameterType.NUMBER || param.type === ParameterType.INTEGER) && typeof value === "number") {
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
  protected checkPermissions(context: ToolExecutionContext): void {
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
  toJSONSchema(): any {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: "object",
        properties: this.definition.parameters.reduce(
          (props, param) => {
            props[param.name] = this.parameterToJSONSchema(param);
            return props;
          },
          {} as Record<string, any>
        ),
        required: this.definition.parameters.filter(param => param.required).map(param => param.name),
      },
    };
  }

  /**
   * Convert parameter to JSON schema
   */
  private parameterToJSONSchema(param: ToolParameter): any {
    const schema: any = {
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
      schema.properties = Object.entries(param.properties).reduce(
        (props, [key, value]) => {
          props[key] = this.parameterToJSONSchema(value);
          return props;
        },
        {} as Record<string, any>
      );
    }

    return schema;
  }
}
