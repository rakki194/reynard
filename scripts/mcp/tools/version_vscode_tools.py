#!/usr/bin/env python3
"""
Enhanced Tool Handlers
======================

Handles enhanced MCP tool calls including version detection and VS Code integration.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any

from services.security_service import SecurityService
from services.version_service import VersionService
from services.vscode_service import VSCodeService


class VersionVSCodeTools:
    """Handles version detection and VS Code integration tool operations."""

    def __init__(self) -> None:
        self.version_service = VersionService()
        self.vscode_service = VSCodeService()
        self.security_service = SecurityService()

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
        """Format tool result for MCP response."""
        if result.get("success", False):
            status = "✅ SUCCESS"
        else:
            status = "❌ FAILED"

        # Format output text
        output_lines = [f"{status} - {operation}"]

        if "summary" in result:
            output_lines.append(f"\n📊 {result['summary']}")

        if result.get("stdout"):
            output_lines.append(f"\n📝 Output:\n{result['stdout']}")

        if result.get("stderr") and not result.get("success", False):
            output_lines.append(f"\n⚠️ Errors:\n{result['stderr']}")

        # Show actual result data for VS Code tools
        if result.get("success", False):
            # Remove success flag and show actual data
            result_data = {
                k: v
                for k, v in result.items()
                if k not in ["success", "stdout", "stderr", "summary"]
            }
            if result_data:
                import json

                output_lines.append(
                    f"\n📋 Results:\n{json.dumps(result_data, indent=2)}"
                )
        elif result.get("error"):
            output_lines.append(f"\n❌ Error: {result['error']}")

        return {"content": [{"type": "text", "text": "\n".join(output_lines)}]}

    async def get_versions(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Get all available version information."""
        result = await self.version_service.get_all_versions()
        return self._format_result(result, "Version Detection")

    async def get_python_version(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Get Python version information."""
        result = await self.version_service.get_python_version()
        return self._format_result(result, "Python Version")

    async def get_node_version(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Get Node.js version information."""
        result = await self.version_service.get_node_version()
        return self._format_result(result, "Node.js Version")

    async def get_typescript_version(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Get TypeScript version information."""
        result = await self.version_service.get_typescript_version()
        return self._format_result(result, "TypeScript Version")

    def get_vscode_active_file(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Get currently active file path in VS Code."""
        result = self.vscode_service.get_active_file_path()
        return self._format_result(result, "VS Code Active File")

    def get_vscode_workspace_info(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Get VS Code workspace information."""
        result = self.vscode_service.get_workspace_info()
        return self._format_result(result, "VS Code Workspace Info")

    def get_vscode_extensions(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Get list of installed VS Code extensions."""
        result = self.vscode_service.get_vscode_extensions()
        return self._format_result(result, "VS Code Extensions")

    async def scan_security_fast(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Run fast security scanning (skips Bandit)."""
        result = await self.security_service.run_comprehensive_security_scan(
            include_bandit=False
        )
        return self._format_result(result, "Fast Security Scan")

    async def scan_security_full(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Run comprehensive security scanning including Bandit."""
        result = await self.security_service.run_comprehensive_security_scan(
            include_bandit=True
        )
        return self._format_result(result, "Full Security Scan")
