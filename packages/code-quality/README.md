# 🦊 Reynard Code Quality Analysis System

_red fur gleams with intelligence_ A comprehensive SonarQube-like code quality analysis system for
the Reynard framework, providing multi-language static analysis, security vulnerability detection, and
quality gate enforcement.

## 🎯 Overview

The Reynard Code Quality Analysis System provides enterprise-grade code quality monitoring with:

- **Multi-Language Support**: TypeScript, JavaScript, Python, Shell, Markdown, YAML, JSON
- **Security Integration**: Leverages existing Fenrir security tools (Bandit, ESLint Security, custom exploits)
- **Quality Gates**: Configurable thresholds and environment-specific rules
- **Real-Time Dashboard**: Web-based visualization of code quality metrics
- **CI/CD Integration**: GitHub Actions workflow for continuous monitoring
- **Comprehensive Reporting**: Trend analysis and detailed quality metrics

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build
```

### Basic Usage

```typescript
import { createCodeQualitySystem } from "reynard-code-quality";

// Create analysis system
const system = createCodeQualitySystem("/path/to/project");

// Initialize with default configuration
await system.initialize();

// Run complete analysis
const results = await system.runCompleteAnalysis("development");

console.log("Analysis Results:", results);
```

### CLI Usage

```bash
# Run comprehensive analysis
npx reynard-code-quality analyze --project . --environment development

# Run security analysis only
npx reynard-code-quality security --project . --format summary

# Evaluate quality gates
npx reynard-code-quality quality-gate --project . --environment production

# Watch for file changes
npx reynard-code-quality watch --project . --interval 5000
```

## 🛠️ Components

### Core Analysis Engine

The `CodeQualityAnalyzer` provides comprehensive code analysis:

```typescript
import { CodeQualityAnalyzer } from "reynard-code-quality";

const analyzer = new CodeQualityAnalyzer("/path/to/project");
const result = await analyzer.analyzeProject();

console.log("Lines of Code:", result.metrics.linesOfCode);
console.log("Issues Found:", result.issues.length);
console.log("Complexity:", result.metrics.cyclomaticComplexity);
```

**Features:**

- File discovery and language detection
- Code metrics calculation (LOC, complexity, maintainability)
- Issue detection using existing linting tools
- Multi-language support
- Real-time analysis with event emission

### Quality Gates System

The `QualityGateManager` enforces quality standards:

```typescript
import { QualityGateManager } from "reynard-code-quality";

const manager = new QualityGateManager("/path/to/project");
await manager.loadConfiguration();

// Create custom quality gate
await manager.addQualityGate({
  id: "custom-gate",
  name: "Custom Quality Gate",
  environment: "production",
  enabled: true,
  conditions: [
    {
      metric: "bugs",
      operator: "EQ",
      threshold: 0,
      description: "No bugs allowed in production",
    },
  ],
});

// Evaluate quality gates
const results = manager.evaluateQualityGates(metrics, "production");
```

**Features:**

- Configurable quality gates with conditions
- Environment-specific rules (development, staging, production)
- Multiple operators (GT, LT, EQ, NE, GTE, LTE)
- JSON configuration persistence
- Validation and error handling

### Security Analysis Integration

The `SecurityAnalysisIntegration` leverages existing Fenrir tools:

```typescript
import { SecurityAnalysisIntegration } from "reynard-code-quality";

const security = new SecurityAnalysisIntegration("/path/to/project");
const result = await security.runSecurityAnalysis(files);

console.log("Vulnerabilities:", result.summary.totalVulnerabilities);
console.log("Security Rating:", result.summary.securityRating);
```

**Supported Tools:**

- **Bandit**: Python security vulnerability scanner
- **ESLint Security**: JavaScript/TypeScript security rules
- **Fenrir Fuzzing**: Custom exploit testing framework
- **Fenrir LLM Exploits**: AI/ML specific vulnerability detection

**Features:**

- Multi-tool integration
- Vulnerability classification (CRITICAL, HIGH, MEDIUM, LOW)
- Security hotspot detection
- Duplicate removal and deduplication
- Confidence scoring

### Web Dashboard

The `CodeQualityDashboard` provides real-time visualization:

```typescript
import { CodeQualityDashboard } from 'reynard-code-quality/dashboard';

// Use in your React/SolidJS application
<CodeQualityDashboard
  projectRoot="/path/to/project"
  autoRefresh={true}
  refreshInterval={300000}
/>
```

**Features:**

- Real-time metrics display
- Quality gate status visualization
- Security analysis results
- Issue tracking and filtering
- Language breakdown
- Responsive design

## 🔧 Configuration

### Quality Gates Configuration

Create `.reynard/quality-gates.json`:

```json
{
  "gates": [
    {
      "id": "reynard-development",
      "name": "Reynard Development Quality Gate",
      "description": "Quality standards for development environment",
      "environment": "development",
      "enabled": true,
      "conditions": [
        {
          "metric": "bugs",
          "operator": "EQ",
          "threshold": 0,
          "description": "No bugs allowed in development"
        },
        {
          "metric": "vulnerabilities",
          "operator": "EQ",
          "threshold": 0,
          "description": "No security vulnerabilities allowed"
        },
        {
          "metric": "codeSmells",
          "operator": "LT",
          "threshold": 50,
          "description": "Keep code smells under 50"
        }
      ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "defaultGate": "reynard-development",
  "environments": {
    "development": "reynard-development",
    "staging": "reynard-development",
    "production": "reynard-production"
  }
}
```

### Security Tools Configuration

Configure security tools in the `SecurityAnalysisIntegration`:

```typescript
const security = new SecurityAnalysisIntegration(projectRoot);

// Enable/disable specific tools
await security.configureSecurityTool("bandit", true);
await security.configureSecurityTool("eslint-security", true);
await security.configureSecurityTool("fenrir-fuzzing", false);
```

## 🚀 CI/CD Integration

### GitHub Actions

The system includes a comprehensive GitHub Actions workflow:

```yaml
name: 🦊 Reynard Code Quality Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM UTC

jobs:
  code-quality-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: 🦊 Run Code Quality Analysis
        run: |
          cd packages/code-quality
          node dist/cli.js analyze --project ../../ --environment development
```

**Features:**

- Automated analysis on push/PR
- Scheduled daily analysis
- Quality gate enforcement
- Security vulnerability detection
- PR comments with results
- Artifact upload for results
- Workflow failure on critical issues

### Custom CI Integration

```bash
# In your CI script
cd packages/code-quality

# Run analysis
node dist/cli.js analyze \
  --project ../../ \
  --environment production \
  --output ../../quality-results.json

# Check exit code
if [ $? -ne 0 ]; then
  echo "Quality gates failed!"
  exit 1
fi
```

## 📊 Metrics and Reporting

### Code Quality Metrics

- **Lines of Code**: Total lines of source code
- **Lines of Comments**: Comment density
- **Cyclomatic Complexity**: Code complexity measurement
- **Cognitive Complexity**: Human-readable complexity
- **Maintainability Index**: Overall maintainability score
- **Code Smells**: Quality issues and anti-patterns
- **Bugs**: Potential runtime errors
- **Vulnerabilities**: Security issues
- **Security Hotspots**: Security-sensitive areas
- **Duplications**: Code duplication percentage
- **Coverage**: Test coverage metrics

### Quality Ratings

- **Reliability Rating**: A (0 bugs) to E (many bugs)
- **Security Rating**: A (0 vulnerabilities) to E (many vulnerabilities)
- **Maintainability Rating**: A (high maintainability) to E (low maintainability)

### Security Analysis

- **Vulnerability Classification**: CRITICAL, HIGH, MEDIUM, LOW, INFO
- **Security Hotspots**: Authentication, Authorization, Cryptography, etc.
- **Tool Integration**: Bandit, ESLint Security, Fenrir exploits
- **Confidence Scoring**: HIGH, MEDIUM, LOW confidence levels

## 🎨 Dashboard Features

### Real-Time Monitoring

- Live metrics updates
- Quality gate status
- Security analysis results
- Issue tracking
- Trend visualization

### Interactive Features

- Issue filtering and sorting
- File-level analysis
- Language breakdown
- Security vulnerability details
- Quality gate condition details

### Responsive Design

- Mobile-friendly interface
- Dark/light theme support
- Accessible design
- Fast loading times

## 🔍 Advanced Usage

### Custom Analysis

```typescript
import { CodeQualityAnalyzer } from "reynard-code-quality";

const analyzer = new CodeQualityAnalyzer("/path/to/project");

// Set up event listeners
analyzer.on("analysisComplete", result => {
  console.log("Analysis complete:", result);
});

analyzer.on("analysisError", error => {
  console.error("Analysis failed:", error);
});

// Run analysis
await analyzer.analyzeProject();
```

### Custom Quality Gates

```typescript
import { QualityGateManager } from "reynard-code-quality";

const manager = new QualityGateManager("/path/to/project");

// Create environment-specific gate
await manager.addQualityGate({
  id: "staging-gate",
  name: "Staging Quality Gate",
  environment: "staging",
  enabled: true,
  conditions: [
    {
      metric: "bugs",
      operator: "EQ",
      threshold: 0,
    },
    {
      metric: "vulnerabilities",
      operator: "LT",
      threshold: 5,
    },
    {
      metric: "maintainabilityIndex",
      operator: "GT",
      threshold: 70,
    },
  ],
});
```

### Security Tool Integration

```typescript
import { SecurityAnalysisIntegration } from "reynard-code-quality";

const security = new SecurityAnalysisIntegration("/path/to/project");

// Add custom security tool
security.addSecurityTool({
  name: "custom-scanner",
  enabled: true,
  command: "custom-security-scan",
  args: ["--format", "json"],
  outputParser: output => {
    // Custom parser logic
    return vulnerabilities;
  },
  supportedLanguages: ["python", "javascript"],
});
```

## 🐛 Troubleshooting

### Common Issues

**Analysis fails with permission errors:**

```bash
# Ensure proper file permissions
chmod -R 755 /path/to/project
```

**Security tools not found:**

```bash
# Install required tools
pip install bandit
npm install -g eslint-plugin-security
```

**Quality gates not loading:**

```bash
# Check configuration file
cat .reynard/quality-gates.json
```

**Dashboard not updating:**

```bash
# Check auto-refresh settings
# Ensure proper event listeners are set up
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=reynard-code-quality:* npx reynard-code-quality analyze
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run quality analysis
6. Submit a pull request

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/reynard.git
cd reynard/packages/code-quality

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm lint

# Build package
pnpm build
```

## 📚 API Reference

### CodeQualityAnalyzer

- `analyzeProject()`: Run comprehensive analysis
- `getAnalysisHistory()`: Get analysis history
- `getLatestAnalysis()`: Get latest analysis results

### QualityGateManager

- `addQualityGate(gate)`: Add new quality gate
- `updateQualityGate(id, updates)`: Update existing gate
- `removeQualityGate(id)`: Remove quality gate
- `evaluateQualityGates(metrics, environment)`: Evaluate gates

### SecurityAnalysisIntegration

- `runSecurityAnalysis(files)`: Run security analysis
- `configureSecurityTool(name, enabled)`: Configure tool
- `getSecurityTools()`: Get available tools

## 📄 License

MIT License - see [LICENSE](../../LICENSE.md) for details.

## 🦊 Reynard Integration

This package is part of the Reynard framework and follows the Reynard coding standards:

- **140-line axiom**: Maximum 140 lines per source file
- **Modular architecture**: Self-contained packages
- **Animal spirit principles**: Fox cunning, Otter thoroughness, Wolf security
- **Quality first**: Comprehensive testing and validation

---

_red fur gleams with pride_ Built with the cunning of a fox, the thoroughness of an otter, and
the security focus of a wolf. Welcome to the apex predators of code quality! 🦊🦦🐺

