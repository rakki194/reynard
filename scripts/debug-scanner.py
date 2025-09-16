#!/usr/bin/env python3
"""
🦊 Debug CHANGELOG.md Scanner
============================

Simple debug version to identify what's causing the hang.
"""

from pathlib import Path


def main():
    print("🦊 Debug scanner starting...")

    project_root = Path(__file__).parent.parent
    print(f"Project root: {project_root}")

    # Test basic file operations
    print("\n📁 Testing basic file operations...")

    # Check if key directories exist
    dirs_to_check = ["packages", "backend", "scripts", ".vscode"]
    for dir_name in dirs_to_check:
        dir_path = project_root / dir_name
        if dir_path.exists():
            print(f"✅ {dir_name}: exists")
            # Count files in directory
            try:
                file_count = len(list(dir_path.rglob("*")))
                print(f"   Files: {file_count}")
            except Exception as e:
                print(f"   Error counting files: {e}")
        else:
            print(f"❌ {dir_name}: not found")

    # Test simple file search
    print("\n🔍 Testing simple file search...")
    try:
        # Just look for Python files in scripts directory
        scripts_dir = project_root / "scripts"
        if scripts_dir.exists():
            py_files = list(scripts_dir.rglob("*.py"))
            print(f"Found {len(py_files)} Python files in scripts/")
            for i, file_path in enumerate(py_files[:5]):
                print(f"  {i + 1}. {file_path.relative_to(project_root)}")
        else:
            print("Scripts directory not found")
    except Exception as e:
        print(f"Error in file search: {e}")

    # Test MCP directory
    print("\n🛠️  Testing MCP directory...")
    mcp_dir = project_root / "scripts" / "mcp"
    if mcp_dir.exists():
        mcp_files = list(mcp_dir.rglob("*.py"))
        print(f"Found {len(mcp_files)} Python files in scripts/mcp/")
        for i, file_path in enumerate(mcp_files[:5]):
            print(f"  {i + 1}. {file_path.relative_to(project_root)}")
    else:
        print("MCP directory not found")

    # Test package.json files
    print("\n📦 Testing package.json files...")
    try:
        package_files = list(project_root.rglob("package.json"))
        print(f"Found {len(package_files)} package.json files")
        for i, file_path in enumerate(package_files[:5]):
            print(f"  {i + 1}. {file_path.relative_to(project_root)}")
    except Exception as e:
        print(f"Error finding package.json files: {e}")

    print("\n🦊 Debug scan complete!")


if __name__ == "__main__":
    main()
