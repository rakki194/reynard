/**
 * ESLint Plugin for i18n Testing
 * Detects hardcoded strings and i18n issues in Reynard packages
 */

import type { ESLint } from 'eslint';

// ESLint rule definitions
export const i18nRules = {
  'no-hardcoded-strings': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hardcoded strings in JSX/TSX files',
        category: 'Best Practices',
        recommended: true
      },
      fixable: 'code',
      schema: [
        {
          type: 'object',
          properties: {
            ignorePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: []
            },
            minLength: {
              type: 'number',
              default: 3
            }
          },
          additionalProperties: false
        }
      ]
    },
    create(context: any) {
      const options = context.options[0] || {};
      const ignorePatterns = options.ignorePatterns || [];
      const minLength = options.minLength || 3;
      
      return {
        JSXText(node: any) {
          const text = node.value.trim();
          
          if (text.length < minLength) return;
          if (ignorePatterns.some((pattern: string) => text.match(new RegExp(pattern)))) return;
          if (isTechnicalTerm(text)) return;
          
          context.report({
            node,
            message: `Hardcoded string found: "${text}". Consider using i18n.t('${generateTranslationKey(text)}') instead.`,
            fix(fixer: any) {
              return fixer.replaceText(node, `{i18n.t('${generateTranslationKey(text)}')}`);
            }
          });
        },
        
        Literal(node: any) {
          if (typeof node.value !== 'string') return;
          if (node.value.length < minLength) return;
          if (ignorePatterns.some((pattern: string) => node.value.match(new RegExp(pattern)))) return;
          if (isTechnicalTerm(node.value)) return;
          
          // Skip if parent is already using i18n
          if (node.parent && (
            node.parent.type === 'CallExpression' && 
            node.parent.callee && 
            (node.parent.callee.name === 't' || node.parent.callee.property?.name === 't')
          )) {
            return;
          }
          
          context.report({
            node,
            message: `Hardcoded string found: "${node.value}". Consider using i18n.t('${generateTranslationKey(node.value)}') instead.`
          });
        }
      };
    }
  },
  
  'no-untranslated-keys': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Ensure all translation keys exist in translation files',
        category: 'Best Practices',
        recommended: true
      },
      schema: [
        {
          type: 'object',
          properties: {
            translationFiles: {
              type: 'array',
              items: { type: 'string' },
              default: ['src/lang/**/*.ts']
            }
          },
          additionalProperties: false
        }
      ]
    },
    create(context: any) {
      const options = context.options[0] || {};
      const translationFiles = options.translationFiles || ['src/lang/**/*.ts'];
      
      return {
        CallExpression(node: any) {
          if (node.callee && (
            node.callee.name === 't' || 
            (node.callee.type === 'MemberExpression' && node.callee.property?.name === 't')
          )) {
            const key = node.arguments[0];
            if (key && key.type === 'Literal' && typeof key.value === 'string') {
              // This would check against actual translation files
              // For now, just report as a warning
              context.report({
                node: key,
                message: `Translation key "${key.value}" should be validated against translation files.`
              });
            }
          }
        }
      };
    }
  }
};

// Helper functions
function generateTranslationKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .substring(0, 50);
}

function isTechnicalTerm(text: string): boolean {
  const technicalTerms = [
    'id', 'class', 'type', 'name', 'value', 'key', 'index', 'count', 'size',
    'width', 'height', 'color', 'url', 'path', 'file', 'dir', 'src', 'alt',
    'title', 'role', 'aria', 'data', 'test', 'spec', 'mock', 'stub', 'fixture'
  ];
  
  return technicalTerms.includes(text.toLowerCase()) || 
         /^[a-z]+[A-Z][a-z]*$/.test(text) || // camelCase
         /^[A-Z_]+$/.test(text); // CONSTANTS
}

// Export the plugin
export const i18nPlugin = {
  rules: i18nRules,
  configs: {
    recommended: {
      plugins: ['@reynard/i18n'],
      rules: {
        '@reynard/i18n/no-hardcoded-strings': 'error',
        '@reynard/i18n/no-untranslated-keys': 'warn'
      }
    }
  }
};
