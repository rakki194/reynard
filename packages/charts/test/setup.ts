import { vi } from "vitest";

// Mock Chart.js with comprehensive exports
vi.mock("chart.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Chart: {
      ...actual.Chart,
      register: vi.fn(),
    },
  };
});

// Mock Chart.js directly
vi.mock("chart.js", () => ({
  default: {
    Chart: vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
      update: vi.fn(),
      data: {},
      options: {},
    })),
    register: vi.fn(),
    CategoryScale: {},
    LinearScale: {},
    PointElement: {},
    LineElement: {},
    BarElement: {},
    ArcElement: {},
    Title: {},
    Tooltip: {},
    Legend: {},
    Filler: {},
    TimeScale: {},
    TimeSeriesScale: {},
    LineController: {},
    BarController: {},
    PieController: {},
    DoughnutController: {},
  },
  Chart: {
    register: vi.fn(),
  },
  register: vi.fn(),
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
  TimeScale: {},
  TimeSeriesScale: {},
  LineController: {},
  BarController: {},
  PieController: {},
  DoughnutController: {},
}));

// Mock chartjs-adapter-date-fns
vi.mock("chartjs-adapter-date-fns", () => ({}));

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Extend expect with custom matchers
import { expect } from "vitest";

expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () => `expected ${received} to be in the document`,
    };
  },
  toHaveClass(received, className) {
    if (!received || typeof received.classList === "undefined") {
      return {
        pass: false,
        message: () => `expected ${received} to have class ${className}`,
      };
    }
    const pass = received.classList.contains(className);
    return {
      pass,
      message: () => `expected ${received} to have class ${className}`,
    };
  },
  toHaveAttribute(received, attribute, value) {
    if (!received || typeof received.getAttribute === "undefined") {
      return {
        pass: false,
        message: () => `expected ${received} to have attribute ${attribute}`,
      };
    }
    const actualValue = received.getAttribute(attribute);
    const pass = value ? actualValue === value : actualValue !== null;
    return {
      pass,
      message: () => `expected ${received} to have attribute ${attribute}${value ? ` with value ${value}` : ""}`,
    };
  },
  toHaveStyle(received, style) {
    if (!received || typeof received.style === "undefined") {
      return {
        pass: false,
        message: () => `expected ${received} to have style ${style}`,
      };
    }
    const [property, value] = style.split(": ");
    const actualValue = received.style.getPropertyValue(property);
    const pass = actualValue === value;
    return {
      pass,
      message: () => `expected ${received} to have style ${style}, but got ${property}: ${actualValue}`,
    };
  },
});