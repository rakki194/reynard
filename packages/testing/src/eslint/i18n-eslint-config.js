/**
 * ESLint Configuration for i18n Rules
 * Provides hardcoded string detection and translation validation
 */

module.exports = {
  plugins: ['@reynard/i18n'],
  rules: {
    // Detect hardcoded strings in JSX and regular code
    '@reynard/i18n/no-hardcoded-strings': ['error', {
      minLength: 3,
      ignorePatterns: [
        '^[a-z]+[A-Z][a-z]*$', // camelCase
        '^[A-Z_]+$', // CONSTANTS
        '^[0-9]+$', // numbers
        '^[a-z]{1,2}$', // short strings
        '^(id|class|type|name|value|key|index|count|size|width|height|color|url|path|file|dir|src|alt|title|role|aria|data|test|spec|mock|stub|fixture)$'
      ],
      allowedInFiles: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/test-utils.ts',
        '**/test-utils.tsx'
      ]
    }],
    
    // Detect untranslated keys
    '@reynard/i18n/no-untranslated-keys': ['warn', {
      namespaces: ['common', 'components', 'ui', 'auth', 'chat', 'gallery', 'settings', 'themes', 'charts', 'floating-panel', 'caption', 'boundingbox', 'audio', 'video', 'image', 'multimodal', 'rag', 'monaco', '3d', 'games', 'i18n'],
      locales: ['en', 'es', 'fr', 'de', 'ru', 'ar', 'zh', 'ja', 'ko', 'pt', 'it', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'hu', 'tr']
    }],
    
    // Detect missing pluralization
    '@reynard/i18n/require-pluralization': ['warn', {
      locales: ['en', 'es', 'fr', 'de', 'ru', 'ar', 'zh', 'ja', 'ko', 'pt', 'it', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'hu', 'tr']
    }],
    
    // Detect RTL issues
    '@reynard/i18n/rtl-support': ['warn', {
      rtlLocales: ['ar', 'he', 'fa', 'ur']
    }]
  },
  
  overrides: [
    // Test files - more lenient rules
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/test-utils.ts', '**/test-utils.tsx'],
      rules: {
        '@reynard/i18n/no-hardcoded-strings': 'off',
        '@reynard/i18n/no-untranslated-keys': 'off'
      }
    },
    
    // Configuration files - more lenient rules
    {
      files: ['**/*.config.js', '**/*.config.ts', '**/*.config.json', '**/package.json', '**/tsconfig.json'],
      rules: {
        '@reynard/i18n/no-hardcoded-strings': 'off',
        '@reynard/i18n/no-untranslated-keys': 'off'
      }
    },
    
    // Documentation files - more lenient rules
    {
      files: ['**/*.md', '**/*.mdx', '**/README.md', '**/CHANGELOG.md'],
      rules: {
        '@reynard/i18n/no-hardcoded-strings': 'off',
        '@reynard/i18n/no-untranslated-keys': 'off'
      }
    },
    
    // Core packages that don't need i18n
    {
      files: [
        'packages/algorithms/**/*',
        'packages/api-client/**/*',
        'packages/colors/**/*',
        'packages/composables/**/*',
        'packages/config/**/*',
        'packages/connection/**/*',
        'packages/core/**/*',
        'packages/fluent-icons/**/*'
      ],
      rules: {
        '@reynard/i18n/no-hardcoded-strings': 'off',
        '@reynard/i18n/no-untranslated-keys': 'off',
        '@reynard/i18n/require-pluralization': 'off',
        '@reynard/i18n/rtl-support': 'off'
      }
    }
  ]
};
