# 🦊 Dynamic Agent Naming Configuration - Usage Examples

_whiskers twitch with excitement_ Here are practical examples of how to use the dynamic agent naming configuration system!

## 🎯 **Quick Start Examples**

### **1. Change Default Scheme via API**

```bash
# Switch from animal spirits to elemental naming
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/elemental

# Switch to celestial naming
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/celestial

# Switch back to animal spirits
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/animal_spirit
```

### **2. Change Default Style via API**

```bash
# Switch to cyberpunk style
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/cyberpunk

# Switch to mythological style
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/mythological

# Switch back to foundation style
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/foundation
```

### **3. Enable/Disable Schemes**

```bash
# Disable animal spirits
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable

# Enable elemental scheme
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/elemental/enable

# Disable multiple schemes
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/scientific/disable
```

### **4. Enable/Disable Styles**

```bash
# Disable cyberpunk style
curl -X PUT http://localhost:8000/mcp/naming-config/styles/cyberpunk/disable

# Enable exo style
curl -X PUT http://localhost:8000/mcp/naming-config/styles/exo/enable

# Disable multiple styles
curl -X PUT http://localhost:8000/mcp/naming-config/styles/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/scientific/disable
```

### **5. Enable/Disable Spirits**

```bash
# Disable dragon spirit
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/dragon/disable

# Enable tiger spirit
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/tiger/enable

# Disable multiple spirits
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/eagle/disable
curl -X PUT http://localhost:8000/mcp/naming-config/spirits/lion/disable
```

## 🎨 **Naming Scenario Examples**

### **Scenario 1: Cyberpunk Theme**

```bash
# Set up cyberpunk naming
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/technology
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/cyberpunk

# Disable non-cyberpunk schemes
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/scientific/disable

# Disable non-cyberpunk styles
curl -X PUT http://localhost:8000/mcp/naming-config/styles/foundation/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/exo/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/mythological/disable
```

**Result**: Names like `Cyber-Protocol-Nexus`, `Neural-System-Core`, `Quantum-Data-Web`

### **Scenario 2: Mythological Theme**

```bash
# Set up mythological naming
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/mythological
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/mythological

# Disable non-mythological schemes
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/technology/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/scientific/disable

# Disable non-mythological styles
curl -X PUT http://localhost:8000/mcp/naming-config/styles/cyberpunk/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/exo/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/scientific/disable
```

**Result**: Names like `Apollo-Divine-21`, `Athena-Sacred-13`, `Zeus-Holy-7`

### **Scenario 3: Scientific Theme**

```bash
# Set up scientific naming
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/scientific
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/scientific

# Disable non-scientific schemes
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/technology/disable

# Disable non-scientific styles
curl -X PUT http://localhost:8000/mcp/naming-config/styles/cyberpunk/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/exo/disable
```

**Result**: Names like `Panthera-Leo-Alpha`, `Canis-Lupus-Beta`, `Felis-Catus-Gamma`

### **Scenario 4: Elemental Theme**

```bash
# Set up elemental naming
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/elemental
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/foundation

# Disable non-elemental schemes
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/technology/disable

# Disable non-elemental styles
curl -X PUT http://localhost:8000/mcp/naming-config/styles/cyberpunk/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/scientific/disable
```

**Result**: Names like `Fire-Elemental-7`, `Water-Guardian-13`, `Earth-Protector-21`

### **Scenario 5: Celestial Theme**

```bash
# Set up celestial naming
curl -X PUT http://localhost:8000/mcp/naming-config/default-scheme/celestial
curl -X PUT http://localhost:8000/mcp/naming-config/default-style/foundation

# Disable non-celestial schemes
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/animal_spirit/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/schemes/technology/disable

# Disable non-celestial styles
curl -X PUT http://localhost:8000/mcp/naming-config/styles/cyberpunk/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/mythological/disable
curl -X PUT http://localhost:8000/mcp/naming-config/styles/scientific/disable
```

**Result**: Names like `Star-Navigator-42`, `Planet-Explorer-17`, `Moon-Guardian-8`

## 🔄 **Dynamic Configuration Changes**

### **Real-time Configuration Updates**

The MCP server automatically detects configuration changes and reloads them:

1. **Edit JSON file**: Modify `naming_config.json`
2. **Auto-reload**: MCP server detects changes automatically
3. **Immediate effect**: New names use updated configuration

### **Manual Configuration Reload**

```bash
# Force reload configuration
curl -X POST http://localhost:8000/mcp/naming-config/reload

# Check configuration status
curl http://localhost:8000/mcp/naming-config/validate
```

### **Configuration Validation**

```bash
# Validate current configuration
curl http://localhost:8000/mcp/naming-config/validate

# Get configuration overview
curl http://localhost:8000/mcp/naming-config/
```

## 🎭 **Custom Configuration Examples**

### **Add New Animal Spirit**

Edit `naming_config.json`:

```json
{
  "spirits": {
    "phoenix": {
      "name": "phoenix",
      "enabled": true,
      "description": "Rebirth, renewal, transformation",
      "emoji": "🔥",
      "base_names": [
        "Phoenix",
        "Rising",
        "Renewal",
        "Transformation",
        "Rebirth",
        "Eternal",
        "Immortal",
        "Flame",
        "Ash",
        "Resurrection"
      ],
      "generation_numbers": [1, 3, 7, 13, 21, 34, 55],
      "weight": 0.6,
      "custom_data": {}
    }
  }
}
```

### **Add New Naming Style**

```json
{
  "styles": {
    "steampunk": {
      "name": "steampunk",
      "enabled": true,
      "description": "Victorian-era mechanical naming",
      "format_template": "{spirit}-{mechanical}-{era}",
      "components": ["steampunk_mechanical", "victorian_era"],
      "custom_data": {}
    }
  }
}
```

### **Add New Naming Scheme**

```json
{
  "schemes": {
    "steampunk": {
      "name": "steampunk",
      "enabled": true,
      "description": "Victorian-era mechanical naming",
      "default_style": "steampunk",
      "supported_styles": ["steampunk", "foundation"],
      "custom_data": {}
    }
  }
}
```

## 🚀 **Advanced Usage**

### **Weighted Distribution Control**

```bash
# Enable weighted distribution (default)
curl -X PUT http://localhost:8000/mcp/naming-config/update \
  -H "Content-Type: application/json" \
  -d '{"weighted_distribution": true}'

# Disable weighted distribution (equal chance)
curl -X PUT http://localhost:8000/mcp/naming-config/update \
  -H "Content-Type: application/json" \
  -d '{"weighted_distribution": false}'
```

### **Bulk Configuration Updates**

```bash
# Update multiple settings at once
curl -X PUT http://localhost:8000/mcp/naming-config/update \
  -H "Content-Type: application/json" \
  -d '{
    "default_scheme": "elemental",
    "default_style": "cyberpunk",
    "weighted_distribution": false
  }'
```

### **Configuration Backup and Restore**

```bash
# Backup current configuration
curl http://localhost:8000/mcp/naming-config/ > naming_config_backup.json

# Restore from backup
cp naming_config_backup.json naming_config.json
curl -X POST http://localhost:8000/mcp/naming-config/reload
```

## 🎯 **Testing Configuration Changes**

### **Test Name Generation**

```python
# Test with current configuration
import requests

# Generate names with current settings
response = requests.post('http://localhost:8000/mcp/tools/call', json={
    'method': 'generate_agent_name',
    'params': {}
})

print(response.json())
```

### **Test Spirit Rolling**

```python
# Test spirit selection with current configuration
response = requests.post('http://localhost:8000/mcp/tools/call', json={
    'method': 'roll_agent_spirit',
    'params': {'weighted': True}
})

print(response.json())
```

## 🎉 **Conclusion**

🦊 _whiskers twitch with satisfaction_ The dynamic agent naming configuration system provides complete flexibility for any naming scenario! You can:

- **Switch themes instantly**: From animal spirits to cyberpunk to mythological
- **Customize on the fly**: Enable/disable schemes, styles, and spirits
- **Auto-reload changes**: Configuration updates take effect immediately
- **Validate settings**: Ensure configuration is correct before use
- **Extend easily**: Add new schemes, styles, and spirits via JSON

_red fur gleams with pride_ Now you can easily adapt the naming system to any project, theme, or creative vision with just a few API calls! 🦊✨
