# Dynamic Enum Service

A **fully modular** service for managing dynamic enums based on FastAPI ECS backend data. This service eliminates hardcoded enums and uses a PostgreSQL database as the single source of truth, while supporting **any type of enum** through a provider-based architecture.

## Features

- **🔄 Generic Enum Support**: Create dynamic enums for any data type (spirits, styles, traits, colors, etc.)
- **🏗️ Provider-Based Architecture**: Clean, extensible interface for enum providers
- **📦 Built-in Providers**: Ready-to-use providers for spirits, styles, and traits
- **🔧 Custom Enum Creation**: Create custom enum types with metadata support
- **⚡ Intelligent Caching**: Performance optimization with fallback support
- **🛡️ Graceful Degradation**: Works even when backend is unavailable
- **🔌 Protocol-Based Design**: Clean interface for backend data providers
- **🚀 Async Support**: Full async/await support for modern Python applications
- **🔄 Backward Compatibility**: Existing code continues to work unchanged

## Installation

```bash
cd services/dynamic_enum
pip install -e .
```

## Usage

### Basic Usage

```python
from reynard_dynamic_enum import DynamicEnumService, initialize_dynamic_enum_service

# Initialize with a backend provider
service = initialize_dynamic_enum_service(backend_provider)

# Get available spirits (backward compatibility)
spirits = await service.get_available_spirits()

# Validate a spirit (backward compatibility)
valid_spirit = await service.validate_spirit("fox")

# Get random spirit with weights (backward compatibility)
random_spirit = await service.get_random_spirit(weighted=True)
```

### Generic Enum Usage

```python
# Get any enum type
spirits = await service.get_available_values("spirits")
styles = await service.get_available_values("styles")
traits = await service.get_available_values("personality_traits")

# Validate any enum value
valid_spirit = await service.validate_value("spirits", "fox")
valid_style = await service.validate_value("styles", "foundation")

# Get random values from any enum
random_spirit = await service.get_random_value("spirits", weighted=True)
random_trait = await service.get_random_value("personality_traits", weighted=False)

# Get metadata (emojis, descriptions)
emoji = await service.get_emoji("spirits", "fox")  # Returns "🦊"
description = await service.get_description("spirits", "fox")  # Returns "Cunning and strategic"
```

### Custom Enum Creation

```python
# Create a custom "colors" enum
colors_data = {
    "red": {"weight": 1.0, "emoji": "🔴", "description": "Bold and passionate"},
    "blue": {"weight": 1.0, "emoji": "🔵", "description": "Calm and trustworthy"},
    "green": {"weight": 1.0, "emoji": "🟢", "description": "Natural and balanced"},
    "yellow": {"weight": 1.0, "emoji": "🟡", "description": "Energetic and optimistic"},
}

# Create and register the custom provider
colors_provider = service.create_custom_provider("colors", colors_data, "blue")

# Use the custom enum
colors = await service.get_available_values("colors")
random_color = await service.get_random_value("colors", weighted=True)
color_emoji = await service.get_emoji("colors", "red")  # Returns "🔴"
```

### With Backend Provider

```python
from reynard_dynamic_enum import DynamicEnumService, EnumDataProvider

class MyBackendProvider(EnumDataProvider):
    async def get_data(self, enum_type: str) -> dict[str, Any]:
        # Your implementation for any enum type
        if enum_type == "spirits":
            return await self.get_spirits_from_backend()
        elif enum_type == "custom_data":
            return await self.get_custom_data_from_backend()
        return {}

# Initialize service
service = DynamicEnumService(MyBackendProvider())

# Use the service with any enum type
spirits = await service.get_available_values("spirits")
custom_data = await service.get_available_values("custom_data")
```

### Global Service Pattern

```python
from reynard_dynamic_enum import initialize_dynamic_enum_service, get_dynamic_enum_service

# Initialize once in your application
initialize_dynamic_enum_service(backend_provider)

# Use anywhere in your application
service = get_dynamic_enum_service()
spirits = await service.get_available_spirits()
```

## API Reference

### DynamicEnumService

#### Methods

- `get_available_spirits()`: Get all available animal spirits
- `get_available_styles()`: Get all available naming styles
- `get_all_enums()`: Get all enum data from backend
- `validate_spirit(spirit: str)`: Validate and return a spirit with fallback
- `validate_style(style: str)`: Validate and return a style with fallback
- `get_random_spirit(weighted: bool = True)`: Get a random spirit
- `get_spirit_emoji(spirit: str)`: Get emoji for a spirit
- `clear_cache()`: Clear all cached data

#### Properties

- `is_valid_spirit(spirit: str)`: Check if spirit is valid (sync)
- `is_valid_style(style: str)`: Check if style is valid (sync)

### BackendDataProvider Protocol

Implement this protocol to provide backend data:

```python
class BackendDataProvider(Protocol):
    async def get_naming_spirits(self) -> Dict[str, Any]:
        """Get naming spirits data from backend."""
        ...
    
    async def get_naming_enums(self) -> Dict[str, Any]:
        """Get naming enums data from backend."""
        ...
```

## Architecture

The service follows a clean architecture pattern:

1. **Service Layer**: `DynamicEnumService` provides the main API
2. **Protocol Layer**: `BackendDataProvider` defines the backend interface
3. **Caching Layer**: Intelligent caching with fallback support
4. **Global Instance**: Singleton pattern for application-wide usage

## Fallback Behavior

When the backend is unavailable, the service provides sensible fallbacks:

- **Spirits**: fox, wolf, otter, dragon, phoenix, eagle, lion, tiger
- **Styles**: foundation, exo, hybrid, cyberpunk, mythological, scientific
- **Default Spirit**: fox
- **Default Style**: foundation

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black src/
isort src/
```

### Linting

```bash
flake8 src/
```

## License

MIT License - see LICENSE file for details.
