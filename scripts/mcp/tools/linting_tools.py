#!/usr/bin/env python3
"""
Linting Tool Handlers
=====================

Handles linting-related MCP tool calls across all languages and frameworks.
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from services.formatting_service import FormattingService
from services.linting_service import LintingService
from services.security_service import SecurityService
from services.validation_service import ValidationService
from protocol.tool_registry import register_tool

# Initialize services
linting_service = LintingService()
formatting_service = FormattingService()
validation_service = ValidationService()
security_service = SecurityService()


def _format_result(result: dict[str, Any], operation: str) -> dict[str, Any]:
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


@register_tool(
    name="lint_frontend",
    category="linting",
    description="ESLint for TypeScript/JavaScript (with auto-fix)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def lint_frontend(**kwargs) -> dict[str, Any]:
    """Lint frontend code with ESLint."""
    arguments = kwargs.get("arguments", {})
    fix = arguments.get("fix", False)
    result = await linting_service.lint_frontend(fix)
    action = "Frontend Linting (with fixes)" if fix else "Frontend Linting"
    return _format_result(result, action)


@register_tool(
    name="lint_python",
    category="linting",
    description="Flake8, Pylint for Python (with auto-fix)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def lint_python(**kwargs) -> dict[str, Any]:
    """Lint Python code with Flake8 and Pylint."""
    arguments = kwargs.get("arguments", {})
    fix = arguments.get("fix", False)
    result = await linting_service.lint_python(fix)
    action = "Python Linting (with fixes)" if fix else "Python Linting"
    return _format_result(result, action)


@register_tool(
    name="lint_markdown",
    category="linting",
    description="markdownlint validation (with auto-fix)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def lint_markdown(**kwargs) -> dict[str, Any]:
    """Lint Markdown files with markdownlint."""
    arguments = kwargs.get("arguments", {})
    fix = arguments.get("fix", False)
    result = await linting_service.lint_markdown(fix)
    action = "Markdown Linting (with fixes)" if fix else "Markdown Linting"
    return _format_result(result, action)


@register_tool(
    name="run_all_linting",
    category="linting",
    description="Execute entire linting suite (with auto-fix)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def run_all_linting(**kwargs) -> dict[str, Any]:
    """Run all linting tools."""
    arguments = kwargs.get("arguments", {})
    fix = arguments.get("fix", False)
    result = await linting_service.run_all_linting(fix)
    action = "All Linting (with fixes)" if fix else "All Linting"
    return _format_result(result, action)


@register_tool(
    name="format_frontend",
    category="formatting",
    description="Prettier formatting (with check-only mode)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def format_frontend(**kwargs) -> dict[str, Any]:
    """Format frontend code with Prettier."""
    arguments = kwargs.get("arguments", {})
    check_only = arguments.get("check_only", False)
    result = await formatting_service.format_frontend(check_only)
    action = "Frontend Formatting (check only)" if check_only else "Frontend Formatting"
    return _format_result(result, action)


@register_tool(
    name="format_python",
    category="formatting",
    description="Black + isort formatting (with check-only mode)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def format_python(**kwargs) -> dict[str, Any]:
    """Format Python code with Black and isort."""
    arguments = kwargs.get("arguments", {})
    check_only = arguments.get("check_only", False)
    result = await formatting_service.format_python(check_only)
    action = "Python Formatting (check only)" if check_only else "Python Formatting"
    return _format_result(result, action)


@register_tool(
    name="scan_security",
    category="security",
    description="Complete security audit (Bandit, audit-ci, type checking)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def scan_security(**kwargs) -> dict[str, Any]:
    """Run comprehensive security scanning."""
    result = await security_service.scan_security()
    return _format_result(result, "Security Scanning")


@register_tool(
    name="scan_security_fast",
    category="security",
    description="Run fast security scanning (skips slow Bandit checks)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def scan_security_fast(**kwargs) -> dict[str, Any]:
    """Run fast security scanning."""
    result = await security_service.scan_security_fast()
    return _format_result(result, "Fast Security Scanning")