/**
 * ESLint Plugin for i18n Testing
 * Detects hardcoded strings and i18n issues in Reynard packages
 */
export declare const i18nRules: {
    "no-hardcoded-strings": {
        meta: {
            type: string;
            docs: {
                description: string;
                category: string;
                recommended: boolean;
            };
            fixable: string;
            schema: {
                type: string;
                properties: {
                    ignorePatterns: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                    minLength: {
                        type: string;
                        default: number;
                    };
                };
                additionalProperties: boolean;
            }[];
        };
        create(context: any): {
            JSXText(node: any): void;
            Literal(node: any): void;
        };
    };
    "no-untranslated-keys": {
        meta: {
            type: string;
            docs: {
                description: string;
                category: string;
                recommended: boolean;
            };
            schema: {
                type: string;
                properties: {
                    translationFiles: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: string[];
                    };
                };
                additionalProperties: boolean;
            }[];
        };
        create(context: any): {
            CallExpression(node: any): void;
        };
    };
};
export declare const i18nPlugin: {
    rules: {
        "no-hardcoded-strings": {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                fixable: string;
                schema: {
                    type: string;
                    properties: {
                        ignorePatterns: {
                            type: string;
                            items: {
                                type: string;
                            };
                            default: never[];
                        };
                        minLength: {
                            type: string;
                            default: number;
                        };
                    };
                    additionalProperties: boolean;
                }[];
            };
            create(context: any): {
                JSXText(node: any): void;
                Literal(node: any): void;
            };
        };
        "no-untranslated-keys": {
            meta: {
                type: string;
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        translationFiles: {
                            type: string;
                            items: {
                                type: string;
                            };
                            default: string[];
                        };
                    };
                    additionalProperties: boolean;
                }[];
            };
            create(context: any): {
                CallExpression(node: any): void;
            };
        };
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                "@reynard/i18n/no-hardcoded-strings": string;
                "@reynard/i18n/no-untranslated-keys": string;
            };
        };
    };
};
