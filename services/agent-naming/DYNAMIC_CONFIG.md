# Dynamic Agent Naming Configuration System

🦊 _whiskers twitch with excitement_ The dynamic agent naming configuration system allows you to change naming schemes, styles, and components at runtime through JSON configuration files and API endpoints!

## 🎯 **Overview**

The system provides three ways to configure agent naming:

1. **JSON Configuration Files** - Edit `naming_config.json` directly
2. **MCP Server Tools** - Use MCP tools for runtime configuration
3. **Backend API Endpoints** - REST API for configuration management

## 📁 **Configuration File Structure**

The main configuration file is located at:

```
services/agent-naming/reynard_agent_naming/data/naming_config.json
```

### **Key Configuration Sections**

```json
{
  "version": "1.0.0",
  "last_updated": "2025-01-15T12:00:00Z",
  "default_scheme": "animal_spirit",
  "default_style": "foundation",
  "weighted_distribution": true,

  "schemes": {
    "animal_spirit": {
      "name": "animal_spirit",
      "enabled": true,
      "description": "Animal spirit based naming",
      "default_style": "foundation",
      "supported_styles": ["foundation", "exo", "cyberpunk"]
    }
  },

  "styles": {
    "foundation": {
      "name": "foundation",
      "enabled": true,
      "description": "Asimov-inspired strategic naming",
      "format_template": "{spirit}-{suffix}-{generation}",
      "components": ["foundation_suffixes"]
    }
  },

  "spirits": {
    "fox": {
      "name": "fox",
      "enabled": true,
      "description": "Cunning, strategic thinking",
      "base_names": ["Vulpine", "Reynard", "Sage"],
      "generation_numbers": [3, 7, 13, 21, 34, 55, 89],
      "weight": 1.0
    }
  }
}
```

## 🛠️ **MCP Server Tools**

### **Available Tools**

- `get_naming_config` - Get current configuration
- `get_available_schemes` - List available schemes
- `get_available_styles` - List available styles
- `get_available_spirits` - List available spirits
- `set_default_scheme` - Set default scheme
- `set_default_style` - Set default style
- `enable_scheme` / `disable_scheme` - Toggle schemes
- `enable_style` / `disable_style` - Toggle styles
- `enable_spirit` / `disable_spirit` - Toggle spirits
- `reload_naming_config` - Reload from file
- `validate_naming_config` - Validate configuration

### **Example Usage**

```python
# Get current configuration
config = await mcp_tools.get_naming_config()

# Change default scheme to elemental
await mcp_tools.set_default_scheme("elemental")

# Disable cyberpunk style
await mcp_tools.disable_style("cyberpunk")

# Enable dragon spirit
await mcp_tools.enable_spirit("dragon")

# Reload configuration
await mcp_tools.reload_naming_config()
```

## 🌐 **Backend API Endpoints**

### **Base URL**

```
http://localhost:8000/mcp/naming-config
```

### **Available Endpoints**

#### **GET /mcp/naming-config/**

Get current configuration overview

#### **GET /mcp/naming-config/schemes**

Get all available schemes

#### **GET /mcp/naming-config/styles**

Get all available styles

#### **GET /mcp/naming-config/spirits**

Get all available spirits

#### **PUT /mcp/naming-config/default-scheme/{scheme_name}**

Set default scheme

#### **PUT /mcp/naming-config/default-style/{style_name}**

Set default style

#### **PUT /mcp/naming-config/schemes/{scheme_name}/enable**

Enable a scheme

#### **PUT /mcp/naming-config/schemes/{scheme_name}/disable**

Disable a scheme

#### **PUT /mcp/naming-config/styles/{style_name}/enable**

Enable a style

#### **PUT /mcp/naming-config/styles/{style_name}/disable**

Disable a style

#### **PUT /mcp/naming-config/spirits/{spirit_name}/enable**

Enable a spirit

#### **PUT /mcp/naming-config/spirits/{spirit_name}/disable**

Disable a spirit

#### **POST /mcp/naming-config/reload**

Reload configuration from file

#### **GET /mcp/naming-config/validate**

Validate current configuration

#### **PUT /mcp/naming-config/update**

Update configuration settings

### **Example API Usage**

```bash
# Get current configuration
curl http://localhost:8000/mcp/naming-config/

# Set default scheme to elemental
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/elemental

# Disable cyberpunk style
curl -X PUT http://localhost:8000/mcp/naming-config/styles/cyberpunk/disable

# Enable dragon spirit
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/dragon/enable

# Reload configuration
curl -X POST http://localhost:8000/mcp/naming-config/reload

# Validate configuration
curl http://localhost:8000/mcp/naming-config/validate
```

## 🎨 **Available Naming Schemes**

### **Animal Spirit** (Default)

- **Description**: Animal spirit based naming with fox, wolf, otter themes
- **Styles**: foundation, exo, cyberpunk, mythological, scientific, hybrid
- **Example**: `Vulpine-Sage-13`

### **Elemental**

- **Description**: Elemental based naming with fire, water, earth, air themes
- **Styles**: foundation, exo, cyberpunk
- **Example**: `Fire-Elemental-7`

### **Celestial**

- **Description**: Celestial based naming with star, planet, moon themes
- **Styles**: foundation, exo, mythological
- **Example**: `Star-Navigator-42`

### **Mythological**

- **Description**: Mythological based naming with god, hero, titan themes
- **Styles**: mythological, foundation
- **Example**: `Apollo-Divine-21`

### **Scientific**

- **Description**: Scientific based naming with element, compound, particle themes
- **Styles**: scientific, foundation
- **Example**: `Panthera-Leo-Alpha`

### **Geographic**

- **Description**: Geographic based naming with mountain, river, ocean themes
- **Styles**: foundation, exo
- **Example**: `Mountain-Guardian-8`

### **Color**

- **Description**: Color based naming with red, blue, green themes
- **Styles**: foundation, cyberpunk
- **Example**: `Red-Core-15`

### **Music**

- **Description**: Music based naming with note, instrument, composer themes
- **Styles**: foundation, exo
- **Example**: `Note-Harmony-12`

### **Technology**

- **Description**: Technology based naming with component, protocol, algorithm themes
- **Styles**: cyberpunk, exo, foundation
- **Example**: `Cyber-Protocol-Nexus`

### **Literary**

- **Description**: Literary based naming with character, author, work themes
- **Styles**: foundation, mythological
- **Example**: `Character-Sage-9`

### **Historical**

- **Description**: Historical based naming with era, civilization, leader themes
- **Styles**: foundation, mythological
- **Example**: `Era-Commander-5`

## 🎭 **Available Naming Styles**

### **Foundation** (Default)

- **Description**: Asimov-inspired strategic, intellectual naming
- **Format**: `{spirit}-{suffix}-{generation}`
- **Example**: `Vulpine-Sage-13`

### **Exo**

- **Description**: Destiny-inspired combat, technical naming
- **Format**: `{spirit}-{suffix}-{model}`
- **Example**: `Lupus-Strike-8`

### **Cyberpunk**

- **Description**: Tech-prefixed cyber naming
- **Format**: `{prefix}-{spirit}-{suffix}`
- **Example**: `Cyber-Fox-Nexus`

### **Mythological**

- **Description**: Divine, mystical naming
- **Format**: `{mythological}-{spirit}-{suffix}`
- **Example**: `Apollo-Fox-Divine`

### **Scientific**

- **Description**: Latin scientific classifications
- **Format**: `{prefix}-{technical}-{classification}`
- **Example**: `Panthera-Leo-Alpha`

### **Hybrid**

- **Description**: Mixed mythological/historical references
- **Format**: `{spirit}-{reference}-{designation}`
- **Example**: `Fox-Atlas-Prime`

## 🦊 **Available Animal Spirits**

### **Primary Spirits** (High Weight)

- **fox** (weight: 1.0) - Cunning, strategic thinking
- **otter** (weight: 0.9) - Playful, thorough testing
- **wolf** (weight: 0.8) - Pack coordination, loyalty

### **Secondary Spirits** (Medium Weight)

- **dragon** (weight: 0.7) - Ancient power, wisdom
- **eagle** (weight: 0.6) - Vision, leadership
- **lion** (weight: 0.5) - Leadership, pride

### **And Many More!**

The system supports 100+ animal spirits across multiple categories including canines, felines, birds, aquatic animals, mythical creatures, and more.

## ⚙️ **Configuration Examples**

### **Switch to Elemental Naming**

```json
{
  "default_scheme": "elemental",
  "default_style": "foundation",
  "schemes": {
    "elemental": {
      "enabled": true
    },
    "animal_spirit": {
      "enabled": false
    }
  }
}
```

### **Enable Only Cyberpunk Style**

```json
{
  "default_style": "cyberpunk",
  "styles": {
    "cyberpunk": {
      "enabled": true
    },
    "foundation": {
      "enabled": false
    },
    "exo": {
      "enabled": false
    }
  }
}
```

### **Disable All Spirits Except Fox**

```json
{
  "spirits": {
    "fox": {
      "enabled": true
    },
    "wolf": {
      "enabled": false
    },
    "otter": {
      "enabled": false
    },
    "dragon": {
      "enabled": false
    }
  }
}
```

## 🔄 **Runtime Configuration Changes**

### **Method 1: Edit JSON File**

1. Edit `naming_config.json`
2. Call `reload_naming_config()` via MCP or API
3. Changes take effect immediately

### **Method 2: Use MCP Tools**

```python
# Change default scheme
await mcp_tools.set_default_scheme("elemental")

# Disable animal spirit scheme
await mcp_tools.disable_scheme("animal_spirit")

# Enable only fox spirit
await mcp_tools.enable_spirit("fox")
await mcp_tools.disable_spirit("wolf")
await mcp_tools.disable_spirit("otter")
```

### **Method 3: Use Backend API**

```bash
# Change default scheme
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/elemental

# Disable animal spirit scheme
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable

# Enable only fox spirit
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/fox/enable
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/wolf/disable
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/otter/disable
```

## ✅ **Validation and Error Handling**

The system includes comprehensive validation:

- **Configuration Validation**: Check for required fields and valid values
- **Schema Validation**: Ensure JSON structure is correct
- **Dependency Validation**: Verify schemes have required styles
- **Error Reporting**: Detailed error messages for configuration issues

### **Validate Configuration**

```python
# Via MCP
issues = await mcp_tools.validate_naming_config()

# Via API
curl http://localhost:8000/mcp/naming-config/validate
```

## 🚀 **Quick Start Guide**

### **1. Change to Elemental Naming**

```bash
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/elemental
```

### **2. Switch to Cyberpunk Style**

```bash
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/cyberpunk
```

### **3. Disable Animal Spirits**

```bash
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable
```

### **4. Reload Configuration**

```bash
curl -X POST http://localhost:8000/mcp/naming-config/reload
```

### **5. Generate Names**

```python
# Names will now use elemental scheme with cyberpunk style
name = manager.generate_name()  # e.g., "Cyber-Fire-Nexus"
```

## 🎯 **Advanced Configuration**

### **Custom Schemes**

Add new schemes by editing the JSON configuration:

```json
{
  "schemes": {
    "custom_scheme": {
      "name": "custom_scheme",
      "enabled": true,
      "description": "My custom naming scheme",
      "default_style": "foundation",
      "supported_styles": ["foundation", "exo"],
      "custom_data": {
        "special_setting": "value"
      }
    }
  }
}
```

### **Custom Styles**

Add new styles with custom format templates:

```json
{
  "styles": {
    "custom_style": {
      "name": "custom_style",
      "enabled": true,
      "description": "My custom naming style",
      "format_template": "{prefix}-{spirit}-{suffix}-{number}",
      "components": ["custom_prefixes", "custom_suffixes"],
      "custom_data": {}
    }
  }
}
```

### **Custom Spirits**

Add new animal spirits:

```json
{
  "spirits": {
    "custom_spirit": {
      "name": "custom_spirit",
      "enabled": true,
      "description": "My custom animal spirit",
      "base_names": ["Custom1", "Custom2", "Custom3"],
      "generation_numbers": [1, 2, 3, 5, 8, 13],
      "weight": 0.5,
      "custom_data": {}
    }
  }
}
```

## 🔧 **Troubleshooting**

### **Configuration Not Loading**

1. Check JSON syntax with a validator
2. Verify file permissions
3. Check logs for error messages
4. Use validation endpoint to identify issues

### **Changes Not Taking Effect**

1. Ensure you call `reload_naming_config()` after editing JSON
2. Check that the configuration is valid
3. Verify the MCP server is running
4. Check backend API connectivity

### **Invalid Configuration**

1. Use the validation endpoint to identify issues
2. Check required fields are present
3. Verify enum values are correct
4. Ensure dependencies are satisfied

## 🎉 **Conclusion**

🦊 _whiskers twitch with satisfaction_ The dynamic agent naming configuration system provides complete flexibility for customizing the naming system at runtime. Whether you prefer JSON files, MCP tools, or REST APIs, you can easily switch between animal spirits, elemental themes, celestial names, or any custom scheme you create!

The system is designed to be:

- **Flexible**: Support any naming scheme or style
- **Runtime Configurable**: Change settings without code changes
- **Validated**: Comprehensive error checking and validation
- **API Driven**: Full REST API and MCP tool support
- **Extensible**: Easy to add new schemes, styles, and spirits

_red fur gleams with pride_ Now you can easily switch from `Vulpine-Sage-13` to `Cyber-Fire-Nexus` to `Star-Navigator-42` with just a few API calls! 🦊✨
