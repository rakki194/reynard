# PHOENIX Control API Reference

This document provides a comprehensive API reference for all components of the PHOENIX Control system.

## Table of Contents

- [Core Components](#core-components)
- [Automation Components](#automation-components)
- [Quality Components](#quality-components)
- [Data Structures](#data-structures)
- [Utilities](#utilities)
- [Configuration](#configuration)

## Core Components

### SuccessAdvisor8

The core agent class representing Success-Advisor-8 with release management and quality assurance expertise.

#### Constructor

```python
SuccessAdvisor8()
```

Creates a new Success-Advisor-8 agent instance with default configuration.

#### Properties

- **`agent_id`** (str): Unique agent identifier ("success-advisor-8")
- **`name`** (str): Agent name ("Champion-Designer-32")
- **`spirit`** (SpiritType): Agent spirit type (WOLF)
- **`style`** (NamingStyle): Agent naming style (FOUNDATION)
- **`generation`** (int): Agent generation number (32)
- **`specialization`** (str): Agent specialization ("Release Management and Quality Assurance")
- **`traits`** (dict): Agent personality traits
- **`abilities`** (dict): Agent abilities and skills
- **`knowledge_base`** (dict): Agent knowledge areas and expertise
- **`performance_history`** (list): Agent performance history

#### Methods

##### `to_dict() -> dict`

Serializes the agent state to a dictionary.

**Returns**: Dictionary representation of the agent state

**Example**:

```python
agent = SuccessAdvisor8()
agent_dict = agent.to_dict()
```

##### `from_dict(data: dict) -> SuccessAdvisor8`

Creates a new agent instance from a dictionary.

**Parameters**:

- `data` (dict): Dictionary containing agent state data

**Returns**: New SuccessAdvisor8 instance

**Example**:

```python
agent = SuccessAdvisor8.from_dict(agent_dict)
```

### AgentState

Data class representing the complete state of an agent.

#### Constructor

```python
AgentState(
    agent_id: str,
    name: str,
    spirit: SpiritType,
    style: NamingStyle,
    generation: int,
    specialization: str,
    traits: dict,
    abilities: dict,
    performance_history: list,
    knowledge_base: dict
)
```

Creates a new agent state instance.

#### Properties

- **`agent_id`** (str): Unique agent identifier
- **`name`** (str): Agent name
- **`spirit`** (SpiritType): Agent spirit type
- **`style`** (NamingStyle): Agent naming style
- **`generation`** (int): Agent generation number
- **`specialization`** (str): Agent specialization
- **`traits`** (dict): Agent personality traits
- **`abilities`** (dict): Agent abilities and skills
- **`performance_history`** (list): Agent performance history
- **`knowledge_base`** (dict): Agent knowledge areas and expertise

#### Methods

##### `to_dict() -> dict`

Serializes the agent state to a dictionary.

**Returns**: Dictionary representation of the agent state

##### `from_dict(data: dict) -> AgentState`

Creates a new agent state instance from a dictionary.

**Parameters**:

- `data` (dict): Dictionary containing agent state data

**Returns**: New AgentState instance

##### `validate() -> bool`

Validates the agent state for integrity.

**Returns**: True if valid, False otherwise

### AgentStatePersistence

Class for managing agent state persistence, backup, and recovery.

#### Constructor

```python
AgentStatePersistence(state_dir: str = "agent_states")
```

Creates a new persistence instance.

**Parameters**:

- `state_dir` (str): Directory for storing agent states

#### Methods

##### `save_agent(agent: AgentState) -> bool`

Saves an agent state to persistent storage.

**Parameters**:

- `agent` (AgentState): Agent state to save

**Returns**: True if successful, False otherwise

**Example**:

```python
persistence = AgentStatePersistence()
success = persistence.save_agent(agent)
```

##### `load_agent(agent_id: str) -> AgentState | None`

Loads an agent state from persistent storage.

**Parameters**:

- `agent_id` (str): Agent identifier

**Returns**: AgentState instance or None if not found

**Example**:

```python
agent = persistence.load_agent("success-advisor-8")
```

##### `list_agents() -> list[AgentState]`

Lists all available agent states.

**Returns**: List of AgentState instances

**Example**:

```python
agents = persistence.list_agents()
```

##### `delete_agent(agent_id: str) -> bool`

Deletes an agent state from persistent storage.

**Parameters**:

- `agent_id` (str): Agent identifier

**Returns**: True if successful, False otherwise

**Example**:

```python
success = persistence.delete_agent("test-agent")
```

##### `backup_agent_states() -> bool`

Creates a backup of all agent states.

**Returns**: True if successful, False otherwise

**Example**:

```python
success = persistence.backup_agent_states()
```

##### `list_backups() -> list[dict]`

Lists all available backups.

**Returns**: List of backup information dictionaries

**Example**:

```python
backups = persistence.list_backups()
```

##### `validate_agent_state(agent: AgentState) -> dict`

Validates an agent state for integrity.

**Parameters**:

- `agent` (AgentState): Agent state to validate

**Returns**: Dictionary with validation results

**Example**:

```python
result = persistence.validate_agent_state(agent)
if result["valid"]:
    print("Agent state is valid")
```

##### `compare_agents(agent1: AgentState, agent2: AgentState) -> dict`

Compares two agent states.

**Parameters**:

- `agent1` (AgentState): First agent state
- `agent2` (AgentState): Second agent state

**Returns**: Dictionary with comparison results

**Example**:

```python
comparison = persistence.compare_agents(agent1, agent2)
print(f"Similarity: {comparison['similarity_score']}")
```

##### `get_agent_statistics() -> dict`

Gets statistics about all agent states.

**Returns**: Dictionary with agent statistics

**Example**:

```python
stats = persistence.get_agent_statistics()
print(f"Total agents: {stats['total_agents']}")
```

##### `cleanup_old_backups() -> bool`

Cleans up old backup files.

**Returns**: True if successful, False otherwise

**Example**:

```python
success = persistence.cleanup_old_backups()
```

## Automation Components

### ReleaseAutomation

Class for automated release workflow management.

#### Constructor

```python
ReleaseAutomation(config: ReleaseConfig)
```

Creates a new release automation instance.

**Parameters**:

- `config` (ReleaseConfig): Release configuration

#### Methods

##### `execute_release_workflow() -> bool`

Executes the complete release workflow.

**Returns**: True if successful, False otherwise

**Example**:

```python
config = ReleaseConfig()
automation = ReleaseAutomation(config)
success = await automation.execute_release_workflow()
```

### GitWorkflowAutomation

Class for git workflow automation.

#### Constructor

```python
GitWorkflowAutomation(config: ReleaseConfig)
```

Creates a new git workflow automation instance.

**Parameters**:

- `config` (ReleaseConfig): Release configuration

#### Methods

##### `verify_agent_state() -> bool`

Verifies agent state before release.

**Returns**: True if valid, False otherwise

**Example**:

```python
git_workflow = GitWorkflowAutomation(config)
valid = git_workflow.verify_agent_state()
```

##### `backup_agent_state() -> bool`

Backs up agent state before release.

**Returns**: True if successful, False otherwise

**Example**:

```python
success = git_workflow.backup_agent_state()
```

##### `detect_junk_files() -> list[str]`

Detects junk files that should not be committed.

**Returns**: List of junk file paths

**Example**:

```python
junk_files = git_workflow.detect_junk_files()
```

##### `analyze_changes() -> dict`

Analyzes changes for release.

**Returns**: Dictionary with change analysis

**Example**:

```python
changes = git_workflow.analyze_changes()
```

##### `execute_git_operations() -> bool`

Executes git operations for release.

**Returns**: True if successful, False otherwise

**Example**:

```python
success = git_workflow.execute_git_operations()
```

### VersionManager

Class for version management and semantic versioning.

#### Constructor

```python
VersionManager()
```

Creates a new version manager instance.

#### Methods

##### `get_current_version() -> str | None`

Gets the current version from package.json.

**Returns**: Current version string or None if not found

**Example**:

```python
version_manager = VersionManager()
current_version = await version_manager.get_current_version()
```

##### `get_version_info(version: str) -> dict`

Gets detailed version information.

**Parameters**:

- `version` (str): Version string

**Returns**: Dictionary with version information

**Example**:

```python
version_info = version_manager.get_version_info("1.0.0")
```

##### `suggest_next_version(current_version: str, change_type: str) -> str | None`

Suggests the next version based on change type.

**Parameters**:

- `current_version` (str): Current version
- `change_type` (str): Type of change (major, minor, patch)

**Returns**: Suggested next version or None

**Example**:

```python
next_version = await version_manager.suggest_next_version("1.0.0", "minor")
```

##### `update_version(new_version: str) -> bool`

Updates the version in package.json.

**Parameters**:

- `new_version` (str): New version string

**Returns**: True if successful, False otherwise

**Example**:

```python
success = await version_manager.update_version("1.1.0")
```

##### `compare_versions(version1: str, version2: str) -> int`

Compares two version strings.

**Parameters**:

- `version1` (str): First version
- `version2` (str): Second version

**Returns**: -1 if version1 < version2, 0 if equal, 1 if version1 > version2

**Example**:

```python
comparison = version_manager.compare_versions("1.0.0", "1.1.0")
```

### ChangelogManager

Class for changelog management and automation.

#### Constructor

```python
ChangelogManager()
```

Creates a new changelog manager instance.

#### Methods

##### `create_changelog() -> bool`

Creates a new changelog file.

**Returns**: True if successful, False otherwise

**Example**:

```python
changelog_manager = ChangelogManager()
success = await changelog_manager.create_changelog()
```

##### `validate_changelog() -> dict`

Validates the changelog format and content.

**Returns**: Dictionary with validation results

**Example**:

```python
validation = await changelog_manager.validate_changelog()
if validation["valid"]:
    print("Changelog is valid")
```

##### `add_entry(change_type: str, description: str) -> bool`

Adds a new entry to the changelog.

**Parameters**:

- `change_type` (str): Type of change (Added, Changed, Fixed, etc.)
- `description` (str): Description of the change

**Returns**: True if successful, False otherwise

**Example**:

```python
success = await changelog_manager.add_entry("Added", "New feature for automated release management")
```

##### `promote_unreleased() -> bool`

Promotes unreleased changes to a new version.

**Returns**: True if successful, False otherwise

**Example**:

```python
success = await changelog_manager.promote_unreleased()
```

##### `add_section(version: str, date: str) -> bool`

Adds a new version section to the changelog.

**Parameters**:

- `version` (str): Version string
- `date` (str): Release date

**Returns**: True if successful, False otherwise

**Example**:

```python
success = await changelog_manager.add_section("1.1.0", "2025-01-15")
```

## Quality Components

### CodeQualityValidation

Class for code quality validation and checking.

#### Constructor

```python
CodeQualityValidation()
```

Creates a new code quality validation instance.

#### Methods

##### `validate_frontend() -> dict`

Validates frontend code quality.

**Returns**: Dictionary with validation results

**Example**:

```python
quality_validator = CodeQualityValidation()
result = await quality_validator.validate_frontend()
```

##### `validate_backend() -> dict`

Validates backend code quality.

**Returns**: Dictionary with validation results

**Example**:

```python
result = await quality_validator.validate_backend()
```

### SecurityQualityAssurance

Class for security quality assurance and vulnerability scanning.

#### Constructor

```python
SecurityQualityAssurance()
```

Creates a new security quality assurance instance.

#### Methods

##### `scan_dependency_vulnerabilities() -> dict`

Scans for dependency vulnerabilities.

**Returns**: Dictionary with scan results

**Example**:

```python
security_qa = SecurityQualityAssurance()
result = await security_qa.scan_dependency_vulnerabilities()
```

##### `scan_python_security() -> dict`

Scans Python code for security issues.

**Returns**: Dictionary with scan results

**Example**:

```python
result = await security_qa.scan_python_security()
```

##### `scan_secrets() -> dict`

Scans for secrets and sensitive information.

**Returns**: Dictionary with scan results

**Example**:

```python
result = await security_qa.scan_secrets()
```

##### `validate_configuration_security() -> dict`

Validates configuration security.

**Returns**: Dictionary with validation results

**Example**:

```python
result = await security_qa.validate_configuration_security()
```

### PerformanceQualityAssurance

Class for performance quality assurance and testing.

#### Constructor

```python
PerformanceQualityAssurance()
```

Creates a new performance quality assurance instance.

#### Methods

##### `test_build_performance() -> dict`

Tests build performance.

**Returns**: Dictionary with test results

**Example**:

```python
performance_qa = PerformanceQualityAssurance()
result = await performance_qa.test_build_performance()
```

##### `test_execution_performance() -> dict`

Tests execution performance.

**Returns**: Dictionary with test results

**Example**:

```python
result = await performance_qa.test_execution_performance()
```

##### `analyze_memory_usage() -> dict`

Analyzes memory usage.

**Returns**: Dictionary with analysis results

**Example**:

```python
result = await performance_qa.analyze_memory_usage()
```

##### `analyze_bundle_size() -> dict`

Analyzes bundle size.

**Returns**: Dictionary with analysis results

**Example**:

```python
result = await performance_qa.analyze_bundle_size()
```

## Data Structures

### SpiritType

Enum representing different agent spirit types.

#### Values

- **`FOX`**: Fox spirit type
- **`WOLF`**: Wolf spirit type
- **`OTTER`**: Otter spirit type
- **`EAGLE`**: Eagle spirit type
- **`LION`**: Lion spirit type
- **`TIGER`**: Tiger spirit type
- **`DRAGON`**: Dragon spirit type
- **`PHOENIX`**: Phoenix spirit type
- **`ALIEN`**: Alien spirit type
- **`YETI`**: Yeti spirit type

#### Methods

##### `from_string(value: str) -> SpiritType`

Creates a SpiritType from a string value.

**Parameters**:

- `value` (str): String value

**Returns**: SpiritType instance

**Raises**: ValueError if value is invalid

**Example**:

```python
spirit = SpiritType.from_string("wolf")
```

### NamingStyle

Enum representing different agent naming styles.

#### Values

- **`FOUNDATION`**: Foundation naming style
- **`EXO`**: Exo naming style
- **`HYBRID`**: Hybrid naming style
- **`CYBERPUNK`**: Cyberpunk naming style
- **`MYTHOLOGICAL`**: Mythological naming style
- **`SCIENTIFIC`**: Scientific naming style

#### Methods

##### `from_string(value: str) -> NamingStyle`

Creates a NamingStyle from a string value.

**Parameters**:

- `value` (str): String value

**Returns**: NamingStyle instance

**Raises**: ValueError if value is invalid

**Example**:

```python
style = NamingStyle.from_string("foundation")
```

### PerformanceMetrics

Data class representing performance metrics.

#### Constructor

```python
PerformanceMetrics(
    timestamp: str,
    action: str,
    success: bool,
    duration: float = 0.0,
    memory_usage: float = 0.0,
    cpu_usage: float = 0.0,
    details: str = ""
)
```

Creates a new performance metrics instance.

#### Properties

- **`timestamp`** (str): Timestamp of the performance measurement
- **`action`** (str): Action that was performed
- **`success`** (bool): Whether the action was successful
- **`duration`** (float): Duration of the action in seconds
- **`memory_usage`** (float): Memory usage in MB
- **`cpu_usage`** (float): CPU usage percentage
- **`details`** (str): Additional details about the performance

#### Methods

##### `to_dict() -> dict`

Serializes the performance metrics to a dictionary.

**Returns**: Dictionary representation of the performance metrics

##### `from_dict(data: dict) -> PerformanceMetrics`

Creates a new performance metrics instance from a dictionary.

**Parameters**:

- `data` (dict): Dictionary containing performance metrics data

**Returns**: New PerformanceMetrics instance

### StatisticalSignificance

Data class representing statistical significance information.

#### Constructor

```python
StatisticalSignificance(
    p_value: float,
    confidence_level: float,
    sample_size: int,
    effect_size: float = 0.0,
    is_significant: bool = False,
    interpretation: str = ""
)
```

Creates a new statistical significance instance.

#### Properties

- **`p_value`** (float): P-value of the statistical test
- **`confidence_level`** (float): Confidence level of the test
- **`sample_size`** (int): Size of the sample
- **`effect_size`** (float): Effect size of the test
- **`is_significant`** (bool): Whether the result is statistically significant
- **`interpretation`** (str): Interpretation of the statistical result

#### Methods

##### `to_dict() -> dict`

Serializes the statistical significance to a dictionary.

**Returns**: Dictionary representation of the statistical significance

##### `from_dict(data: dict) -> StatisticalSignificance`

Creates a new statistical significance instance from a dictionary.

**Parameters**:

- `data` (dict): Dictionary containing statistical significance data

**Returns**: New StatisticalSignificance instance

## Configuration

### ReleaseConfig

Data class representing release configuration.

#### Constructor

```python
ReleaseConfig(
    auto_backup: bool = True,
    comprehensive_analysis: bool = True,
    detailed_logging: bool = True,
    agent_state_tracking: bool = True,
    create_tag: bool = True,
    push_remote: bool = False,
    version_type: str = "auto"
)
```

Creates a new release configuration instance.

#### Properties

- **`auto_backup`** (bool): Whether to automatically backup agent states
- **`comprehensive_analysis`** (bool): Whether to perform comprehensive analysis
- **`detailed_logging`** (bool): Whether to enable detailed logging
- **`agent_state_tracking`** (bool): Whether to track agent state changes
- **`create_tag`** (bool): Whether to create git tags
- **`push_remote`** (bool): Whether to push to remote repository
- **`version_type`** (str): Type of version bump (auto, major, minor, patch)

#### Methods

##### `to_dict() -> dict`

Serializes the release configuration to a dictionary.

**Returns**: Dictionary representation of the release configuration

##### `from_dict(data: dict) -> ReleaseConfig`

Creates a new release configuration instance from a dictionary.

**Parameters**:

- `data` (dict): Dictionary containing release configuration data

**Returns**: New ReleaseConfig instance

### QualityConfig

Data class representing quality configuration.

#### Constructor

```python
QualityConfig(
    enable_linting: bool = True,
    enable_formatting: bool = True,
    enable_type_checking: bool = True,
    enable_security_scanning: bool = True,
    enable_performance_testing: bool = True,
    enable_documentation_validation: bool = True,
    strict_mode: bool = True,
    auto_fix: bool = True
)
```

Creates a new quality configuration instance.

#### Properties

- **`enable_linting`** (bool): Whether to enable linting
- **`enable_formatting`** (bool): Whether to enable formatting
- **`enable_type_checking`** (bool): Whether to enable type checking
- **`enable_security_scanning`** (bool): Whether to enable security scanning
- **`enable_performance_testing`** (bool): Whether to enable performance testing
- **`enable_documentation_validation`** (bool): Whether to enable documentation validation
- **`strict_mode`** (bool): Whether to enable strict mode
- **`auto_fix`** (bool): Whether to automatically fix issues

#### Methods

##### `to_dict() -> dict`

Serializes the quality configuration to a dictionary.

**Returns**: Dictionary representation of the quality configuration

##### `from_dict(data: dict) -> QualityConfig`

Creates a new quality configuration instance from a dictionary.

**Parameters**:

- `data` (dict): Dictionary containing quality configuration data

**Returns**: New QualityConfig instance

## Utilities

### setup_logging

Function for setting up logging configuration.

#### Signature

```python
setup_logging(level: str = "INFO") -> logging.Logger
```

Sets up logging configuration for the PHOENIX Control system.

**Parameters**:

- `level` (str): Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

**Returns**: Configured logger instance

**Example**:

```python
logger = setup_logging("DEBUG")
logger.info("PHOENIX Control system initialized")
```

---

**Note**: This API reference is maintained by the PHOENIX Control development team. For questions or suggestions about the API, please contact the team or create an issue in the project repository.
