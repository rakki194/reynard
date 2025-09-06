"""
Git tools for the yipyap assistant.

This module provides git-related tools that allow the assistant to perform
version control operations on datasets including status checking, staging,
committing, branching, and repository management.
"""

import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from .base import BaseTool, ToolParameter, ToolResult, ToolExecutionContext, ParameterType
from .decorators import tool

logger = logging.getLogger(__name__)

def get_git_manager():
    """Get git manager without circular imports."""
    # Import here to avoid circular dependency
    from ..main import get_git_manager as _get_git_manager
    return _get_git_manager()


@tool(
    name="git_status",
    description="Get the current git status of a dataset directory including staged, modified, and untracked files",
    category="git", 
    tags=["git", "status", "repository"],
    required_permission="read",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory relative to the root",
            "required": True
        }
    }
)
async def git_status_tool(dataset_path: str) -> Dict[str, Any]:
    """Get comprehensive git status for a dataset directory."""
    try:
        git_manager = get_git_manager()
        status = git_manager.get_status(dataset_path)
        
        return {
            "is_repository": status.is_repository,
            "branch_name": status.branch_name,
            "is_dirty": status.is_dirty,
            "untracked_files": status.untracked_files,
            "modified_files": status.modified_files,
            "staged_files": status.staged_files,
            "commits_ahead": status.commits_ahead,
            "commits_behind": status.commits_behind,
            "last_commit": status.last_commit,
            "summary": _generate_status_summary(status)
        }
    except Exception as e:
        logger.error(f"Error getting git status for {dataset_path}: {e}")
        raise


@tool(
    name="git_init",
    description="Initialize a new git repository in a dataset directory with proper .gitignore and LFS setup",
    category="git",
    tags=["git", "init", "repository", "setup"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string", 
            "description": "Path to the dataset directory where the repository will be initialized",
            "required": True
        }
    }
)
async def git_init_tool(dataset_path: str) -> Dict[str, Any]:
    """Initialize a new git repository in the specified dataset directory."""
    try:
        git_manager = get_git_manager()
        success = git_manager.initialize_repository(dataset_path)
        
        if success:
            return {
                "success": True,
                "message": f"Successfully initialized git repository in {dataset_path}",
                "repository_path": dataset_path
            }
        else:
            return {
                "success": False,
                "message": f"Failed to initialize git repository in {dataset_path}"
            }
    except Exception as e:
        logger.error(f"Error initializing git repository in {dataset_path}: {e}")
        raise


@tool(
    name="git_add",
    description="Stage specific files or all changes for the next commit",
    category="git",
    tags=["git", "add", "stage", "commit"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "files": {
            "type": "array",
            "description": "List of file paths to stage (relative to dataset directory). If empty, stages all changes",
            "required": False,
            "default": []
        },
        "all_files": {
            "type": "boolean",
            "description": "Whether to stage all modified and untracked files",
            "required": False,
            "default": False
        }
    }
)
async def git_add_tool(dataset_path: str, files: List[str] = None, all_files: bool = False) -> Dict[str, Any]:
    """Stage files for the next commit."""
    try:
        git_manager = get_git_manager()
        files = files or []
        
        if all_files or not files:
            success = git_manager.stage_all(dataset_path)
            message = "Staged all changes" if success else "Failed to stage all changes"
        else:
            success = git_manager.stage_files(dataset_path, files)
            message = f"Staged {len(files)} files" if success else f"Failed to stage {len(files)} files"
        
        return {
            "success": success,
            "message": message,
            "files_staged": files if files else "all",
            "dataset_path": dataset_path
        }
    except Exception as e:
        logger.error(f"Error staging files in {dataset_path}: {e}")
        raise


@tool(
    name="git_unstage",
    description="Unstage files that were previously added to the staging area",
    category="git",
    tags=["git", "unstage", "reset"],
    required_permission="write", 
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "files": {
            "type": "array",
            "description": "List of file paths to unstage. If empty, unstages all staged files",
            "required": False,
            "default": []
        },
        "all_files": {
            "type": "boolean",
            "description": "Whether to unstage all staged files",
            "required": False,
            "default": False
        }
    }
)
async def git_unstage_tool(dataset_path: str, files: List[str] = None, all_files: bool = False) -> Dict[str, Any]:
    """Unstage files from the staging area."""
    try:
        git_manager = get_git_manager()
        files = files or []
        
        if all_files or not files:
            success = git_manager.stage_all(dataset_path, unstage=True)
            message = "Unstaged all files" if success else "Failed to unstage all files"
        else:
            success = git_manager.stage_files(dataset_path, files, unstage=True)
            message = f"Unstaged {len(files)} files" if success else f"Failed to unstage {len(files)} files"
        
        return {
            "success": success,
            "message": message,
            "files_unstaged": files if files else "all",
            "dataset_path": dataset_path
        }
    except Exception as e:
        logger.error(f"Error unstaging files in {dataset_path}: {e}")
        raise


@tool(
    name="git_commit",
    description="Commit staged changes with a descriptive message",
    category="git",
    tags=["git", "commit", "save"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "message": {
            "type": "string",
            "description": "Commit message describing the changes",
            "required": True,
            "min_length": 1,
            "max_length": 500
        },
        "author_name": {
            "type": "string", 
            "description": "Name of the commit author",
            "required": False,
            "default": "YipYap Assistant"
        },
        "author_email": {
            "type": "string",
            "description": "Email of the commit author", 
            "required": False,
            "default": "assistant@yipyap.local"
        }
    }
)
async def git_commit_tool(
    dataset_path: str, 
    message: str, 
    author_name: str = "YipYap Assistant",
    author_email: str = "assistant@yipyap.local"
) -> Dict[str, Any]:
    """Commit staged changes with the specified message."""
    try:
        git_manager = get_git_manager()
        success = git_manager.commit_changes(dataset_path, message, author_name, author_email)
        
        if success:
            return {
                "success": True,
                "message": f"Successfully committed changes: {message}",
                "commit_message": message,
                "author": f"{author_name} <{author_email}>",
                "dataset_path": dataset_path
            }
        else:
            return {
                "success": False,
                "message": "Failed to commit changes (no staged changes or repository error)",
                "dataset_path": dataset_path
            }
    except Exception as e:
        logger.error(f"Error committing changes in {dataset_path}: {e}")
        raise


@tool(
    name="git_branches",
    description="List all branches in the repository with their commit information",
    category="git", 
    tags=["git", "branch", "list"],
    required_permission="read",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        }
    }
)
async def git_branches_tool(dataset_path: str) -> Dict[str, Any]:
    """Get list of all branches in the repository."""
    try:
        git_manager = get_git_manager()
        branches = git_manager.get_branches(dataset_path)
        
        branch_data = []
        current_branch = None
        
        for branch in branches:
            branch_info = {
                "name": branch.name,
                "is_current": branch.is_current,
                "is_remote": branch.is_remote,
                "last_commit": None
            }
            
            if branch.is_current:
                current_branch = branch.name
            
            if branch.last_commit:
                branch_info["last_commit"] = {
                    "hash": branch.last_commit.hash,
                    "short_hash": branch.last_commit.short_hash,
                    "message": branch.last_commit.message,
                    "author_name": branch.last_commit.author_name,
                    "author_email": branch.last_commit.author_email,
                    "timestamp": branch.last_commit.timestamp.isoformat(),
                    "files_changed": branch.last_commit.files_changed
                }
            
            branch_data.append(branch_info)
        
        return {
            "branches": branch_data,
            "current_branch": current_branch,
            "total_branches": len(branch_data),
            "dataset_path": dataset_path
        }
    except Exception as e:
        logger.error(f"Error getting branches for {dataset_path}: {e}")
        raise


@tool(
    name="git_create_branch",
    description="Create a new branch and optionally switch to it",
    category="git",
    tags=["git", "branch", "create", "new"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "branch_name": {
            "type": "string",
            "description": "Name of the new branch to create",
            "required": True,
            "min_length": 1,
            "max_length": 100,
            "pattern": r"^[a-zA-Z0-9\-_./]+$"
        },
        "switch_to": {
            "type": "boolean",
            "description": "Whether to switch to the new branch after creation",
            "required": False,
            "default": True
        }
    }
)
async def git_create_branch_tool(dataset_path: str, branch_name: str, switch_to: bool = True) -> Dict[str, Any]:
    """Create a new branch and optionally switch to it."""
    try:
        git_manager = get_git_manager()
        success = git_manager.create_branch(dataset_path, branch_name, switch_to)
        
        if success:
            action = "created and switched to" if switch_to else "created"
            return {
                "success": True,
                "message": f"Successfully {action} branch '{branch_name}'",
                "branch_name": branch_name,
                "switched": switch_to,
                "dataset_path": dataset_path
            }
        else:
            return {
                "success": False,
                "message": f"Failed to create branch '{branch_name}'",
                "branch_name": branch_name,
                "dataset_path": dataset_path
            }
    except Exception as e:
        logger.error(f"Error creating branch {branch_name} in {dataset_path}: {e}")
        raise


@tool(
    name="git_switch_branch", 
    description="Switch to an existing branch",
    category="git",
    tags=["git", "branch", "switch", "checkout"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "branch_name": {
            "type": "string",
            "description": "Name of the branch to switch to",
            "required": True,
            "min_length": 1,
            "max_length": 100
        }
    }
)
async def git_switch_branch_tool(dataset_path: str, branch_name: str) -> Dict[str, Any]:
    """Switch to an existing branch."""
    try:
        git_manager = get_git_manager()
        success = git_manager.switch_branch(dataset_path, branch_name)
        
        if success:
            return {
                "success": True,
                "message": f"Successfully switched to branch '{branch_name}'",
                "branch_name": branch_name,
                "dataset_path": dataset_path
            }
        else:
            return {
                "success": False,
                "message": f"Failed to switch to branch '{branch_name}' (branch may not exist)",
                "branch_name": branch_name,
                "dataset_path": dataset_path
            }
    except Exception as e:
        logger.error(f"Error switching to branch {branch_name} in {dataset_path}: {e}")
        raise


@tool(
    name="git_history",
    description="Get the commit history for the repository",
    category="git",
    tags=["git", "history", "log", "commits"],
    required_permission="read",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "limit": {
            "type": "integer",
            "description": "Maximum number of commits to return",
            "required": False,
            "default": 20,
            "min_value": 1,
            "max_value": 100
        }
    }
)
async def git_history_tool(dataset_path: str, limit: int = 20) -> Dict[str, Any]:
    """Get commit history for the repository."""
    try:
        git_manager = get_git_manager()
        commits = git_manager.get_commit_history(dataset_path, limit)
        
        commit_data = []
        for commit in commits:
            commit_data.append({
                "hash": commit.hash,
                "short_hash": commit.short_hash,
                "message": commit.message,
                "author_name": commit.author_name,
                "author_email": commit.author_email,
                "timestamp": commit.timestamp.isoformat(),
                "files_changed": commit.files_changed
            })
        
        return {
            "commits": commit_data,
            "total_commits": len(commit_data),
            "limit": limit,
            "dataset_path": dataset_path
        }
    except Exception as e:
        logger.error(f"Error getting commit history for {dataset_path}: {e}")
        raise


@tool(
    name="git_revert",
    description="Revert modified files back to their last committed state",
    category="git",
    tags=["git", "revert", "undo", "reset"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "files": {
            "type": "array",
            "description": "List of file paths to revert (relative to dataset directory)",
            "required": True
        }
    }
)
async def git_revert_tool(dataset_path: str, files: List[str]) -> Dict[str, Any]:
    """Revert modified files back to their last committed state."""
    try:
        git_manager = get_git_manager()
        success = git_manager.revert_files(dataset_path, files)
        
        if success:
            return {
                "success": True,
                "message": f"Successfully reverted {len(files)} files to their last committed state",
                "files_reverted": files,
                "dataset_path": dataset_path
            }
        else:
            return {
                "success": False,
                "message": f"Failed to revert files (repository may not have commits)",
                "files": files,
                "dataset_path": dataset_path
            }
    except Exception as e:
        logger.error(f"Error reverting files in {dataset_path}: {e}")
        raise


@tool(
    name="git_delete_untracked",
    description="Delete untracked files from the repository",
    category="git",
    tags=["git", "delete", "untracked", "clean"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        },
        "file_path": {
            "type": "string",
            "description": "Path to the untracked file to delete (relative to dataset directory)",
            "required": True
        }
    }
)
async def git_delete_untracked_tool(dataset_path: str, file_path: str) -> Dict[str, Any]:
    """Delete an untracked file from the repository."""
    try:
        git_manager = get_git_manager()
        success = git_manager.delete_file(dataset_path, file_path)
        
        if success:
            return {
                "success": True,
                "message": f"Successfully deleted untracked file: {file_path}",
                "file_path": file_path,
                "dataset_path": dataset_path
            }
        else:
            return {
                "success": False,
                "message": f"Failed to delete file: {file_path} (file may not exist or is not untracked)",
                "file_path": file_path,
                "dataset_path": dataset_path
            }
    except Exception as e:
        logger.error(f"Error deleting file {file_path} in {dataset_path}: {e}")
        raise


@tool(
    name="git_lfs_update",
    description="Update Git LFS (Large File Storage) settings for the repository",
    category="git",
    tags=["git", "lfs", "large files", "config"],
    required_permission="write",
    parameters={
        "dataset_path": {
            "type": "string",
            "description": "Path to the dataset directory",
            "required": True
        }
    }
)
async def git_lfs_update_tool(dataset_path: str) -> Dict[str, Any]:
    """Update Git LFS settings for the repository."""
    try:
        git_manager = get_git_manager()
        success = git_manager.update_lfs_settings(dataset_path)
        
        if success:
            return {
                "success": True,
                "message": "Successfully updated Git LFS settings",
                "dataset_path": dataset_path
            }
        else:
            return {
                "success": False,
                "message": "Failed to update Git LFS settings (Git LFS may not be available)",
                "dataset_path": dataset_path
            }
    except Exception as e:
        logger.error(f"Error updating Git LFS settings for {dataset_path}: {e}")
        raise


def _generate_status_summary(status) -> str:
    """Generate a human-readable summary of the git status."""
    if not status.is_repository:
        return "Not a git repository"
    
    if not status.is_dirty:
        return f"Working directory clean on branch '{status.branch_name or 'unknown'}'"
    
    summary_parts = []
    
    if status.staged_files:
        summary_parts.append(f"{len(status.staged_files)} staged")
    
    if status.modified_files:
        summary_parts.append(f"{len(status.modified_files)} modified")
    
    if status.untracked_files:
        summary_parts.append(f"{len(status.untracked_files)} untracked")
    
    files_summary = ", ".join(summary_parts)
    branch_info = f"on branch '{status.branch_name or 'unknown'}'"
    
    return f"Working directory has changes ({files_summary}) {branch_info}" 