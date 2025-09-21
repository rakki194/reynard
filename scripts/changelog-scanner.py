#!/usr/bin/env python3
"""
🦊 CHANGELOG.md Codebase Scanner
===============================

Strategic fox specialist tool for comprehensive codebase scanning
when CHANGELOG.md is saved. Uses MCP tools for maximum effectiveness.

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
    from main import MCPServer
except ImportError as e:
    print(f"❌ Failed to import MCP server: {e}")
    print("💡 Make sure you're running this from the Reynard project root")
    sys.exit(1)


class ChangelogScanner:
    """🦊 Strategic codebase scanner for CHANGELOG.md updates"""

    def __init__(self):
        self.server = None
        self.results = {}

    async def initialize(self):
        """Initialize the MCP server"""
        try:
            self.server = MCPServer()
            # Initialize the MCP server by sending an initialize request
            init_request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {},
            }
            init_response = await self.server.handle_request(init_request)
            if init_response and "result" in init_response:
                print("🦊 MCP server initialized successfully")
            else:
                print("⚠️ MCP server initialization response unclear")
        except Exception as e:
            print(f"❌ Failed to initialize MCP server: {e}")
            raise

    async def detect_monoliths(self) -> dict[str, Any]:
        """Detect monolithic files in the codebase"""
        print("\n📊 Detecting monolithic files...")
        try:
            result = await self.server.call_tool(
                "detect_monoliths",
                {
                    "max_lines": 140,
                    "top_n": 10,
                    "directories": [
                        "../../packages/",
                        "../../backend/",
                        "../../scripts/",
                    ],
                    "file_types": [".ts", ".tsx", ".py", ".js", ".jsx"],
                    "exclude_comments": True,
                    "include_metrics": True,
                },
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
            result = await self.server.call_tool(
                "search_enhanced",
                {
                    "query": "development tools utilities scripts automation",
                    "search_type": "hybrid",
                    "top_k": 20,
                    "file_types": [".py", ".ts", ".js", ".sh"],
                    "directories": ["../../scripts/", "../../packages/"],
                },
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
            result = await self.server.call_tool(
                "search_enhanced",
                {
                    "query": "MCP tools server protocol",
                    "search_type": "hybrid",
                    "top_k": 15,
                    "file_types": [".py"],
                    "directories": ["../../services/mcp-server/"],
                },
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
            result = await self.server.call_tool(
                "search_enhanced",
                {
                    "query": "validation linting formatting testing",
                    "search_type": "hybrid",
                    "top_k": 15,
                    "file_types": [".py", ".ts", ".js"],
                    "directories": ["../../packages/dev-tools/validation/", "../../packages/"],
                },
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

    async def get_code_metrics(self) -> dict[str, Any]:
        """Get comprehensive code metrics"""
        print("\n📈 Generating code metrics summary...")
        try:
            result = await self.server.call_tool(
                "get_code_metrics_summary",
                {
                    "directories": [
                        "../../packages/",
                        "../../backend/",
                        "../../scripts/",
                    ],
                    "file_types": [".py", ".ts", ".tsx", ".js", ".jsx"],
                },
            )
            print(f"Codebase health: {result.get('summary', 'Unknown')}")
            return result
        except Exception as e:
            print(f"❌ Error getting code metrics: {e}")
            return {"error": str(e)}

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
            self.get_code_metrics(),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Organize results
        self.results = {
            "monoliths": (
                results[0]
                if not isinstance(results[0], Exception)
                else {"error": str(results[0])}
            ),
            "development_tools": (
                results[1]
                if not isinstance(results[1], Exception)
                else {"error": str(results[1])}
            ),
            "mcp_tools": (
                results[2]
                if not isinstance(results[2], Exception)
                else {"error": str(results[2])}
            ),
            "validation_tools": (
                results[3]
                if not isinstance(results[3], Exception)
                else {"error": str(results[3])}
            ),
            "code_metrics": (
                results[4]
                if not isinstance(results[4], Exception)
                else {"error": str(results[4])}
            ),
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

        print("\n🦊 *whiskers twitch with satisfaction* Scan complete!")
        print("💡 Use this information to understand your development ecosystem")


async def main():
    """Main entry point"""
    scanner = ChangelogScanner()

    try:
        await scanner.initialize()
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
