"""
Git Tool Definitions

MCP tool definitions for Git operations in the Reynard ecosystem.
"""

from ...definitions import ToolDefinition

GIT_TOOL_DEFINITIONS = [
    ToolDefinition(
        name="git_tool",
        description="Comprehensive git operations tool with pagination support",
        input_schema={
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "description": "Git operation to perform",
                    "enum": [
                        "status",
                        "branch",
                        "log",
                        "diff",
                        "add",
                        "commit",
                        "push",
                        "pull",
                        "checkout",
                        "merge",
                        "rebase",
                        "reset",
                        "stash",
                        "tag",
                        "remote",
                        "fetch",
                        "clone",
                    ],
                },
                "args": {
                    "type": "object",
                    "description": "Operation-specific arguments",
                    "properties": {
                        "files": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Files to operate on (for add, commit, etc.)",
                        },
                        "message": {"type": "string", "description": "Commit message"},
                        "branch": {"type": "string", "description": "Branch name"},
                        "remote": {
                            "type": "string",
                            "description": "Remote name (default: origin)",
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Limit for log entries (default: 10)",
                        },
                        "staged": {
                            "type": "boolean",
                            "description": "Show staged changes for diff (default: false)",
                        },
                        "page": {
                            "type": "integer",
                            "description": "Page number for paginated diff (default: 1)",
                        },
                        "page_size": {
                            "type": "integer",
                            "description": "Lines per page for diff (default: 1000)",
                        },
                        "force": {
                            "type": "boolean",
                            "description": "Force operation (for push, reset, etc.)",
                        },
                        "amend": {
                            "type": "boolean",
                            "description": "Amend last commit",
                        },
                    },
                },
            },
            "required": ["operation"],
        },
    ),
]
