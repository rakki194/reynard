#!/usr/bin/env python3
"""
Linting Service
===============

Core service for orchestrating all linting operations.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class LintingService:
    """Handles all linting operations across different tools and languages."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            # Go up from services/mcp-server to the project root
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent
        else:
            self.project_root = project_root

    async def run_command(
        self, command: list[str], cwd: Path | None = None
    ) -> dict[str, Any]:
        """Execute a command and return structured results."""
        working_dir = cwd or self.project_root

        try:
            logger.info("Running command: %s", " ".join(command))
            result = await asyncio.create_subprocess_exec(
                *command,
                cwd=working_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            stdout_bytes, stderr_bytes = await result.communicate()
            stdout = stdout_bytes.decode("utf-8")
            stderr = stderr_bytes.decode("utf-8")

            return {
                "success": result.returncode == 0,
                "returncode": result.returncode,
                "stdout": stdout.strip(),
                "stderr": stderr.strip(),
                "command": " ".join(command),
            }

        except Exception as e:
            logger.exception("Command execution failed")
            return {
                "success": False,
                "returncode": -1,
                "stdout": "",
                "stderr": str(e),
                "command": " ".join(command),
            }

    async def lint_frontend(self, fix: bool = False) -> dict[str, Any]:
        """Run ESLint on frontend code."""
        command = ["pnpm", "lint:fix" if fix else "lint"]
        return await self.run_command(command)

    async def lint_python(
        self, fix: bool = False, max_errors: int = 50
    ) -> dict[str, Any]:
        """Run Python linting tools with improved error handling."""
        if fix:
            # Run formatters first, then linters
            format_result = await self.run_command(["pnpm", "run", "python:format"])
            lint_result = await self._run_python_lint_with_limits(max_errors)

            return {
                "success": format_result["success"] and lint_result["success"],
                "format": format_result,
                "lint": lint_result,
            }
        return await self._run_python_lint_with_limits(max_errors)

    async def _run_python_lint_with_limits(
        self, max_errors: int = 50
    ) -> dict[str, Any]:
        """Run Python linting with error output limiting."""
        # Create a more targeted flake8 command that excludes problematic directories
        exclude_dirs = [
            "third_party",
            "node_modules",
            ".git",
            "venv",
            "backend/venv",
            "__pycache__",
            ".pytest_cache",
            "dist",
            "build",
        ]

        exclude_pattern = ",".join(exclude_dirs)

        # Use flake8 directly with exclusions and error limits
        command = [
            "bash",
            "-c",
            f"if [ -f ~/venv/bin/activate ]; then "
            f"source ~/venv/bin/activate && "
            f"flake8 --exclude={exclude_pattern} --max-line-length=100 --count --statistics . | head -n {max_errors}; "
            f"else "
            f"echo 'Virtual environment not found, using system Python...' && "
            f"flake8 --exclude={exclude_pattern} --max-line-length=100 --count --statistics . | head -n {max_errors}; "
            f"fi",
        ]

        result = await self.run_command(command)

        # Add summary information
        if result["stdout"]:
            lines = result["stdout"].split("\n")
            error_count = len(
                [line for line in lines if ":" in line and not line.startswith("Total")]
            )
            result["error_count"] = error_count
            result["summary"] = (
                f"Found {error_count} linting issues (showing first {max_errors})"
            )
        else:
            result["error_count"] = 0
            result["summary"] = "No linting issues found"

        return result

    async def lint_markdown(self, fix: bool = False) -> dict[str, Any]:
        """Run markdown linting tools."""
        command = ["pnpm", "run", "markdown:lint:fix" if fix else "markdown:lint"]
        return await self.run_command(command)

    async def lint_shell(self) -> dict[str, Any]:
        """Run shell script linting."""
        return await self.run_command(["pnpm", "run", "shell:lint"])

    async def lint_workflows(self) -> dict[str, Any]:
        """Run workflow linting."""
        return await self.run_command(["pnpm", "run", "workflow:lint"])

    async def run_comprehensive_linting(self, fix: bool = False) -> dict[str, Any]:
        """Run all linting tools comprehensively."""
        results = {}

        # Run all linting operations
        results["frontend"] = await self.lint_frontend(fix)
        results["python"] = await self.lint_python(fix)
        results["markdown"] = await self.lint_markdown(fix)
        results["shell"] = await self.lint_shell()
        results["workflows"] = await self.lint_workflows()

        # Determine overall success
        overall_success = all(
            result.get("success", False) for result in results.values()
        )

        return {
            "success": overall_success,
            "results": results,
            "summary": self._generate_summary(results),
        }

    def _generate_summary(self, results: dict[str, Any]) -> str:
        """Generate a summary of linting results."""
        total = len(results)
        passed = sum(1 for result in results.values() if result.get("success", False))
        failed = total - passed

        return f"Linting Summary: {passed}/{total} passed, {failed} failed"
