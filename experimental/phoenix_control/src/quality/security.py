"""
Security Scanner

Provides comprehensive security scanning including dependency vulnerability
analysis and secret detection for the Success-Advisor-8 distillation system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import asyncio
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..utils.logging import PhoenixLogger


class SecurityScanner:
    """
    Security scanning system.

    Provides comprehensive security validation including dependency
    vulnerability scanning, secret detection, and security best practices.
    """

    def __init__(self):
        """Initialize security scanner."""
        self.logger = PhoenixLogger("security_scanner")

        # Secret patterns
        self.secret_patterns = {
            "api_key": r"(?i)(api[_-]?key|apikey)\s*[:=]\s*['\"]?([a-zA-Z0-9_-]{20,})['\"]?",
            "secret": r"(?i)(secret|password|passwd|pwd)\s*[:=]\s*['\"]?([a-zA-Z0-9_-]{8,})['\"]?",
            "token": r"(?i)(token|bearer)\s*[:=]\s*['\"]?([a-zA-Z0-9_.-]{20,})['\"]?",
            "private_key": r"-----BEGIN (?:RSA )?PRIVATE KEY-----",
            "aws_key": r"(?i)(aws[_-]?access[_-]?key[_-]?id|aws[_-]?secret[_-]?access[_-]?key)\s*[:=]\s*['\"]?([a-zA-Z0-9/+=]{20,})['\"]?",
            "github_token": r"(?i)(github[_-]?token|gh[_-]?token)\s*[:=]\s*['\"]?(ghp_[a-zA-Z0-9]{36})['\"]?",
            "database_url": r"(?i)(database[_-]?url|db[_-]?url)\s*[:=]\s*['\"]?(postgresql|mysql|mongodb)://[^'\"]+['\"]?",
        }

        self.logger.info("Security scanner initialized", "initialization")

    async def run_security_scan(self) -> Dict[str, Any]:
        """
        Run comprehensive security scan.

        Returns:
            Security scan results
        """
        self.logger.info("Running comprehensive security scan", "security_scan")

        results = {
            "overall_status": "passed",
            "vulnerabilities": [],
            "secrets_found": [],
            "security_issues": [],
            "recommendations": [],
        }

        try:
            # Run dependency vulnerability scan
            vuln_results = await self._scan_dependencies()
            results["vulnerabilities"] = vuln_results.get("vulnerabilities", [])

            # Run secret detection
            secret_results = await self._scan_secrets()
            results["secrets_found"] = secret_results.get("secrets", [])

            # Run security best practices check
            practices_results = await self._check_security_practices()
            results["security_issues"] = practices_results.get("issues", [])
            results["recommendations"] = practices_results.get("recommendations", [])

            # Determine overall status
            if (
                results["vulnerabilities"]
                or results["secrets_found"]
                or results["security_issues"]
            ):
                results["overall_status"] = "failed"
                self.logger.error("Security scan found issues", "security_scan")
            else:
                self.logger.success(
                    "Security scan passed - no issues found", "security_scan"
                )

        except Exception as e:
            results["overall_status"] = "error"
            results["error"] = str(e)
            self.logger.error(f"Security scan failed: {e}", "security_scan")

        return results

    async def _scan_dependencies(self) -> Dict[str, Any]:
        """
        Scan for dependency vulnerabilities.

        Returns:
            Dependency scan results
        """
        try:
            vulnerabilities = []

            # Check for package.json (Node.js project)
            if Path("package.json").exists():
                npm_results = await self._scan_npm_dependencies()
                vulnerabilities.extend(npm_results.get("vulnerabilities", []))

            # Check for requirements.txt or pyproject.toml (Python project)
            if Path("requirements.txt").exists() or Path("pyproject.toml").exists():
                python_results = await self._scan_python_dependencies()
                vulnerabilities.extend(python_results.get("vulnerabilities", []))

            return {
                "vulnerabilities": vulnerabilities,
                "total_vulnerabilities": len(vulnerabilities),
            }

        except Exception as e:
            self.logger.error(f"Dependency scan failed: {e}", "dependency_scan")
            return {"vulnerabilities": [], "error": str(e)}

    async def _scan_npm_dependencies(self) -> Dict[str, Any]:
        """
        Scan npm dependencies for vulnerabilities.

        Returns:
            NPM scan results
        """
        try:
            # Run npm audit
            result = subprocess.run(
                ["npm", "audit", "--audit-level=moderate", "--json"],
                capture_output=True,
                text=True,
            )

            vulnerabilities = []

            if result.returncode != 0:
                try:
                    import json

                    audit_data = json.loads(result.stdout)

                    if "vulnerabilities" in audit_data:
                        for vuln_id, vuln_data in audit_data["vulnerabilities"].items():
                            vulnerabilities.append(
                                {
                                    "id": vuln_id,
                                    "severity": vuln_data.get("severity", "unknown"),
                                    "title": vuln_data.get(
                                        "title", "Unknown vulnerability"
                                    ),
                                    "description": vuln_data.get("description", ""),
                                    "package": vuln_data.get("name", "unknown"),
                                    "version": vuln_data.get("version", "unknown"),
                                }
                            )
                except json.JSONDecodeError:
                    # Fallback to text parsing
                    vulnerabilities.append(
                        {
                            "id": "npm_audit_failed",
                            "severity": "high",
                            "title": "NPM audit failed",
                            "description": "Could not parse npm audit results",
                            "package": "unknown",
                            "version": "unknown",
                        }
                    )

            return {"vulnerabilities": vulnerabilities}

        except Exception as e:
            return {"vulnerabilities": [], "error": str(e)}

    async def _scan_python_dependencies(self) -> Dict[str, Any]:
        """
        Scan Python dependencies for vulnerabilities.

        Returns:
            Python scan results
        """
        try:
            vulnerabilities = []

            # Try to run safety check
            result = subprocess.run(
                ["safety", "check", "--json"], capture_output=True, text=True
            )

            if result.returncode == 0:
                # No vulnerabilities found
                return {"vulnerabilities": []}
            else:
                try:
                    import json

                    safety_data = json.loads(result.stdout)

                    for vuln in safety_data:
                        vulnerabilities.append(
                            {
                                "id": vuln.get("id", "unknown"),
                                "severity": "high",  # Safety typically reports high-severity issues
                                "title": vuln.get("advisory", "Unknown vulnerability"),
                                "description": vuln.get("description", ""),
                                "package": vuln.get("package", "unknown"),
                                "version": vuln.get("installed_version", "unknown"),
                            }
                        )
                except json.JSONDecodeError:
                    # Fallback to text parsing
                    vulnerabilities.append(
                        {
                            "id": "safety_check_failed",
                            "severity": "medium",
                            "title": "Safety check failed",
                            "description": "Could not parse safety check results",
                            "package": "unknown",
                            "version": "unknown",
                        }
                    )

            return {"vulnerabilities": vulnerabilities}

        except Exception as e:
            return {"vulnerabilities": [], "error": str(e)}

    async def _scan_secrets(self) -> Dict[str, Any]:
        """
        Scan for hardcoded secrets and credentials.

        Returns:
            Secret scan results
        """
        try:
            secrets_found = []

            # Scan common file types
            file_patterns = [
                "*.py",
                "*.js",
                "*.ts",
                "*.tsx",
                "*.jsx",
                "*.json",
                "*.yaml",
                "*.yml",
                "*.env*",
            ]

            for pattern in file_patterns:
                for file_path in Path(".").glob(f"**/{pattern}"):
                    # Skip certain directories
                    if any(
                        skip_dir in str(file_path)
                        for skip_dir in ["node_modules", ".git", "__pycache__", ".venv"]
                    ):
                        continue

                    try:
                        with open(
                            file_path, "r", encoding="utf-8", errors="ignore"
                        ) as f:
                            content = f.read()

                        # Check for secret patterns
                        for secret_type, pattern in self.secret_patterns.items():
                            matches = re.finditer(pattern, content, re.MULTILINE)

                            for match in matches:
                                # Get line number
                                line_num = content[: match.start()].count("\n") + 1

                                secrets_found.append(
                                    {
                                        "type": secret_type,
                                        "file": str(file_path),
                                        "line": line_num,
                                        "match": (
                                            match.group(0)[:100] + "..."
                                            if len(match.group(0)) > 100
                                            else match.group(0)
                                        ),
                                        "severity": (
                                            "high"
                                            if secret_type in ["private_key", "aws_key"]
                                            else "medium"
                                        ),
                                    }
                                )

                    except Exception as e:
                        # Skip files that can't be read
                        continue

            return {"secrets": secrets_found}

        except Exception as e:
            return {"secrets": [], "error": str(e)}

    async def _check_security_practices(self) -> Dict[str, Any]:
        """
        Check security best practices.

        Returns:
            Security practices check results
        """
        try:
            issues = []
            recommendations = []

            # Check for .gitignore
            if not Path(".gitignore").exists():
                issues.append(
                    {
                        "type": "missing_gitignore",
                        "severity": "medium",
                        "description": ".gitignore file not found",
                        "recommendation": "Create a .gitignore file to exclude sensitive files",
                    }
                )
                recommendations.append("Create a comprehensive .gitignore file")

            # Check for environment files
            env_files = list(Path(".").glob(".env*"))
            if env_files:
                for env_file in env_files:
                    if env_file.name == ".env":
                        issues.append(
                            {
                                "type": "env_file_exposed",
                                "severity": "high",
                                "description": f"{env_file} should not be committed to version control",
                                "recommendation": "Add .env to .gitignore and use .env.example instead",
                            }
                        )
                        recommendations.append(
                            "Use .env.example for template and add .env to .gitignore"
                        )

            # Check for hardcoded URLs
            hardcoded_urls = await self._check_hardcoded_urls()
            if hardcoded_urls:
                issues.append(
                    {
                        "type": "hardcoded_urls",
                        "severity": "low",
                        "description": f"Found {len(hardcoded_urls)} hardcoded URLs",
                        "recommendation": "Use environment variables for URLs",
                    }
                )
                recommendations.append("Use environment variables for configuration")

            # Check for console.log statements (potential information leakage)
            console_logs = await self._check_console_logs()
            if console_logs:
                issues.append(
                    {
                        "type": "console_logs",
                        "severity": "low",
                        "description": f"Found {len(console_logs)} console.log statements",
                        "recommendation": "Remove or replace console.log statements in production code",
                    }
                )
                recommendations.append(
                    "Remove debug console.log statements from production code"
                )

            return {"issues": issues, "recommendations": recommendations}

        except Exception as e:
            return {"issues": [], "recommendations": [], "error": str(e)}

    async def _check_hardcoded_urls(self) -> List[str]:
        """
        Check for hardcoded URLs in code.

        Returns:
            List of hardcoded URLs found
        """
        try:
            urls_found = []
            url_pattern = r'https?://[^\s\'"]+'

            for file_path in Path(".").glob("**/*.{py,js,ts,tsx,jsx}"):
                if any(
                    skip_dir in str(file_path)
                    for skip_dir in ["node_modules", ".git", "__pycache__"]
                ):
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    matches = re.findall(url_pattern, content)
                    for match in matches:
                        urls_found.append(f"{file_path}: {match}")

                except Exception:
                    continue

            return urls_found

        except Exception as e:
            return []

    async def _check_console_logs(self) -> List[str]:
        """
        Check for console.log statements in JavaScript/TypeScript files.

        Returns:
            List of console.log statements found
        """
        try:
            console_logs = []
            console_pattern = r"console\.(log|warn|error|info|debug)\s*\("

            for file_path in Path(".").glob("**/*.{js,ts,tsx,jsx}"):
                if any(
                    skip_dir in str(file_path) for skip_dir in ["node_modules", ".git"]
                ):
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    matches = re.finditer(console_pattern, content)
                    for match in matches:
                        line_num = content[: match.start()].count("\n") + 1
                        console_logs.append(f"{file_path}:{line_num}: {match.group(0)}")

                except Exception:
                    continue

            return console_logs

        except Exception as e:
            return []

    async def generate_security_report(self, results: Dict[str, Any]) -> str:
        """
        Generate a human-readable security report.

        Args:
            results: Security scan results

        Returns:
            Formatted security report
        """
        report = []
        report.append("# Security Scan Report")
        report.append(f"**Overall Status:** {results['overall_status'].upper()}")
        report.append("")

        # Vulnerabilities section
        vulnerabilities = results.get("vulnerabilities", [])
        if vulnerabilities:
            report.append("## 🚨 Vulnerabilities Found")
            for vuln in vulnerabilities:
                report.append(f"### {vuln.get('title', 'Unknown')}")
                report.append(f"- **Severity:** {vuln.get('severity', 'unknown')}")
                report.append(f"- **Package:** {vuln.get('package', 'unknown')}")
                report.append(f"- **Version:** {vuln.get('version', 'unknown')}")
                report.append(
                    f"- **Description:** {vuln.get('description', 'No description')}"
                )
                report.append("")
        else:
            report.append("## ✅ No Vulnerabilities Found")
            report.append("")

        # Secrets section
        secrets = results.get("secrets_found", [])
        if secrets:
            report.append("## 🔐 Secrets Found")
            for secret in secrets:
                report.append(
                    f"### {secret.get('type', 'Unknown')} in {secret.get('file', 'unknown')}"
                )
                report.append(f"- **Line:** {secret.get('line', 'unknown')}")
                report.append(f"- **Severity:** {secret.get('severity', 'unknown')}")
                report.append(f"- **Match:** `{secret.get('match', 'unknown')}`")
                report.append("")
        else:
            report.append("## ✅ No Secrets Found")
            report.append("")

        # Security issues section
        issues = results.get("security_issues", [])
        if issues:
            report.append("## ⚠️ Security Issues")
            for issue in issues:
                report.append(f"### {issue.get('description', 'Unknown issue')}")
                report.append(f"- **Severity:** {issue.get('severity', 'unknown')}")
                report.append(
                    f"- **Recommendation:** {issue.get('recommendation', 'No recommendation')}"
                )
                report.append("")
        else:
            report.append("## ✅ No Security Issues Found")
            report.append("")

        # Recommendations section
        recommendations = results.get("recommendations", [])
        if recommendations:
            report.append("## 💡 Recommendations")
            for rec in recommendations:
                report.append(f"- {rec}")
            report.append("")

        return "\n".join(report)
