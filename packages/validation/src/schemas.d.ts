/**
 * Common validation schemas for the Reynard framework
 */
import type { ValidationSchema } from "./types.js";
export declare const CommonSchemas: {
    readonly email: {
        readonly type: "email";
        readonly required: true;
        readonly errorMessage: "Please enter a valid email address";
    };
    readonly password: {
        readonly type: "password";
        readonly required: true;
        readonly minLength: 8;
        readonly maxLength: 128;
        readonly errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character";
    };
    readonly username: {
        readonly type: "username";
        readonly required: true;
        readonly minLength: 3;
        readonly maxLength: 30;
        readonly errorMessage: "Username must be 3-30 characters with only letters, numbers, hyphens, and underscores";
    };
    readonly url: {
        readonly type: "url";
        readonly required: true;
        readonly errorMessage: "Please enter a valid URL";
    };
    readonly positiveNumber: {
        readonly type: "number";
        readonly required: true;
        readonly min: 0;
        readonly errorMessage: "Must be a positive number";
    };
    readonly nonEmptyString: {
        readonly type: "string";
        readonly required: true;
        readonly minLength: 1;
        readonly errorMessage: "This field cannot be empty";
    };
    readonly apiKey: {
        readonly type: "api-key";
        readonly required: true;
        readonly minLength: 10;
        readonly maxLength: 256;
        readonly errorMessage: "API key must be 10-256 characters with only letters, numbers, underscores, and hyphens";
    };
    readonly token: {
        readonly type: "token";
        readonly required: true;
        readonly minLength: 20;
        readonly maxLength: 512;
        readonly errorMessage: "Token must be 20-512 characters";
    };
    readonly filename: {
        readonly type: "filename";
        readonly required: true;
        readonly minLength: 1;
        readonly maxLength: 255;
        readonly errorMessage: "Filename cannot contain invalid characters";
    };
    readonly mimeType: {
        readonly type: "mime-type";
        readonly required: true;
        readonly errorMessage: "Must be a valid MIME type";
    };
    readonly port: {
        readonly type: "port";
        readonly required: true;
        readonly min: 1;
        readonly max: 65535;
        readonly errorMessage: "Port must be between 1 and 65535";
    };
    readonly timeout: {
        readonly type: "timeout";
        readonly required: true;
        readonly min: 1000;
        readonly max: 300000;
        readonly errorMessage: "Timeout must be between 1 second and 5 minutes";
    };
    readonly modelName: {
        readonly type: "model-name";
        readonly required: true;
        readonly minLength: 1;
        readonly maxLength: 100;
        readonly errorMessage: "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens";
    };
    readonly prompt: {
        readonly type: "prompt";
        readonly required: true;
        readonly minLength: 1;
        readonly maxLength: 10000;
        readonly errorMessage: "Prompt must be 1-10000 characters";
    };
    readonly temperature: {
        readonly type: "temperature";
        readonly required: true;
        readonly min: 0;
        readonly max: 2;
        readonly errorMessage: "Temperature must be between 0 and 2";
    };
    readonly maxTokens: {
        readonly type: "max-tokens";
        readonly required: true;
        readonly min: 1;
        readonly max: 100000;
        readonly errorMessage: "Max tokens must be between 1 and 100000";
    };
    readonly theme: {
        readonly type: "theme";
        readonly required: true;
        readonly enum: ["light", "dark", "auto"];
        readonly errorMessage: "Theme must be light, dark, or auto";
    };
    readonly language: {
        readonly type: "language";
        readonly required: true;
        readonly minLength: 2;
        readonly maxLength: 5;
        readonly errorMessage: "Language must be a valid locale code (e.g., 'en' or 'en-US')";
    };
    readonly color: {
        readonly type: "color";
        readonly required: true;
        readonly errorMessage: "Color must be a valid hex, RGB, or HSL color";
    };
    readonly phone: {
        readonly type: "phone";
        readonly required: true;
        readonly errorMessage: "Must be a valid phone number";
    };
    readonly ip: {
        readonly type: "ip";
        readonly required: true;
        readonly errorMessage: "Must be a valid IP address";
    };
    readonly hexColor: {
        readonly type: "hex-color";
        readonly required: true;
        readonly errorMessage: "Must be a valid hex color";
    };
};
export declare const FormSchemas: {
    readonly login: {
        readonly email: {
            readonly type: "email";
            readonly required: true;
            readonly errorMessage: "Please enter a valid email address";
        };
        readonly password: {
            readonly type: "password";
            readonly required: true;
            readonly minLength: 8;
            readonly maxLength: 128;
            readonly errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character";
        };
    };
    readonly registration: {
        readonly email: {
            readonly type: "email";
            readonly required: true;
            readonly errorMessage: "Please enter a valid email address";
        };
        readonly username: {
            readonly type: "username";
            readonly required: true;
            readonly minLength: 3;
            readonly maxLength: 30;
            readonly errorMessage: "Username must be 3-30 characters with only letters, numbers, hyphens, and underscores";
        };
        readonly password: {
            readonly type: "password";
            readonly required: true;
            readonly minLength: 8;
            readonly maxLength: 128;
            readonly errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character";
        };
    };
    readonly profile: {
        readonly username: {
            readonly type: "username";
            readonly required: true;
            readonly minLength: 3;
            readonly maxLength: 30;
            readonly errorMessage: "Username must be 3-30 characters with only letters, numbers, hyphens, and underscores";
        };
        readonly email: {
            readonly type: "email";
            readonly required: true;
            readonly errorMessage: "Please enter a valid email address";
        };
    };
    readonly settings: {
        readonly theme: {
            readonly type: "theme";
            readonly required: true;
            readonly enum: ["light", "dark", "auto"];
            readonly errorMessage: "Theme must be light, dark, or auto";
        };
        readonly language: {
            readonly type: "language";
            readonly required: true;
            readonly minLength: 2;
            readonly maxLength: 5;
            readonly errorMessage: "Language must be a valid locale code (e.g., 'en' or 'en-US')";
        };
    };
    readonly api: {
        readonly apiKey: {
            readonly type: "api-key";
            readonly required: true;
            readonly minLength: 10;
            readonly maxLength: 256;
            readonly errorMessage: "API key must be 10-256 characters with only letters, numbers, underscores, and hyphens";
        };
        readonly modelName: {
            readonly type: "model-name";
            readonly required: true;
            readonly minLength: 1;
            readonly maxLength: 100;
            readonly errorMessage: "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens";
        };
        readonly temperature: {
            readonly type: "temperature";
            readonly required: true;
            readonly min: 0;
            readonly max: 2;
            readonly errorMessage: "Temperature must be between 0 and 2";
        };
        readonly maxTokens: {
            readonly type: "max-tokens";
            readonly required: true;
            readonly min: 1;
            readonly max: 100000;
            readonly errorMessage: "Max tokens must be between 1 and 100000";
        };
    };
    readonly file: {
        readonly filename: {
            readonly type: "filename";
            readonly required: true;
            readonly minLength: 1;
            readonly maxLength: 255;
            readonly errorMessage: "Filename cannot contain invalid characters";
        };
        readonly mimeType: {
            readonly type: "mime-type";
            readonly required: true;
            readonly errorMessage: "Must be a valid MIME type";
        };
    };
    readonly network: {
        readonly url: {
            readonly type: "url";
            readonly required: true;
            readonly errorMessage: "Please enter a valid URL";
        };
        readonly port: {
            readonly type: "port";
            readonly required: true;
            readonly min: 1;
            readonly max: 65535;
            readonly errorMessage: "Port must be between 1 and 65535";
        };
        readonly timeout: {
            readonly type: "timeout";
            readonly required: true;
            readonly min: 1000;
            readonly max: 300000;
            readonly errorMessage: "Timeout must be between 1 second and 5 minutes";
        };
    };
};
export declare function createStringSchema(options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    errorMessage?: string;
}): ValidationSchema;
export declare function createNumberSchema(options: {
    required?: boolean;
    min?: number;
    max?: number;
    errorMessage?: string;
}): ValidationSchema;
export declare function createEnumSchema<T>(values: T[], options?: {
    required?: boolean;
    errorMessage?: string;
}): ValidationSchema;
export declare function createCustomSchema<T>(validator: (value: unknown) => {
    isValid: boolean;
    error?: string;
}, options?: {
    required?: boolean;
    errorMessage?: string;
}): ValidationSchema;
