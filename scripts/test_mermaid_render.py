#!/usr/bin/env python3
"""
Test Mermaid Diagram Rendering

This script tests if the generated mermaid diagram can be rendered correctly.
"""

import re
import sys


def extract_mermaid_diagram(file_path: str) -> str:
    """Extract mermaid diagram from markdown file."""
    with open(file_path, encoding="utf-8") as f:
        content = f.read()

    # Find mermaid code block
    mermaid_match = re.search(r"```mermaid\n(.*?)\n```", content, re.DOTALL)
    if mermaid_match:
        return mermaid_match.group(1)

    return ""


def test_mermaid_syntax(diagram_content: str) -> bool:
    """Test if mermaid diagram has valid syntax by checking basic patterns."""
    lines = diagram_content.strip().split("\n")

    # Check for basic structure
    has_graph_declaration = any(line.strip().startswith("graph") for line in lines)
    has_connections = any("-->" in line for line in lines)
    has_proper_quotes = True

    # Check for quote balance
    for line in lines:
        if '"' in line and not line.strip().startswith("style"):
            quote_count = line.count('"')
            if quote_count % 2 != 0:
                has_proper_quotes = False
                break

    return has_graph_declaration and has_connections and has_proper_quotes


def main():
    """Test the generated mermaid diagram."""
    if len(sys.argv) != 2:
        print("Usage: python test_mermaid_render.py <markdown_file>")
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        # Extract mermaid diagram
        diagram_content = extract_mermaid_diagram(file_path)

        if not diagram_content:
            print("❌ No mermaid diagram found in file")
            sys.exit(1)

        print("🔍 Testing mermaid diagram syntax...")

        # Test basic syntax
        if test_mermaid_syntax(diagram_content):
            print("✅ Mermaid diagram syntax is valid")
        else:
            print("❌ Mermaid diagram has syntax issues")
            sys.exit(1)

        # Count nodes and connections
        lines = diagram_content.strip().split("\n")
        connections = [
            line
            for line in lines
            if "-->" in line and not line.strip().startswith("style")
        ]
        style_lines = [line for line in lines if line.strip().startswith("style")]

        print("📊 Diagram statistics:")
        print(f"  - Connections: {len(connections)}")
        print(f"  - Style rules: {len(style_lines)}")
        print(f"  - Total lines: {len(lines)}")

        # Check for common issues
        issues = []

        # Check for unclosed quotes
        for i, line in enumerate(lines, 1):
            if '"' in line and not line.strip().startswith("style"):
                quote_count = line.count('"')
                if quote_count % 2 != 0:
                    issues.append(f"Line {i}: Unclosed quotes")

        # Check for very long lines
        for i, line in enumerate(lines, 1):
            if len(line) > 200:
                issues.append(f"Line {i}: Very long line ({len(line)} chars)")

        if issues:
            print("\n⚠️  Potential issues:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print("\n✅ No syntax issues detected")

        print("\n🎉 Mermaid diagram appears to be valid and renderable!")

    except Exception as e:
        print(f"❌ Error testing diagram: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
