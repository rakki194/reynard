#!/usr/bin/env python3
"""
🧪 Test Suite for Git Automation Tools

Comprehensive test suite for the Git automation MCP tools.
"""

import json
import os
import subprocess
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

import pytest

# Import the tools we're testing
from git_automation_tools import GitAutomationTools


class TestGitAutomationTools:
    """Test suite for GitAutomationTools class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.tools = GitAutomationTools()
        self.temp_dir = tempfile.mkdtemp()
        self.original_cwd = os.getcwd()
        os.chdir(self.temp_dir)

    def teardown_method(self):
        """Clean up test fixtures."""
        os.chdir(self.original_cwd)
        # Clean up temp directory
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    @patch('subprocess.run')
    def test_detect_junk_files_success(self, mock_run):
        """Test successful junk file detection."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "hasJunk": False,
            "totalFiles": 0,
            "categories": [],
            "recommendations": ["✅ Repository is clean - no junk files detected"]
        })
        mock_run.return_value = mock_result

        result = self.tools.detect_junk_files(working_dir=".")

        assert result["success"] is True
        assert result["hasJunk"] is False
        assert result["totalFiles"] == 0
        assert result["categories"] == []
        mock_run.assert_called_once()

    @patch('subprocess.run')
    def test_detect_junk_files_with_junk(self, mock_run):
        """Test junk file detection with junk files found."""
        # Mock subprocess call with junk files
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "hasJunk": True,
            "totalFiles": 3,
            "categories": [
                {
                    "category": "python",
                    "files": ["__pycache__/module.pyc", "venv/lib/", ".pytest_cache/"],
                    "count": 3
                }
            ],
            "recommendations": ["🔧 Recommended actions:"]
        })
        mock_run.return_value = mock_result

        result = self.tools.detect_junk_files(working_dir=".")

        assert result["success"] is True
        assert result["hasJunk"] is True
        assert result["totalFiles"] == 3
        assert len(result["categories"]) == 1
        assert result["categories"][0]["category"] == "python"

    @patch('subprocess.run')
    def test_detect_junk_files_error(self, mock_run):
        """Test junk file detection with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.detect_junk_files(working_dir=".")

        assert result["success"] is False
        assert "error" in result

    @patch('subprocess.run')
    def test_analyze_changes_success(self, mock_run):
        """Test successful change analysis."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "totalFiles": 2,
            "totalAdditions": 15,
            "totalDeletions": 3,
            "categories": [
                {
                    "type": "feature",
                    "files": [
                        {"file": "src/components/Button.tsx", "status": "added"},
                        {"file": "src/components/Modal.tsx", "status": "added"}
                    ],
                    "impact": "medium",
                    "description": "New features and capabilities (2 files)"
                }
            ],
            "versionBumpType": "minor",
            "hasBreakingChanges": False,
            "securityChanges": False,
            "performanceChanges": False
        })
        mock_run.return_value = mock_result

        result = self.tools.analyze_changes(working_dir=".")

        assert result["success"] is True
        assert result["totalFiles"] == 2
        assert result["totalAdditions"] == 15
        assert result["totalDeletions"] == 3
        assert result["versionBumpType"] == "minor"
        assert len(result["categories"]) == 1
        assert result["categories"][0]["type"] == "feature"

    @patch('subprocess.run')
    def test_analyze_changes_error(self, mock_run):
        """Test change analysis with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.analyze_changes(working_dir=".")

        assert result["success"] is False
        assert "error" in result

    @patch('subprocess.run')
    def test_generate_commit_message_success(self, mock_run):
        """Test successful commit message generation."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "type": "feat",
            "scope": "components",
            "description": "add new features and capabilities",
            "body": "Detailed description of changes",
            "footer": "Version bump: minor",
            "fullMessage": "feat(components): add new features and capabilities\n\nDetailed description of changes\n\nVersion bump: minor"
        })
        mock_run.return_value = mock_result

        result = self.tools.generate_commit_message(working_dir=".")

        assert result["success"] is True
        assert result["type"] == "feat"
        assert result["scope"] == "components"
        assert result["description"] == "add new features and capabilities"
        assert result["fullMessage"].startswith("feat(components):")

    @patch('subprocess.run')
    def test_generate_commit_message_error(self, mock_run):
        """Test commit message generation with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.generate_commit_message(working_dir=".")

        assert result["success"] is False
        assert "error" in result

    @patch('subprocess.run')
    def test_manage_changelog_success(self, mock_run):
        """Test successful changelog management."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "action": "promote_unreleased",
            "version": "1.3.0",
            "date": "2024-02-01",
            "entriesPromoted": 3
        })
        mock_run.return_value = mock_result

        result = self.tools.manage_changelog(
            action="promote_unreleased",
            version="1.3.0",
            date="2024-02-01",
            working_dir="."
        )

        assert result["success"] is True
        assert result["action"] == "promote_unreleased"
        assert result["version"] == "1.3.0"
        assert result["entriesPromoted"] == 3

    @patch('subprocess.run')
    def test_manage_changelog_error(self, mock_run):
        """Test changelog management with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.manage_changelog(
            action="promote_unreleased",
            version="1.3.0",
            date="2024-02-01",
            working_dir="."
        )

        assert result["success"] is False
        assert "error" in result

    @patch('subprocess.run')
    def test_manage_version_success(self, mock_run):
        """Test successful version management."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "action": "update_version",
            "currentVersion": "1.2.3",
            "nextVersion": "1.3.0",
            "bumpType": "minor",
            "tagCreated": True,
            "tagPushed": True
        })
        mock_run.return_value = mock_result

        result = self.tools.manage_version(
            action="update_version",
            bump_type="minor",
            create_tag=True,
            push_tag=True,
            working_dir="."
        )

        assert result["success"] is True
        assert result["action"] == "update_version"
        assert result["currentVersion"] == "1.2.3"
        assert result["nextVersion"] == "1.3.0"
        assert result["bumpType"] == "minor"
        assert result["tagCreated"] is True
        assert result["tagPushed"] is True

    @patch('subprocess.run')
    def test_manage_version_error(self, mock_run):
        """Test version management with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.manage_version(
            action="update_version",
            bump_type="minor",
            create_tag=True,
            push_tag=True,
            working_dir="."
        )

        assert result["success"] is False
        assert "error" in result

    @patch('subprocess.run')
    def test_execute_workflow_success(self, mock_run):
        """Test successful workflow execution."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "dryRun": False,
            "autoConfirm": True,
            "junkDetection": {
                "hasJunk": False,
                "totalFiles": 0,
                "categories": [],
                "recommendations": ["✅ Repository is clean - no junk files detected"]
            },
            "changeAnalysis": {
                "totalFiles": 2,
                "totalAdditions": 15,
                "totalDeletions": 3,
                "categories": [
                    {
                        "type": "feature",
                        "files": [
                            {"file": "src/components/Button.tsx", "status": "added"},
                            {"file": "src/components/Modal.tsx", "status": "added"}
                        ],
                        "impact": "medium",
                        "description": "New features and capabilities (2 files)"
                    }
                ],
                "versionBumpType": "minor",
                "hasBreakingChanges": False,
                "securityChanges": False,
                "performanceChanges": False
            },
            "commitMessage": {
                "type": "feat",
                "scope": "components",
                "description": "add new features and capabilities",
                "body": "Detailed description of changes",
                "footer": "Version bump: minor",
                "fullMessage": "feat(components): add new features and capabilities\n\nDetailed description of changes\n\nVersion bump: minor"
            },
            "versionInfo": {
                "currentVersion": "1.2.3",
                "nextVersion": "1.3.0",
                "bumpType": "minor"
            },
            "actionsPerformed": [
                "junk_detection",
                "change_analysis",
                "commit_message_generation",
                "version_update",
                "changelog_promotion",
                "git_tag_creation",
                "git_tag_push"
            ]
        })
        mock_run.return_value = mock_result

        result = self.tools.execute_workflow(
            auto_confirm=True,
            dry_run=False,
            cleanup_junk=False,
            create_tag=True,
            push_tag=True,
            working_dir="."
        )

        assert result["success"] is True
        assert result["dryRun"] is False
        assert result["autoConfirm"] is True
        assert result["junkDetection"]["hasJunk"] is False
        assert result["changeAnalysis"]["totalFiles"] == 2
        assert result["commitMessage"]["type"] == "feat"
        assert result["versionInfo"]["nextVersion"] == "1.3.0"
        assert len(result["actionsPerformed"]) == 7

    @patch('subprocess.run')
    def test_execute_workflow_error(self, mock_run):
        """Test workflow execution with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.execute_workflow(
            auto_confirm=True,
            dry_run=False,
            cleanup_junk=False,
            create_tag=True,
            push_tag=True,
            working_dir="."
        )

        assert result["success"] is False
        assert "error" in result

    @patch('subprocess.run')
    def test_quick_workflow_success(self, mock_run):
        """Test successful quick workflow execution."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "dryRun": False,
            "autoConfirm": True,
            "junkDetection": {
                "hasJunk": False,
                "totalFiles": 0,
                "categories": [],
                "recommendations": ["✅ Repository is clean - no junk files detected"]
            },
            "changeAnalysis": {
                "totalFiles": 1,
                "totalAdditions": 5,
                "totalDeletions": 2,
                "categories": [
                    {
                        "type": "fix",
                        "files": [{"file": "src/utils/helper.ts", "status": "modified"}],
                        "impact": "medium",
                        "description": "Bug fixes and issue resolution (1 files)"
                    }
                ],
                "versionBumpType": "patch",
                "hasBreakingChanges": False,
                "securityChanges": False,
                "performanceChanges": False
            },
            "commitMessage": {
                "type": "fix",
                "scope": "utils",
                "description": "fix bugs and resolve issues",
                "body": None,
                "footer": None,
                "fullMessage": "fix(utils): fix bugs and resolve issues"
            },
            "versionInfo": {
                "currentVersion": "1.2.3",
                "nextVersion": "1.2.4",
                "bumpType": "patch"
            },
            "actionsPerformed": [
                "junk_detection",
                "change_analysis",
                "commit_message_generation",
                "version_update",
                "changelog_promotion",
                "git_tag_creation",
                "git_tag_push"
            ]
        })
        mock_run.return_value = mock_result

        result = self.tools.quick_workflow(working_dir=".")

        assert result["success"] is True
        assert result["autoConfirm"] is True
        assert result["junkDetection"]["hasJunk"] is False
        assert result["changeAnalysis"]["totalFiles"] == 1
        assert result["commitMessage"]["type"] == "fix"
        assert result["versionInfo"]["nextVersion"] == "1.2.4"

    @patch('subprocess.run')
    def test_quick_workflow_error(self, mock_run):
        """Test quick workflow execution with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.quick_workflow(working_dir=".")

        assert result["success"] is False
        assert "error" in result

    @patch('subprocess.run')
    def test_get_workflow_status_success(self, mock_run):
        """Test successful workflow status retrieval."""
        # Mock successful subprocess call
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "workingDirectory": ".",
            "components": [
                "JunkFileDetector",
                "ChangeAnalyzer",
                "CommitMessageGenerator",
                "ChangelogManager",
                "VersionManager"
            ],
            "capabilities": [
                "junk_file_detection",
                "change_analysis",
                "commit_message_generation",
                "changelog_management",
                "version_management",
                "git_tag_management"
            ]
        })
        mock_run.return_value = mock_result

        result = self.tools.get_workflow_status(working_dir=".")

        assert result["success"] is True
        assert result["workingDirectory"] == "."
        assert len(result["components"]) == 5
        assert "JunkFileDetector" in result["components"]
        assert "ChangeAnalyzer" in result["components"]
        assert len(result["capabilities"]) == 6
        assert "junk_file_detection" in result["capabilities"]
        assert "change_analysis" in result["capabilities"]

    @patch('subprocess.run')
    def test_get_workflow_status_error(self, mock_run):
        """Test workflow status retrieval with error."""
        # Mock subprocess call with error
        mock_run.side_effect = subprocess.CalledProcessError(1, "npx")

        result = self.tools.get_workflow_status(working_dir=".")

        assert result["success"] is False
        assert "error" in result

    def test_validate_working_directory(self):
        """Test working directory validation."""
        # Test with valid directory
        result = self.tools._validate_working_directory(".")
        assert result is True

        # Test with invalid directory
        result = self.tools._validate_working_directory("/nonexistent/directory")
        assert result is False

    def test_build_command_args(self):
        """Test command argument building."""
        # Test basic command
        args = self.tools._build_command_args("detect-junk", {})
        assert args == ["npx", "reynard-git", "detect-junk"]

        # Test command with options
        args = self.tools._build_command_args("detect-junk", {"cleanup": True})
        assert args == ["npx", "reynard-git", "detect-junk", "--cleanup"]

        # Test command with working directory
        args = self.tools._build_command_args("detect-junk", {}, working_dir="/test")
        assert args == ["npx", "reynard-git", "detect-junk", "--working-dir", "/test"]

    def test_parse_json_response(self):
        """Test JSON response parsing."""
        # Test valid JSON
        valid_json = '{"success": true, "data": "test"}'
        result = self.tools._parse_json_response(valid_json)
        assert result["success"] is True
        assert result["data"] == "test"

        # Test invalid JSON
        invalid_json = '{"success": true, "data": "test"'
        result = self.tools._parse_json_response(invalid_json)
        assert result["success"] is False
        assert "error" in result

    def test_handle_subprocess_error(self):
        """Test subprocess error handling."""
        # Test CalledProcessError
        error = subprocess.CalledProcessError(1, "npx", "Command failed")
        result = self.tools._handle_subprocess_error(error)
        assert result["success"] is False
        assert "error" in result

        # Test FileNotFoundError
        error = FileNotFoundError("Command not found")
        result = self.tools._handle_subprocess_error(error)
        assert result["success"] is False
        assert "error" in result

        # Test generic Exception
        error = Exception("Generic error")
        result = self.tools._handle_subprocess_error(error)
        assert result["success"] is False
        assert "error" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
