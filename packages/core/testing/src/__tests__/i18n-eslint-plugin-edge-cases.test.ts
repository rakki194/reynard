/**
 * Edge Cases and Complex Scenarios Tests for i18n ESLint Plugin
 * Tests complex AST scenarios, nested contexts, and edge cases
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

describe("i18n ESLint Plugin - Edge Cases", () => {
  describe("Nested Context Detection", () => {
    it("should handle deeply nested object structures", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
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
        ],
        invalid: [],
      });
    });

    it("should handle complex function calls with mixed contexts", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
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
        ],
        invalid: [],
      });
    });

    it("should handle template literals in technical contexts", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          const apiUrl = \`\${baseUrl}/api/v1/users\`;
          const filePath = \`\${process.cwd()}/src/components\`;
          const query = \`SELECT * FROM users WHERE id = \${userId}\`;
          `,
        ],
        invalid: [],
      });
    });
  });

  describe("Complex JSX Scenarios", () => {
    it("should handle JSX with mixed content and expressions", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          const Component = () => {
            const { t } = useI18n();
            return (
              <div>
                <h1>{t("welcome.title")}</h1>
                <p>{t("welcome.message")}</p>
                <button onClick={() => console.log("clicked")}>
                  {t("common.submit")}
                </button>
              </div>
            );
          };
          `,
        ],
        invalid: [
          {
            code: `
            const Component = () => {
              return (
                <div>
                  <h1>Welcome to our app</h1>
                  <p>This is a test message</p>
                  <button onClick={() => console.log("clicked")}>
                    Submit Form
                  </button>
                </div>
              );
            };
            `,
            errors: [
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
              {
                message: "Hardcoded string found: \"Submit Form\". Consider using i18n.t('submit.form') instead.",
                type: "JSXText",
              },
            ],
          },
        ],
      });
    });

    it("should handle JSX fragments and complex nesting", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [],
        invalid: [
          {
            code: `
            const ComplexComponent = () => {
              return (
                <>
                  <header>
                    <nav>
                      <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/contact">Contact</a></li>
                      </ul>
                    </nav>
                  </header>
                  <main>
                    <section>
                      <h2>Our Services</h2>
                      <p>We provide excellent service</p>
                    </section>
                  </main>
                </>
              );
            };
            `,
            errors: [
              {
                message: "Hardcoded string found: \"Home\". Consider using i18n.t('home') instead.",
                type: "JSXText",
              },
              {
                message: "Hardcoded string found: \"About\". Consider using i18n.t('about') instead.",
                type: "JSXText",
              },
              {
                message: "Hardcoded string found: \"Contact\". Consider using i18n.t('contact') instead.",
                type: "JSXText",
              },
              {
                message: "Hardcoded string found: \"Our Services\". Consider using i18n.t('our.services') instead.",
                type: "JSXText",
              },
              {
                message:
                  "Hardcoded string found: \"We provide excellent service\". Consider using i18n.t('we.provide.excellent.service') instead.",
                type: "JSXText",
              },
            ],
          },
        ],
      });
    });
  });

  describe("Advanced TypeScript Features", () => {
    it("should handle generic types and interfaces", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          interface ApiResponse<T> {
            data: T;
            status: "success" | "error";
            message: string;
          }
          
          class ApiClient<T> {
            private baseUrl: string;
            
            constructor(baseUrl: string) {
              this.baseUrl = baseUrl;
            }
            
            async get(endpoint: string): Promise<ApiResponse<T>> {
              const response = await fetch(\`\${this.baseUrl}\${endpoint}\`);
              return response.json();
            }
          }
          `,
        ],
        invalid: [],
      });
    });

    it("should handle decorators and metadata", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          @Component({
            selector: "app-root",
            template: "<div>Hello World</div>"
          })
          export class AppComponent {
            @Input() title: string = "default";
            
            @Output() click = new EventEmitter<string>();
          }
          `,
        ],
        invalid: [],
      });
    });

    it("should handle async/await patterns", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          async function fetchUserData(userId: string) {
            try {
              const response = await fetch(\`/api/users/\${userId}\`);
              const userData = await response.json();
              return userData;
            } catch (error) {
              console.error("Failed to fetch user data:", error);
              throw new Error("User not found");
            }
          }
          `,
        ],
        invalid: [],
      });
    });
  });

  describe("Complex Error Handling", () => {
    it("should handle error classes and custom exceptions", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          class ValidationError extends Error {
            constructor(field: string, message: string) {
              super(\`Validation failed for \${field}: \${message}\`);
              this.name = "ValidationError";
            }
          }
          
          class ApiError extends Error {
            constructor(status: number, message: string) {
              super(\`API Error \${status}: \${message}\`);
              this.name = "ApiError";
            }
          }
          `,
        ],
        invalid: [],
      });
    });

    it("should handle error handling patterns", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          function handleError(error: Error) {
            if (error instanceof ValidationError) {
              console.error("Validation error:", error.message);
            } else if (error instanceof ApiError) {
              console.error("API error:", error.message);
            } else {
              console.error("Unknown error:", error.message);
            }
          }
          `,
        ],
        invalid: [],
      });
    });
  });

  describe("Performance and Optimization Patterns", () => {
    it("should handle memoization and caching", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          const memoizedFunction = memoize((key: string) => {
            return expensiveOperation(key);
          });
          
          const cache = new Map<string, any>();
          cache.set("user:123", userData);
          cache.set("config:app", appConfig);
          `,
        ],
        invalid: [],
      });
    });

    it("should handle worker and thread patterns", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          const worker = new Worker("worker.js");
          worker.postMessage({ type: "process", data: inputData });
          
          const thread = new Worker("thread.js");
          thread.onmessage = (event) => {
            const result = event.data;
            console.log("Thread result:", result);
          };
          `,
        ],
        invalid: [],
      });
    });
  });

  describe("Configuration and Environment Patterns", () => {
    it("should handle environment-specific configurations", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          const config = {
            development: {
              apiUrl: "http://localhost:3000",
              debug: true,
              logLevel: "debug"
            },
            production: {
              apiUrl: "https://api.example.com",
              debug: false,
              logLevel: "error"
            }
          };
          
          const env = process.env.NODE_ENV || "development";
          const currentConfig = config[env];
          `,
        ],
        invalid: [],
      });
    });

    it("should handle feature flags and conditional logic", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          const featureFlags = {
            enableNewUI: process.env.ENABLE_NEW_UI === "true",
            enableAnalytics: process.env.ENABLE_ANALYTICS === "true",
            enableDebugMode: process.env.NODE_ENV === "development"
          };
          
          if (featureFlags.enableNewUI) {
            console.log("New UI enabled");
          }
          `,
        ],
        invalid: [],
      });
    });
  });

  describe("Integration and API Patterns", () => {
    it("should handle API client patterns", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          class ApiClient {
            private baseUrl: string;
            private apiKey: string;
            
            constructor(baseUrl: string, apiKey: string) {
              this.baseUrl = baseUrl;
              this.apiKey = apiKey;
            }
            
            async request(endpoint: string, options: RequestInit = {}) {
              const url = \`\${this.baseUrl}\${endpoint}\`;
              const headers = {
                "Content-Type": "application/json",
                "Authorization": \`Bearer \${this.apiKey}\`,
                ...options.headers
              };
              
              return fetch(url, { ...options, headers });
            }
          }
          `,
        ],
        invalid: [],
      });
    });

    it("should handle database query patterns", () => {
      ruleTester.run("no-hardcoded-strings", i18nRules["no-hardcoded-strings"], {
        valid: [
          `
          class DatabaseClient {
            async findUser(id: string) {
              const query = \`SELECT * FROM users WHERE id = ?\`;
              const result = await this.executeQuery(query, [id]);
              return result.rows[0];
            }
            
            async createUser(userData: any) {
              const query = \`INSERT INTO users (name, email) VALUES (?, ?)\`;
              const result = await this.executeQuery(query, [userData.name, userData.email]);
              return result.insertId;
            }
          }
          `,
        ],
        invalid: [],
      });
    });
  });
});
