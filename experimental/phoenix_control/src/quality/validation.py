"""Quality Validation

Provides comprehensive code quality validation including linting,
formatting, and type checking for the Success-Advisor-8 distillation system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import subprocess
from pathlib import Path
from typing import Any

from ..utils.data_structures import (
    QualityConfig,
    QualityResult,
    create_default_quality_config,
)
from ..utils.logging import PhoenixLogger


class QualityAssurance:
    """Quality assurance system.

    Provides comprehensive code quality validation including linting,
    formatting, type checking, and documentation validation.
    """

    def __init__(self, config: QualityConfig | None = None):
        """Initialize quality assurance system.

        Args:
            config: Optional quality configuration

        """
        self.config = config or create_default_quality_config()
        self.logger = PhoenixLogger("quality_assurance")

        self.logger.info("Quality assurance system initialized", "initialization")

    async def run_all_checks(self) -> QualityResult:
        """Run all quality assurance checks.

        Returns:
            Quality result with all check results

        """
        self.logger.info(
            "Running comprehensive quality assurance checks",
            "quality_checks",
        )

        result = QualityResult(
            all_passed=True,
            passed_checks=0,
            failed_checks=0,
            total_checks=0,
        )

        checks = []

        # Add checks based on configuration
        if self.config.run_linting:
            checks.append(("linting", self._run_linting_check))

        if self.config.run_formatting:
            checks.append(("formatting", self._run_formatting_check))

        if self.config.run_type_checking:
            checks.append(("type_checking", self._run_type_checking))

        if self.config.run_documentation_validation:
            checks.append(("documentation", self._run_documentation_check))

        # Run all checks
        for check_name, check_func in checks:
            result.total_checks += 1

            try:
                check_result = await check_func()
                result.results[check_name] = check_result

                if check_result.get("passed", False):
                    result.passed_checks += 1
                    self.logger.success(f"{check_name} check passed", "quality_checks")
                else:
                    result.failed_checks += 1
                    result.all_passed = False
                    error_msg = check_result.get("error", "Unknown error")
                    result.errors.append(f"{check_name}: {error_msg}")
                    self.logger.error(
                        f"{check_name} check failed: {error_msg}",
                        "quality_checks",
                    )

                    if self.config.fail_on_errors:
                        break

            except Exception as e:
                result.failed_checks += 1
                result.all_passed = False
                result.errors.append(f"{check_name}: {e!s}")
                self.logger.error(
                    f"{check_name} check failed with exception: {e}",
                    "quality_checks",
                )

        if result.all_passed:
            self.logger.success(
                f"All {result.total_checks} quality checks passed",
                "quality_checks",
            )
        else:
            self.logger.error(
                f"{result.failed_checks}/{result.total_checks} quality checks failed",
                "quality_checks",
            )

        return result

    async def _run_linting_check(self) -> dict[str, Any]:
        """Run linting checks.

        Returns:
            Linting check results

        """
        try:
            # Check for package.json to determine project type
            if Path("package.json").exists():
                return await self._run_frontend_linting()
            return await self._run_python_linting()

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_frontend_linting(self) -> dict[str, Any]:
        """Run frontend linting (ESLint).

        Returns:
            Frontend linting results

        """
        try:
            # Check if ESLint is available
            result = subprocess.run(
                ["npx", "eslint", "--version"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                return {"passed": False, "error": "ESLint not available"}

            # Run ESLint
            result = subprocess.run(
                ["npx", "eslint", ".", "--ext", ".js,.ts,.tsx,.jsx"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode == 0:
                return {
                    "passed": True,
                    "output": result.stdout,
                    "errors": 0,
                    "warnings": 0,
                }
            # Parse ESLint output for error/warning counts
            output_lines = result.stdout.split("\n")
            errors = sum(1 for line in output_lines if "error" in line.lower())
            warnings = sum(1 for line in output_lines if "warning" in line.lower())

            return {
                "passed": False,
                "output": result.stdout,
                "errors": errors,
                "warnings": warnings,
                "error": f"ESLint found {errors} errors and {warnings} warnings",
            }

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_python_linting(self) -> dict[str, Any]:
        """Run Python linting (flake8).

        Returns:
            Python linting results

        """
        try:
            # Check if flake8 is available
            result = subprocess.run(
                ["flake8", "--version"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                return {"passed": False, "error": "flake8 not available"}

            # Run flake8
            result = subprocess.run(
                ["flake8", ".", "--max-line-length=140", "--extend-ignore=E203,W503"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode == 0:
                return {
                    "passed": True,
                    "output": result.stdout,
                    "errors": 0,
                    "warnings": 0,
                }
            # Parse flake8 output
            output_lines = result.stdout.split("\n")
            issues = len([line for line in output_lines if line.strip()])

            return {
                "passed": False,
                "output": result.stdout,
                "errors": issues,
                "warnings": 0,
                "error": f"flake8 found {issues} issues",
            }

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_formatting_check(self) -> dict[str, Any]:
        """Run formatting checks.

        Returns:
            Formatting check results

        """
        try:
            # Check for package.json to determine project type
            if Path("package.json").exists():
                return await self._run_frontend_formatting()
            return await self._run_python_formatting()

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_frontend_formatting(self) -> dict[str, Any]:
        """Run frontend formatting check (Prettier).

        Returns:
            Frontend formatting results

        """
        try:
            # Check if Prettier is available
            result = subprocess.run(
                ["npx", "prettier", "--version"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                return {"passed": False, "error": "Prettier not available"}

            # Run Prettier check
            result = subprocess.run(
                ["npx", "prettier", "--check", "."],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode == 0:
                return {
                    "passed": True,
                    "output": result.stdout,
                    "message": "All files are properly formatted",
                }
            return {
                "passed": False,
                "output": result.stdout,
                "error": "Some files are not properly formatted",
            }

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_python_formatting(self) -> dict[str, Any]:
        """Run Python formatting check (Black).

        Returns:
            Python formatting results

        """
        try:
            # Check if Black is available
            result = subprocess.run(
                ["black", "--version"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                return {"passed": False, "error": "Black not available"}

            # Run Black check
            result = subprocess.run(
                ["black", "--check", "--line-length=140", "."],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode == 0:
                return {
                    "passed": True,
                    "output": result.stdout,
                    "message": "All files are properly formatted",
                }
            return {
                "passed": False,
                "output": result.stdout,
                "error": "Some files are not properly formatted",
            }

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_type_checking(self) -> dict[str, Any]:
        """Run type checking.

        Returns:
            Type checking results

        """
        try:
            # Check for package.json to determine project type
            if Path("package.json").exists():
                return await self._run_typescript_checking()
            return await self._run_python_type_checking()

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_typescript_checking(self) -> dict[str, Any]:
        """Run TypeScript type checking.

        Returns:
            TypeScript checking results

        """
        try:
            # Check if TypeScript is available
            result = subprocess.run(
                ["npx", "tsc", "--version"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                return {"passed": False, "error": "TypeScript not available"}

            # Run TypeScript check
            result = subprocess.run(
                ["npx", "tsc", "--noEmit"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode == 0:
                return {
                    "passed": True,
                    "output": result.stdout,
                    "message": "No type errors found",
                }
            return {
                "passed": False,
                "output": result.stdout,
                "error": "TypeScript type errors found",
            }

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_python_type_checking(self) -> dict[str, Any]:
        """Run Python type checking (mypy).

        Returns:
            Python type checking results

        """
        try:
            # Check if mypy is available
            result = subprocess.run(
                ["mypy", "--version"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                return {"passed": False, "error": "mypy not available"}

            # Run mypy
            result = subprocess.run(
                ["mypy", ".", "--ignore-missing-imports"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode == 0:
                return {
                    "passed": True,
                    "output": result.stdout,
                    "message": "No type errors found",
                }
            return {
                "passed": False,
                "output": result.stdout,
                "error": "Python type errors found",
            }

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def _run_documentation_check(self) -> dict[str, Any]:
        """Run documentation validation.

        Returns:
            Documentation check results

        """
        try:
            # Check for markdown files
            markdown_files = list(Path().glob("**/*.md"))

            if not markdown_files:
                return {"passed": True, "message": "No markdown files found"}

            # Basic markdown validation
            issues = []

            for md_file in markdown_files:
                try:
                    with open(md_file, encoding="utf-8") as f:
                        content = f.read()

                    # Check for basic markdown structure
                    if not content.strip():
                        issues.append(f"Empty file: {md_file}")
                        continue

                    # Check for proper heading structure
                    lines = content.split("\n")
                    has_h1 = any(line.startswith("# ") for line in lines)

                    if (
                        not has_h1 and len(lines) > 10
                    ):  # Only check files with substantial content
                        issues.append(f"Missing H1 heading: {md_file}")

                except Exception as e:
                    issues.append(f"Error reading {md_file}: {e}")

            if issues:
                return {
                    "passed": False,
                    "output": "\n".join(issues),
                    "error": f"Found {len(issues)} documentation issues",
                }
            return {
                "passed": True,
                "output": f"Validated {len(markdown_files)} markdown files",
                "message": "All documentation files are valid",
            }

        except Exception as e:
            return {"passed": False, "error": str(e)}

    async def fix_issues(self, check_type: str) -> dict[str, Any]:
        """Attempt to fix quality issues automatically.

        Args:
            check_type: Type of check to fix (linting, formatting)

        Returns:
            Fix results

        """
        try:
            if check_type == "formatting":
                return await self._fix_formatting()
            if check_type == "linting":
                return await self._fix_linting()
            return {"success": False, "error": f"Unknown check type: {check_type}"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _fix_formatting(self) -> dict[str, Any]:
        """Fix formatting issues automatically.

        Returns:
            Fix results

        """
        try:
            if Path("package.json").exists():
                # Frontend formatting fix
                result = subprocess.run(
                    ["npx", "prettier", "--write", "."],
                    capture_output=True,
                    text=True,
                    check=False,
                )
            else:
                # Python formatting fix
                result = subprocess.run(
                    ["black", "--line-length=140", "."],
                    capture_output=True,
                    text=True,
                    check=False,
                )

            if result.returncode == 0:
                return {
                    "success": True,
                    "output": result.stdout,
                    "message": "Formatting issues fixed",
                }
            return {
                "success": False,
                "output": result.stdout,
                "error": "Failed to fix formatting issues",
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _fix_linting(self) -> dict[str, Any]:
        """Fix linting issues automatically where possible.

        Returns:
            Fix results

        """
        try:
            if Path("package.json").exists():
                # Frontend linting fix
                result = subprocess.run(
                    ["npx", "eslint", ".", "--ext", ".js,.ts,.tsx,.jsx", "--fix"],
                    capture_output=True,
                    text=True,
                    check=False,
                )
            else:
                # Python linting fix (flake8 doesn't have auto-fix, but we can try autopep8)
                result = subprocess.run(
                    ["autopep8", "--in-place", "--recursive", "."],
                    capture_output=True,
                    text=True,
                    check=False,
                )

            if result.returncode == 0:
                return {
                    "success": True,
                    "output": result.stdout,
                    "message": "Linting issues fixed where possible",
                }
            return {
                "success": False,
                "output": result.stdout,
                "error": "Failed to fix linting issues",
            }

        except Exception as e:
            return {"success": False, "error": str(e)}
