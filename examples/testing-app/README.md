# 🦦 Reynard Testing Dashboard

*splashes with testing dashboard enthusiasm* A comprehensive dashboard for viewing all test results, benchmarks, and profiling data from the Reynard testing ecosystem.

## 🎯 Overview

The Reynard Testing Dashboard provides a beautiful, structured interface for exploring all testing data stored in the `reynard_e2e` PostgreSQL database. It displays:

- **Test Runs**: All pytest, vitest, e2e, and benchmark executions
- **Test Results**: Individual test outcomes with detailed information
- **Benchmark Data**: Performance metrics and load testing results
- **Coverage Reports**: Code coverage statistics and trends
- **Trace Data**: Execution traces and debugging information
- **Artifacts**: Screenshots, videos, and other test artifacts

## 🚀 Features

### 📊 **Dashboard Overview**
- Real-time statistics and trends
- Success rate monitoring
- Performance metrics visualization
- Recent failures tracking

### 🔍 **Advanced Filtering**
- Filter by test type (pytest, vitest, e2e, benchmark, etc.)
- Filter by environment (development, staging, production)
- Filter by status (running, completed, failed, cancelled)
- Filter by branch and date range
- Configurable result limits

### 📈 **Data Visualization**
- Interactive test run cards
- Performance trend indicators
- Coverage percentage displays
- Duration and timing information

### 🎨 **Modern UI/UX**
- Responsive design for all screen sizes
- Dark/light theme support
- Smooth animations and transitions
- Accessible color schemes

## 🛠️ Setup

### Prerequisites

1. **Backend API Running**: Ensure the Reynard backend is running on `http://localhost:8000`
2. **Database Available**: The `reynard_e2e` database should be accessible
3. **Node.js**: Version 18+ recommended

### Installation

```bash
# Navigate to the testing dashboard
cd examples/testing-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dashboard will be available at `http://localhost:3001`

### Environment Configuration

Create a `.env` file in the project root:

```env
# Testing API Configuration
VITE_TESTING_API_URL=http://localhost:8000

# Optional: Custom API timeout
VITE_API_TIMEOUT=30000
```

## 📱 Usage

### Dashboard Navigation

1. **Overview Tab**: View overall statistics and recent test runs
2. **Filter Panel**: Use the collapsible filter panel to narrow down results
3. **Test Run Cards**: Click on any test run card to view detailed information

### Filtering Options

- **Test Type**: Select specific test frameworks (pytest, vitest, e2e, etc.)
- **Environment**: Filter by deployment environment
- **Status**: Show only running, completed, failed, or cancelled tests
- **Branch**: Filter by Git branch name
- **Date Range**: Set custom date/time ranges
- **Result Limit**: Control how many results to display

### Data Interpretation

#### Test Run Cards
- **Status Colors**: Green (completed), Red (failed), Blue (running), Yellow (cancelled)
- **Test Type Icons**: 🐍 (pytest), ⚡ (vitest), 🎭 (e2e), 📊 (benchmark)
- **Success Rate**: Color-coded based on performance (green ≥80%, yellow ≥60%, red <60%)

#### Statistics Cards
- **Trend Indicators**: 📈 (improving), 📉 (declining), ➖ (stable)
- **Value Formatting**: Automatic scaling (K for thousands, M for millions)
- **Color Coding**: Each metric has a distinct color theme

## 🔧 API Integration

The dashboard integrates with the Reynard Testing Ecosystem API:

### Available Endpoints

- `GET /api/testing/health` - API health check
- `GET /api/testing/test-runs` - List test runs with filtering
- `GET /api/testing/test-runs/{id}` - Get specific test run
- `GET /api/testing/test-runs/{id}/summary` - Get comprehensive summary
- `GET /api/testing/test-runs/{id}/test-results` - Get individual test results
- `GET /api/testing/test-runs/{id}/benchmark-results` - Get benchmark data
- `GET /api/testing/test-runs/{id}/performance-metrics` - Get performance metrics
- `GET /api/testing/test-runs/{id}/trace-data` - Get trace information
- `GET /api/testing/test-runs/{id}/coverage-data` - Get coverage data
- `GET /api/testing/test-runs/{id}/test-artifacts` - Get test artifacts
- `GET /api/testing/test-runs/{id}/test-reports` - Get generated reports

### Error Handling

The dashboard gracefully handles:
- API unavailability with retry options
- Network timeouts and connection errors
- Empty result sets with helpful messaging
- Invalid filter combinations

## 🎨 Customization

### Theming

The dashboard supports CSS custom properties for easy theming:

```css
:root {
  --color-primary: #007bff;
  --color-success: #28a745;
  --color-error: #dc3545;
  --color-warning: #ffc107;
  /* ... more variables */
}
```

### Component Styling

All components use consistent design tokens:
- Spacing: `--spacing-xs` to `--spacing-xxl`
- Border radius: `--radius-sm` to `--radius-xl`
- Transitions: `--transition-fast`, `--transition-normal`, `--transition-slow`

## 🧪 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── TestRunCard.tsx  # Individual test run display
│   ├── StatsCard.tsx    # Statistics display
│   └── FilterPanel.tsx  # Filtering interface
├── pages/               # Page components
│   └── Dashboard.tsx    # Main dashboard view
├── types/               # TypeScript type definitions
│   └── testing.ts       # Testing ecosystem types
├── utils/               # Utility functions
│   └── api.ts           # API client
├── styles/              # CSS styles
│   └── app.css          # Main stylesheet
├── App.tsx              # Main app component
└── index.tsx            # Entry point
```

### Adding New Features

1. **New Components**: Add to `src/components/`
2. **New Pages**: Add to `src/pages/`
3. **New Types**: Extend `src/types/testing.ts`
4. **New API Methods**: Add to `src/utils/api.ts`

### Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Serve Production Build

```bash
pnpm serve
```

### Environment Variables for Production

```env
VITE_TESTING_API_URL=https://your-api-domain.com
VITE_API_TIMEOUT=30000
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new data structures
3. Include responsive design considerations
4. Test with various screen sizes
5. Ensure accessibility compliance

## 📄 License

This project is part of the Reynard ecosystem and follows the same licensing terms.

## 🆘 Troubleshooting

### Common Issues

**API Connection Failed**
- Ensure the backend server is running on `http://localhost:8000`
- Check that the `reynard_e2e` database is accessible
- Verify network connectivity

**No Data Displayed**
- Check if test runs exist in the database
- Verify filter settings aren't too restrictive
- Ensure the API endpoints are responding correctly

**Styling Issues**
- Clear browser cache and reload
- Check for CSS conflicts with browser extensions
- Verify all dependencies are installed correctly

### Getting Help

- Check the Reynard documentation
- Review the API endpoint documentation
- Examine browser developer tools for errors
- Check the backend server logs

---

🦦 *splashes with dashboard completion satisfaction* The Reynard Testing Dashboard provides a comprehensive, beautiful, and functional interface for exploring all your testing data. Happy testing! 🧪✨
