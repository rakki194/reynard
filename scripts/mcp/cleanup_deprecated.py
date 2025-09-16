#!/usr/bin/env python3
"""
Deprecated Code Cleanup Script
==============================

This script identifies and helps fix deprecated patterns in the MCP server.
Run this to modernize the codebase and remove outdated practices.
"""

import ast
import logging
import os
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Set

logger = logging.getLogger(__name__)


class DeprecationScanner:
    """Scans for deprecated patterns in Python code."""
    
    def __init__(self, root_dir: str = "."):
        self.root_dir = Path(root_dir)
        self.issues: Dict[str, List[str]] = {}
        
    def scan_all(self) -> Dict[str, List[str]]:
        """Scan all Python files for deprecated patterns."""
        logger.info("🔍 Scanning for deprecated patterns...")
        
        python_files = list(self.root_dir.rglob("*.py"))
        logger.info(f"Found {len(python_files)} Python files to scan")
        
        for file_path in python_files:
            if self._should_skip_file(file_path):
                continue
                
            self._scan_file(file_path)
            
        return self.issues
    
    def _should_skip_file(self, file_path: Path) -> bool:
        """Skip certain files that shouldn't be scanned."""
        skip_patterns = [
            "__pycache__",
            ".git",
            "node_modules",
            ".venv",
            "venv",
            "build",
            "dist"
        ]
        
        return any(pattern in str(file_path) for pattern in skip_patterns)
    
    def _scan_file(self, file_path: Path) -> None:
        """Scan a single Python file for deprecated patterns."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check for various deprecated patterns
            self._check_deprecated_imports(file_path, content)
            self._check_print_statements(file_path, content)
            self._check_old_string_formatting(file_path, content)
            self._check_broad_exceptions(file_path, content)
            self._check_old_typing(file_path, content)
            
        except Exception as e:
            logger.warning(f"Could not scan {file_path}: {e}")
    
    def _check_deprecated_imports(self, file_path: Path, content: str) -> None:
        """Check for deprecated import patterns."""
        if "__import__(" in content:
            self._add_issue(file_path, "Uses deprecated __import__() function")
            
        # Check for actual wildcard imports (not just the string in comments)
        if re.search(r'^from\s+\w+\s+import\s+\*', content, re.MULTILINE):
            self._add_issue(file_path, "Uses wildcard imports (import *)")
    
    def _check_print_statements(self, file_path: Path, content: str) -> None:
        """Check for print statements that should be logging."""
        print_matches = re.findall(r'print\s*\(', content)
        if print_matches and "test" not in str(file_path).lower():
            self._add_issue(file_path, f"Contains {len(print_matches)} print statements (should use logging)")
    
    def _check_old_string_formatting(self, file_path: Path, content: str) -> None:
        """Check for old-style string formatting."""
        old_format_patterns = [
            r'\.format\(',
            r'%[sd]',
            r'%[rf]'
        ]
        
        for pattern in old_format_patterns:
            matches = re.findall(pattern, content)
            if matches:
                self._add_issue(file_path, f"Uses old-style string formatting ({len(matches)} instances)")
                break
    
    def _check_broad_exceptions(self, file_path: Path, content: str) -> None:
        """Check for overly broad exception handling."""
        broad_exceptions = [
            r'except\s*Exception\s*:',
            r'except\s*:',
        ]
        
        for pattern in broad_exceptions:
            matches = re.findall(pattern, content)
            if matches:
                self._add_issue(file_path, f"Uses broad exception handling ({len(matches)} instances)")
                break
    
    def _check_old_typing(self, file_path: Path, content: str) -> None:
        """Check for old-style typing annotations."""
        old_typing_patterns = [
            r'from typing import.*Union',
            r'Optional\[.*\]',
            r'List\[.*\]',
            r'Dict\[.*\]'
        ]
        
        for pattern in old_typing_patterns:
            matches = re.findall(pattern, content)
            if matches:
                self._add_issue(file_path, f"Uses old-style typing annotations ({len(matches)} instances)")
                break
    
    def _add_issue(self, file_path: Path, issue: str) -> None:
        """Add an issue to the results."""
        file_str = str(file_path)
        if file_str not in self.issues:
            self.issues[file_str] = []
        self.issues[file_str].append(issue)
    
    def generate_report(self) -> str:
        """Generate a comprehensive deprecation report."""
        if not self.issues:
            return "✅ No deprecated patterns found!"
        
        report = ["🚨 DEPRECATED CODE ANALYSIS REPORT", "=" * 50, ""]
        
        total_files = len(self.issues)
        total_issues = sum(len(issues) for issues in self.issues.values())
        
        report.append(f"📊 Summary:")
        report.append(f"   Files with issues: {total_files}")
        report.append(f"   Total issues found: {total_issues}")
        report.append("")
        
        # Group by issue type
        issue_types: Dict[str, List[str]] = {}
        for file_path, issues in self.issues.items():
            for issue in issues:
                issue_type = issue.split(":")[0] if ":" in issue else issue
                if issue_type not in issue_types:
                    issue_types[issue_type] = []
                issue_types[issue_type].append(file_path)
        
        report.append("📋 Issues by Type:")
        for issue_type, files in sorted(issue_types.items()):
            report.append(f"   {issue_type}: {len(files)} files")
        report.append("")
        
        # Detailed file-by-file report
        report.append("📁 Detailed Report:")
        for file_path, issues in sorted(self.issues.items()):
            report.append(f"\n🔸 {file_path}")
            for issue in issues:
                report.append(f"   • {issue}")
        
        return "\n".join(report)


def main():
    """Main function to run the deprecation scanner."""
    logging.basicConfig(level=logging.INFO)
    
    scanner = DeprecationScanner(".")
    issues = scanner.scan_all()
    
    report = scanner.generate_report()
    print(report)
    
    # Save report to file
    with open("deprecation_report.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    print(f"\n📄 Full report saved to: deprecation_report.txt")
    
    if issues:
        print(f"\n🔧 Next steps:")
        print(f"   1. Review the report above")
        print(f"   2. Fix deprecated patterns file by file")
        print(f"   3. Run tests to ensure nothing breaks")
        print(f"   4. Re-run this scanner to verify fixes")
        return 1
    else:
        print(f"\n🎉 No deprecated patterns found! Your code is modern and clean.")
        return 0


if __name__ == "__main__":
    exit(main())
