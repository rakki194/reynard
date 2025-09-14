# Cursor MCP Integration Setup

_whiskers twitch with cunning intelligence_ A complete guide to integrating the Reynard Agent Namer MCP server with Cursor IDE.

## 🦊 Overview

This guide will help you set up the Reynard Agent Namer MCP server to work with Cursor IDE, allowing AI agents to name themselves directly within your development environment.

## 📋 Prerequisites

- ✅ Cursor IDE installed
- ✅ Reynard Agent Namer MCP server running
- ✅ Python virtual environment set up
- ✅ All files in `/home/kade/runeset/reynard/scripts/utils/mcp/`

## 🚀 Setup Steps

### Step 1: Open Cursor Settings

1. Launch Cursor IDE
2. Navigate to `File > Preferences > Cursor Settings`
3. Look for the `MCP` section in the settings

### Step 2: Add MCP Server Configuration

1. Click on `Add new global MCP server`
2. This will open the `mcp.json` configuration file
3. Replace the contents with our configuration:

```json
{
  "mcpServers": {
    "reynard-agent-namer": {
      "command": "bash",
      "args": [
        "-c",
        "source ~/venv/bin/activate && cd /home/kade/runeset/reynard/scripts/utils/mcp && python3 agent_namer_server.py"
      ],
      "env": {
        "PYTHONPATH": "/home/kade/runeset/reynard/scripts/utils/mcp"
      }
    }
  }
}
```

### Step 3: Save and Restart

1. Save the `mcp.json` file
2. Restart Cursor IDE completely
3. Wait for Cursor to reload

### Step 4: Verify Integration

1. After restarting, open the MCP Servers panel in Cursor
2. Look for `reynard-agent-namer` in the list
3. Check for a green status indicator (✅) next to the server name
4. If you see a red indicator (❌), check the logs for errors

## 🛠️ Available Tools

Once integrated, the following tools will be available in Cursor:

### 1. `generate_agent_name`

Generate a new robot name with animal spirit themes.

**Parameters:**

- `spirit` (optional): "fox", "wolf", or "otter"
- `style` (optional): "foundation", "exo", or "hybrid"

**Example:**

```
Generate a fox-themed foundation name for me
```

### 2. `assign_agent_name`

Assign a name to an agent.

**Parameters:**

- `agent_id` (required): Unique identifier for the agent
- `name` (required): Name to assign

**Example:**

```
Assign the name "Reynard-Orion-Meta" to agent "cursor-ai-001"
```

### 3. `get_agent_name`

Get the current name of an agent.

**Parameters:**

- `agent_id` (required): Unique identifier for the agent

**Example:**

```
What is the name of agent "cursor-ai-001"?
```

### 4. `list_agent_names`

List all agents and their assigned names.

**Example:**

```
Show me all the agent names that have been assigned
```

### 5. `get_current_time`

Get the current date and time.

**Parameters:**

- `format` (optional): Time format - "iso" (default), "readable", "timestamp", or custom format string

**Example:**

```
What time is it right now?
```

### 6. `get_current_location`

Get the current location based on the machine's IP address.

**Parameters:**

- `include_coordinates` (optional): Include latitude and longitude (default: true)

**Example:**

```
Where am I located right now?
```

## 🎯 Usage Examples

### Generate a Name

```
Hey Cursor, can you generate a wolf-themed exo name for me?
```

### Assign a Name

```
Please assign the name "Vulpine-Strategist-7" to agent "my-ai-assistant"
```

### Check Current Name

```
What name is currently assigned to agent "my-ai-assistant"?
```

### List All Names

```
Show me all the agent names that have been created
```

### Get Current Time

```
What time is it right now?
```

### Get Current Location

```
Where am I located right now?
```

## 🔧 Troubleshooting

### Server Not Starting

- Check that the virtual environment path is correct: `~/venv/bin/activate`
- Verify the script path: `/home/kade/runeset/reynard/scripts/utils/mcp/agent_namer_server.py`
- Ensure Python 3.8+ is available in the virtual environment

### Tools Not Available

- Restart Cursor completely after configuration changes
- Check the MCP Servers panel for error messages
- Verify the server shows a green status indicator

### Permission Issues

- Ensure the MCP server script is executable: `chmod +x mcp-agent-namer-server.py`
- Check that the virtual environment is accessible

### Import Errors

- Verify all required files are in the same directory
- Check that the Python path is correctly set in the environment

## 📁 File Locations

- **MCP Server**: `/home/kade/runeset/reynard/scripts/utils/mcp/agent_namer_server.py`
- **Robot Generator**: `/home/kade/runeset/reynard/scripts/utils/agent-naming/robot-name-generator.py`
- **Configuration**: `cursor-mcp-config.json` (use this as your `mcp.json`)
- **Logs**: `/home/kade/runeset/reynard/scripts/utils/mcp/mcp-agent-namer.log`

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ Green status indicator next to `reynard-agent-namer` in MCP Servers panel
2. ✅ Tools available in Cursor's chat interface
3. ✅ Ability to generate and assign agent names
4. ✅ Persistent name storage across sessions

## 🦊 Example Workflow

1. **Open Cursor Chat**: Switch to Agent mode
2. **Generate Name**: "Generate a fox-themed foundation name for me"
3. **Assign Name**: "Assign that name to agent 'cursor-ai-001'"
4. **Verify**: "What name is assigned to agent 'cursor-ai-001'?"

_three spirits howl in unison_ With this setup, you can now name AI agents directly within Cursor IDE using the strategic elegance of the Reynard way! 🦊🐺🦦

## 📚 Additional Resources

- [Cursor MCP Documentation](https://docs.cursor.com/context/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Reynard Agent Naming Guide](../agent-naming/AGENT-NAMING-GUIDE.md)

_red fur gleams with satisfaction_ Your Cursor IDE is now equipped with the power to name AI agents with the cunning of the fox, the coordination of the wolf, and the precision of the otter!
