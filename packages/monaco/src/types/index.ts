/**
 * Core types for Monaco editor and text editing components
 */

export interface LanguageInfo {
  monacoLanguage: string;
  displayName: string;
  isCode: boolean;
}

export interface AnalysisIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  source?: string;
  code?: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  category?: string;
  fixable?: boolean;
  suggestions?: string[];
}

export interface AnalysisResult {
  issues: AnalysisIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    hints: number;
    total: number;
  };
  metadata: {
    language: string;
    fileSize: number;
    lineCount: number;
    complexity?: number;
    maintainability?: number;
    security?: number;
  };
}

export interface ExecutionOutput {
  id: string;
  type: 'stdout' | 'stderr' | 'info' | 'error';
  content: string;
  timestamp: number;
  lineNumber?: number;
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  executionTime: number;
  output: ExecutionOutput[];
  error?: string;
}

export interface BuildCommand {
  id: string;
  name: string;
  command: string;
  description: string;
  language: string;
  category: 'build' | 'run' | 'test' | 'debug' | 'custom';
  default?: boolean;
}

export interface MonacoShikiOptions {
  theme?: string;
  lang?: string;
  themes?: string[];
  langs?: string[];
  enableShikiHighlighting?: boolean;
  // Reynard theme support
  reynardTheme?: string;
  useReynardTheme?: boolean;
}

export interface MonacoShikiState {
  isShikiEnabled: boolean;
  currentTheme: string;
  currentLang: string;
  shikiHighlightedContent: string;
  monacoTheme: string;
}

export interface ShikiOptions {
  theme?: string;
  lang?: string;
  themes?: string[];
  langs?: string[];
}

export interface ShikiState {
  highlighter: any | null;
  isLoading: boolean;
  error: string | null;
  highlightedHtml: string;
}

export interface NaturalLanguageDetectionResult {
  success: boolean;
  naturalLanguage: string;
  confidence: number;
  error?: string;
}

export interface UseLanguageDetectionReturn {
  isNaturalLanguageDetectionAvailable: () => boolean;
  isProgrammingLanguageDetectionAvailable: () => boolean;
  isLoading: () => boolean;
  detectedNaturalLanguage: () => string;
  confidence: () => number;
  error: () => string | null;
  detectNaturalLanguage: (text: string) => Promise<void>;
  detectProgrammingLanguageFromFile: (fileName: string) => string;
}


