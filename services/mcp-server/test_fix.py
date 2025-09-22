#!/usr/bin/env python3
"""
Test script to verify the FileAnalysisService fix.
"""

import asyncio
import sys
from pathlib import Path

# Add the MCP server directory to the path
mcp_dir = Path(__file__).parent
sys.path.insert(0, str(mcp_dir))

from services.file_analysis_service import FileAnalysisService


async def test_analyze_file_complexity():
    """Test the analyze_file_complexity method."""
    try:
        fa = FileAnalysisService()
        result = await fa.analyze_file_complexity('services/file_analysis_service.py')
        print("✅ Success: analyze_file_complexity method works!")
        print(f"Result keys: {list(result.keys())}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_analyze_file_complexity())
    sys.exit(0 if success else 1)
