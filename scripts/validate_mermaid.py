#!/usr/bin/env python3
"""Mermaid Diagram Validator

This script validates mermaid diagrams for common syntax issues.
"""

import re
import sys


class MermaidValidator:
    """Validates mermaid diagram syntax."""

    def __init__(self):
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def validate_diagram(
        self,
        diagram_content: str,
    ) -> tuple[bool, list[str], list[str]]:
        """Validate a mermaid diagram and return validation results."""
        self.errors = []
        self.warnings = []

        lines = diagram_content.strip().split("\n")

        # Remove mermaid code block markers
        if lines[0].startswith("```mermaid"):
            lines = lines[1:]
        if lines[-1].startswith("```"):
            lines = lines[:-1]

        # Check for basic structure
        self._check_basic_structure(lines)

        # Check for syntax issues
        self._check_syntax_issues(lines)

        # Check for node naming issues
        self._check_node_naming(lines)

        # Check for style issues
        self._check_style_issues(lines)

        return len(self.errors) == 0, self.errors, self.warnings

    def _check_basic_structure(self, lines: list[str]):
        """Check for basic mermaid structure."""
        if not lines:
            self.errors.append("Empty diagram")
            return

        # Check for graph declaration
        if not any(line.strip().startswith("graph") for line in lines):
            self.errors.append("Missing graph declaration (graph TD, graph LR, etc.)")

        # Check for at least one connection
        connections = [line for line in lines if "-->" in line or "---" in line]
        if not connections:
            self.errors.append("No connections found in diagram")

    def _check_syntax_issues(self, lines: list[str]):
        """Check for common syntax issues."""
        for i, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith("style"):
                continue

            # Check for unclosed quotes in node labels
            if '"' in line:
                quote_count = line.count('"')
                if quote_count % 2 != 0:
                    self.errors.append(f"Line {i}: Unclosed quotes in node label")

            # Check for invalid characters in node IDs
            if "-->" in line:
                parts = line.split("-->")
                if len(parts) == 2:
                    left_node = parts[0].strip()
                    right_node = parts[1].strip()

                    # Check left node ID
                    if "[" in left_node or '"' in left_node:
                        node_id = left_node.split("[")[0].split('"')[0].strip()
                    else:
                        node_id = left_node

                    if not re.match(r"^[A-Za-z][A-Za-z0-9]*$", node_id):
                        self.warnings.append(
                            f"Line {i}: Node ID '{node_id}' may cause issues (use alphanumeric only)",
                        )

                    # Check right node ID
                    if "[" in right_node or '"' in right_node:
                        node_id = right_node.split("[")[0].split('"')[0].strip()
                    else:
                        node_id = right_node

                    if not re.match(r"^[A-Za-z][A-Za-z0-9]*$", node_id):
                        self.warnings.append(
                            f"Line {i}: Node ID '{node_id}' may cause issues (use alphanumeric only)",
                        )

    def _check_node_naming(self, lines: list[str]):
        """Check for node naming issues."""
        node_ids = set()

        for i, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith("style"):
                continue

            # Extract node IDs
            if "-->" in line:
                parts = line.split("-->")
                for part in parts:
                    part = part.strip()
                    if "[" in part or '"' in part:
                        node_id = part.split("[")[0].split('"')[0].strip()
                    else:
                        node_id = part

                    if node_id and node_id not in ["graph", "TD", "LR", "RL", "BT"]:
                        if node_id in node_ids:
                            self.warnings.append(
                                f"Line {i}: Duplicate node ID '{node_id}'",
                            )
                        node_ids.add(node_id)

    def _check_style_issues(self, lines: list[str]):
        """Check for style-related issues."""
        style_lines = [line for line in lines if line.strip().startswith("style")]
        node_ids = set()

        # Collect all node IDs
        for line in lines:
            line = line.strip()
            if not line or line.startswith("style"):
                continue

            if "-->" in line:
                parts = line.split("-->")
                for part in parts:
                    part = part.strip()
                    if "[" in part or '"' in part:
                        node_id = part.split("[")[0].split('"')[0].strip()
                    else:
                        node_id = part

                    if node_id and node_id not in ["graph", "TD", "LR", "RL", "BT"]:
                        node_ids.add(node_id)

        # Check style references
        for i, line in enumerate(lines, 1):
            if line.strip().startswith("style"):
                style_parts = line.strip().split()
                if len(style_parts) >= 2:
                    styled_node = style_parts[1]
                    if styled_node not in node_ids:
                        self.warnings.append(
                            f"Line {i}: Style references undefined node '{styled_node}'",
                        )


def extract_mermaid_from_markdown(file_path: str) -> str:
    """Extract mermaid diagram from markdown file."""
    with open(file_path, encoding="utf-8") as f:
        content = f.read()

    # Find mermaid code block
    mermaid_match = re.search(r"```mermaid\n(.*?)\n```", content, re.DOTALL)
    if mermaid_match:
        return mermaid_match.group(1)

    return ""


def main():
    """Main function to validate mermaid diagrams."""
    if len(sys.argv) != 2:
        print("Usage: python validate_mermaid.py <markdown_file>")
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        # Extract mermaid diagram
        diagram_content = extract_mermaid_from_markdown(file_path)

        if not diagram_content:
            print("❌ No mermaid diagram found in file")
            sys.exit(1)

        # Validate diagram
        validator = MermaidValidator()
        is_valid, errors, warnings = validator.validate_diagram(diagram_content)

        if is_valid:
            print("✅ Mermaid diagram is valid!")
        else:
            print("❌ Mermaid diagram has errors:")
            for error in errors:
                print(f"  - {error}")

        if warnings:
            print("\n⚠️  Warnings:")
            for warning in warnings:
                print(f"  - {warning}")

        if not is_valid:
            sys.exit(1)

    except Exception as e:
        print(f"❌ Error validating diagram: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
