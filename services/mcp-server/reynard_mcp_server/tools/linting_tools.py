#!/usr/bin/env python3
"""
Linting Tool Handlers
=====================

Handles linting-related MCP tool calls across all languages and frameworks.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any

from services.formatting_service import FormattingService
from services.linting_service import LintingService
from services.security_service import SecurityService
from services.validation_service import ValidationService


class LintingTools:
    """Handles all linting-related tool operations."""

    def __init__(self) -> None:
        self.linting_service = LintingService()
        self.formatting_service = FormattingService()
        self.validation_service = ValidationService()
        self.security_service = SecurityService()

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
        """Format tool result for MCP response."""
        status = "✅ PASSED" if result.get("success", False) else "❌ FAILED"

        # Format output text
        output_lines = [f"{status} - {operation}"]

        if "summary" in result:
            output_lines.append(f"\n📊 {result['summary']}")

        if result.get("stdout"):
            output_lines.append(f"\n📝 Output:\n{result['stdout']}")

        if result.get("stderr") and not result.get("success", False):
            output_lines.append(f"\n⚠️ Errors:\n{result['stderr']}")

        return {"content": [{"type": "text", "text": "\n".join(output_lines)}]}

    async def lint_frontend(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Lint frontend code with ESLint."""
        fix = arguments.get("fix", False)
        result = await self.linting_service.lint_frontend(fix)
        action = "Frontend Linting (with fixes)" if fix else "Frontend Linting"
        return self._format_result(result, action)

    async def format_frontend(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Format frontend code with Prettier."""
        check_only = arguments.get("check_only", False)
        result = await self.formatting_service.format_frontend(check_only)
        action = "Frontend Format Check" if check_only else "Frontend Formatting"
        return self._format_result(result, action)

    async def lint_python(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Lint Python code with Flake8 and related tools."""
        fix = arguments.get("fix", False)
        result = await self.linting_service.lint_python(fix)
        action = "Python Linting (with fixes)" if fix else "Python Linting"
        return self._format_result(result, action)

    async def format_python(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Format Python code with Black and isort."""
        check_only = arguments.get("check_only", False)
        result = await self.formatting_service.format_python(check_only)
        action = "Python Format Check" if check_only else "Python Formatting"
        return self._format_result(result, action)

    async def lint_markdown(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Lint Markdown files."""
        fix = arguments.get("fix", False)
        result = await self.linting_service.lint_markdown(fix)
        action = "Markdown Linting (with fixes)" if fix else "Markdown Linting"
        return self._format_result(result, action)

    async def validate_comprehensive(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Run comprehensive validation across all components."""
        fix = arguments.get("fix", False)
        result = await self.validation_service.run_comprehensive_validation(fix)
        action = (
            "Comprehensive Validation (with fixes)"
            if fix
            else "Comprehensive Validation"
        )
        return self._format_result(result, action)

    async def scan_security(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Run comprehensive security scanning."""
        result = await self.security_service.run_comprehensive_security_scan()
        return self._format_result(result, "Security Scanning")

    async def scan_security_fast(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:  # pylint: disable=unused-argument
        """Run fast security scanning (skips slow Bandit checks)."""
        result = await self.security_service.run_fast_security_scan()
        return self._format_result(result, "Fast Security Scanning")

    async def run_all_linting(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Run all linting tools comprehensively."""
        fix = arguments.get("fix", False)
        result = await self.linting_service.run_comprehensive_linting(fix)
        action = (
            "Complete Linting Suite (with fixes)" if fix else "Complete Linting Suite"
        )
        return self._format_result(result, action)
