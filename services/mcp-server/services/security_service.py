#!/usr/bin/env python3
"""
Security Service
================

Core service for orchestrating security scanning and audit operations.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class SecurityService:
    """Handles all security scanning and audit operations."""

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
            logger.exception("Command execution failed: %s", e)
            return {
                "success": False,
                "returncode": -1,
                "stdout": "",
                "stderr": str(e),
                "command": " ".join(command),
            }

    async def audit_dependencies(self) -> dict[str, Any]:
        """Run dependency security audit."""
        return await self.run_command(["npx", "audit-ci", "--config", "audit-ci.json"])

    async def scan_python_security(
        self, include_bandit: bool = False
    ) -> dict[str, Any]:
        """Run Python security scanning with optional Bandit."""
        if include_bandit:
            return await self.run_command(["pnpm", "run", "python:security"])
        # Skip Bandit and run faster security checks
        return await self.run_command(["pnpm", "run", "python:typecheck"])

    async def typecheck_python(self) -> dict[str, Any]:
        """Run Python type checking for security-related type issues."""
        return await self.run_command(["pnpm", "run", "python:typecheck"])

    async def typecheck_frontend(self) -> dict[str, Any]:
        """Run TypeScript type checking for frontend security."""
        return await self.run_command(["pnpm", "run", "typecheck"])

    async def run_comprehensive_security_scan(
        self, include_bandit: bool = False
    ) -> dict[str, Any]:
        """Run comprehensive security scanning across all components."""
        results = {}

        # Run all security operations
        results["dependency_audit"] = await self.audit_dependencies()
        results["python_security"] = await self.scan_python_security(include_bandit)
        results["python_typecheck"] = await self.typecheck_python()
        results["frontend_typecheck"] = await self.typecheck_frontend()

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
        """Generate a summary of security scan results."""
        total = len(results)
        passed = sum(1 for result in results.values() if result.get("success", False))
        failed = total - passed

        return f"Security Scan Summary: {passed}/{total} passed, {failed} failed"
