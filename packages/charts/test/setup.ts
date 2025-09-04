import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Chart.js to avoid canvas issues in jsdom
vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn(),
    unregister: vi.fn(),
  },
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  BarController: vi.fn(),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  LineController: vi.fn(),
  LineElement: vi.fn(),
  PointElement: vi.fn(),
  ArcElement: vi.fn(),
  DoughnutController: vi.fn(),
  PieController: vi.fn(),
  TimeScale: vi.fn(),
}));

// Mock solid-chartjs
vi.mock("solid-chartjs", () => ({
  Bar: vi.fn(() => "Bar Chart"),
  Line: vi.fn(() => "Line Chart"),
  Pie: vi.fn(() => "Pie Chart"),
  Doughnut: vi.fn(() => "Doughnut Chart"),
}));

// Mock chartjs-adapter-date-fns
vi.mock("chartjs-adapter-date-fns", () => ({}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock the problematic import
vi.doMock("chartjs-adapter-date-fns", () => ({}));
