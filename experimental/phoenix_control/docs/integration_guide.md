# PHOENIX Control Integration Guide

This guide provides comprehensive information about integrating PHOENIX Control with other systems and tools.

## Table of Contents

- [System Integration Overview](#system-integration-overview)
- [MCP Server Integration](#mcp-server-integration)
- [ECS World Simulation Integration](#ecs-world-simulation-integration)
- [Git Integration](#git-integration)
- [CI/CD Integration](#cicd-integration)
- [Quality Assurance Integration](#quality-assurance-integration)
- [Monitoring and Logging Integration](#monitoring-and-logging-integration)
- [Custom Integration Examples](#custom-integration-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## System Integration Overview

PHOENIX Control is designed to integrate seamlessly with various systems and tools. The integration architecture follows a modular approach, allowing you to integrate only the components you need.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHOENIX Control System                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   MCP Server    │  │   ECS World     │  │   Git System    │  │
│  │   Integration   │  │   Integration   │  │   Integration   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   CI/CD         │  │   Quality       │  │   Monitoring    │  │
│  │   Integration   │  │   Integration   │  │   Integration   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Components

1. **MCP Server Integration**: Integration with MCP server for development workflow
2. **ECS World Integration**: Integration with ECS world simulation
3. **Git Integration**: Integration with Git for version control
4. **CI/CD Integration**: Integration with CI/CD pipelines
5. **Quality Integration**: Integration with quality assurance tools
6. **Monitoring Integration**: Integration with monitoring and logging systems

## MCP Server Integration

### Overview

The MCP (Model Context Protocol) server integration provides access to development workflow automation tools and agent management capabilities.

### Integration Setup

```python
from phoenix_control.src.integration.mcp_integration import MCPIntegration

# Initialize MCP integration
mcp_integration = MCPIntegration()

# Connect to MCP server
await mcp_integration.connect()

# Get available tools
tools = await mcp_integration.get_available_tools()
print(f"Available MCP tools: {len(tools)}")
```

### Available MCP Tools

The MCP server provides access to various tools:

- **Agent Naming**: Generate and assign agent names
- **Development Workflow**: Automate development tasks
- **Quality Assurance**: Run quality checks and validation
- **Version Management**: Manage versions and releases
- **Documentation**: Generate and manage documentation

### Using MCP Tools

```python
# Generate agent name
agent_name = await mcp_integration.generate_agent_name("wolf", "foundation")
print(f"Generated agent name: {agent_name}")

# Assign agent name
await mcp_integration.assign_agent_name("agent-001", agent_name)

# Run quality checks
quality_result = await mcp_integration.run_quality_checks()
print(f"Quality checks: {'✅' if quality_result['passed'] else '❌'}")

# Get development workflow status
workflow_status = await mcp_integration.get_workflow_status()
print(f"Workflow status: {workflow_status}")
```

### MCP Configuration

```python
# Configure MCP integration
mcp_config = {
    "server_url": "http://localhost:8000",
    "timeout": 30,
    "retry_attempts": 3,
    "enable_caching": True
}

mcp_integration = MCPIntegration(config=mcp_config)
```

## ECS World Simulation Integration

### Overview

The ECS (Entity Component System) world simulation integration provides access to agent state management and world simulation capabilities.

### Integration Setup

```python
from phoenix_control.src.integration.ecs_integration import ECSIntegration

# Initialize ECS integration
ecs_integration = ECSIntegration()

# Connect to ECS world
await ecs_integration.connect()

# Get world status
world_status = await ecs_integration.get_world_status()
print(f"World status: {world_status}")
```

### Agent State Synchronization

```python
# Sync agent state with ECS world
agent = SuccessAdvisor8()
await ecs_integration.sync_agent_state(agent)

# Get agent from ECS world
ecs_agent = await ecs_integration.get_agent(agent.agent_id)
print(f"ECS agent: {ecs_agent}")

# Update agent in ECS world
await ecs_integration.update_agent(agent)
```

### World Simulation Control

```python
# Get simulation status
simulation_status = await ecs_integration.get_simulation_status()
print(f"Simulation time: {simulation_status['time']}")
print(f"Time acceleration: {simulation_status['acceleration']}")

# Control time acceleration
await ecs_integration.set_time_acceleration(10.0)  # 10x speed

# Nudge time forward
await ecs_integration.nudge_time(0.1)
```

### Agent Interactions

```python
# Initiate agent interaction
interaction = await ecs_integration.initiate_interaction("agent-001", "agent-002")
print(f"Interaction initiated: {interaction['id']}")

# Send message between agents
await ecs_integration.send_message("agent-001", "agent-002", "Hello from agent-001")

# Get interaction history
history = await ecs_integration.get_interaction_history("agent-001")
print(f"Interaction history: {len(history)} interactions")
```

## Git Integration

### Overview

The Git integration provides comprehensive Git workflow automation and version control capabilities.

### Integration Setup

```python
from phoenix_control.src.integration.git_integration import GitIntegration

# Initialize Git integration
git_integration = GitIntegration()

# Check Git repository status
repo_status = await git_integration.get_repository_status()
print(f"Repository status: {repo_status}")
```

### Git Workflow Automation

```python
# Analyze changes
changes = await git_integration.analyze_changes()
print(f"Changes detected: {len(changes)}")

# Stage changes
await git_integration.stage_changes(changes)

# Create commit
commit_message = "feat: add new feature for automated release management"
commit_hash = await git_integration.create_commit(commit_message)
print(f"Commit created: {commit_hash}")

# Create tag
tag_name = "v1.1.0"
tag_hash = await git_integration.create_tag(tag_name)
print(f"Tag created: {tag_hash}")

# Push to remote
await git_integration.push_to_remote()
```

### Branch Management

```python
# Get current branch
current_branch = await git_integration.get_current_branch()
print(f"Current branch: {current_branch}")

# Create new branch
new_branch = "feature/new-feature"
await git_integration.create_branch(new_branch)

# Switch branch
await git_integration.switch_branch(new_branch)

# Merge branch
await git_integration.merge_branch("main")
```

### Git Configuration

```python
# Configure Git integration
git_config = {
    "auto_stage": True,
    "auto_commit": True,
    "auto_tag": True,
    "auto_push": False,
    "commit_message_template": "feat: {description}",
    "tag_prefix": "v"
}

git_integration = GitIntegration(config=git_config)
```

## CI/CD Integration

### Overview

The CI/CD integration provides seamless integration with continuous integration and deployment pipelines.

### GitHub Actions Integration

```yaml
# .github/workflows/phoenix-control.yml
name: PHOENIX Control CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  phoenix-control:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.8

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run PHOENIX Control
        run: |
          python examples/integration_example.py

      - name: Run quality checks
        run: |
          python -m pytest tests/ --cov=src/

      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

### Jenkins Integration

```groovy
// Jenkinsfile
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
            }
        }

        stage('Run PHOENIX Control') {
            steps {
                sh 'python examples/integration_example.py'
            }
        }

        stage('Quality Checks') {
            steps {
                sh 'python -m pytest tests/ --cov=src/'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'python examples/release_automation.py'
            }
        }
    }
}
```

### GitLab CI Integration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - quality
  - deploy

variables:
  PYTHON_VERSION: "3.8"

test:
  stage: test
  image: python:${PYTHON_VERSION}
  script:
    - pip install -r requirements.txt
    - python examples/integration_example.py
  only:
    - main
    - develop

quality:
  stage: quality
  image: python:${PYTHON_VERSION}
  script:
    - pip install -r requirements.txt
    - python -m pytest tests/ --cov=src/
  coverage: '/TOTAL.*\s+(\d+%)$/'
  only:
    - main
    - develop

deploy:
  stage: deploy
  image: python:${PYTHON_VERSION}
  script:
    - pip install -r requirements.txt
    - python examples/release_automation.py
  only:
    - main
```

## Quality Assurance Integration

### Overview

The quality assurance integration provides comprehensive quality validation and testing capabilities.

### Integration Setup

```python
from phoenix_control.src.integration.quality_integration import QualityIntegration

# Initialize quality integration
quality_integration = QualityIntegration()

# Run comprehensive quality checks
quality_result = await quality_integration.run_comprehensive_checks()
print(f"Quality result: {quality_result}")
```

### Code Quality Integration

```python
# Integrate with ESLint
eslint_result = await quality_integration.run_eslint()
print(f"ESLint result: {eslint_result}")

# Integrate with Prettier
prettier_result = await quality_integration.run_prettier()
print(f"Prettier result: {prettier_result}")

# Integrate with TypeScript
typescript_result = await quality_integration.run_typescript()
print(f"TypeScript result: {typescript_result}")
```

### Security Integration

```python
# Integrate with Bandit
bandit_result = await quality_integration.run_bandit()
print(f"Bandit result: {bandit_result}")

# Integrate with audit-ci
audit_result = await quality_integration.run_audit_ci()
print(f"Audit result: {audit_result}")

# Integrate with trufflehog
trufflehog_result = await quality_integration.run_trufflehog()
print(f"Trufflehog result: {trufflehog_result}")
```

### Performance Integration

```python
# Integrate with webpack-bundle-analyzer
bundle_result = await quality_integration.run_bundle_analyzer()
print(f"Bundle analysis result: {bundle_result}")

# Integrate with memory profiler
memory_result = await quality_integration.run_memory_profiler()
print(f"Memory profiling result: {memory_result}")
```

## Monitoring and Logging Integration

### Overview

The monitoring and logging integration provides comprehensive system monitoring and logging capabilities.

### Integration Setup

```python
from phoenix_control.src.integration.monitoring_integration import MonitoringIntegration

# Initialize monitoring integration
monitoring_integration = MonitoringIntegration()

# Set up monitoring
await monitoring_integration.setup_monitoring()
```

### Logging Integration

```python
# Integrate with structured logging
import logging
from phoenix_control.src.utils.logging import setup_logging

# Set up structured logging
logger = setup_logging("INFO")

# Log with context
logger.info("PHOENIX Control system initialized", extra={
    "agent_id": "success-advisor-8",
    "operation": "initialization",
    "timestamp": "2025-01-15T10:30:00Z"
})
```

### Metrics Integration

```python
# Collect system metrics
metrics = await monitoring_integration.collect_metrics()
print(f"System metrics: {metrics}")

# Collect agent metrics
agent_metrics = await monitoring_integration.collect_agent_metrics("success-advisor-8")
print(f"Agent metrics: {agent_metrics}")

# Collect performance metrics
performance_metrics = await monitoring_integration.collect_performance_metrics()
print(f"Performance metrics: {performance_metrics}")
```

### Alerting Integration

```python
# Set up alerts
await monitoring_integration.setup_alerts({
    "cpu_usage": 80,
    "memory_usage": 80,
    "disk_usage": 80,
    "error_rate": 5
})

# Send alert
await monitoring_integration.send_alert("high_cpu_usage", {
    "cpu_usage": 85,
    "timestamp": "2025-01-15T10:30:00Z"
})
```

## Custom Integration Examples

### Custom Agent Integration

```python
from phoenix_control.src.integration.custom_integration import CustomIntegration

class MyCustomIntegration(CustomIntegration):
    def __init__(self):
        super().__init__()
        self.custom_config = {}

    async def initialize(self):
        """Initialize custom integration."""
        await super().initialize()
        # Custom initialization logic

    async def process_agent(self, agent):
        """Process agent with custom logic."""
        # Custom agent processing
        processed_agent = await self.custom_agent_processing(agent)
        return processed_agent

    async def custom_agent_processing(self, agent):
        """Custom agent processing logic."""
        # Implement custom logic
        return agent

# Use custom integration
custom_integration = MyCustomIntegration()
await custom_integration.initialize()
```

### Custom Quality Integration

```python
class MyCustomQualityIntegration(QualityIntegration):
    def __init__(self):
        super().__init__()
        self.custom_tools = []

    async def run_custom_checks(self):
        """Run custom quality checks."""
        results = {}

        for tool in self.custom_tools:
            result = await self.run_tool(tool)
            results[tool] = result

        return results

    async def run_tool(self, tool):
        """Run a custom quality tool."""
        # Implement custom tool execution
        return {"passed": True, "details": "Custom tool executed"}

# Use custom quality integration
custom_quality = MyCustomQualityIntegration()
custom_quality.custom_tools = ["custom-linter", "custom-formatter"]
results = await custom_quality.run_custom_checks()
```

### Custom Release Integration

```python
class MyCustomReleaseIntegration(ReleaseIntegration):
    def __init__(self):
        super().__init__()
        self.custom_workflow = []

    async def execute_custom_workflow(self):
        """Execute custom release workflow."""
        for step in self.custom_workflow:
            await self.execute_step(step)

    async def execute_step(self, step):
        """Execute a custom workflow step."""
        # Implement custom step execution
        print(f"Executing custom step: {step}")

# Use custom release integration
custom_release = MyCustomReleaseIntegration()
custom_release.custom_workflow = ["custom-step-1", "custom-step-2", "custom-step-3"]
await custom_release.execute_custom_workflow()
```

## Best Practices

### 1. Integration Design

- **Modular Design**: Design integrations to be modular and reusable
- **Error Handling**: Implement comprehensive error handling
- **Configuration**: Use configuration files for integration settings
- **Documentation**: Document all integration points and APIs

### 2. Performance Optimization

- **Caching**: Implement caching for frequently accessed data
- **Async Operations**: Use async operations for better performance
- **Resource Management**: Properly manage resources and connections
- **Monitoring**: Monitor integration performance and health

### 3. Security Considerations

- **Authentication**: Implement proper authentication for integrations
- **Authorization**: Use proper authorization for access control
- **Data Validation**: Validate all data from external systems
- **Audit Logging**: Log all integration activities for audit

### 4. Testing and Validation

- **Unit Tests**: Write unit tests for integration components
- **Integration Tests**: Test integration with external systems
- **Mock Services**: Use mock services for testing
- **Validation**: Validate integration functionality

### 5. Maintenance and Updates

- **Version Management**: Manage integration versions properly
- **Backward Compatibility**: Maintain backward compatibility
- **Deprecation**: Properly deprecate old integration features
- **Migration**: Provide migration paths for updates

## Troubleshooting

### Common Integration Issues

#### 1. Connection Issues

**Problem**: Cannot connect to external system.

**Solution**:

```python
try:
    await integration.connect()
except ConnectionError as e:
    print(f"Connection failed: {e}")
    # Implement retry logic
    await integration.retry_connection()
```

#### 2. Authentication Issues

**Problem**: Authentication fails with external system.

**Solution**:

```python
try:
    await integration.authenticate()
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
    # Check credentials and configuration
    await integration.validate_credentials()
```

#### 3. Data Validation Issues

**Problem**: Data validation fails.

**Solution**:

```python
try:
    validated_data = await integration.validate_data(data)
except ValidationError as e:
    print(f"Validation failed: {e}")
    # Log validation errors and fix data
    await integration.log_validation_errors(e)
```

#### 4. Performance Issues

**Problem**: Integration is slow or timing out.

**Solution**:

```python
# Monitor integration performance
start_time = time.time()
result = await integration.perform_operation()
end_time = time.time()

if end_time - start_time > 30:  # 30 second timeout
    print("Integration operation timed out")
    # Implement timeout handling
    await integration.handle_timeout()
```

### Debug Mode

Enable debug mode for integration troubleshooting:

```python
# Enable debug mode
integration.debug_mode = True

# Set debug logging level
import logging
logging.getLogger("phoenix_control.integration").setLevel(logging.DEBUG)

# Run integration with debug output
await integration.run_with_debug()
```

### Health Checks

Implement health checks for integrations:

```python
# Check integration health
health_status = await integration.check_health()
if health_status["healthy"]:
    print("Integration is healthy")
else:
    print(f"Integration health issues: {health_status['issues']}")
```

---

**Note**: This integration guide is maintained by the PHOENIX Control development team. For questions or suggestions about integrations, please contact the team or create an issue in the project repository.
