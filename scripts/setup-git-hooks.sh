#!/bin/bash
#
# Setup Git Hooks for Reynard Projects
# 
# This script installs the CSS validation pre-commit hook across all Reynard projects.
# It can be run from the main Reynard directory or individual project directories.
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/pre-commit-hook"
VALIDATOR_SCRIPT="$SCRIPT_DIR/validate-css-variables.js"

echo -e "${BLUE}🔧 Setting up Git Hooks for Reynard Projects${NC}"
echo "=============================================="

# Check if required scripts exist
if [ ! -f "$HOOK_SCRIPT" ]; then
    echo -e "${RED}❌ Pre-commit hook script not found: $HOOK_SCRIPT${NC}"
    exit 1
fi

if [ ! -f "$VALIDATOR_SCRIPT" ]; then
    echo -e "${RED}❌ CSS validator script not found: $VALIDATOR_SCRIPT${NC}"
    exit 1
fi

# Function to setup hooks for a single project
setup_project_hooks() {
    local project_dir="$1"
    local project_name=$(basename "$project_dir")
    
    echo -e "${BLUE}📁 Setting up hooks for: $project_name${NC}"
    
    # Check if it's a git repository
    if [ ! -d "$project_dir/.git" ]; then
        echo -e "${YELLOW}⚠️  Not a git repository, skipping: $project_name${NC}"
        return 0
    fi
    
    # Check if it's a Reynard project
    if [ ! -f "$project_dir/package.json" ]; then
        echo -e "${YELLOW}⚠️  No package.json found, skipping: $project_name${NC}"
        return 0
    fi
    
    if ! grep -q "reynard" "$project_dir/package.json" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Not a Reynard project, skipping: $project_name${NC}"
        return 0
    fi
    
    # Create hooks directory if it doesn't exist
    mkdir -p "$project_dir/.git/hooks"
    
    # Create a symlink to the shared hook script
    local hook_path="$project_dir/.git/hooks/pre-commit"
    
    if [ -L "$hook_path" ]; then
        echo -e "${YELLOW}   Hook already exists (symlink), updating...${NC}"
        rm "$hook_path"
    elif [ -f "$hook_path" ]; then
        echo -e "${YELLOW}   Existing hook found, backing up...${NC}"
        mv "$hook_path" "$hook_path.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Create the symlink
    ln -s "$HOOK_SCRIPT" "$hook_path"
    
    # Make sure it's executable
    chmod +x "$hook_path"
    
    echo -e "${GREEN}   ✅ Hook installed successfully${NC}"
    
    # Test the validator script
    echo -e "${BLUE}   🧪 Testing CSS validator...${NC}"
    cd "$project_dir"
    if node "$VALIDATOR_SCRIPT" --help >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ CSS validator working${NC}"
    else
        echo -e "${YELLOW}   ⚠️  CSS validator test failed (this is normal if no CSS files exist)${NC}"
    fi
    
    return 0
}

# Function to find all Reynard projects
find_reynard_projects() {
    local base_dir="$1"
    local projects=()
    
    # Look for directories with package.json containing "reynard"
    while IFS= read -r -d '' dir; do
        if grep -q "reynard" "$dir/package.json" 2>/dev/null; then
            # Only include if it's a direct child of the base directory or in reynard subdirectories
            if [[ "$dir" == "$base_dir"/* ]] && [[ "$(dirname "$dir")" == "$base_dir" ]]; then
                projects+=("$dir")
            fi
        fi
    done < <(find "$base_dir" -maxdepth 2 -name "package.json" -type f -print0 2>/dev/null)
    
    echo "${projects[@]}"
}

# Main logic
if [ $# -eq 0 ]; then
    # No arguments provided, auto-discover projects
    echo -e "${BLUE}🔍 Auto-discovering Reynard projects...${NC}"
    
    # Start from the directory containing this script (should be reynard/scripts)
    BASE_DIR="$(dirname "$SCRIPT_DIR")"
    
    # Also check the parent directory for other Reynard projects
    PARENT_DIR="$(dirname "$BASE_DIR")"
    
    projects=()
    
    # Add projects from the Reynard directory
    if [ -d "$BASE_DIR" ]; then
        while IFS= read -r -d '' dir; do
            if grep -q "reynard" "$dir/package.json" 2>/dev/null; then
                projects+=("$dir")
            fi
        done < <(find "$BASE_DIR" -name "package.json" -type f -print0 2>/dev/null)
    fi
    
    # Add projects from the parent directory (like reynard-test-app, etc.)
    if [ -d "$PARENT_DIR" ]; then
        while IFS= read -r -d '' dir; do
            # Only add if it's a direct child and contains "reynard" in package.json
            if [[ "$dir" == "$PARENT_DIR"/* ]] && [[ "$(dirname "$dir")" == "$PARENT_DIR" ]]; then
                if grep -q "reynard" "$dir/package.json" 2>/dev/null; then
                    projects+=("$dir")
                fi
            fi
        done < <(find "$PARENT_DIR" -maxdepth 2 -name "package.json" -type f -print0 2>/dev/null)
    fi
    
    if [ ${#projects[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No Reynard projects found${NC}"
        echo -e "${YELLOW}   Make sure you're running this from a directory containing Reynard projects${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}📋 Found ${#projects[@]} Reynard projects:${NC}"
    for project in "${projects[@]}"; do
        echo -e "${GREEN}   - $(basename "$project")${NC}"
    done
    echo ""
    
else
    # Arguments provided, use them as project directories
    projects=("$@")
fi

# Setup hooks for each project
success_count=0
total_count=${#projects[@]}

for project in "${projects[@]}"; do
    if setup_project_hooks "$project"; then
        ((success_count++))
    fi
    echo ""
done

# Summary
echo -e "${BLUE}📊 Setup Summary${NC}"
echo "==============="
echo -e "${GREEN}✅ Successfully configured: $success_count/$total_count projects${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 All Reynard projects now have CSS validation hooks!${NC}"
    echo ""
    echo -e "${BLUE}💡 What happens next:${NC}"
    echo -e "${BLUE}   - CSS validation will run automatically on every commit${NC}"
    echo -e "${BLUE}   - Commits with CSS errors will be blocked${NC}"
    echo -e "${BLUE}   - Warnings will be shown but won't block commits${NC}"
    echo -e "${BLUE}   - Run 'node scripts/validate-css-variables.js' to test manually${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some projects could not be configured${NC}"
    echo -e "${YELLOW}   Check the output above for details${NC}"
    exit 1
fi
