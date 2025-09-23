"""
🦊 Git Automation Tool Definitions

MCP tool definitions for Git workflow automation in the Reynard ecosystem.
"""

from .definitions import ToolDefinition

GIT_AUTOMATION_TOOL_DEFINITIONS = [
    ToolDefinition(
        name="detect_junk_files",
        description="Detect and optionally clean up junk files in the repository",
        input_schema={
            "type": "object",
            "properties": {
                "cleanup": {
                    "type": "boolean",
                    "description": "Clean up detected junk files",
                    "default": False,
                },
                "force": {
                    "type": "boolean",
                    "description": "Force cleanup without confirmation",
                    "default": False,
                },
                "dry_run": {
                    "type": "boolean",
                    "description": "Show what would be cleaned up without actually doing it",
                    "default": False,
                },
            },
        },
    ),
    ToolDefinition(
        name="analyze_git_changes",
        description="Analyze Git changes and determine their impact and categorization",
        input_schema={"type": "object", "properties": {}},
    ),
    ToolDefinition(
        name="generate_commit_message",
        description="Generate a conventional commit message from analyzed changes",
        input_schema={
            "type": "object",
            "properties": {
                "include_body": {
                    "type": "boolean",
                    "description": "Include detailed body in commit message",
                    "default": True,
                },
                "include_footer": {
                    "type": "boolean",
                    "description": "Include footer with additional information",
                    "default": True,
                },
            },
        },
    ),
    ToolDefinition(
        name="manage_changelog",
        description="Manage CHANGELOG.md file with validation and version promotion",
        input_schema={
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action to perform: 'show', 'validate', 'promote'",
                    "enum": ["show", "validate", "promote"],
                    "default": "show",
                },
                "version": {
                    "type": "string",
                    "description": "Version to promote unreleased changes to (required for 'promote' action)",
                },
                "date": {
                    "type": "string",
                    "description": "Date for the version in YYYY-MM-DD format",
                },
            },
        },
    ),
    ToolDefinition(
        name="manage_version",
        description="Manage package versions and Git tags with semantic versioning",
        input_schema={
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action to perform: 'show', 'bump'",
                    "enum": ["show", "bump"],
                    "default": "show",
                },
                "bump_type": {
                    "type": "string",
                    "description": "Version bump type: 'major', 'minor', 'patch' (required for 'bump' action)",
                    "enum": ["major", "minor", "patch"],
                },
                "create_tag": {
                    "type": "boolean",
                    "description": "Create Git tag for the version",
                    "default": False,
                },
                "push_tag": {
                    "type": "boolean",
                    "description": "Push Git tag to remote",
                    "default": False,
                },
            },
        },
    ),
    ToolDefinition(
        name="execute_git_workflow",
        description="Execute the complete Git workflow automation with all steps",
        input_schema={
            "type": "object",
            "properties": {
                "skip_junk": {
                    "type": "boolean",
                    "description": "Skip junk file detection",
                    "default": False,
                },
                "skip_analysis": {
                    "type": "boolean",
                    "description": "Skip change analysis",
                    "default": False,
                },
                "skip_commit": {
                    "type": "boolean",
                    "description": "Skip commit message generation",
                    "default": False,
                },
                "skip_version": {
                    "type": "boolean",
                    "description": "Skip version bump",
                    "default": False,
                },
                "skip_changelog": {
                    "type": "boolean",
                    "description": "Skip changelog update",
                    "default": False,
                },
                "skip_tag": {
                    "type": "boolean",
                    "description": "Skip Git tag creation",
                    "default": False,
                },
                "dry_run": {
                    "type": "boolean",
                    "description": "Show what would be done without executing",
                    "default": False,
                },
                "auto_confirm": {
                    "type": "boolean",
                    "description": "Skip all confirmations and proceed automatically",
                    "default": False,
                },
                "commit_message": {
                    "type": "string",
                    "description": "Custom commit message (overrides generated message)",
                },
                "bump_type": {
                    "type": "string",
                    "description": "Version bump type: 'major', 'minor', 'patch'",
                    "enum": ["major", "minor", "patch"],
                },
            },
        },
    ),
    ToolDefinition(
        name="quick_git_workflow",
        description="Execute quick Git workflow with minimal prompts and auto-confirm",
        input_schema={"type": "object", "properties": {}},
    ),
    ToolDefinition(
        name="get_git_workflow_status",
        description="Get current Git workflow status including changes, version, and tags",
        input_schema={"type": "object", "properties": {}},
    ),
]
