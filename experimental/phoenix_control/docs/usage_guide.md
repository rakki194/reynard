# PHOENIX Control Usage Guide

This guide provides step-by-step instructions for using the PHOENIX Control system, including installation, configuration, and common usage patterns.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
- [Advanced Usage](#advanced-usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Python 3.8 or higher
- Git (for release automation)
- Node.js and npm/pnpm (for frontend quality checks)
- Access to the PHOENIX Control repository

### Step 1: Clone the Repository

```bash
git clone https://github.com/reynard/phoenix-control.git
cd phoenix-control
```

### Step 2: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (if needed)
npm install
```

### Step 3: Verify Installation

```bash
# Run basic usage example
python examples/basic_usage.py

# Run tests
python -m pytest tests/ -v
```

## Quick Start

### 1. Initialize Success-Advisor-8

```python
from phoenix_control.src.core.success_advisor import SuccessAdvisor8

# Create Success-Advisor-8 agent
agent = SuccessAdvisor8()

# Display agent information
print(f"Agent: {agent.name}")
print(f"Spirit: {agent.spirit}")
print(f"Specialization: {agent.specialization}")
```

### 2. Set Up Agent State Persistence

```python
from phoenix_control.src.core.persistence import AgentStatePersistence

# Initialize persistence system
persistence = AgentStatePersistence()

# Save agent state
success = persistence.save_agent(agent)
if success:
    print("Agent state saved successfully")
```

### 3. Configure Release Automation

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

### 4. Run Quality Assurance

```python
from phoenix_control.src.quality.validation import CodeQualityValidation

# Initialize quality validator
quality_validator = CodeQualityValidation()

# Run quality checks
frontend_result = await quality_validator.validate_frontend()
backend_result = await quality_validator.validate_backend()

print(f"Frontend Quality: {'✅' if frontend_result['linting']['passed'] else '❌'}")
print(f"Backend Quality: {'✅' if backend_result['linting']['passed'] else '❌'}")
```

## Basic Usage

### Agent Management

#### Creating and Managing Agents

```python
from phoenix_control.src.core.success_advisor import SuccessAdvisor8
from phoenix_control.src.core.persistence import AgentStatePersistence

# Create agent
agent = SuccessAdvisor8()

# Initialize persistence
persistence = AgentStatePersistence()

# Save agent state
persistence.save_agent(agent)

# Load agent state
loaded_agent = persistence.load_agent(agent.agent_id)

# List all agents
agents = persistence.list_agents()
for agent in agents:
    print(f"Agent: {agent.name} ({agent.agent_id})")
```

#### Agent State Validation

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

#### Agent State Backup and Recovery

```python
# Create backup
backup_result = persistence.backup_agent_states()
if backup_result:
    print("Backup created successfully")

# List available backups
backups = persistence.list_backups()
for backup in backups:
    print(f"Backup: {backup['name']} ({backup['timestamp']})")
```

### Release Automation

#### Basic Release Workflow

```python
from phoenix_control.src.automation.git_workflow import ReleaseAutomation
from phoenix_control.src.utils.data_structures import ReleaseConfig

# Configure release
config = ReleaseConfig(
    auto_backup=True,
    comprehensive_analysis=True,
    create_tag=True,
    push_remote=False
)

# Initialize automation
automation = ReleaseAutomation(config)

# Execute release workflow
success = await automation.execute_release_workflow()
if success:
    print("Release workflow completed successfully")
else:
    print("Release workflow failed")
```

#### Version Management

```python
from phoenix_control.src.automation.version_management import VersionManager

# Initialize version manager
version_manager = VersionManager()

# Get current version
current_version = await version_manager.get_current_version()
print(f"Current version: {current_version}")

# Suggest next version
next_version = await version_manager.suggest_next_version(current_version, "minor")
print(f"Suggested next version: {next_version}")

# Update version
if next_version:
    success = await version_manager.update_version(next_version)
    if success:
        print("Version updated successfully")
```

#### Changelog Management

```python
from phoenix_control.src.automation.changelog import ChangelogManager

# Initialize changelog manager
changelog_manager = ChangelogManager()

# Create changelog if it doesn't exist
if not changelog_manager.changelog_path.exists():
    await changelog_manager.create_changelog()

# Add changelog entries
await changelog_manager.add_entry("Added", "New feature for automated release management")
await changelog_manager.add_entry("Changed", "Improved version detection algorithm")
await changelog_manager.add_entry("Fixed", "Resolved issue with changelog formatting")

# Validate changelog
validation = await changelog_manager.validate_changelog()
if validation["valid"]:
    print("Changelog is valid")
```

### Quality Assurance

#### Code Quality Validation

```python
from phoenix_control.src.quality.validation import CodeQualityValidation

# Initialize quality validator
quality_validator = CodeQualityValidation()

# Validate frontend code
frontend_result = await quality_validator.validate_frontend()
print(f"Frontend Linting: {'✅' if frontend_result['linting']['passed'] else '❌'}")
print(f"Frontend Formatting: {'✅' if frontend_result['formatting']['passed'] else '❌'}")
print(f"Frontend Type Safety: {'✅' if frontend_result['type_safety']['passed'] else '❌'}")

# Validate backend code
backend_result = await quality_validator.validate_backend()
print(f"Backend Linting: {'✅' if backend_result['linting']['passed'] else '❌'}")
print(f"Backend Formatting: {'✅' if backend_result['formatting']['passed'] else '❌'}")
print(f"Backend Type Safety: {'✅' if backend_result['type_safety']['passed'] else '❌'}")
```

#### Security Quality Assurance

```python
from phoenix_control.src.quality.security import SecurityQualityAssurance

# Initialize security QA
security_qa = SecurityQualityAssurance()

# Scan for dependency vulnerabilities
dep_result = await security_qa.scan_dependency_vulnerabilities()
print(f"Dependency Scan: {'✅' if dep_result['passed'] else '❌'}")

# Scan Python security
python_result = await security_qa.scan_python_security()
print(f"Python Security: {'✅' if python_result['passed'] else '❌'}")

# Scan for secrets
secret_result = await security_qa.scan_secrets()
print(f"Secret Scan: {'✅' if secret_result['passed'] else '❌'}")
```

#### Performance Quality Assurance

```python
from phoenix_control.src.quality.performance import PerformanceQualityAssurance

# Initialize performance QA
performance_qa = PerformanceQualityAssurance()

# Test build performance
build_result = await performance_qa.test_build_performance()
print(f"Build Performance: {'✅' if build_result['passed'] else '❌'}")
if build_result['passed']:
    print(f"Build Time: {build_result['build_time']:.2f}s")

# Test execution performance
exec_result = await performance_qa.test_execution_performance()
print(f"Execution Performance: {'✅' if exec_result['passed'] else '❌'}")
if exec_result['passed']:
    print(f"Test Time: {exec_result['test_time']:.2f}s")
```

## Advanced Usage

### Custom Agent Configuration

```python
from phoenix_control.src.core.agent_state import AgentState
from phoenix_control.src.utils.data_structures import SpiritType, NamingStyle

# Create custom agent state
custom_agent = AgentState(
    agent_id="custom-agent-001",
    name="Custom-Agent-42",
    spirit=SpiritType.FOX,
    style=NamingStyle.EXO,
    generation=42,
    specialization="Custom Testing and Quality Assurance",
    traits={
        "dominance": 0.8,
        "independence": 0.9,
        "patience": 0.7,
        "aggression": 0.4,
        "charisma": 0.6,
        "creativity": 0.8
    },
    abilities={
        "strategist": 0.9,
        "hunter": 0.8,
        "teacher": 0.7,
        "artist": 0.6,
        "healer": 0.5,
        "inventor": 0.8
    },
    performance_history=[],
    knowledge_base={
        "testing": 0.9,
        "quality": 0.8,
        "automation": 0.7
    }
)

# Save custom agent
persistence = AgentStatePersistence()
success = persistence.save_agent(custom_agent)
```

### Advanced Release Configuration

```python
from phoenix_control.src.utils.data_structures import ReleaseConfig

# Advanced release configuration
advanced_config = ReleaseConfig(
    auto_backup=True,
    comprehensive_analysis=True,
    detailed_logging=True,
    agent_state_tracking=True,
    create_tag=True,
    push_remote=True,  # Enable for production
    version_type="auto"  # or "major", "minor", "patch"
)

# Use advanced configuration
automation = ReleaseAutomation(advanced_config)
```

### Quality Configuration

```python
from phoenix_control.src.utils.data_structures import QualityConfig

# Custom quality configuration
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

# Use custom quality configuration
quality_validator = CodeQualityValidation()
# Note: QualityConfig is used internally by the quality components
```

### Agent State Comparison

```python
# Compare two agents
agent1 = persistence.load_agent("success-advisor-8")
agent2 = persistence.load_agent("custom-agent-001")

if agent1 and agent2:
    comparison = persistence.compare_agents(agent1, agent2)
    print(f"Similarity Score: {comparison['similarity_score']:.2f}")
    print(f"Common Traits: {len(comparison['common_traits'])}")
    print(f"Common Abilities: {len(comparison['common_abilities'])}")
    print(f"Common Knowledge: {len(comparison['common_knowledge'])}")
```

### Agent Statistics

```python
# Get agent statistics
stats = persistence.get_agent_statistics()
print(f"Total Agents: {stats['total_agents']}")
print(f"Active Agents: {stats['active_agents']}")
print(f"Average Generation: {stats['average_generation']:.1f}")
print(f"Most Common Spirit: {stats['most_common_spirit']}")
print(f"Most Common Style: {stats['most_common_style']}")
```

## Configuration

### Environment Variables

Set the following environment variables for configuration:

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

### Configuration Files

Create configuration files for persistent settings:

#### `phoenix_config.json`

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

## Examples

### Complete Release Workflow

```python
import asyncio
from phoenix_control.src.core.success_advisor import SuccessAdvisor8
from phoenix_control.src.core.persistence import AgentStatePersistence
from phoenix_control.src.automation.git_workflow import ReleaseAutomation
from phoenix_control.src.quality.validation import CodeQualityValidation
from phoenix_control.src.utils.data_structures import ReleaseConfig

async def complete_release_workflow():
    """Complete release workflow example."""

    # 1. Initialize Success-Advisor-8
    agent = SuccessAdvisor8()
    print(f"Initialized agent: {agent.name}")

    # 2. Set up persistence
    persistence = AgentStatePersistence()
    persistence.save_agent(agent)
    print("Agent state saved")

    # 3. Configure release automation
    config = ReleaseConfig(
        auto_backup=True,
        comprehensive_analysis=True,
        create_tag=True,
        push_remote=False
    )
    automation = ReleaseAutomation(config)

    # 4. Run quality checks
    quality_validator = CodeQualityValidation()
    frontend_result = await quality_validator.validate_frontend()
    backend_result = await quality_validator.validate_backend()

    # 5. Check quality gates
    quality_gates_passed = all([
        frontend_result['linting']['passed'],
        frontend_result['formatting']['passed'],
        frontend_result['type_safety']['passed'],
        backend_result['linting']['passed'],
        backend_result['formatting']['passed'],
        backend_result['type_safety']['passed']
    ])

    if quality_gates_passed:
        print("✅ All quality gates passed")

        # 6. Execute release workflow
        success = await automation.execute_release_workflow()
        if success:
            print("✅ Release workflow completed successfully")

            # 7. Update agent performance
            agent.performance_history.append({
                "timestamp": "2025-01-15T10:30:00Z",
                "action": "release_execution",
                "success": True,
                "details": "Successfully executed release workflow"
            })

            # 8. Save updated agent state
            persistence.save_agent(agent)
            print("✅ Agent state updated")
        else:
            print("❌ Release workflow failed")
    else:
        print("❌ Quality gates failed - release blocked")

# Run the complete workflow
asyncio.run(complete_release_workflow())
```

### Agent State Management

```python
from phoenix_control.src.core.persistence import AgentStatePersistence
from phoenix_control.src.core.success_advisor import SuccessAdvisor8

def agent_state_management_example():
    """Agent state management example."""

    # Initialize persistence
    persistence = AgentStatePersistence()

    # Create and save agent
    agent = SuccessAdvisor8()
    persistence.save_agent(agent)
    print(f"Created and saved agent: {agent.name}")

    # Load agent
    loaded_agent = persistence.load_agent(agent.agent_id)
    if loaded_agent:
        print(f"Loaded agent: {loaded_agent.name}")

    # List all agents
    agents = persistence.list_agents()
    print(f"Total agents: {len(agents)}")

    # Create backup
    backup_result = persistence.backup_agent_states()
    if backup_result:
        print("Backup created successfully")

    # List backups
    backups = persistence.list_backups()
    print(f"Available backups: {len(backups)}")

    # Get statistics
    stats = persistence.get_agent_statistics()
    print(f"Agent statistics: {stats}")

# Run the example
agent_state_management_example()
```

## Best Practices

### 1. Agent Management

- **Regular Backups**: Create regular backups of agent states
- **State Validation**: Always validate agent states before operations
- **Performance Tracking**: Track agent performance over time
- **State Comparison**: Compare agent states for analysis

### 2. Release Automation

- **Quality Gates**: Always run quality gates before releases
- **Version Management**: Use semantic versioning consistently
- **Changelog Updates**: Keep changelog updated with all changes
- **Backup Before Release**: Always backup agent states before releases

### 3. Quality Assurance

- **Comprehensive Testing**: Run all quality checks before releases
- **Security Scanning**: Regularly scan for security vulnerabilities
- **Performance Monitoring**: Monitor performance metrics
- **Documentation Validation**: Ensure documentation is up to date

### 4. Configuration Management

- **Environment Variables**: Use environment variables for configuration
- **Configuration Files**: Use configuration files for persistent settings
- **Default Values**: Provide sensible default values
- **Validation**: Validate configuration before use

### 5. Error Handling

- **Graceful Degradation**: Handle errors gracefully
- **Error Logging**: Log all errors for debugging
- **Recovery Mechanisms**: Implement recovery mechanisms
- **User Notification**: Notify users of errors clearly

## Troubleshooting

### Common Issues

#### 1. Import Errors

**Problem**: Module not found errors when importing PHOENIX Control components.

**Solution**:

```python
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
```

#### 2. Agent State Not Found

**Problem**: Agent state cannot be loaded.

**Solution**:

```python
# Check if agent exists
agents = persistence.list_agents()
agent_ids = [agent.agent_id for agent in agents]
if "success-advisor-8" not in agent_ids:
    print("Agent not found, creating new agent")
    agent = SuccessAdvisor8()
    persistence.save_agent(agent)
```

#### 3. Quality Checks Failing

**Problem**: Quality checks are failing.

**Solution**:

```python
# Check specific quality issues
frontend_result = await quality_validator.validate_frontend()
if not frontend_result['linting']['passed']:
    print("Linting issues found")
    print(frontend_result['linting']['errors'])

if not frontend_result['formatting']['passed']:
    print("Formatting issues found")
    print(frontend_result['formatting']['errors'])
```

#### 4. Release Workflow Failing

**Problem**: Release workflow is failing.

**Solution**:

```python
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
else:
    print("Quality gates passed - proceeding with release")
```

### Debug Mode

Enable debug mode for detailed logging:

```python
import logging
from phoenix_control.src.utils.logging import setup_logging

# Set up debug logging
logger = setup_logging("DEBUG")
logger.debug("Debug mode enabled")
```

### Performance Issues

If you experience performance issues:

1. **Check Resource Usage**: Monitor memory and CPU usage
2. **Optimize Configuration**: Adjust configuration for your environment
3. **Reduce Quality Checks**: Disable unnecessary quality checks
4. **Use Caching**: Enable caching for frequently accessed data

### Getting Help

1. **Check Documentation**: Review this usage guide and API reference
2. **Run Examples**: Try the examples in the `examples/` directory
3. **Check Logs**: Review log output for error messages
4. **Contact Support**: Contact the development team for assistance

---

**Note**: This usage guide is maintained by the PHOENIX Control development team. For questions or suggestions, please contact the team or create an issue in the project repository.
