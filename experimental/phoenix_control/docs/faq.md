# PHOENIX Control FAQ

This document provides answers to frequently asked questions about the PHOENIX Control system.

## Table of Contents

- [General Questions](#general-questions)
- [Installation and Setup](#installation-and-setup)
- [Agent Management](#agent-management)
- [Release Automation](#release-automation)
- [Quality Assurance](#quality-assurance)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)
- [Security](#security)
- [Contributing](#contributing)

## General Questions

### What is PHOENIX Control?

PHOENIX Control is a comprehensive system for agent state management, release automation, and quality assurance. It provides tools for managing AI agents like Success-Advisor-8, automating release workflows, and ensuring code quality through comprehensive validation.

### What is Success-Advisor-8?

Success-Advisor-8 is a specialized AI agent with expertise in release management and quality assurance. It's designed to automate release workflows, manage agent states, and ensure code quality through comprehensive validation processes.

### What are the key features of PHOENIX Control?

- **Agent State Management**: Complete agent lifecycle management with persistence
- **Release Automation**: Automated release workflow with git integration
- **Quality Assurance**: Multi-layer quality validation (code, security, performance)
- **Version Management**: Semantic versioning with automated bump detection
- **Changelog Management**: Automated changelog updates and validation
- **Backup and Recovery**: Automated backup and recovery for agent states

### How does PHOENIX Control differ from other release management tools?

PHOENIX Control is specifically designed for AI agent management and includes:

- Agent state persistence and recovery
- AI agent-specific quality assurance
- Integration with agent naming systems
- Agent performance tracking
- Specialized agent state validation

### Is PHOENIX Control open source?

Yes, PHOENIX Control is open source and available under the MIT license.

## Installation and Setup

### What are the system requirements?

- Python 3.8 or higher
- Git (for release automation)
- Node.js and npm/pnpm (for frontend quality checks)
- At least 100MB of free disk space
- 512MB of available RAM

### How do I install PHOENIX Control?

```bash
# Clone the repository
git clone https://github.com/reynard/phoenix-control.git
cd phoenix-control

# Install dependencies
pip install -r requirements.txt

# Verify installation
python examples/basic_usage.py
```

### Do I need to install additional tools?

For full functionality, you may need:

- **ESLint**: For JavaScript/TypeScript linting
- **Prettier**: For code formatting
- **Flake8**: For Python linting
- **Black**: For Python formatting
- **MyPy**: For Python type checking
- **Bandit**: For Python security scanning

### Can I install PHOENIX Control in a virtual environment?

Yes, it's recommended to use a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### How do I verify the installation?

Run the basic usage example:

```bash
python examples/basic_usage.py
```

This will test the core functionality and verify that everything is working correctly.

## Agent Management

### How do I create a new agent?

```python
from phoenix_control.src.core.success_advisor import SuccessAdvisor8

# Create Success-Advisor-8 agent
agent = SuccessAdvisor8()
print(f"Created agent: {agent.name}")
```

### How do I save and load agent states?

```python
from phoenix_control.src.core.persistence import AgentStatePersistence

# Initialize persistence
persistence = AgentStatePersistence()

# Save agent state
persistence.save_agent(agent)

# Load agent state
loaded_agent = persistence.load_agent(agent.agent_id)
```

### How do I list all agents?

```python
# List all agents
agents = persistence.list_agents()
for agent in agents:
    print(f"Agent: {agent.name} ({agent.agent_id})")
```

### How do I backup agent states?

```python
# Create backup
backup_result = persistence.backup_agent_states()
if backup_result:
    print("Backup created successfully")
```

### How do I restore from backup?

```python
# List available backups
backups = persistence.list_backups()
for backup in backups:
    print(f"Backup: {backup['name']} ({backup['timestamp']})")

# Restore from backup (implementation depends on your needs)
```

### Can I create custom agents?

Yes, you can create custom agents with different traits and abilities:

```python
from phoenix_control.src.core.agent_state import AgentState
from phoenix_control.src.utils.data_structures import SpiritType, NamingStyle

custom_agent = AgentState(
    agent_id="custom-agent-001",
    name="Custom-Agent-42",
    spirit=SpiritType.FOX,
    style=NamingStyle.EXO,
    generation=42,
    specialization="Custom Testing",
    traits={"dominance": 0.8, "independence": 0.9},
    abilities={"strategist": 0.9, "hunter": 0.8},
    performance_history=[],
    knowledge_base={"testing": 0.9}
)
```

### How do I validate agent states?

```python
# Validate agent state
validation_result = persistence.validate_agent_state(agent)
if validation_result["valid"]:
    print("Agent state is valid")
else:
    print("Validation errors:")
    for error in validation_result["errors"]:
        print(f"  - {error}")
```

## Release Automation

### How do I configure release automation?

```python
from phoenix_control.src.automation.git_workflow import ReleaseAutomation
from phoenix_control.src.utils.data_structures import ReleaseConfig

# Configure release automation
config = ReleaseConfig(
    auto_backup=True,
    comprehensive_analysis=True,
    create_tag=True,
    push_remote=False  # Set to False for testing
)

# Initialize release automation
automation = ReleaseAutomation(config)
```

### How do I execute a release workflow?

```python
# Execute release workflow
success = await automation.execute_release_workflow()
if success:
    print("Release workflow completed successfully")
else:
    print("Release workflow failed")
```

### How do I manage versions?

```python
from phoenix_control.src.automation.version_management import VersionManager

version_manager = VersionManager()

# Get current version
current_version = await version_manager.get_current_version()
print(f"Current version: {current_version}")

# Suggest next version
next_version = await version_manager.suggest_next_version(current_version, "minor")
print(f"Suggested next version: {next_version}")
```

### How do I update the changelog?

```python
from phoenix_control.src.automation.changelog import ChangelogManager

changelog_manager = ChangelogManager()

# Add changelog entries
await changelog_manager.add_entry("Added", "New feature for automated release management")
await changelog_manager.add_entry("Changed", "Improved version detection algorithm")
await changelog_manager.add_entry("Fixed", "Resolved issue with changelog formatting")
```

### What types of version bumps are supported?

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)
- **Auto**: Automatically determine based on changes

### How do I handle git operations?

The system automatically handles:

- Git status analysis
- Change detection and staging
- Commit creation
- Tag creation
- Push to remote (if enabled)

### Can I customize the release workflow?

Yes, you can customize the release workflow by modifying the `ReleaseConfig` and implementing custom logic in the automation classes.

## Quality Assurance

### How do I run quality checks?

```python
from phoenix_control.src.quality.validation import CodeQualityValidation

quality_validator = CodeQualityValidation()

# Run quality checks
frontend_result = await quality_validator.validate_frontend()
backend_result = await quality_validator.validate_backend()

print(f"Frontend Quality: {'✅' if frontend_result['linting']['passed'] else '❌'}")
print(f"Backend Quality: {'✅' if backend_result['linting']['passed'] else '❌'}")
```

### What quality checks are performed?

- **Code Quality**: Linting, formatting, type safety
- **Security**: Vulnerability scanning, secret detection
- **Performance**: Build performance, test execution, memory usage
- **Documentation**: Documentation validation and completeness

### How do I configure quality checks?

```python
from phoenix_control.src.utils.data_structures import QualityConfig

quality_config = QualityConfig(
    enable_linting=True,
    enable_formatting=True,
    enable_type_checking=True,
    enable_security_scanning=True,
    enable_performance_testing=True,
    enable_documentation_validation=True,
    strict_mode=True,
    auto_fix=True
)
```

### How do I handle quality check failures?

```python
# Check specific quality issues
if not frontend_result['linting']['passed']:
    print("Frontend linting issues:")
    for error in frontend_result['linting']['errors']:
        print(f"  - {error}")

if not frontend_result['formatting']['passed']:
    print("Frontend formatting issues:")
    for error in frontend_result['formatting']['errors']:
        print(f"  - {error}")
```

### Can I disable certain quality checks?

Yes, you can disable quality checks by setting the appropriate configuration options:

```python
quality_config = QualityConfig(
    enable_linting=False,  # Disable linting
    enable_security_scanning=False,  # Disable security scanning
    strict_mode=False  # Disable strict mode
)
```

### How do I run security scans?

```python
from phoenix_control.src.quality.security import SecurityQualityAssurance

security_qa = SecurityQualityAssurance()

# Run security scans
dep_result = await security_qa.scan_dependency_vulnerabilities()
python_result = await security_qa.scan_python_security()
secret_result = await security_qa.scan_secrets()
```

### How do I run performance tests?

```python
from phoenix_control.src.quality.performance import PerformanceQualityAssurance

performance_qa = PerformanceQualityAssurance()

# Run performance tests
build_result = await performance_qa.test_build_performance()
exec_result = await performance_qa.test_execution_performance()
memory_result = await performance_qa.analyze_memory_usage()
```

## Configuration

### How do I configure the system?

You can configure the system using:

- Environment variables
- Configuration files
- Programmatic configuration

### What environment variables are available?

```bash
# Agent state directory
export PHOENIX_AGENT_STATE_DIR="/path/to/agent/states"

# Logging level
export PHOENIX_LOG_LEVEL="INFO"

# Release configuration
export PHOENIX_AUTO_BACKUP="true"
export PHOENIX_CREATE_TAG="true"
export PHOENIX_PUSH_REMOTE="false"

# Quality configuration
export PHOENIX_ENABLE_LINTING="true"
export PHOENIX_ENABLE_SECURITY_SCANNING="true"
export PHOENIX_STRICT_MODE="true"
```

### How do I create a configuration file?

Create a `phoenix_config.json` file:

```json
{
  "release": {
    "auto_backup": true,
    "comprehensive_analysis": true,
    "detailed_logging": true,
    "agent_state_tracking": true,
    "create_tag": true,
    "push_remote": false,
    "version_type": "auto"
  },
  "quality": {
    "enable_linting": true,
    "enable_formatting": true,
    "enable_type_checking": true,
    "enable_security_scanning": true,
    "enable_performance_testing": true,
    "enable_documentation_validation": true,
    "strict_mode": true,
    "auto_fix": true
  },
  "logging": {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  }
}
```

### How do I validate configuration?

```python
from phoenix_control.src.utils.data_structures import ReleaseConfig

try:
    config = ReleaseConfig(
        auto_backup=True,
        comprehensive_analysis=True,
        detailed_logging=True,
        agent_state_tracking=True,
        create_tag=True,
        push_remote=False,
        version_type="auto"
    )
    print("Configuration is valid")
except ValueError as e:
    print(f"Configuration error: {e}")
```

## Troubleshooting

### What should I do if I get import errors?

Ensure the `src` directory is in your Python path:

```python
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
```

### What should I do if agent states are not found?

Check if the agent exists and create it if necessary:

```python
persistence = AgentStatePersistence()
agents = persistence.list_agents()
agent_ids = [agent.agent_id for agent in agents]

if "success-advisor-8" not in agent_ids:
    print("Agent not found, creating new agent")
    agent = SuccessAdvisor8()
    persistence.save_agent(agent)
    print("Agent created successfully")
```

### What should I do if quality checks are failing?

Check specific quality issues and fix them:

```python
frontend_result = await quality_validator.validate_frontend()
if not frontend_result['linting']['passed']:
    print("Frontend linting issues:")
    for error in frontend_result['linting']['errors']:
        print(f"  - {error}")
```

### What should I do if the release workflow is failing?

Check quality gates and fix issues:

```python
quality_gates_passed = all([
    frontend_result['linting']['passed'],
    frontend_result['formatting']['passed'],
    frontend_result['type_safety']['passed'],
    backend_result['linting']['passed'],
    backend_result['formatting']['passed'],
    backend_result['type_safety']['passed']
])

if not quality_gates_passed:
    print("Quality gates failed - fix issues before release")
else:
    print("Quality gates passed - proceeding with release")
```

### How do I enable debug logging?

```python
import logging
from phoenix_control.src.utils.logging import setup_logging

# Set up debug logging
logger = setup_logging("DEBUG")
logger.debug("Debug mode enabled")
```

### What should I do if I get permission errors?

Check file permissions and ensure you have write access:

```python
import os
from pathlib import Path

state_dir = Path("agent_states")
if state_dir.exists():
    print(f"State directory readable: {os.access(state_dir, os.R_OK)}")
    print(f"State directory writable: {os.access(state_dir, os.W_OK)}")
else:
    print("State directory does not exist")
```

## Performance

### How can I improve performance?

- Use caching for frequently accessed data
- Optimize configuration for your environment
- Reduce unnecessary quality checks
- Use parallel processing where possible

### How do I monitor performance?

```python
import time
import psutil
import os

# Measure operation time
start_time = time.time()
# Your operation here
end_time = time.time()
operation_time = end_time - start_time
print(f"Operation took {operation_time:.2f} seconds")

# Monitor memory usage
process = psutil.Process(os.getpid())
memory_info = process.memory_info()
memory_mb = memory_info.rss / 1024 / 1024
print(f"Memory usage: {memory_mb:.2f} MB")
```

### What are the performance thresholds?

- **Operation Time**: < 5 seconds for most operations
- **Memory Usage**: < 500MB for typical usage
- **CPU Usage**: < 80% for normal operations
- **Disk Usage**: < 80% of available space

### How do I optimize for large numbers of agents?

- Use efficient data structures
- Implement pagination for agent listing
- Use background processing for heavy operations
- Implement caching for frequently accessed data

## Security

### What security measures are in place?

- Input validation for all data
- Output sanitization
- Access control for agent states
- Audit logging for security events
- Vulnerability scanning

### How do I scan for security vulnerabilities?

```python
from phoenix_control.src.quality.security import SecurityQualityAssurance

security_qa = SecurityQualityAssurance()

# Run security scans
dep_result = await security_qa.scan_dependency_vulnerabilities()
python_result = await security_qa.scan_python_security()
secret_result = await security_qa.scan_secrets()
```

### How do I handle secrets?

- Never commit secrets to version control
- Use environment variables for sensitive data
- Regularly scan for exposed secrets
- Implement proper access controls

### How do I secure agent states?

- Use proper file permissions
- Implement access controls
- Encrypt sensitive data
- Regular security audits

## Contributing

### How can I contribute to PHOENIX Control?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Submit a pull request

### What coding standards should I follow?

- Follow PEP 8 for Python code
- Use type hints where appropriate
- Add docstrings for all functions and classes
- Write comprehensive tests
- Update documentation

### How do I run the tests?

```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_success_advisor.py -v

# Run tests with coverage
python -m pytest tests/ --cov=src/ --cov-report=html
```

### How do I add new features?

1. Design the feature
2. Implement the feature
3. Add tests
4. Update documentation
5. Submit a pull request

### How do I report bugs?

1. Check existing issues
2. Create a new issue
3. Provide detailed information
4. Include steps to reproduce
5. Add system information

---

**Note**: This FAQ is maintained by the PHOENIX Control development team. For questions not covered here, please contact the team or create an issue in the project repository.
