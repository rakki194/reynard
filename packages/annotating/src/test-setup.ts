import { vi } from "vitest";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  debug: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock timers
vi.useFakeTimers();

// Mock File API for file upload tests
global.File = class File {
  constructor(
    public content: string[],
    public name: string,
    public options: { type?: string } = {}
  ) {
    this.type = options.type || 'text/plain';
  }
  
  type: string;
  size: number = 0;
  
  static fromString(content: string, name: string, type?: string) {
    return new File([content], name, { type });
  }
} as any;

// Mock URL.createObjectURL for image preview tests
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock ResizeObserver for component tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch for API calls
global.fetch = vi.fn();
