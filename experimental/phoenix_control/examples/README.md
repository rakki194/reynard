# PHOENIX Control Examples

This directory contains comprehensive examples demonstrating the capabilities of the PHOENIX Control system. Each example focuses on a specific aspect of the system and provides practical usage patterns.

## Examples Overview

### 1. Basic Usage (`basic_usage.py`)

**Purpose**: Introduction to PHOENIX Control fundamentals
**Focus**: Core concepts and basic operations

**What it demonstrates**:

- Success-Advisor-8 initialization and configuration
- Agent state persistence and management
- Basic release automation workflow
- Quality assurance framework overview

**Key Features**:

- Agent state creation and validation
- Persistence system usage
- Release configuration
- Quality gate validation

**Usage**:

```bash
python examples/basic_usage.py
```

### 2. Release Automation (`release_automation.py`)

**Purpose**: Complete release automation workflow
**Focus**: Version management, changelog updates, and git operations

**What it demonstrates**:

- Version detection and management
- Changelog creation and validation
- Release configuration options
- Git workflow automation
- Version comparison and history

**Key Features**:

- Semantic versioning
- Automated changelog updates
- Release configuration management
- Version comparison utilities
- Release history tracking

**Usage**:

```bash
python examples/release_automation.py
```

### 3. Quality Assurance (`quality_assurance.py`)

**Purpose**: Comprehensive quality assurance framework
**Focus**: Code quality, security scanning, and performance testing

**What it demonstrates**:

- Code quality validation (linting, formatting, type safety)
- Security vulnerability scanning
- Performance testing and analysis
- Quality metrics and trends
- Quality gate validation

**Key Features**:

- Frontend and backend quality validation
- Dependency vulnerability scanning
- Python security scanning (Bandit)
- Secret scanning
- Performance benchmarking
- Quality score calculation

**Usage**:

```bash
python examples/quality_assurance.py
```

### 4. Agent Management (`agent_management.py`)

**Purpose**: Agent state persistence and management
**Focus**: Agent lifecycle, state management, and backup/recovery

**What it demonstrates**:

- Agent state creation and validation
- Persistence system operations
- Backup and recovery procedures
- Agent state comparison
- Statistics and monitoring

**Key Features**:

- Agent state persistence
- Backup and recovery
- State validation
- Agent comparison
- Statistics and monitoring
- Cleanup operations

**Usage**:

```bash
python examples/agent_management.py
```

### 5. Integration Example (`integration_example.py`)

**Purpose**: Complete system integration demonstration
**Focus**: End-to-end workflow with all components

**What it demonstrates**:

- System initialization and configuration
- Complete release workflow
- Quality assurance pipeline
- Agent state management
- Post-release validation
- System health monitoring

**Key Features**:

- Full system integration
- End-to-end release workflow
- Quality gate validation
- Agent state updates
- System health monitoring
- Integration summary

**Usage**:

```bash
python examples/integration_example.py
```

## Example Structure

Each example follows a consistent structure:

1. **Imports and Setup**: Import necessary modules and configure paths
2. **System Initialization**: Initialize required components
3. **Core Operations**: Demonstrate main functionality
4. **Validation and Testing**: Show validation and testing procedures
5. **Results and Summary**: Display results and provide summary

## Running Examples

### Prerequisites

1. **Python Environment**: Ensure Python 3.8+ is installed
2. **Dependencies**: Install required packages from `requirements.txt`
3. **Project Structure**: Ensure the `phoenix_control` directory structure is complete

### Installation

```bash
# Navigate to the phoenix_control directory
cd experimental/phoenix_control

# Install dependencies
pip install -r requirements.txt
```

### Execution

```bash
# Run individual examples
python examples/basic_usage.py
python examples/release_automation.py
python examples/quality_assurance.py
python examples/agent_management.py
python examples/integration_example.py

# Or run all examples
for example in examples/*.py; do
    echo "Running $example..."
    python "$example"
    echo "Completed $example"
    echo "---"
done
```

## Example Output

Each example provides detailed output including:

- **System Status**: Component initialization and status
- **Operation Results**: Success/failure indicators for each operation
- **Quality Metrics**: Quality scores and validation results
- **Performance Data**: Timing and performance information
- **Summary Information**: Overall results and recommendations

## Customization

Examples can be customized by modifying:

- **Configuration**: Update `ReleaseConfig` and `QualityConfig` objects
- **Agent Properties**: Modify agent traits, abilities, and knowledge
- **Quality Thresholds**: Adjust quality gate requirements
- **Release Settings**: Change version bump types and release options

## Safety Features

All examples include safety features:

- **Simulation Mode**: Examples run in simulation mode by default
- **No Git Operations**: Actual git operations are disabled for safety
- **Validation Only**: Quality checks are performed without modifications
- **Backup Protection**: Agent states are backed up before operations

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure the `src` directory is in the Python path
2. **Missing Dependencies**: Install all required packages from `requirements.txt`
3. **Permission Issues**: Ensure write permissions for state and backup directories
4. **Configuration Errors**: Verify configuration objects are properly initialized

### Debug Mode

Enable debug mode for detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

When adding new examples:

1. **Follow Structure**: Use the established example structure
2. **Include Documentation**: Add comprehensive docstrings and comments
3. **Safety First**: Include safety features and validation
4. **Test Thoroughly**: Ensure examples work correctly
5. **Update README**: Update this README with new example information

## Support

For questions or issues with examples:

1. **Check Logs**: Review console output for error messages
2. **Validate Setup**: Ensure all prerequisites are met
3. **Review Configuration**: Check configuration objects
4. **Test Components**: Verify individual components work
5. **Seek Help**: Contact the development team for assistance

---

**Note**: These examples are designed for demonstration and learning purposes. They include safety features to prevent accidental modifications to your system. Always review and understand the code before running in production environments.
