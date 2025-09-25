# Reynard Codebase Scanner Service

A comprehensive codebase analysis and monitoring service for the Reynard ecosystem, providing advanced metrics, security scanning, dependency analysis, and real-time monitoring capabilities.

## 🚀 Features

### 🔍 **Analysis Engine**

- **Multi-language Support**: Python, TypeScript, JavaScript, JSON, YAML, Markdown
- **File Discovery**: Intelligent file discovery with pattern matching and exclusion rules
- **AST Analysis**: Deep code analysis using Abstract Syntax Trees
- **Tree-sitter Integration**: Advanced parsing for multiple programming languages

### 📊 **Metrics & Insights**

- **Code Complexity**: Cyclomatic complexity analysis using Radon and Lizard
- **Dependency Graphs**: NetworkX-powered dependency visualization
- **Security Scanning**: Bandit security analysis and Safety vulnerability scanning
- **Performance Analysis**: Bottleneck detection and optimization recommendations

### 🔄 **Real-time Monitoring**

- **File System Watching**: Real-time change detection using Watchdog
- **Change History**: Comprehensive change tracking and history
- **Event Callbacks**: Customizable change event handling
- **Debounced Events**: Intelligent event debouncing to prevent spam

### 📤 **Export & Integration**

- **Multiple Formats**: JSON, CSV, YAML, HTML, XML export support
- **MCP Integration**: Model Context Protocol tool integration
- **REST API**: Comprehensive FastAPI-based REST interface
- **Caching**: Intelligent analysis result caching

## 🛠️ Installation

### Prerequisites

- Python 3.9+
- Git (for repository analysis)

### Install Dependencies

```bash
# Install the service
cd services/codebase-scanner
pip install -e .

# Install optional dependencies for enhanced features
pip install -e ".[dev]"
```

### Optional Dependencies

For enhanced functionality, install these optional packages:

```bash
# Tree-sitter language parsers
pip install tree-sitter-python tree-sitter-typescript tree-sitter-javascript tree-sitter-json

# Analysis tools
pip install radon lizard bandit safety

# Visualization
pip install networkx matplotlib plotly

# File monitoring
pip install watchdog
```

## 🚀 Quick Start

### Basic Usage

```python
from reynard_codebase_scanner import CodebaseScannerService

# Initialize service
scanner = CodebaseScannerService("/path/to/your/codebase")

# Run comprehensive analysis
results = scanner.analyze_codebase()

# Get analysis summary
summary = scanner.get_analysis_summary()
print(f"Analyzed {summary['total_files']} files")

# Export results
scanner.export_analysis(
    analysis_data=results,
    output_path="analysis_report",
    format="html"
)
```

### Real-time Monitoring

```python
# Start monitoring
scanner.start_monitoring()

# Add custom change handler
def on_file_change(file_path: str, change_type: str):
    print(f"File {change_type}: {file_path}")

scanner.real_time_monitor.add_change_callback(on_file_change)

# Get change history
history = scanner.get_change_history(limit=10)
```

## 🌐 REST API

### Start the Service

```bash
cd services/codebase-scanner
uvicorn reynard_codebase_scanner.api:app --host 0.0.0.0 --port 8000
```

### API Endpoints

#### Health & Info

- `GET /health` - Health check
- `GET /info` - Service information and capabilities
- `GET /` - Root endpoint with available endpoints

#### Analysis

- `POST /analyze` - Perform comprehensive codebase analysis
- `GET /analyze/summary` - Get analysis summary
- `GET /analysis/complexity` - Get complexity analysis
- `GET /analysis/security` - Get security analysis
- `GET /analysis/performance` - Get performance analysis
- `GET /analysis/dependencies` - Get dependency analysis
- `GET /analysis/insights` - Get insights and recommendations

#### Monitoring

- `POST /monitoring/start` - Start real-time monitoring
- `POST /monitoring/stop` - Stop real-time monitoring
- `GET /monitoring/status` - Get monitoring status
- `GET /monitoring/history` - Get change history

#### Export

- `POST /export` - Export analysis results
- `GET /export/download/{filename}` - Download exported file

#### Cache Management

- `GET /cache/list` - List cached analyses
- `GET /cache/get/{cache_key}` - Get cached analysis
- `POST /cache/clear` - Clear analysis cache

### Example API Usage

```bash
# Perform analysis
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "include_patterns": ["*.py", "*.ts"],
    "exclude_patterns": ["**/test_*", "**/__pycache__/**"],
    "include_complexity": true,
    "include_security": true
  }'

# Get analysis summary
curl "http://localhost:8000/analyze/summary"

# Export to HTML
curl -X POST "http://localhost:8000/export" \
  -H "Content-Type: application/json" \
  -d '{
    "output_path": "my_analysis",
    "format": "html"
  }'
```

## 📊 Analysis Features

### Code Complexity Analysis

- **Cyclomatic Complexity**: Measures code complexity using Radon
- **Maintainability Index**: Code maintainability scoring
- **Function Analysis**: Detailed function complexity metrics
- **Class Analysis**: Object-oriented design complexity

### Security Scanning

- **Bandit Integration**: Python security vulnerability detection
- **Safety Checks**: Known vulnerability scanning for dependencies
- **Issue Categorization**: High/Medium/Low severity classification
- **File-level Reporting**: Security issues grouped by file

### Dependency Analysis

- **Import Tracking**: Comprehensive import and dependency mapping
- **Circular Dependencies**: Detection of circular import chains
- **Dependency Graphs**: Visual dependency relationship mapping
- **Most Connected**: Identification of highly connected modules

### Performance Analysis

- **Large Files**: Detection of oversized files (>1000 lines)
- **Complex Functions**: Functions with high complexity scores
- **Import Overload**: Files with excessive imports
- **Nesting Depth**: Deep nesting and structural issues

## 🔧 Configuration

### Analysis Configuration

```python
# Custom analysis configuration
results = scanner.analyze_codebase(
    include_patterns=["*.py", "*.ts", "*.js"],
    exclude_patterns=["**/test_*", "**/node_modules/**"],
    max_depth=5,
    include_complexity=True,
    include_security=True,
    include_performance=True,
    include_dependencies=True
)
```

### Monitoring Configuration

```python
# Start monitoring with custom patterns
scanner.start_monitoring(
    include_patterns=["*.py", "*.ts"],
    exclude_patterns=["**/__pycache__/**", "**/node_modules/**"]
)
```

## 📈 Export Formats

### JSON Export

```python
scanner.export_analysis(
    output_path="analysis",
    format="json"
)
```

### HTML Report

```python
scanner.export_analysis(
    output_path="report",
    format="html"
)
```

### CSV Data

```python
scanner.export_analysis(
    output_path="metrics",
    format="csv"
)
```

## 🧪 Testing

Run the test suite:

```bash
cd services/codebase-scanner
python -m pytest tests/ -v
```

## 🔌 MCP Integration

The service provides MCP (Model Context Protocol) integration for seamless tool integration:

```python
# Register custom MCP tools
scanner.mcp_integration.register_tool("custom_analyzer", my_analysis_function)

# Call MCP tools
result = scanner.mcp_integration.call_tool("custom_analyzer", file_path)
```

## 📝 API Documentation

Once the service is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🏗️ Architecture

### Core Components

- **AnalysisEngine**: File discovery and parsing
- **MetricsInsights**: Complexity, security, and performance analysis
- **RealTimeMonitor**: File system monitoring and change detection
- **ExportManager**: Multi-format export functionality
- **MCPIntegration**: Model Context Protocol integration

### Service Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FastAPI App   │    │  Scanner Service │    │ Analysis Engine │
│                 │◄──►│                  │◄──►│                 │
│  REST Endpoints │    │  Orchestration   │    │ File Discovery  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Metrics Insights │
                       │                  │
                       │ • Complexity     │
                       │ • Security       │
                       │ • Performance    │
                       │ • Dependencies   │
                       └──────────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the Reynard ecosystem and follows the same licensing terms.

## 🆘 Support

For issues and questions:

- Check the API documentation at `/docs`
- Review the test suite for usage examples
- Open an issue in the Reynard repository

---

_Built with 🦊 for the Reynard ecosystem_
