#!/usr/bin/env python3
"""
MCP Agent Namer Server
======================

A Model Context Protocol (MCP) server that provides tools for agents to generate
and assign themselves custom names using the Reynard robot name generator.

This server implements the MCP protocol to allow AI agents to:
1. Generate custom robot names with animal spirit themes
2. Assign names to themselves or other agents
3. Query current agent names
4. Manage agent identity persistence
5. Get current date and time
6. Get current location based on IP address

Usage:
    python3 agent_namer_server.py

The server will start and listen for MCP protocol messages, providing
the following tools:
- generate_agent_name: Generate a new robot name
- assign_agent_name: Assign a name to an agent
- get_agent_name: Get current agent name
- list_agent_names: List all assigned agent names
- get_current_time: Get current date and time
- get_current_location: Get location based on IP address
"""

import asyncio
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import requests

# Add current directory to path to import our robot name generator
sys.path.insert(0, str(Path(__file__).parent))

try:
    from robot_name_generator import ReynardRobotNamer
except ImportError:
    # Try importing from the utils/agent-naming directory
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "robot_name_generator", "../utils/agent-naming/robot-name-generator.py"
    )
    robot_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(robot_module)
    ReynardRobotNamer = robot_module.ReynardRobotNamer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("mcp-agent-namer.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


class AgentNameManager:
    """Manages agent names and persistence."""

    def __init__(self, data_dir: str = None):
        self.data_dir = Path(data_dir) if data_dir else Path(__file__).parent
        self.agents_file = self.data_dir / "agent-names.json"
        self.namer = ReynardRobotNamer()
        self._load_agents()

    def _load_agents(self):
        """Load agent names from persistent storage."""
        if self.agents_file.exists():
            try:
                with open(self.agents_file) as f:
                    self.agents = json.load(f)
            except (OSError, json.JSONDecodeError) as e:
                logger.warning(f"Could not load agent names: {e}")
                self.agents = {}
        else:
            self.agents = {}

    def _save_agents(self):
        """Save agent names to persistent storage."""
        try:
            with open(self.agents_file, "w") as f:
                json.dump(self.agents, f, indent=2)
        except OSError as e:
            logger.error(f"Could not save agent names: {e}")

    def generate_name(self, spirit: str = None, style: str = None) -> str:
        """Generate a new robot name."""
        names = self.namer.generate_batch(1, spirit, style)
        return names[0] if names else "Unknown-Unit-1"

    def assign_name(self, agent_id: str, name: str) -> bool:
        """Assign a name to an agent."""
        self.agents[agent_id] = {
            "name": name,
            "assigned_at": asyncio.get_event_loop().time(),
        }
        self._save_agents()
        logger.info(f"Assigned name '{name}' to agent '{agent_id}'")
        return True

    def get_name(self, agent_id: str) -> str | None:
        """Get the name of an agent."""
        return self.agents.get(agent_id, {}).get("name")

    def list_agents(self) -> dict[str, str]:
        """List all agents and their names."""
        return {agent_id: data["name"] for agent_id, data in self.agents.items()}


class MCPServer:
    """MCP Server for agent naming functionality."""

    def __init__(self):
        self.name_manager = AgentNameManager()
        self.tools = {
            "generate_agent_name": {
                "name": "generate_agent_name",
                "description": "Generate a new robot name with animal spirit themes",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "spirit": {
                            "type": "string",
                            "enum": ["fox", "wolf", "otter"],
                            "description": "Animal spirit theme",
                        },
                        "style": {
                            "type": "string",
                            "enum": ["foundation", "exo", "hybrid"],
                            "description": "Naming style",
                        },
                    },
                },
            },
            "assign_agent_name": {
                "name": "assign_agent_name",
                "description": "Assign a name to an agent",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "agent_id": {
                            "type": "string",
                            "description": "Unique identifier for the agent",
                        },
                        "name": {
                            "type": "string",
                            "description": "Name to assign to the agent",
                        },
                    },
                    "required": ["agent_id", "name"],
                },
            },
            "get_agent_name": {
                "name": "get_agent_name",
                "description": "Get the current name of an agent",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "agent_id": {
                            "type": "string",
                            "description": "Unique identifier for the agent",
                        }
                    },
                    "required": ["agent_id"],
                },
            },
            "list_agent_names": {
                "name": "list_agent_names",
                "description": "List all agents and their assigned names",
                "inputSchema": {"type": "object", "properties": {}},
            },
            "get_current_time": {
                "name": "get_current_time",
                "description": "Get the current date and time",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "format": {
                            "type": "string",
                            "description": "Time format (default: ISO format)",
                            "default": "iso",
                        }
                    },
                },
            },
            "get_current_location": {
                "name": "get_current_location",
                "description": "Get the current location based on the machine's IP address",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "include_coordinates": {
                            "type": "boolean",
                            "description": "Include latitude and longitude coordinates",
                            "default": True,
                        }
                    },
                },
            },
        }

    async def handle_request(self, request: dict[str, Any]) -> dict[str, Any]:
        """Handle incoming MCP requests."""
        try:
            method = request.get("method")
            params = request.get("params", {})
            request_id = request.get("id")

            # Handle MCP initialization
            if method == "initialize":
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {"tools": {}},
                        "serverInfo": {
                            "name": "reynard-agent-namer",
                            "version": "1.1.0",
                        },
                    },
                }

            if method == "tools/list":
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {"tools": list(self.tools.values())},
                }

            if method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})

                if tool_name == "generate_agent_name":
                    spirit = arguments.get("spirit")
                    style = arguments.get("style")
                    name = self.name_manager.generate_name(spirit, style)
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [
                                {"type": "text", "text": f"Generated name: {name}"}
                            ]
                        },
                    }

                if tool_name == "assign_agent_name":
                    agent_id = arguments.get("agent_id")
                    name = arguments.get("name")
                    success = self.name_manager.assign_name(agent_id, name)
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"Assigned name '{name}' to agent '{agent_id}': {success}",
                                }
                            ]
                        },
                    }

                if tool_name == "get_agent_name":
                    agent_id = arguments.get("agent_id")
                    name = self.name_manager.get_name(agent_id)
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"Agent '{agent_id}' name: {name or 'No name assigned'}",
                                }
                            ]
                        },
                    }

                if tool_name == "list_agent_names":
                    agents = self.name_manager.list_agents()
                    agent_list = "\n".join(
                        [f"{agent_id}: {name}" for agent_id, name in agents.items()]
                    )
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"Assigned agent names:\n{agent_list or 'No agents assigned'}",
                                }
                            ]
                        },
                    }

                if tool_name == "get_current_time":
                    format_type = arguments.get("format", "iso")
                    now = datetime.now()

                    if format_type == "iso":
                        time_str = now.isoformat()
                    elif format_type == "readable":
                        time_str = now.strftime("%Y-%m-%d %H:%M:%S")
                    elif format_type == "timestamp":
                        time_str = str(int(now.timestamp()))
                    else:
                        time_str = now.strftime(format_type)

                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"Current time: {time_str}",
                                }
                            ]
                        },
                    }

                if tool_name == "get_current_location":
                    include_coordinates = arguments.get("include_coordinates", True)

                    try:
                        # Get location data from ipinfo.io
                        response = requests.get("https://ipinfo.io/json", timeout=10)
                        response.raise_for_status()
                        data = response.json()

                        location_info = {
                            "ip": data.get("ip", "Unknown"),
                            "city": data.get("city", "Unknown"),
                            "region": data.get("region", "Unknown"),
                            "country": data.get("country", "Unknown"),
                            "timezone": data.get("timezone", "Unknown"),
                        }

                        if include_coordinates and "loc" in data:
                            lat, lon = data["loc"].split(",")
                            location_info["latitude"] = lat.strip()
                            location_info["longitude"] = lon.strip()

                        # Format the response
                        location_text = f"Location: {location_info['city']}, {location_info['region']}, {location_info['country']}"
                        if include_coordinates and "latitude" in location_info:
                            location_text += f"\nCoordinates: {location_info['latitude']}, {location_info['longitude']}"
                        location_text += f"\nIP: {location_info['ip']}\nTimezone: {location_info['timezone']}"

                        return {
                            "jsonrpc": "2.0",
                            "id": request_id,
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": location_text,
                                    }
                                ]
                            },
                        }

                    except requests.RequestException as e:
                        return {
                            "jsonrpc": "2.0",
                            "id": request_id,
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": f"Error fetching location: {e!s}",
                                    }
                                ]
                            },
                        }
                    except Exception as e:
                        return {
                            "jsonrpc": "2.0",
                            "id": request_id,
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": f"Error processing location data: {e!s}",
                                    }
                                ]
                            },
                        }

                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {"code": -32601, "message": f"Unknown tool: {tool_name}"},
                }

            # Handle notifications (no response needed)
            if method in ["notifications/initialized", "notifications/cancelled"]:
                return None

            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32601, "message": f"Unknown method: {method}"},
            }

        except Exception as e:
            logger.error(f"Error handling request: {e}")
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {"code": -32603, "message": f"Internal error: {e!s}"},
            }

    async def run(self):
        """Run the MCP server."""
        logger.info("Starting MCP Agent Namer Server...")

        # Read from stdin and write to stdout (MCP protocol)
        while True:
            try:
                line = await asyncio.get_event_loop().run_in_executor(
                    None, sys.stdin.readline
                )
                if not line:
                    break

                request = json.loads(line.strip())
                response = await self.handle_request(request)

                # Only send response if it's not None (notifications don't need responses)
                if response is not None:
                    print(json.dumps(response))
                    sys.stdout.flush()

            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {e}")
            except Exception as e:
                logger.error(f"Unexpected error: {e}")


def main():
    """Main entry point."""
    server = MCPServer()

    try:
        asyncio.run(server.run())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
