#!/bin/bash
# Humility Enforcer - Systematic Enforcement of Humble Communication
# Part of the Reynard project's commitment to humble communication.

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DETECTOR_SCRIPT="$SCRIPT_DIR/humility-detector.py"
LOG_FILE="$PROJECT_ROOT/.humility-enforcer.log"
CONFIG_FILE="$SCRIPT_DIR/humility-config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_CONFIG='{
    "enabled": true,
    "severity_threshold": "medium",
    "file_extensions": [".md", ".txt", ".py", ".js", ".ts", ".tsx", ".jsx", ".json"],
    "exclude_patterns": [
        "node_modules/",
        ".git/",
        "dist/",
        "build/",
        "coverage/",
        "*.min.js",
        "*.bundle.js"
    ],
    "auto_fix": false,
    "pre_commit_hook": true,
    "ci_integration": true
}'

# Initialize configuration if it doesn't exist
init_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        echo "$DEFAULT_CONFIG" > "$CONFIG_FILE"
        echo -e "${BLUE}Initialized humility configuration at $CONFIG_FILE${NC}"
    fi
}

# Load configuration
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        ENABLED=$(jq -r '.enabled' "$CONFIG_FILE")
        SEVERITY_THRESHOLD=$(jq -r '.severity_threshold' "$CONFIG_FILE")
        FILE_EXTENSIONS=$(jq -r '.file_extensions | join(" ")' "$CONFIG_FILE")
        EXCLUDE_PATTERNS=$(jq -r '.exclude_patterns | join("|")' "$CONFIG_FILE")
        AUTO_FIX=$(jq -r '.auto_fix' "$CONFIG_FILE")
        PRE_COMMIT_HOOK=$(jq -r '.pre_commit_hook' "$CONFIG_FILE")
        CI_INTEGRATION=$(jq -r '.ci_integration' "$CONFIG_FILE")
    else
        # Use defaults
        ENABLED=true
        SEVERITY_THRESHOLD="medium"
        FILE_EXTENSIONS=".md .txt .py .js .ts .tsx .jsx .json"
        EXCLUDE_PATTERNS="node_modules/|.git/|dist/|build/|coverage/|*.min.js|*.bundle.js"
        AUTO_FIX=false
        PRE_COMMIT_HOOK=true
        CI_INTEGRATION=true
    fi
}

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case "$level" in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
    esac
}

# Check if required tools are available
check_dependencies() {
    local missing_deps=()
    
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log "ERROR" "Missing required dependencies: ${missing_deps[*]}"
        log "ERROR" "Please install the missing dependencies and try again"
        exit 1
    fi
}

# Run humility detector
run_detector() {
    local path="$1"
    local output_file="$2"
    local format="${3:-text}"
    
    log "INFO" "Running humility detector on: $path"
    
    local cmd_args=("$DETECTOR_SCRIPT" "$path" "--format" "$format" "--min-severity" "$SEVERITY_THRESHOLD")
    
    if [[ -n "$output_file" ]]; then
        cmd_args+=("--output" "$output_file")
    fi
    
    if [[ "$FILE_EXTENSIONS" != "null" ]]; then
        cmd_args+=("--extensions" $FILE_EXTENSIONS)
    fi
    
    if ! python3 "${cmd_args[@]}"; then
        return 1
    fi
    return 0
}

# Auto-fix boastful language (basic implementation)
auto_fix() {
    local file="$1"
    local temp_file=$(mktemp)
    
    log "INFO" "Attempting to auto-fix boastful language in: $file"
    
    # Basic replacements (this is a simplified version)
    sed -E '
        s/\bbest\b/good/g
        s/\bmost\b/many/g
        s/\bgreatest\b/significant/g
        s/\bunprecedented\b/new/g
        s/\bexceptional\b/notable/g
        s/\boutstanding\b/good/g
        s/\bremarkable\b/notable/g
        s/\bstunning\b/impressive/g
        s/\bbreathtaking\b/impressive/g
        s/\brevolutionary\b/innovative/g
        s/\bgroundbreaking\b/new/g
        s/\bgame-changing\b/significant/g
        s/\bbreakthrough\b/advancement/g
        s/\bphenomenal\b/impressive/g
        s/\bspectacular\b/impressive/g
        s/\bmagnificent\b/well-designed/g
        s/\bincredible\b/impressive/g
        s/\baward-winning\b/recognized/g
        s/\bindustry-leading\b/competitive/g
        s/\bbest-in-class\b/high-quality/g
        s/\bworld-class\b/professional/g
        s/\btop-tier\b/high-quality/g
        s/\bpremium\b/enhanced/g
        s/\belite\b/specialized/g
        s/\bsuperior\b/effective/g
        s/\badvanced\b/useful/g
        s/\bsophisticated\b/well-designed/g
        s/\bpowerful\b/capable/g
        s/\brobust\b/reliable/g
        s/\bscalable\b/adaptable/g
        s/\benterprise-grade\b/professional/g
        s/\bproduction-ready\b/ready/g
        s/\bbattle-tested\b/tested/g
    ' "$file" > "$temp_file"
    
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        log "SUCCESS" "Auto-fixed boastful language in: $file"
        return 0
    else
        rm "$temp_file"
        log "INFO" "No changes needed in: $file"
        return 1
    fi
}

# Install pre-commit hook
install_pre_commit_hook() {
    local hook_file="$PROJECT_ROOT/.git/hooks/pre-commit"
    
    if [[ "$PRE_COMMIT_HOOK" == "true" ]]; then
        log "INFO" "Installing pre-commit hook..."
        
        cat > "$hook_file" << 'EOF'
#!/bin/bash
# Pre-commit hook for humility enforcement

set -e

# Run humility detector
if ! python3 scripts/humility/humility-detector.py . --min-severity medium; then
    echo "❌ Boastful language detected. Please review and revise before committing."
    echo "Run 'python3 scripts/humility/humility-detector.py' for details."
    exit 1
fi

echo "✅ No boastful language detected. Proceeding with commit."
EOF
        
        chmod +x "$hook_file"
        log "SUCCESS" "Pre-commit hook installed successfully"
    fi
}

# Remove pre-commit hook
remove_pre_commit_hook() {
    local hook_file="$PROJECT_ROOT/.git/hooks/pre-commit"
    
    if [[ -f "$hook_file" ]]; then
        rm "$hook_file"
        log "SUCCESS" "Pre-commit hook removed"
    else
        log "INFO" "No pre-commit hook found to remove"
    fi
}

# CI integration
ci_check() {
    if [[ "$CI_INTEGRATION" == "true" ]]; then
        log "INFO" "Running CI humility check..."
        
        local report_file=$(mktemp)
        if run_detector "$PROJECT_ROOT" "$report_file" "json"; then
            log "SUCCESS" "CI humility check passed"
            rm "$report_file"
            return 0
        else
            log "ERROR" "CI humility check failed"
            if [[ -f "$report_file" ]]; then
                log "ERROR" "Report saved to: $report_file"
            fi
            return 1
        fi
    fi
}

# Scan specific files or directories
scan_path() {
    local path="$1"
    local auto_fix_mode="${2:-false}"
    
    if [[ ! -e "$path" ]]; then
        log "ERROR" "Path does not exist: $path"
        return 1
    fi
    
    local report_file=$(mktemp)
    local has_issues=false
    
    if run_detector "$path" "$report_file" "json"; then
        log "SUCCESS" "No boastful language found in: $path"
    else
        log "WARN" "Boastful language found in: $path"
        has_issues=true
        
        if [[ "$auto_fix_mode" == "true" && "$AUTO_FIX" == "true" ]]; then
            log "INFO" "Attempting auto-fix..."
            
            # Extract files with issues and attempt to fix them
            local files_with_issues
            files_with_issues=$(jq -r '.findings[].file_path' "$report_file" | sort -u)
            
            for file in $files_with_issues; do
                if [[ -f "$file" ]]; then
                    auto_fix "$file" || true
                fi
            done
            
            # Re-scan to check if issues were resolved
            if run_detector "$path" "$report_file" "json"; then
                log "SUCCESS" "Auto-fix resolved all issues in: $path"
                has_issues=false
            else
                log "WARN" "Some issues remain after auto-fix in: $path"
            fi
        fi
    fi
    
    # Display report
    if [[ -f "$report_file" ]]; then
        python3 "$DETECTOR_SCRIPT" "$path" --format text --min-severity "$SEVERITY_THRESHOLD" --score
    fi
    
    rm -f "$report_file"
    
    if [[ "$has_issues" == "true" ]]; then
        return 1
    else
        return 0
    fi
}

# Main function
main() {
    local command="${1:-scan}"
    shift || true
    
    # Initialize
    init_config
    load_config
    check_dependencies
    
    # Create log file if it doesn't exist
    touch "$LOG_FILE"
    
    case "$command" in
        "scan")
            local path="${1:-$PROJECT_ROOT}"
            local auto_fix_mode="${2:-false}"
            scan_path "$path" "$auto_fix_mode"
            ;;
        "install-hook")
            install_pre_commit_hook
            ;;
        "remove-hook")
            remove_pre_commit_hook
            ;;
        "ci-check")
            ci_check
            ;;
        "config")
            if [[ -f "$CONFIG_FILE" ]]; then
                cat "$CONFIG_FILE" | jq .
            else
                log "ERROR" "Configuration file not found: $CONFIG_FILE"
                exit 1
            fi
            ;;
        "help"|"--help"|"-h")
            cat << EOF
Humility Enforcer - Systematic Enforcement of Humble Communication

Usage: $0 <command> [options]

Commands:
  scan [path] [auto-fix]    Scan files for boastful language
  install-hook              Install pre-commit hook
  remove-hook               Remove pre-commit hook
  ci-check                  Run CI integration check
  config                    Show current configuration
  help                      Show this help message

Examples:
  $0 scan                          # Scan entire project
  $0 scan README.md                # Scan specific file
  $0 scan docs/                    # Scan specific directory
  $0 scan . true                   # Scan with auto-fix enabled
  $0 install-hook                  # Install pre-commit hook
  $0 ci-check                      # Run CI check

Configuration:
  Edit $CONFIG_FILE to customize behavior

EOF
            ;;
        *)
            log "ERROR" "Unknown command: $command"
            log "INFO" "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
