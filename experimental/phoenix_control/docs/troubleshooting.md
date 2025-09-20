# PHOENIX Control Troubleshooting Guide

This guide provides solutions to common issues and problems encountered when using the PHOENIX Control system.

## Table of Contents

- [Common Issues](#common-issues)
- [Installation Problems](#installation-problems)
- [Configuration Issues](#configuration-issues)
- [Agent Management Problems](#agent-management-problems)
- [Release Automation Issues](#release-automation-issues)
- [Quality Assurance Problems](#quality-assurance-problems)
- [Performance Issues](#performance-issues)
- [Debugging Techniques](#debugging-techniques)
- [Getting Help](#getting-help)

## Common Issues

### 1. Import Errors

#### Problem

```
ModuleNotFoundError: No module named 'phoenix_control'
```

#### Solution

Ensure the `src` directory is in your Python path:

```python
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
```

#### Alternative Solution

Install the package in development mode:

```bash
cd experimental/phoenix_control
pip install -e .
```

### 2. Agent State Not Found

#### Problem

```
Agent state not found: success-advisor-8
```

#### Solution

Check if the agent exists and create it if necessary:

```python
from phoenix_control.src.core.persistence import AgentStatePersistence
from phoenix_control.src.core.success_advisor import SuccessAdvisor8

persistence = AgentStatePersistence()
agents = persistence.list_agents()
agent_ids = [agent.agent_id for agent in agents]

if "success-advisor-8" not in agent_ids:
    print("Agent not found, creating new agent")
    agent = SuccessAdvisor8()
    persistence.save_agent(agent)
    print("Agent created successfully")
```

### 3. Quality Checks Failing

#### Problem

Quality checks are failing with various errors.

#### Solution

Check specific quality issues and fix them:

```python
from phoenix_control.src.quality.validation import CodeQualityValidation

quality_validator = CodeQualityValidation()

# Check frontend quality
frontend_result = await quality_validator.validate_frontend()
if not frontend_result['linting']['passed']:
    print("Frontend linting issues:")
    for error in frontend_result['linting']['errors']:
        print(f"  - {error}")

if not frontend_result['formatting']['passed']:
    print("Frontend formatting issues:")
    for error in frontend_result['formatting']['errors']:
        print(f"  - {error}")

# Check backend quality
backend_result = await quality_validator.validate_backend()
if not backend_result['linting']['passed']:
    print("Backend linting issues:")
    for error in backend_result['linting']['errors']:
        print(f"  - {error}")
```

### 4. Release Workflow Failing

#### Problem

Release workflow is failing at various stages.

#### Solution

Check quality gates and fix issues:

```python
from phoenix_control.src.quality.validation import CodeQualityValidation

quality_validator = CodeQualityValidation()

# Run quality checks
frontend_result = await quality_validator.validate_frontend()
backend_result = await quality_validator.validate_backend()

# Check quality gates
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
    print("Frontend issues:", not frontend_result['linting']['passed'])
    print("Backend issues:", not backend_result['linting']['passed'])
else:
    print("Quality gates passed - proceeding with release")
```

## Installation Problems

### 1. Python Version Issues

#### Problem

```
Python 3.8+ is required
```

#### Solution

Upgrade Python to version 3.8 or higher:

```bash
# Check Python version
python --version

# Upgrade Python (Ubuntu/Debian)
sudo apt update
sudo apt install python3.8 python3.8-pip

# Upgrade Python (macOS)
brew install python@3.8

# Upgrade Python (Windows)
# Download from https://www.python.org/downloads/
```

### 2. Dependency Installation Issues

#### Problem

```
pip install -r requirements.txt
```

#### Solution

Install dependencies individually:

```bash
# Install core dependencies
pip install asyncio
pip install pathlib
pip install dataclasses
pip install enum34

# Install optional dependencies
pip install pytest
pip install black
pip install flake8
pip install mypy
```

### 3. Permission Issues

#### Problem

```
Permission denied: /usr/local/lib/python3.8/site-packages/
```

#### Solution

Use user installation or virtual environment:

```bash
# User installation
pip install --user -r requirements.txt

# Virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## Configuration Issues

### 1. Configuration File Not Found

#### Problem

```
Configuration file not found: phoenix_config.json
```

#### Solution

Create a default configuration file:

```python
from phoenix_control.src.utils.data_structures import ReleaseConfig, QualityConfig
import json

# Create default configuration
config = {
    "release": {
        "auto_backup": True,
        "comprehensive_analysis": True,
        "detailed_logging": True,
        "agent_state_tracking": True,
        "create_tag": True,
        "push_remote": False,
        "version_type": "auto"
    },
    "quality": {
        "enable_linting": True,
        "enable_formatting": True,
        "enable_type_checking": True,
        "enable_security_scanning": True,
        "enable_performance_testing": True,
        "enable_documentation_validation": True,
        "strict_mode": True,
        "auto_fix": True
    },
    "logging": {
        "level": "INFO",
        "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    }
}

# Save configuration
with open("phoenix_config.json", "w") as f:
    json.dump(config, f, indent=2)
```

### 2. Environment Variables Not Set

#### Problem

Environment variables are not being read.

#### Solution

Set environment variables:

```bash
# Set environment variables
export PHOENIX_AGENT_STATE_DIR="/path/to/agent/states"
export PHOENIX_LOG_LEVEL="INFO"
export PHOENIX_AUTO_BACKUP="true"
export PHOENIX_CREATE_TAG="true"
export PHOENIX_PUSH_REMOTE="false"
export PHOENIX_ENABLE_LINTING="true"
export PHOENIX_ENABLE_SECURITY_SCANNING="true"
export PHOENIX_STRICT_MODE="true"
```

### 3. Invalid Configuration Values

#### Problem

```
Invalid configuration value: version_type
```

#### Solution

Validate configuration values:

```python
from phoenix_control.src.utils.data_structures import ReleaseConfig

# Validate configuration
try:
    config = ReleaseConfig(
        auto_backup=True,
        comprehensive_analysis=True,
        detailed_logging=True,
        agent_state_tracking=True,
        create_tag=True,
        push_remote=False,
        version_type="auto"  # Valid values: "auto", "major", "minor", "patch"
    )
    print("Configuration is valid")
except ValueError as e:
    print(f"Configuration error: {e}")
```

## Agent Management Problems

### 1. Agent State Corruption

#### Problem

Agent state file is corrupted or invalid.

#### Solution

Validate and recover agent state:

```python
from phoenix_control.src.core.persistence import AgentStatePersistence
from phoenix_control.src.core.success_advisor import SuccessAdvisor8

persistence = AgentStatePersistence()

# Try to load agent
try:
    agent = persistence.load_agent("success-advisor-8")
    if agent:
        # Validate agent state
        validation = persistence.validate_agent_state(agent)
        if not validation["valid"]:
            print("Agent state is invalid, recreating...")
            # Create new agent
            new_agent = SuccessAdvisor8()
            persistence.save_agent(new_agent)
            print("Agent state recreated")
        else:
            print("Agent state is valid")
    else:
        print("Agent not found, creating new agent")
        agent = SuccessAdvisor8()
        persistence.save_agent(agent)
        print("Agent created")
except Exception as e:
    print(f"Error loading agent: {e}")
    # Create new agent
    agent = SuccessAdvisor8()
    persistence.save_agent(agent)
    print("Agent created after error")
```

### 2. Backup and Recovery Issues

#### Problem

Backup or recovery operations are failing.

#### Solution

Check backup directory and permissions:

```python
from phoenix_control.src.core.persistence import AgentStatePersistence
from pathlib import Path

persistence = AgentStatePersistence()

# Check backup directory
backup_dir = persistence.backup_dir
if not backup_dir.exists():
    print("Creating backup directory")
    backup_dir.mkdir(parents=True, exist_ok=True)

# Check permissions
if not backup_dir.is_dir():
    print("Backup directory is not a directory")
elif not os.access(backup_dir, os.W_OK):
    print("No write permission to backup directory")
else:
    print("Backup directory is accessible")

    # Try backup
    try:
        result = persistence.backup_agent_states()
        if result:
            print("Backup successful")
        else:
            print("Backup failed")
    except Exception as e:
        print(f"Backup error: {e}")
```

### 3. Agent State Comparison Issues

#### Problem

Agent state comparison is failing or returning unexpected results.

#### Solution

Check agent states and comparison logic:

```python
from phoenix_control.src.core.persistence import AgentStatePersistence

persistence = AgentStatePersistence()

# Get agents
agents = persistence.list_agents()
if len(agents) >= 2:
    agent1 = agents[0]
    agent2 = agents[1]

    # Compare agents
    try:
        comparison = persistence.compare_agents(agent1, agent2)
        print(f"Similarity Score: {comparison['similarity_score']:.2f}")
        print(f"Common Traits: {len(comparison['common_traits'])}")
        print(f"Common Abilities: {len(comparison['common_abilities'])}")
        print(f"Common Knowledge: {len(comparison['common_knowledge'])}")
    except Exception as e:
        print(f"Comparison error: {e}")
else:
    print("Need at least 2 agents for comparison")
```

## Release Automation Issues

### 1. Git Repository Issues

#### Problem

Git repository is not found or not accessible.

#### Solution

Check git repository status:

```python
import subprocess
from pathlib import Path

# Check if we're in a git repository
try:
    result = subprocess.run(["git", "status"], capture_output=True, text=True)
    if result.returncode == 0:
        print("Git repository is accessible")
    else:
        print("Not in a git repository or git not available")
        print(f"Error: {result.stderr}")
except FileNotFoundError:
    print("Git is not installed or not in PATH")
```

### 2. Version Management Issues

#### Problem

Version detection or management is failing.

#### Solution

Check package.json and version format:

```python
from phoenix_control.src.automation.version_management import VersionManager
from pathlib import Path
import json

version_manager = VersionManager()

# Check package.json
package_json_path = Path("package.json")
if package_json_path.exists():
    try:
        with open(package_json_path, "r") as f:
            package_data = json.load(f)

        if "version" in package_data:
            version = package_data["version"]
            print(f"Current version: {version}")

            # Validate version format
            version_info = version_manager.get_version_info(version)
            print(f"Version info: {version_info}")
        else:
            print("No version field in package.json")
    except json.JSONDecodeError as e:
        print(f"Invalid JSON in package.json: {e}")
else:
    print("package.json not found")
```

### 3. Changelog Issues

#### Problem

Changelog creation or validation is failing.

#### Solution

Check changelog file and format:

```python
from phoenix_control.src.automation.changelog import ChangelogManager
from pathlib import Path

changelog_manager = ChangelogManager()

# Check changelog file
changelog_path = changelog_manager.changelog_path
if changelog_path.exists():
    print("Changelog file exists")

    # Validate changelog
    try:
        validation = await changelog_manager.validate_changelog()
        if validation["valid"]:
            print("Changelog is valid")
        else:
            print("Changelog validation failed:")
            for error in validation["errors"]:
                print(f"  - {error}")
    except Exception as e:
        print(f"Changelog validation error: {e}")
else:
    print("Changelog file not found, creating new one")
    try:
        await changelog_manager.create_changelog()
        print("Changelog created successfully")
    except Exception as e:
        print(f"Changelog creation error: {e}")
```

## Quality Assurance Problems

### 1. Linting Issues

#### Problem

Linting is failing with various errors.

#### Solution

Check and fix linting issues:

```python
from phoenix_control.src.quality.validation import CodeQualityValidation

quality_validator = CodeQualityValidation()

# Check frontend linting
frontend_result = await quality_validator.validate_frontend()
if not frontend_result['linting']['passed']:
    print("Frontend linting issues:")
    for error in frontend_result['linting']['errors']:
        print(f"  - {error}")

    # Try to fix issues
    if frontend_result['linting']['fixable']:
        print("Attempting to fix linting issues...")
        # Note: Auto-fix would be implemented in the actual system
        print("Auto-fix not implemented in this example")

# Check backend linting
backend_result = await quality_validator.validate_backend()
if not backend_result['linting']['passed']:
    print("Backend linting issues:")
    for error in backend_result['linting']['errors']:
        print(f"  - {error}")
```

### 2. Security Scanning Issues

#### Problem

Security scanning is failing or not finding issues.

#### Solution

Check security scanning configuration:

```python
from phoenix_control.src.quality.security import SecurityQualityAssurance

security_qa = SecurityQualityAssurance()

# Check dependency vulnerabilities
try:
    dep_result = await security_qa.scan_dependency_vulnerabilities()
    if dep_result['passed']:
        print("No dependency vulnerabilities found")
    else:
        print("Dependency vulnerabilities found:")
        for vuln in dep_result['vulnerabilities']:
            print(f"  - {vuln}")
except Exception as e:
    print(f"Dependency scan error: {e}")

# Check Python security
try:
    python_result = await security_qa.scan_python_security()
    if python_result['passed']:
        print("No Python security issues found")
    else:
        print("Python security issues found:")
        for issue in python_result['issues']:
            print(f"  - {issue}")
except Exception as e:
    print(f"Python security scan error: {e}")
```

### 3. Performance Testing Issues

#### Problem

Performance testing is failing or not providing useful results.

#### Solution

Check performance testing configuration:

```python
from phoenix_control.src.quality.performance import PerformanceQualityAssurance

performance_qa = PerformanceQualityAssurance()

# Check build performance
try:
    build_result = await performance_qa.test_build_performance()
    if build_result['passed']:
        print(f"Build performance: {build_result['build_time']:.2f}s")
        print(f"Memory usage: {build_result['memory_usage']:.2f}MB")
    else:
        print("Build performance test failed")
        print(f"Error: {build_result.get('error', 'Unknown error')}")
except Exception as e:
    print(f"Build performance test error: {e}")

# Check execution performance
try:
    exec_result = await performance_qa.test_execution_performance()
    if exec_result['passed']:
        print(f"Test execution time: {exec_result['test_time']:.2f}s")
        print(f"Test count: {exec_result['test_count']}")
    else:
        print("Execution performance test failed")
        print(f"Error: {exec_result.get('error', 'Unknown error')}")
except Exception as e:
    print(f"Execution performance test error: {e}")
```

## Performance Issues

### 1. Slow Operations

#### Problem

Operations are running slowly.

#### Solution

Check performance and optimize:

```python
import time
from phoenix_control.src.core.persistence import AgentStatePersistence

persistence = AgentStatePersistence()

# Measure operation time
start_time = time.time()

# Perform operation
agents = persistence.list_agents()

end_time = time.time()
operation_time = end_time - start_time

print(f"Operation took {operation_time:.2f} seconds")

if operation_time > 5.0:  # Threshold for slow operations
    print("Operation is slow, consider optimization")

    # Check number of agents
    print(f"Number of agents: {len(agents)}")

    # Check state directory size
    state_dir = persistence.state_dir
    if state_dir.exists():
        total_size = sum(f.stat().st_size for f in state_dir.glob('*') if f.is_file())
        print(f"State directory size: {total_size / 1024 / 1024:.2f} MB")
```

### 2. Memory Usage Issues

#### Problem

High memory usage or memory leaks.

#### Solution

Monitor memory usage:

```python
import psutil
import os

# Get current process
process = psutil.Process(os.getpid())

# Monitor memory usage
memory_info = process.memory_info()
memory_mb = memory_info.rss / 1024 / 1024

print(f"Current memory usage: {memory_mb:.2f} MB")

if memory_mb > 500:  # Threshold for high memory usage
    print("High memory usage detected")

    # Check memory usage over time
    for i in range(5):
        memory_info = process.memory_info()
        memory_mb = memory_info.rss / 1024 / 1024
        print(f"Memory usage at step {i+1}: {memory_mb:.2f} MB")
        time.sleep(1)
```

### 3. Resource Exhaustion

#### Problem

System resources are being exhausted.

#### Solution

Check resource usage and limits:

```python
import psutil
import os

# Check system resources
cpu_percent = psutil.cpu_percent(interval=1)
memory = psutil.virtual_memory()
disk = psutil.disk_usage('/')

print(f"CPU usage: {cpu_percent}%")
print(f"Memory usage: {memory.percent}%")
print(f"Disk usage: {disk.percent}%")

# Check if resources are low
if cpu_percent > 80:
    print("High CPU usage detected")
if memory.percent > 80:
    print("High memory usage detected")
if disk.percent > 80:
    print("High disk usage detected")

# Check file descriptors (Unix systems)
if hasattr(os, 'getrlimit'):
    try:
        soft, hard = os.getrlimit(os.RLIMIT_NOFILE)
        print(f"File descriptor limit: {soft}/{hard}")
    except OSError:
        print("Could not get file descriptor limit")
```

## Debugging Techniques

### 1. Enable Debug Logging

```python
import logging
from phoenix_control.src.utils.logging import setup_logging

# Set up debug logging
logger = setup_logging("DEBUG")
logger.debug("Debug mode enabled")

# Use logger in your code
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

### 2. Use Try-Catch Blocks

```python
try:
    # Your code here
    result = some_operation()
    print(f"Operation successful: {result}")
except Exception as e:
    print(f"Operation failed: {e}")
    import traceback
    traceback.print_exc()
```

### 3. Check System State

```python
import sys
import os
from pathlib import Path

# Check Python version
print(f"Python version: {sys.version}")

# Check current directory
print(f"Current directory: {os.getcwd()}")

# Check Python path
print(f"Python path: {sys.path}")

# Check environment variables
env_vars = ["PHOENIX_AGENT_STATE_DIR", "PHOENIX_LOG_LEVEL"]
for var in env_vars:
    value = os.environ.get(var, "Not set")
    print(f"{var}: {value}")

# Check file permissions
state_dir = Path("agent_states")
if state_dir.exists():
    print(f"State directory exists: {state_dir}")
    print(f"State directory readable: {os.access(state_dir, os.R_OK)}")
    print(f"State directory writable: {os.access(state_dir, os.W_OK)}")
else:
    print("State directory does not exist")
```

### 4. Validate Data

```python
from phoenix_control.src.core.persistence import AgentStatePersistence

persistence = AgentStatePersistence()

# Validate agent states
agents = persistence.list_agents()
for agent in agents:
    validation = persistence.validate_agent_state(agent)
    if not validation["valid"]:
        print(f"Invalid agent state: {agent.agent_id}")
        for error in validation["errors"]:
            print(f"  - {error}")
    else:
        print(f"Valid agent state: {agent.agent_id}")
```

## Getting Help

### 1. Check Documentation

- Review this troubleshooting guide
- Check the API reference
- Read the usage guide
- Look at the examples

### 2. Check Logs

```python
import logging

# Set up logging to see all messages
logging.basicConfig(level=logging.DEBUG)

# Your code here
```

### 3. Run Examples

```bash
# Run basic usage example
python examples/basic_usage.py

# Run all examples
python examples/integration_example.py
```

### 4. Check System Requirements

```python
import sys
import platform

print(f"Python version: {sys.version}")
print(f"Platform: {platform.platform()}")
print(f"Architecture: {platform.architecture()}")
print(f"Machine: {platform.machine()}")
print(f"Processor: {platform.processor()}")
```

### 5. Contact Support

If you're still having issues:

1. **Create an Issue**: Create an issue in the project repository
2. **Provide Details**: Include error messages, system information, and steps to reproduce
3. **Check Existing Issues**: Look for similar issues that have been resolved
4. **Join Community**: Join the community discussion for help

### 6. Common Error Messages

#### ModuleNotFoundError

```
ModuleNotFoundError: No module named 'phoenix_control'
```

**Solution**: Add the `src` directory to your Python path or install the package.

#### FileNotFoundError

```
FileNotFoundError: [Errno 2] No such file or directory: 'agent_states'
```

**Solution**: The agent states directory doesn't exist. It will be created automatically when you first save an agent.

#### PermissionError

```
PermissionError: [Errno 13] Permission denied: 'agent_states'
```

**Solution**: Check file permissions and ensure you have write access to the directory.

#### ValueError

```
ValueError: Invalid spirit type: 'invalid'
```

**Solution**: Use a valid spirit type from the SpiritType enum.

#### KeyError

```
KeyError: 'version'
```

**Solution**: Ensure your package.json file has a version field.

---

**Note**: This troubleshooting guide is maintained by the PHOENIX Control development team. For questions or suggestions, please contact the team or create an issue in the project repository.
