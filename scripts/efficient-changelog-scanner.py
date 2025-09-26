#!/usr/bin/env python3
"""🦊 Efficient CHANGELOG.md Codebase Scanner
=========================================

Strategic fox specialist tool for comprehensive codebase scanning
when CHANGELOG.md is saved. Uses efficient file operations to avoid hanging.

*whiskers twitch with cunning* This tool outfoxes complexity by being smart
about what files to scan, avoiding the massive file counts that cause hangs.
"""

import json
import sys
from pathlib import Path
from typing import Any


class EfficientChangelogScanner:
    """🦊 Efficient strategic codebase scanner for CHANGELOG.md updates"""

    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.results = {}

    def count_lines_in_file(self, file_path: Path) -> int:
        """Count lines in a file, excluding comments and empty lines"""
        try:
            with open(file_path, encoding="utf-8") as f:
                lines = f.readlines()

            # Count non-comment, non-empty lines
            count = 0
            for line in lines:
                stripped = line.strip()
                if (
                    stripped
                    and not stripped.startswith("#")
                    and not stripped.startswith("//")
                    and not stripped.startswith("/*")
                    and not stripped.startswith("*")
                ):
                    count += 1

            return count
        except Exception:
            return 0

    def detect_monoliths(self) -> dict[str, Any]:
        """Detect monolithic files in the codebase - efficient version"""
        print("\n📊 Detecting monolithic files...")
        try:
            monoliths = []
            max_lines = 140

            # Use more targeted searches to avoid massive file counts
            target_dirs = [
                ("packages", ["*.py", "*.ts", "*.tsx", "*.js", "*.jsx"]),
                ("backend", ["*.py"]),
                ("scripts", ["*.py", "*.ts", "*.js"]),
            ]

            for dir_name, extensions in target_dirs:
                dir_path = self.project_root / dir_name
                if not dir_path.exists():
                    continue

                print(f"  Scanning {dir_name}/...")
                for ext in extensions:
                    # Use rglob with limit to avoid processing too many files
                    files = list(dir_path.rglob(ext))
                    # Limit to first 100 files per extension to avoid hanging
                    for file_path in files[:100]:
                        if file_path.is_file():
                            line_count = self.count_lines_in_file(file_path)
                            if line_count > max_lines:
                                relative_path = file_path.relative_to(self.project_root)
                                monoliths.append(
                                    {
                                        "file_path": str(relative_path),
                                        "line_count": line_count,
                                        "absolute_path": str(file_path),
                                    },
                                )

            # Sort by line count (descending)
            monoliths.sort(key=lambda x: x["line_count"], reverse=True)

            print(f"Found {len(monoliths)} monolithic files")
            return {"monoliths": monoliths, "count": len(monoliths)}
        except Exception as e:
            print(f"❌ Error detecting monoliths: {e}")
            return {"monoliths": [], "count": 0, "error": str(e)}

    def search_development_tools(self) -> dict[str, Any]:
        """Search for development tools and utilities - efficient version"""
        print("\n🔍 Searching for development tools...")
        try:
            tools = []

            # Search in specific directories with targeted patterns
            search_dirs = [
                (
                    "scripts",
                    [
                        "*tool*.py",
                        "*util*.py",
                        "*helper*.py",
                        "*manager*.py",
                        "*scanner*.py",
                        "*watcher*.py",
                    ],
                ),
                ("packages", ["*tool*.ts", "*util*.ts", "*helper*.ts", "*manager*.ts"]),
            ]

            for dir_name, patterns in search_dirs:
                dir_path = self.project_root / dir_name
                if not dir_path.exists():
                    continue

                print(f"  Searching {dir_name}/...")
                for pattern in patterns:
                    files = list(dir_path.rglob(pattern))
                    for file_path in files[:50]:  # Limit to 50 files per pattern
                        if file_path.is_file():
                            relative_path = file_path.relative_to(self.project_root)
                            tools.append(
                                {
                                    "file_path": str(relative_path),
                                    "absolute_path": str(file_path),
                                    "type": "development_tool",
                                },
                            )

            print(f"Found {len(tools)} tool-related files")
            return {"tools": tools, "count": len(tools)}
        except Exception as e:
            print(f"❌ Error searching development tools: {e}")
            return {"tools": [], "count": 0, "error": str(e)}

    def search_mcp_tools(self) -> dict[str, Any]:
        """Search for MCP tools and server components"""
        print("\n🛠️  Scanning MCP tools...")
        try:
            mcp_tools = []
            mcp_files = []
            registered_tools = 0

            # Search in MCP directory
            mcp_dir = self.project_root / "scripts" / "mcp"
            if mcp_dir.exists():
                print(f"  Scanning {mcp_dir.relative_to(self.project_root)}/...")
                for file_path in mcp_dir.rglob("*.py"):
                    if file_path.is_file():
                        relative_path = file_path.relative_to(self.project_root)
                        file_info = {
                            "file_path": str(relative_path),
                            "absolute_path": str(file_path),
                            "type": "mcp_file",
                        }
                        mcp_files.append(file_info)

                        # Check if it's a registered tool (not test/debug/stub)
                        if not any(
                            pattern in file_path.name.lower()
                            for pattern in ["test_", "debug_", "stub", "__init__"]
                        ):
                            mcp_tools.append(file_info)

            # Try to get actual registered tool count
            try:
                import sys

                sys.path.append(str(mcp_dir))
                from tools.definitions import get_tool_definitions

                registered_tools = len(get_tool_definitions())
            except Exception:
                registered_tools = len(mcp_tools)

            print(f"Found {len(mcp_files)} MCP Python files")
            print(f"Found {len(mcp_tools)} MCP tool files (excluding tests/debug)")
            print(f"Registered MCP tools: {registered_tools}")

            return {
                "mcp_files": mcp_files,
                "mcp_tools": mcp_tools,
                "registered_tools": registered_tools,
                "count": len(mcp_tools),
            }
        except Exception as e:
            print(f"❌ Error searching MCP tools: {e}")
            return {"mcp_tools": [], "count": 0, "error": str(e)}

    def search_validation_tools(self) -> dict[str, Any]:
        """Search for validation and testing tools - efficient version"""
        print("\n✅ Scanning validation tools...")
        try:
            validation_tools = []

            # Search in specific validation directories
            validation_dirs = [
                ("packages/dev-tools/validation", ["*.py", "*.ts", "*.js"]),
                (
                    "packages",
                    [
                        "*test*.ts",
                        "*test*.py",
                        "*lint*.ts",
                        "*lint*.py",
                        "*format*.ts",
                        "*format*.py",
                    ],
                ),
            ]

            for dir_name, extensions in validation_dirs:
                dir_path = self.project_root / dir_name
                if not dir_path.exists():
                    continue

                print(f"  Searching {dir_name}/...")
                for ext in extensions:
                    files = list(dir_path.rglob(ext))
                    for file_path in files[:30]:  # Limit to 30 files per extension
                        if file_path.is_file():
                            relative_path = file_path.relative_to(self.project_root)
                            validation_tools.append(
                                {
                                    "file_path": str(relative_path),
                                    "absolute_path": str(file_path),
                                    "type": "validation_tool",
                                },
                            )

            print(f"Found {len(validation_tools)} validation tool files")
            return {
                "validation_tools": validation_tools,
                "count": len(validation_tools),
            }
        except Exception as e:
            print(f"❌ Error searching validation tools: {e}")
            return {"validation_tools": [], "count": 0, "error": str(e)}

    def search_vscode_tasks(self) -> dict[str, Any]:
        """Search for VS Code tasks and configuration"""
        print("\n⚙️  Scanning VS Code configuration...")
        try:
            vscode_files = []

            # Search for VS Code configuration files
            vscode_dir = self.project_root / ".vscode"
            if vscode_dir.exists():
                print(f"  Scanning {vscode_dir.relative_to(self.project_root)}/...")
                for file_path in vscode_dir.rglob("*"):
                    if file_path.is_file():
                        relative_path = file_path.relative_to(self.project_root)
                        vscode_files.append(
                            {
                                "file_path": str(relative_path),
                                "absolute_path": str(file_path),
                                "type": "vscode_config",
                            },
                        )

            print(f"Found {len(vscode_files)} VS Code configuration files")
            return {"vscode_files": vscode_files, "count": len(vscode_files)}
        except Exception as e:
            print(f"❌ Error searching VS Code files: {e}")
            return {"vscode_files": [], "count": 0, "error": str(e)}

    def get_package_info(self) -> dict[str, Any]:
        """Get information about packages in the project - efficient version"""
        print("\n📦 Analyzing package structure...")
        try:
            packages = []

            # Search for package.json files in key locations only
            key_locations = [
                "package.json",  # Root package.json
                "packages/*/package.json",  # Package-specific package.json files
                "backend/package.json",
                "e2e/package.json",
            ]

            for location in key_locations:
                if "*" in location:
                    # Use rglob for patterns
                    files = list(self.project_root.rglob(location))
                    for package_json in files[:20]:  # Limit to 20 files per pattern
                        if package_json.is_file():
                            try:
                                with open(package_json) as f:
                                    package_data = json.load(f)

                                relative_path = package_json.relative_to(
                                    self.project_root,
                                )
                                packages.append(
                                    {
                                        "file_path": str(relative_path),
                                        "name": package_data.get("name", "Unknown"),
                                        "version": package_data.get(
                                            "version",
                                            "Unknown",
                                        ),
                                        "type": "package",
                                    },
                                )
                            except Exception:
                                continue
                else:
                    # Direct file path
                    package_json = self.project_root / location
                    if package_json.is_file():
                        try:
                            with open(package_json) as f:
                                package_data = json.load(f)

                            relative_path = package_json.relative_to(self.project_root)
                            packages.append(
                                {
                                    "file_path": str(relative_path),
                                    "name": package_data.get("name", "Unknown"),
                                    "version": package_data.get("version", "Unknown"),
                                    "type": "package",
                                },
                            )
                        except Exception:
                            continue

            print(f"Found {len(packages)} packages")
            return {"packages": packages, "count": len(packages)}
        except Exception as e:
            print(f"❌ Error analyzing packages: {e}")
            return {"packages": [], "count": 0, "error": str(e)}

    def scan_codebase(self) -> dict[str, Any]:
        """Perform comprehensive codebase scan"""
        print("🦊 Starting comprehensive codebase scan...")
        print("=" * 60)

        # Run all scans
        self.results = {
            "monoliths": self.detect_monoliths(),
            "development_tools": self.search_development_tools(),
            "mcp_tools": self.search_mcp_tools(),
            "validation_tools": self.search_validation_tools(),
            "vscode_files": self.search_vscode_tasks(),
            "packages": self.get_package_info(),
        }

        return self.results

    def print_summary(self):
        """Print a comprehensive summary of the scan results"""
        print("\n" + "=" * 60)
        print("🦊 CODEBASE SCAN COMPLETE!")
        print("=" * 60)

        print("\n📋 SUMMARY:")
        print(
            f"  • Monolithic files: {self.results.get('monoliths', {}).get('count', 0)}",
        )
        print(
            f"  • Development tools: {self.results.get('development_tools', {}).get('count', 0)}",
        )
        print(f"  • MCP tools: {self.results.get('mcp_tools', {}).get('count', 0)}")
        print(
            f"  • Validation tools: {self.results.get('validation_tools', {}).get('count', 0)}",
        )
        print(
            f"  • VS Code configs: {self.results.get('vscode_files', {}).get('count', 0)}",
        )
        print(f"  • Packages: {self.results.get('packages', {}).get('count', 0)}")

        # Show top monoliths if any
        monoliths = self.results.get("monoliths", {}).get("monoliths", [])
        if monoliths:
            print(f"\n🏗️  TOP MONOLITHS (>{monoliths[0].get('line_count', 0)} lines):")
            for i, monolith in enumerate(monoliths[:5], 1):
                print(
                    f"  {i}. {monolith.get('file_path', 'Unknown')} ({monolith.get('line_count', 0)} lines)",
                )

        # Show key tools
        dev_tools = self.results.get("development_tools", {}).get("tools", [])
        if dev_tools:
            print("\n🛠️  KEY DEVELOPMENT TOOLS:")
            for i, tool in enumerate(dev_tools[:5], 1):
                print(f"  {i}. {tool.get('file_path', 'Unknown')}")

        # Show MCP tools
        mcp_data = self.results.get("mcp_tools", {})
        mcp_tools = mcp_data.get("mcp_tools", [])
        registered_tools = mcp_data.get("registered_tools", 0)
        if mcp_tools:
            print(f"\n🔧 MCP TOOLS (Registered: {registered_tools}):")
            for i, tool in enumerate(mcp_tools[:5], 1):
                print(f"  {i}. {tool.get('file_path', 'Unknown')}")

        # Show packages
        packages = self.results.get("packages", {}).get("packages", [])
        if packages:
            print("\n📦 PACKAGES:")
            for i, package in enumerate(packages[:5], 1):
                print(
                    f"  {i}. {package.get('name', 'Unknown')} v{package.get('version', 'Unknown')}",
                )

        print("\n🦊 *whiskers twitch with satisfaction* Scan complete!")
        print("💡 Use this information to understand your development ecosystem")


def main():
    """Main entry point"""
    scanner = EfficientChangelogScanner()

    try:
        scanner.scan_codebase()
        scanner.print_summary()

        # Save results to a file for reference
        results_file = Path(__file__).parent / "changelog-scan-results.json"
        with open(results_file, "w") as f:
            json.dump(scanner.results, f, indent=2, default=str)
        print(f"\n💾 Results saved to: {results_file}")

    except Exception as e:
        print(f"❌ Scan failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
