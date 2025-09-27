#!/bin/bash
# Git-tracked junk file detection script for Reynard monorepo

echo "🔍 Scanning for potential junk files tracked by Git in Reynard monorepo..."

# Create temporary files for analysis
PYTHON_JUNK="/tmp/python-junk-files.txt"
TYPESCRIPT_JUNK="/tmp/typescript-junk-files.txt"
REYNARD_JUNK="/tmp/reynard-junk-files.txt"
ALL_JUNK="/tmp/all-junk-files.txt"

# Detect Python artifacts that are tracked by Git
echo "🐍 Detecting Python development artifacts tracked by Git..."
git ls-files | grep -E "\.(pyc|pyo)$|__pycache__/" > "${PYTHON_JUNK}"
git ls-files | grep -E "\.(pyd|so)$|\.egg-info/" >> "${PYTHON_JUNK}"
# Only catch virtual environments and build directories that are clearly temporary
git ls-files | grep -E "(venv|\.venv|env|\.env)/" >> "${PYTHON_JUNK}"
git ls-files | grep -E "(build|dist|\.egg)/" | grep -v -E "(examples/|packages/)" >> "${PYTHON_JUNK}"
git ls-files | grep -E "(\.pytest_cache|\.coverage|htmlcov|\.tox)/" >> "${PYTHON_JUNK}"
# Only catch IDE files that are clearly temporary, not project configuration
git ls-files | grep -E "(\.swp|\.swo|\.ropeproject|\.mypy_cache)/" >> "${PYTHON_JUNK}"
git ls-files | grep -E "\.(log|tmp|temp)$|\.DS_Store|Thumbs\.db" >> "${PYTHON_JUNK}"

# Detect TypeScript/JavaScript artifacts that are tracked by Git
echo "📦 Detecting TypeScript/JavaScript development artifacts tracked by Git..."
# Only catch .d.ts files that are clearly build artifacts, not legitimate type definitions
git ls-files | grep -E "\.js\.map$|\.d\.ts\.map$" > "${TYPESCRIPT_JUNK}"
# Only catch build directories that are clearly temporary
git ls-files | grep -E "(dist|build|out)/" | grep -v -E "(test-dist|examples/|packages/)" >> "${TYPESCRIPT_JUNK}"
git ls-files | grep -E "node_modules/|package-lock\.json|yarn\.lock" >> "${TYPESCRIPT_JUNK}"
git ls-files | grep -E "(\.npm|\.yarn|\.pnpm)/" >> "${TYPESCRIPT_JUNK}"
git ls-files | grep -E "\.tsbuildinfo$|\.eslintcache|\.stylelintcache" >> "${TYPESCRIPT_JUNK}"
git ls-files | grep -E "(coverage|\.nyc_output)/" >> "${TYPESCRIPT_JUNK}"
git ls-files | grep -E "(\.vite|\.rollup\.cache|\.turbo)/" >> "${TYPESCRIPT_JUNK}"
git ls-files | grep -E "\.(bundle|chunk|vendor)\.js$" >> "${TYPESCRIPT_JUNK}"

# Detect Reynard-specific artifacts that are tracked by Git
echo "🦊 Detecting Reynard-specific artifacts tracked by Git..."
git ls-files | grep -E "\.generated\.|\.auto\.|(temp|tmp|\.temp)/" > "${REYNARD_JUNK}"
git ls-files | grep -E "\.(backup|bak|orig)$" >> "${REYNARD_JUNK}"
# Only catch temporary MCP files, not legitimate configuration files
git ls-files | grep -E "\.mcp\.log$|(\.mcp-cache|mcp-temp)/" >> "${REYNARD_JUNK}"
git ls-files | grep -E "\.sim\.log$|(\.ecs-cache|simulation-temp)/" >> "${REYNARD_JUNK}"
git ls-files | grep -E "agent-names-.*\.json$|(\.agent-cache|agent-temp)/" >> "${REYNARD_JUNK}"
git ls-files | grep -E "\.agent\.log$" >> "${REYNARD_JUNK}"

# Remove duplicates and sort
sort -u "${PYTHON_JUNK}" -o "${PYTHON_JUNK}"
sort -u "${TYPESCRIPT_JUNK}" -o "${TYPESCRIPT_JUNK}"
sort -u "${REYNARD_JUNK}" -o "${REYNARD_JUNK}"

# Combine all junk files
cat "${PYTHON_JUNK}" "${TYPESCRIPT_JUNK}" "${REYNARD_JUNK}" | sort -u > "${ALL_JUNK}"

# Analyze results
PYTHON_COUNT=$(wc -l < "${PYTHON_JUNK}")
TYPESCRIPT_COUNT=$(wc -l < "${TYPESCRIPT_JUNK}")
REYNARD_COUNT=$(wc -l < "${REYNARD_JUNK}")
TOTAL_COUNT=$(wc -l < "${ALL_JUNK}")

echo ""
echo "📊 Git-Tracked Junk File Detection Results:"
echo "   🐍 Python artifacts: ${PYTHON_COUNT} files"
echo "   📦 TypeScript/JS artifacts: ${TYPESCRIPT_COUNT} files"
echo "   🦊 Reynard-specific artifacts: ${REYNARD_COUNT} files"
echo "   📋 Total tracked junk files: ${TOTAL_COUNT} files"

if [[ "${TOTAL_COUNT}" -gt 0 ]; then
    echo ""
    echo "⚠️  TRACKED JUNK FILES DETECTED!"
    echo "   The following files are tracked by Git but appear to be development artifacts:"
    echo ""
    cat "${ALL_JUNK}" | head -20
    if [[ "${TOTAL_COUNT}" -gt 20 ]; then
        echo "   ... and $((TOTAL_COUNT - 20)) more files"
    fi
    echo ""
    echo "🔧 Recommended actions:"
    echo "   1. Review each file to determine if it should be removed from Git tracking"
    echo "   2. Use 'git rm --cached <file>' to remove from tracking while keeping local copy"
    echo "   3. Add appropriate patterns to .gitignore to prevent future tracking"
    echo "   4. Commit the removal and .gitignore updates"
    echo "   5. Re-run this detection after cleanup"
    echo ""
    echo "📁 Full list saved to: ${ALL_JUNK}"

    # Clean up temporary files
    rm -f "${PYTHON_JUNK}" "${TYPESCRIPT_JUNK}" "${REYNARD_JUNK}"

    exit 1
else
    echo ""
    echo "✅ No tracked junk files detected! Git repository is clean."

    # Clean up temporary files
    rm -f "${PYTHON_JUNK}" "${TYPESCRIPT_JUNK}" "${REYNARD_JUNK}" "${ALL_JUNK}"

    exit 0
fi
