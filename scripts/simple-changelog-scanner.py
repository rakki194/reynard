#!/usr/bin/env python3
"""
🦊 Simple CHANGELOG.md Codebase Scanner
======================================

Strategic fox specialist tool for comprehensive codebase scanning
when CHANGELOG.md is saved. Uses direct MCP tool calls for simplicity.

*whiskers twitch with cunning* This tool outfoxes complexity by providing
a complete overview of the development ecosystem.
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Any

# Add the MCP scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent / "mcp"))

try:
    from tools.enhanced_bm25_search_tools import EnhancedBM25SearchTools
    from tools.file_search_tools import FileSearchTools
    from tools.monolith_detection_tools import MonolithDetectionTools
except ImportError as e:
    print(f"❌ Failed to import MCP tools: {e}")
    print("💡 Make sure you're running this from the Reynard project root")
    sys.exit(1)


class SimpleChangelogScanner:
    """🦊 Simple strategic codebase scanner for CHANGELOG.md updates"""

    def __init__(self):
        self.monolith_tools = MonolithDetectionTools()
        self.search_tools = EnhancedBM25SearchTools()
        self.file_tools = FileSearchTools()
        self.results = {}

    async def detect_monoliths(self) -> dict[str, Any]:
        """Detect monolithic files in the codebase"""
        print("\n📊 Detecting monolithic files...")
        try:
            result = await self.monolith_tools.detect_monoliths(
                max_lines=140,
                top_n=10,
                directories=["../../packages/", "../../backend/", "../../scripts/"],
                file_types=[".ts", ".tsx", ".py", ".js", ".jsx"],
                exclude_comments=True,
                include_metrics=True,
            )
            monoliths = result.get("monoliths", [])
            print(f"Found {len(monoliths)} monolithic files")
            return {"monoliths": monoliths, "count": len(monoliths)}
        except Exception as e:
            print(f"❌ Error detecting monoliths: {e}")
            return {"monoliths": [], "count": 0, "error": str(e)}

    async def search_development_tools(self) -> dict[str, Any]:
        """Search for development tools and utilities"""
        print("\n🔍 Searching for development tools...")
        try:
            result = await self.search_tools.search_enhanced(
                query="development tools utilities scripts automation",
                search_type="hybrid",
                top_k=20,
                file_types=[".py", ".ts", ".js", ".sh"],
                directories=["../../scripts/", "../../packages/"],
            )
            tools = result.get("results", [])
            print(f"Found {len(tools)} tool-related files")
            return {"tools": tools, "count": len(tools)}
        except Exception as e:
            print(f"❌ Error searching development tools: {e}")
            return {"tools": [], "count": 0, "error": str(e)}

    async def search_mcp_tools(self) -> dict[str, Any]:
        """Search for MCP tools and server components"""
        print("\n🛠️  Scanning MCP tools...")
        try:
            result = await self.search_tools.search_enhanced(
                query="MCP tools server protocol",
                search_type="hybrid",
                top_k=15,
                file_types=[".py"],
                directories=["../../scripts/mcp/"],
            )
            mcp_tools = result.get("results", [])
            print(f"Found {len(mcp_tools)} MCP tool files")
            return {"mcp_tools": mcp_tools, "count": len(mcp_tools)}
        except Exception as e:
            print(f"❌ Error searching MCP tools: {e}")
            return {"mcp_tools": [], "count": 0, "error": str(e)}

    async def search_validation_tools(self) -> dict[str, Any]:
        """Search for validation and testing tools"""
        print("\n✅ Scanning validation tools...")
        try:
            result = await self.search_tools.search_enhanced(
                query="validation linting formatting testing",
                search_type="hybrid",
                top_k=15,
                file_types=[".py", ".ts", ".js"],
                directories=["../../scripts/validation/", "../../packages/"],
            )
            validation_tools = result.get("results", [])
            print(f"Found {len(validation_tools)} validation tool files")
            return {
                "validation_tools": validation_tools,
                "count": len(validation_tools),
            }
        except Exception as e:
            print(f"❌ Error searching validation tools: {e}")
            return {"validation_tools": [], "count": 0, "error": str(e)}

    async def search_files_by_pattern(self) -> dict[str, Any]:
        """Search for files by common tool patterns"""
        print("\n📁 Searching for tool files by pattern...")
        try:
            patterns = ["*tool*", "*util*", "*script*", "*helper*", "*manager*"]
            all_files = []

            for pattern in patterns:
                result = await self.file_tools.search_files(
                    pattern=pattern, directory="../../", recursive=True
                )
                files = result.get("files", [])
                all_files.extend(files)

            # Remove duplicates
            unique_files = list(set(all_files))
            print(f"Found {len(unique_files)} tool files by pattern")
            return {"pattern_files": unique_files, "count": len(unique_files)}
        except Exception as e:
            print(f"❌ Error searching files by pattern: {e}")
            return {"pattern_files": [], "count": 0, "error": str(e)}

    async def scan_codebase(self) -> dict[str, Any]:
        """Perform comprehensive codebase scan"""
        print("🦊 Starting comprehensive codebase scan...")
        print("=" * 60)

        # Run all scans in parallel for efficiency
        tasks = [
            self.detect_monoliths(),
            self.search_development_tools(),
            self.search_mcp_tools(),
            self.search_validation_tools(),
            self.search_files_by_pattern(),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Organize results
        self.results = {
            "monoliths": results[0]
            if not isinstance(results[0], Exception)
            else {"error": str(results[0])},
            "development_tools": results[1]
            if not isinstance(results[1], Exception)
            else {"error": str(results[1])},
            "mcp_tools": results[2]
            if not isinstance(results[2], Exception)
            else {"error": str(results[2])},
            "validation_tools": results[3]
            if not isinstance(results[3], Exception)
            else {"error": str(results[3])},
            "pattern_files": results[4]
            if not isinstance(results[4], Exception)
            else {"error": str(results[4])},
        }

        return self.results

    def print_summary(self):
        """Print a comprehensive summary of the scan results"""
        print("\n" + "=" * 60)
        print("🦊 CODEBASE SCAN COMPLETE!")
        print("=" * 60)

        print("\n📋 SUMMARY:")
        print(
            f"  • Monolithic files: {self.results.get('monoliths', {}).get('count', 0)}"
        )
        print(
            f"  • Development tools: {self.results.get('development_tools', {}).get('count', 0)}"
        )
        print(f"  • MCP tools: {self.results.get('mcp_tools', {}).get('count', 0)}")
        print(
            f"  • Validation tools: {self.results.get('validation_tools', {}).get('count', 0)}"
        )
        print(
            f"  • Pattern-based files: {self.results.get('pattern_files', {}).get('count', 0)}"
        )

        # Show top monoliths if any
        monoliths = self.results.get("monoliths", {}).get("monoliths", [])
        if monoliths:
            print(f"\n🏗️  TOP MONOLITHS (>{monoliths[0].get('line_count', 0)} lines):")
            for i, monolith in enumerate(monoliths[:5], 1):
                print(
                    f"  {i}. {monolith.get('file_path', 'Unknown')} ({monolith.get('line_count', 0)} lines)"
                )

        # Show key tools
        dev_tools = self.results.get("development_tools", {}).get("tools", [])
        if dev_tools:
            print("\n🛠️  KEY DEVELOPMENT TOOLS:")
            for i, tool in enumerate(dev_tools[:5], 1):
                print(f"  {i}. {tool.get('file_path', 'Unknown')}")

        # Show MCP tools
        mcp_tools = self.results.get("mcp_tools", {}).get("mcp_tools", [])
        if mcp_tools:
            print("\n🔧 MCP TOOLS:")
            for i, tool in enumerate(mcp_tools[:5], 1):
                print(f"  {i}. {tool.get('file_path', 'Unknown')}")

        print("\n🦊 *whiskers twitch with satisfaction* Scan complete!")
        print("💡 Use this information to understand your development ecosystem")


async def main():
    """Main entry point"""
    scanner = SimpleChangelogScanner()

    try:
        await scanner.scan_codebase()
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
    asyncio.run(main())
