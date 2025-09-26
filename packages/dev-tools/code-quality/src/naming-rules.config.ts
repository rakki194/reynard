/**
 * 🦊 Naming Rules Configuration
 *
 * Centralized configuration for naming violation detection rules.
 * Enforces the Reynard naming guidelines across the codebase.
 */

export interface NamingRuleConfig {
  pattern: RegExp;
  forbidden: string[];
  suggestion: string;
  severity: "error" | "warning";
  description: string;
  examples?: {
    bad: string[];
    good: string[];
  };
}

/**
 * Forbidden marketing prefixes that add no technical value
 */
export const FORBIDDEN_PREFIXES = [
  "Unified",
  "Enhanced",
  "Advanced",
  "Super",
  "Ultra",
  "Mega",
  "Ultimate",
  "Comprehensive",
  "Complete",
  "Full-Featured",
  "Enterprise-Grade",
  "Intelligent",
  "Smart",
  "AI-Powered",
  "Next-Gen",
  "Revolutionary",
];

/**
 * Generic naming patterns that lack specificity
 */
export const GENERIC_PATTERNS = [
  "Manager",
  "Handler",
  "Processor",
  "Controller",
  "Service",
  "Engine",
  "System",
  "Framework",
  "Platform",
  "Solution",
];

/**
 * Default naming rules for the Reynard codebase
 */
export const DEFAULT_NAMING_RULES: NamingRuleConfig[] = [
  {
    // Match forbidden marketing prefixes at the start of identifiers.
    // Supports both hyphenated and non-hyphenated variants (e.g., AI-Powered | AIPowered).
    pattern:
      /^(Unified|Enhanced|Advanced|Super|Ultra|Mega|Ultimate|Comprehensive|Complete|Full-Featured|FullFeatured|Enterprise-Grade|EnterpriseGrade|Intelligent|Smart|AI-Powered|AIPowered|Next-Gen|NextGen|Revolutionary)[A-Z][a-zA-Z]*/g,
    forbidden: FORBIDDEN_PREFIXES,
    suggestion: "Remove the marketing prefix and use clear, descriptive naming",
    severity: "error",
    description: "Forbidden marketing prefixes that add no technical value",
    examples: {
      bad: [
        "UnifiedMetricsEngine",
        "EnhancedSecuritySystem",
        "AdvancedAnalyticsPlatform",
        "SuperFastProcessor",
        "UltraSecureVault",
        "MegaDataProcessor",
        "UltimateSolutionFramework",
        "ComprehensiveAnalysisSystem",
        "CompleteDataManagementSystem",
        "Full-FeaturedAnalyticsPlatform",
        "Enterprise-GradeSecurityFramework",
        "IntelligentDataProcessor",
        "SmartAnalyticsEngine",
        "AI-PoweredDataProcessor",
        "Next-GenAnalyticsPlatform",
        "RevolutionaryDataFramework",
      ],
      good: [
        "MetricsEngine",
        "SecuritySystem",
        "AnalyticsPlatform",
        "FastProcessor",
        "SecureVault",
        "DataProcessor",
        "SolutionFramework",
        "AnalysisSystem",
        "DataManagementSystem",
        "AnalyticsPlatform",
        "SecurityFramework",
        "DataProcessor",
        "AnalyticsEngine",
        "DataProcessor",
        "AnalyticsPlatform",
        "DataFramework",
      ],
    },
  },
  {
    pattern: /\b([A-Z][a-z]*){4,}([A-Z][a-zA-Z]*)/g,
    forbidden: [],
    suggestion: "Simplify to 2-3 clear, descriptive words",
    severity: "warning",
    description: "Overly complex naming with too many words",
    examples: {
      bad: [
        "VeryComplexDataProcessingEngine",
        "ExtremelyAdvancedAnalyticsSystem",
        "HighlySophisticatedSecurityFramework",
      ],
      good: ["DataProcessor", "AnalyticsSystem", "SecurityFramework"],
    },
  },
  {
    pattern:
      /\b(Manager|Handler|Processor|Controller|Service|Engine|System|Framework|Platform|Solution)([A-Z][a-zA-Z]*)/g,
    forbidden: [],
    suggestion: "Use more specific, descriptive names that explain the actual purpose",
    severity: "warning",
    description: "Generic naming patterns that lack specificity",
    examples: {
      bad: [
        "DataManager",
        "RequestHandler",
        "FileProcessor",
        "UserController",
        "AuthService",
        "MetricsEngine",
        "SecuritySystem",
        "WebFramework",
        "AnalyticsPlatform",
        "DataSolution",
      ],
      good: [
        "DataCoordinator",
        "RequestProcessor",
        "FileValidator",
        "UserAuthenticator",
        "AuthProvider",
        "MetricsCalculator",
        "SecurityGuard",
        "WebLibrary",
        "AnalyticsEnvironment",
        "DataImplementation",
      ],
    },
  },
  {
    pattern: /\b[A-Z]{3,}([A-Z][a-zA-Z]*)/g,
    forbidden: [],
    suggestion: "Use full words instead of acronyms for better readability",
    severity: "warning",
    description: "Excessive use of acronyms reduces code readability",
    examples: {
      bad: ["HTTPRequestProcessor", "XMLDataParser", "JSONResponseHandler", "SQLQueryBuilder", "APIEndpointManager"],
      good: ["HttpRequestProcessor", "XmlDataParser", "JsonResponseHandler", "SqlQueryBuilder", "ApiEndpointManager"],
    },
  },
];

/**
 * Approved naming patterns for reference
 */
export const APPROVED_NAMING_PATTERNS = {
  // Simple & Clear
  simple: [
    "MetricsEngine",
    "PerformanceCollector",
    "TimeSeriesStore",
    "QueryEngine",
    "AlertRuleEngine",
    "DashboardEngine",
  ],

  // Descriptive
  descriptive: [
    "DataIngestionPipeline",
    "NotificationSystem",
    "ThemeSystem",
    "UserAuthenticationService",
    "FileValidationEngine",
    "CacheManagementSystem",
  ],

  // Functional
  functional: [
    "MetricsCalculator",
    "SecurityValidator",
    "DataTransformer",
    "RequestProcessor",
    "ResponseFormatter",
    "ErrorHandler",
  ],
};

/**
 * Naming guidelines for different types
 */
export const NAMING_GUIDELINES = {
  classes: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: "PascalCase, descriptive noun or noun phrase",
    examples: {
      good: ["UserService", "DataProcessor", "SecurityValidator"],
      bad: ["userService", "data_processor", "UnifiedDataProcessor"],
    },
  },

  functions: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: "camelCase, verb or verb phrase",
    examples: {
      good: ["processData", "validateUser", "calculateMetrics"],
      bad: ["ProcessData", "validate_user", "EnhancedProcessData"],
    },
  },

  variables: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: "camelCase, descriptive noun",
    examples: {
      good: ["userData", "metricsCount", "securityConfig"],
      bad: ["UserData", "metrics_count", "EnhancedUserData"],
    },
  },

  interfaces: {
    pattern: /^I[A-Z][a-zA-Z0-9]*$/,
    description: "PascalCase with I prefix, descriptive noun",
    examples: {
      good: ["IUserService", "IDataProcessor", "ISecurityValidator"],
      bad: ["UserService", "iDataProcessor", "UnifiedIUserService"],
    },
  },

  types: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: "PascalCase, descriptive noun",
    examples: {
      good: ["UserRole", "DataStatus", "SecurityLevel"],
      bad: ["userRole", "data_status", "EnhancedUserRole"],
    },
  },

  enums: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: "PascalCase, descriptive noun",
    examples: {
      good: ["UserRole", "DataStatus", "SecurityLevel"],
      bad: ["userRole", "data_status", "UnifiedUserRole"],
    },
  },

  files: {
    pattern: /^[a-z][a-zA-Z0-9-]*\.(ts|tsx|js|jsx|py)$/,
    description: "kebab-case or camelCase, descriptive name",
    examples: {
      good: ["user-service.ts", "dataProcessor.ts", "security-validator.py"],
      bad: ["UserService.ts", "data_processor.ts", "UnifiedUserService.ts"],
    },
  },

  packages: {
    pattern: /^[a-z][a-zA-Z0-9-]*$/,
    description: "kebab-case, descriptive name without marketing prefixes",
    examples: {
      good: ["user-service", "data-processor", "security-validator"],
      bad: ["UserService", "data_processor", "unified-user-service"],
    },
  },
};

/**
 * Get naming rules for a specific context
 */
export function getNamingRules(context: "default" | "strict" | "lenient" = "default"): NamingRuleConfig[] {
  switch (context) {
    case "strict":
      return DEFAULT_NAMING_RULES.map(rule => ({
        ...rule,
        severity: "error" as const,
      }));

    case "lenient":
      return DEFAULT_NAMING_RULES.map(rule => ({
        ...rule,
        severity: "warning" as const,
      }));

    case "default":
    default:
      return DEFAULT_NAMING_RULES;
  }
}

/**
 * Validate a name against naming guidelines
 */
export function validateName(
  name: string,
  type: keyof typeof NAMING_GUIDELINES
): {
  valid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const guidelines = NAMING_GUIDELINES[type];
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Check pattern
  if (!guidelines.pattern.test(name)) {
    errors.push(`Name "${name}" does not match ${type} naming pattern`);
    suggestions.push(`Use ${guidelines.description}`);
  }

  // Check for forbidden prefixes
  const hasForbiddenPrefix = FORBIDDEN_PREFIXES.some(prefix => name.toLowerCase().startsWith(prefix.toLowerCase()));

  if (hasForbiddenPrefix) {
    errors.push(`Name "${name}" contains forbidden marketing prefix`);
    const cleaned = name.replace(
      /^(Unified|Enhanced|Advanced|Super|Ultra|Mega|Ultimate|Comprehensive|Complete|Full-Featured|Enterprise-Grade|Intelligent|Smart|AI-Powered|Next-Gen|Revolutionary)/i,
      ""
    );
    suggestions.push(`Use "${cleaned}" instead`);
  }

  return {
    valid: errors.length === 0,
    errors,
    suggestions,
  };
}
