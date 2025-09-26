/**
 * Logical Error Detection Tests for i18n ESLint Plugin
 * Tests that verify the plugin handles edge cases and logical errors correctly
 */

import { describe, it, expect } from "vitest";
import { RuleTester } from "eslint";
import { i18nRules } from "../utils/i18n-eslint-plugin.js";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

describe("i18n ESLint Plugin - Logical Error Detection", () => {
  describe("Already Internationalized Code", () => {
    it("should not flag strings that are already using i18n.t()", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const { t } = useI18n();
            const message = t("common.welcome");
            const title = t("nav.home");
            `,
          },
          {
            code: `
            const Component = () => {
              const { t } = useI18n();
              return (
                <div>
                  <h1>{t("welcome.title")}</h1>
                  <p>{t("welcome.message")}</p>
                </div>
              );
            };
            `,
          },
          {
            code: `
            const message = i18n.t("common.error");
            const title = i18n.t("nav.about");
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in i18n.t() calls even if they look hardcoded", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const { t } = useI18n();
            const message = t("Welcome to our app");
            const title = t("Hello World");
            `,
          },
          {
            code: `
            const Component = () => {
              const { t } = useI18n();
              return <h1>{t("This is a test message")}</h1>;
            };
            `,
          },
        ],
        invalid: [],
      });
    });
  });

  describe("Technical Context Detection", () => {
    it("should not flag strings in import statements", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            import { Component } from "solid-js";
            import { useI18n } from "reynard-themes";
            import { ToolRegistry, ToolExecutor } from "reynard-tools";
            import { createSignal } from "solid-js";
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in require statements", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const fs = require("fs");
            const path = require("path");
            const commander = require("commander");
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in module.exports", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            module.exports = {
              Component: MyComponent,
              utils: helperUtils
            };
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in export statements", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            export { Component } from "./component";
            export default class MyClass {};
            export const config = "development";
            export * from "./utils";
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in constructor calls", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const cmd = new Command("eslint");
            const component = new Component();
            const registry = new ToolRegistry();
            const executor = new ToolExecutor();
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in console statements", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            console.log("debug info");
            console.error("error occurred");
            console.warn("warning message");
            console.info("information");
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in process statements", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            process.env.NODE_ENV;
            process.exit(1);
            process.cwd();
            process.argv;
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in object property keys", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const obj = {
              "key": "value",
              "name": "app",
              "theme": "dark"
            };
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in array elements", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const items = ["item1", "item2", "item3"];
            const themes = ["light", "dark", "auto"];
            const languages = ["en", "es", "fr"];
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in switch cases", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            switch (type) {
              case "primary":
                return "blue";
              case "secondary":
                return "gray";
              default:
                return "default";
            }
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag strings in throw statements", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            throw new Error("Something went wrong");
            throw new TypeError("Invalid type");
            throw new ValidationError("Invalid input");
            `,
          },
        ],
        invalid: [],
      });
    });
  });

  describe("Technical Term Detection", () => {
    it("should not flag common technical terms", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const id = "user-123";
            const type = "button";
            const name = "component";
            const value = "data";
            const key = "config";
            const index = "0";
            const count = "items";
            const size = "large";
            const width = "100px";
            const height = "200px";
            const color = "blue";
            const url = "https://example.com";
            const path = "/api/users";
            const file = "config.json";
            const dir = "src";
            const src = "image.jpg";
            const alt = "description";
            const title = "tooltip";
            const role = "button";
            const aria = "label";
            const data = "value";
            const test = "spec";
            const mock = "data";
            const stub = "response";
            const fixture = "example";
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag tool and framework names", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const tool = "commander";
            const linter = "eslint";
            const language = "typescript";
            const runtime = "node";
            const manager = "npm";
            const bundler = "webpack";
            const framework = "vite";
            const compiler = "babel";
            const testRunner = "jest";
            const testFramework = "vitest";
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should not flag naming convention patterns", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const camelCase = "value";
            const CONSTANT = "value";
            const kebab-case = "value";
            const dot.notation = "value";
            const colon:notation = "value";
            const slash/notation = "value";
            const nested.dot.notation = "value";
            `,
          },
        ],
        invalid: [],
      });
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should respect minimum length setting", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const short = "ab";
            const tiny = "x";
            const empty = "";
            `,
            options: [{ minLength: 3 }],
          },
        ],
        invalid: [
          {
            code: `
            const long = "Hello World";
            const medium = "Test";
            `,
            options: [{ minLength: 3 }],
            errors: [
              {
                message: "Hardcoded string found: \"Hello World\". Consider using i18n.t('hello.world') instead.",
                type: "Literal",
              },
              {
                message: "Hardcoded string found: \"Test\". Consider using i18n.t('test') instead.",
                type: "Literal",
              },
            ],
          },
        ],
      });
    });

    it("should respect custom ignore patterns", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const special = "special-pattern";
            const custom = "custom-value";
            `,
            options: [{ ignorePatterns: ["^special-", "^custom-"] }],
          },
        ],
        invalid: [
          {
            code: `
            const normal = "Hello World";
            const other = "Other message";
            `,
            options: [{ ignorePatterns: ["^special-", "^custom-"] }],
            errors: [
              {
                message: "Hardcoded string found: \"Hello World\". Consider using i18n.t('hello.world') instead.",
                type: "Literal",
              },
              {
                message: "Hardcoded string found: \"Other message\". Consider using i18n.t('other.message') instead.",
                type: "Literal",
              },
            ],
          },
        ],
      });
    });

    it("should handle empty strings and whitespace", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const empty = "";
            const space = " ";
            const tab = "\t";
            const newline = "\n";
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should handle strings with only special characters", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const symbols = "!@#$%^&*()";
            const punctuation = ".,;:!?";
            const brackets = "[]{}()";
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should handle very long strings", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [],
        invalid: [
          {
            code: `
            const longString = "This is a very long string that contains many words and should be internationalized because it is user-facing content that needs to be translated into different languages for global users";
            `,
            errors: [
              {
                message:
                  "Hardcoded string found: \"This is a very long string that contains many words and should be internationalized because it is user-facing content that needs to be translated into different languages for global users\". Consider using i18n.t('this.is.a.very.long.string.that.contains.many.words.and') instead.",
                type: "Literal",
              },
            ],
          },
        ],
      });
    });
  });

  describe("Complex AST Scenarios", () => {
    it("should handle deeply nested object structures", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const config = {
              api: {
                endpoints: {
                  users: "/api/users",
                  posts: "/api/posts"
                },
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer token"
                }
              },
              ui: {
                themes: ["light", "dark", "auto"],
                components: {
                  button: {
                    variants: ["primary", "secondary", "tertiary"]
                  }
                }
              }
            };
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should handle complex function calls with mixed contexts", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            function setupApp() {
              const config = loadConfig("development");
              const router = createRouter({
                routes: [
                  { path: "/", component: "Home" },
                  { path: "/about", component: "About" }
                ]
              });
              return { config, router };
            }
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should handle template literals in technical contexts", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            const apiUrl = \`\${baseUrl}/api/v1/users\`;
            const filePath = \`\${process.cwd()}/src/components\`;
            const query = \`SELECT * FROM users WHERE id = \${userId}\`;
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should handle mixed technical and user-facing code", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          {
            code: `
            import { Component } from "solid-js";
            import { useI18n } from "reynard-themes";
            
            const MyComponent: Component = () => {
              const { t } = useI18n();
              const config = { theme: "dark", language: "en" };
              
              return (
                <div>
                  <h1>{t("welcome.title")}</h1>
                  <p>{t("welcome.message")}</p>
                </div>
              );
            };
            `,
          },
        ],
        invalid: [
          {
            code: `
            import { Component } from "solid-js";
            
            const MyComponent: Component = () => {
              const config = { theme: "dark", language: "en" };
              const title = "Welcome to our app";
              
              return (
                <div>
                  <h1>Welcome to our app</h1>
                  <p>This is a test message</p>
                </div>
              );
            };
            `,
            errors: [
              {
                message:
                  "Hardcoded string found: \"Welcome to our app\". Consider using i18n.t('welcome.to.our.app') instead.",
                type: "Literal",
              },
              {
                message:
                  "Hardcoded string found: \"Welcome to our app\". Consider using i18n.t('welcome.to.our.app') instead.",
                type: "JSXText",
              },
              {
                message:
                  "Hardcoded string found: \"This is a test message\". Consider using i18n.t('this.is.a.test.message') instead.",
                type: "JSXText",
              },
            ],
          },
        ],
      });
    });
  });

  describe("Translation Key Validation Edge Cases", () => {
    it("should handle dynamic translation keys", () => {
      ruleTester.run("no-untranslated-keys", i18nRules["no-untranslated-keys"], {
        valid: [
          {
            code: `
            const dynamicKey = \`common.\${type}\`;
            const message = t(dynamicKey);
            `,
          },
          {
            code: `
            const key = "common." + action;
            const message = t(key);
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should handle translation keys in template literals", () => {
      ruleTester.run("no-untranslated-keys", i18nRules["no-untranslated-keys"], {
        valid: [
          {
            code: `
            const { t } = useI18n();
            const message = t(\`common.\${type}\`);
            `,
          },
        ],
        invalid: [],
      });
    });

    it("should handle translation keys in complex expressions", () => {
      ruleTester.run("no-untranslated-keys", i18nRules["no-untranslated-keys"], {
        valid: [
          {
            code: `
            const { t } = useI18n();
            const message = t(condition ? "common.success" : "common.error");
            `,
          },
        ],
        invalid: [],
      });
    });
  });
});
