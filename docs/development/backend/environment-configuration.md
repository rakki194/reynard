# Environment-Based Configuration System

The Environment-Based Configuration System provides comprehensive configuration management for the lazy loading system, allowing you to create environment-specific configurations with inheritance, templates, and migration capabilities.

## Overview

The system supports multiple environments (development, staging, production, testing, demo) with the ability to:

- Create custom environments with specific configurations
- Use configuration templates for common settings
- Inherit configurations from parent environments
- Migrate configurations between environments
- Validate configurations for correctness
- Export and import environment configurations

## Environment Types

The system supports the following environment types:

- **development**: Development environment with debugging enabled
- **staging**: Staging environment for testing
- **production**: Production environment with optimized settings
- **testing**: Testing environment with minimal resource usage
- **demo**: Demo environment with showcase features
- **custom**: Custom environment for specific use cases

## Default Environments

The system comes with pre-configured environments:

### Development

- Aggressive unloading strategy (5-minute timeout)
- Debug mode enabled
- Detailed logging
- Performance monitoring enabled

### Staging

- Balanced unloading strategy (15-minute timeout)
- Inherits from development
- Debug mode disabled
- Info-level logging

### Production

- Conservative unloading strategy (30-minute timeout)
- Inherits from staging
- Optimized for performance
- Warning-level logging
- Increased cache size (200MB)

### Testing

- Unloading disabled
- Minimal resource usage
- Debug mode enabled
- No analytics or monitoring

### Demo

- Balanced unloading strategy
- Inherits from development
- Analytics and monitoring enabled
- Showcase features enabled

## Configuration Templates

The system includes several configuration templates:

### High Performance

- Conservative unloading strategy
- 8 concurrent loads
- 500MB cache size
- High memory pressure threshold

### Memory Efficient

- Aggressive unloading strategy
- 2 concurrent loads
- 50MB cache size
- Low memory pressure threshold

### Debug Mode

- Debug mode enabled
- Detailed logging
- Short check intervals
- Performance monitoring

### Minimal

- Unloading disabled
- No analytics or monitoring
- Minimal features enabled

## Environment Detection

The system automatically detects the current environment based on environment variables:

1. **REYNARD_ENVIRONMENT**: Explicit environment setting
2. **NODE_ENV**: Node.js environment variable
3. **PRODUCTION**: Production flag
4. **STAGING**: Staging flag
5. **TESTING**: Testing flag
6. **Default**: Falls back to "development"

## API Usage

### Environment Management

#### Get All Environments

```bash
GET /api/environment-config/environments
```

#### Get Current Environment

```bash
GET /api/environment-config/environments/current
```

#### Get Specific Environment

```bash
GET /api/environment-config/environments/{environment_name}
```

#### Create Environment

```bash
POST /api/environment-config/environments
{
  "name": "custom_env",
  "environment_type": "custom",
  "description": "Custom environment",
  "parent_environment": "development",
  "inheritance_level": "full",
  "overrides": {
    "lazy_loading_unloading_strategy": "AGGRESSIVE",
    "cache_size_limit": 100000000
  },
  "templates": ["high_performance"]
}
```

#### Update Environment

```bash
PUT /api/environment-config/environments/{environment_name}
{
  "description": "Updated description",
  "overrides": {
    "new_setting": "new_value"
  }
}
```

#### Delete Environment

```bash
DELETE /api/environment-config/environments/{environment_name}
```

### Template Management

#### Get All Templates

```bash
GET /api/environment-config/templates
```

#### Get Specific Template

```bash
GET /api/environment-config/templates/{template_name}
```

#### Create Template

```bash
POST /api/environment-config/templates
{
  "name": "custom_template",
  "description": "Custom template",
  "category": "performance",
  "configuration": {
    "custom_setting": "custom_value"
  },
  "validation_rules": {
    "custom_setting": {
      "type": "str",
      "allowed_values": ["value1", "value2"]
    }
  }
}
```

### Migration

#### Migrate Configuration

```bash
POST /api/environment-config/migrations
{
  "from_environment": "development",
  "to_environment": "staging",
  "migration_type": "copy"
}
```

Migration types:

- **copy**: Copy all configuration from source to target
- **merge**: Merge source configuration with target configuration
- **transform**: Transform configuration using rules

#### Transform Migration Example

```bash
POST /api/environment-config/migrations
{
  "from_environment": "development",
  "to_environment": "production",
  "migration_type": "transform",
  "transform_rules": {
    "timeout": {
      "type": "multiply",
      "factor": 2.0
    },
    "cache_size": {
      "type": "add",
      "offset": 100000000
    }
  }
}
```

### Import/Export

#### Export Environment

```bash
POST /api/environment-config/environments/{environment_name}/export?format=json
```

#### Import Environment

```bash
POST /api/environment-config/environments/import
Content-Type: multipart/form-data
file: environment_config.json
overwrite: false
```

### Validation

#### Validate Environment

```bash
POST /api/environment-config/environments/{environment_name}/validate
```

### Utility Endpoints

#### Reload Configuration

```bash
POST /api/environment-config/reload
```

#### Get Status

```bash
GET /api/environment-config/status
```

## Configuration Inheritance

Environments can inherit configurations from parent environments:

```json
{
  "name": "staging",
  "environment_type": "staging",
  "parent_environment": "development",
  "inheritance_level": "full",
  "overrides": {
    "lazy_loading_unloading_strategy": "BALANCED"
  }
}
```

Inheritance levels:

- **none**: No inheritance
- **partial**: Inherit only specific sections
- **full**: Full inheritance with overrides

## Configuration Resolution

The system resolves configurations in the following order:

1. Parent environment configuration (if inheritance is enabled)
2. Template configurations (in order specified)
3. Environment-specific overrides

This allows for flexible configuration management while maintaining consistency across environments.

## Validation Rules

Templates can include validation rules for configuration values:

```json
{
  "validation_rules": {
    "max_concurrent_loads": {
      "type": "int",
      "min": 1,
      "max": 16
    },
    "cache_size_limit": {
      "type": "int",
      "min": 1048576,
      "max": 2147483648
    },
    "lazy_loading_unloading_strategy": {
      "type": "str",
      "allowed_values": ["AGGRESSIVE", "BALANCED", "CONSERVATIVE"]
    }
  }
}
```

## File Structure

The system stores configurations in the following structure:

```plai
config/environments/
├── environments/
│   ├── development.json
│   ├── staging.json
│   ├── production.json
│   └── custom_env.json
├── templates/
│   ├── high_performance.json
│   ├── memory_efficient.json
│   └── custom_template.json
├── migrations/
│   └── migration_records.json
└── exports/
    └── exported_configs/
```

## Integration with Configuration Engine

The environment-based configuration system integrates with the existing configuration engine:

```python
from app.utils.configuration_engine import get_configuration_engine

# Get configuration engine
config_engine = get_configuration_engine()

# Get current environment
current_env = config_engine.get_current_environment()

# Get environment configuration
env_config = config_engine.get_current_environment_config()

# Get resolved configuration
resolved_config = config_engine.resolve_environment_configuration("production")

# Create new environment
config_engine.create_environment(
    name="custom_env",
    environment_type="custom",
    parent_environment="development"
)
```

## Best Practices

1. **Use Templates**: Create templates for common configuration patterns
2. **Inheritance**: Use inheritance to maintain consistency across environments
3. **Validation**: Include validation rules in templates to ensure configuration correctness
4. **Migration**: Use migration tools to propagate configuration changes
5. **Documentation**: Document custom environments and templates
6. **Testing**: Test configurations in lower environments before applying to production

## Examples

### Creating a High-Performance Development Environment

```python
# Create environment with high-performance template
config_engine.create_environment(
    name="dev_high_perf",
    environment_type="custom",
    description="High-performance development environment",
    parent_environment="development",
    templates=["high_performance"],
    overrides={
        "debug_mode": True,
        "log_level": "DEBUG"
    }
)
```

### Migrating Development Settings to Production

```python
# Migrate with transformations for production
config_engine.migrate_configuration(
    from_environment="development",
    to_environment="production",
    migration_type="transform",
    transform_rules={
        "timeout": {"type": "multiply", "factor": 3.0},
        "cache_size": {"type": "multiply", "factor": 2.0},
        "debug_mode": {"type": "replace", "value": False}
    }
)
```

### Creating a Custom Template

```python
# Create template for GPU-optimized environments
config_engine.create_template(
    name="gpu_optimized",
    description="GPU-optimized configuration",
    category="performance",
    configuration={
        "max_concurrent_loads": 16,
        "memory_pressure_threshold": 0.95,
        "gpu_memory_fraction": 0.8
    },
    validation_rules={
        "max_concurrent_loads": {"min": 1, "max": 32},
        "gpu_memory_fraction": {"min": 0.1, "max": 1.0}
    }
)
```

This environment-based configuration system provides a powerful and flexible way to manage configurations across different environments while maintaining consistency and enabling easy migration between environments.
