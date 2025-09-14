#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration file path
CONFIG_FILE="$(dirname "$0")/dev-server-config.json"

# Function to get project info from config
get_project_info() {
    local project_path="$1"
    local project_name=$(basename "$project_path")
    
    # Handle current directory (.)
    if [ "$project_path" = "." ]; then
        project_path=$(pwd)
        project_name=$(basename "$project_path")
    fi
    
    # Check if it's a package
    if [[ "$project_path" == *"/packages/"* ]]; then
        jq -r ".packages.\"$project_name\" // empty" "$CONFIG_FILE" 2>/dev/null || echo ""
    # Check if it's an example
    elif [[ "$project_path" == *"/examples/"* ]]; then
        jq -r ".examples.\"$project_name\" // empty" "$CONFIG_FILE" 2>/dev/null || echo ""
    # Check if it's backend
    elif [[ "$project_path" == *"/backend"* ]]; then
        jq -r ".backend.main // empty" "$CONFIG_FILE" 2>/dev/null || echo ""
    # Check if it's e2e
    elif [[ "$project_path" == *"/e2e"* ]]; then
        jq -r ".e2e.playwright // empty" "$CONFIG_FILE" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# Function to check if a port is in use
is_port_in_use() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$port" >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tlnp 2>/dev/null | grep ":$port " >/dev/null 2>&1
    elif command -v ss >/dev/null 2>&1; then
        ss -tlnp 2>/dev/null | grep ":$port " >/dev/null 2>&1
    else
        # Fallback: try to connect to the port
        timeout 1 bash -c "</dev/tcp/localhost/$port" 2>/dev/null
    fi
}

# Function to find what's running on a port
get_port_process() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$port" 2>/dev/null | tail -n +2 | awk '{print $1, $2}' | head -1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1
    elif command -v ss >/dev/null 2>&1; then
        ss -tlnp 2>/dev/null | grep ":$port " | awk '{print $6}' | head -1
    else
        echo "unknown"
    fi
}

# Function to show running servers
show_running_servers() {
    echo -e "${BLUE}🦊 Reynard Development Server Status${NC}"
    echo -e "${BLUE}=====================================${NC}"
    
    local running_count=0
    
    # Check all configured ports
    for category in packages examples backend e2e; do
        local category_upper=$(echo "$category" | tr '[:lower:]' '[:upper:]')
        echo -e "\n${CYAN}📦 $category_upper${NC}"
        
        # Get all projects in this category
        local projects=$(jq -r ".$category | keys[]" "$CONFIG_FILE" 2>/dev/null || echo "")
        
        if [ -n "$projects" ]; then
            while IFS= read -r project; do
                local port=$(jq -r ".$category.\"$project\".port" "$CONFIG_FILE" 2>/dev/null)
                local description=$(jq -r ".$category.\"$project\".description" "$CONFIG_FILE" 2>/dev/null)
                
                if is_port_in_use "$port"; then
                    local process_info=$(get_port_process "$port")
                    echo -e "  ${GREEN}✅ $project${NC} (port $port) - $description"
                    echo -e "     ${YELLOW}Process: $process_info${NC}"
                    echo -e "     ${GREEN}🌐 http://localhost:$port${NC}"
                    running_count=$((running_count + 1))
                else
                    echo -e "  ${RED}❌ $project${NC} (port $port) - $description"
                fi
            done <<< "$projects"
        fi
    done
    
    echo -e "\n${BLUE}📊 Summary: $running_count server(s) running${NC}"
    
    if [ $running_count -gt 0 ]; then
        echo -e "\n${GREEN}💡 Auto-reload is enabled for all running servers!${NC}"
        echo -e "${GREEN}   No need to restart when you make changes.${NC}"
    fi
}

# Function to check for conflicts before starting
check_dev_server_conflicts() {
    local project_path="$1"
    local project_name=$(basename "$project_path")
    local project_info=$(get_project_info "$project_path")
    
    if [ -z "$project_info" ]; then
        echo -e "${YELLOW}⚠️  No configuration found for $project_name${NC}"
        echo -e "${YELLOW}   This project may not be configured in the dev server queue.${NC}"
        return 0
    fi
    
    local port=$(echo "$project_info" | jq -r '.port')
    local description=$(echo "$project_info" | jq -r '.description')
    local auto_reload=$(echo "$project_info" | jq -r '.autoReload')
    
    echo -e "${BLUE}🦊 Starting development server for $project_name${NC}"
    echo -e "${BLUE}📝 Description: $description${NC}"
    echo -e "${BLUE}🌐 Port: $port${NC}"
    
    if is_port_in_use "$port"; then
        local process_info=$(get_port_process "$port")
        echo -e "\n${RED}❌ Port $port is already in use!${NC}"
        echo -e "${RED}   Process: $process_info${NC}"
        echo -e "${RED}   URL: http://localhost:$port${NC}"
        echo -e "\n${YELLOW}💡 Solutions:${NC}"
        echo -e "${YELLOW}   1. Stop the existing server: kill the process above${NC}"
        echo -e "${YELLOW}   2. Use the existing server (it has auto-reload enabled)${NC}"
        echo -e "${YELLOW}   3. Check if another agent is already working on this project${NC}"
        echo -e "\n${CYAN}🔍 Run 'pnpm run dev:status' to see all running servers${NC}"
        return 1
    fi
    
    if [ "$auto_reload" = "true" ]; then
        echo -e "${GREEN}✅ Auto-reload enabled - changes will be reflected automatically${NC}"
    fi
    
    echo -e "${GREEN}🚀 Starting server...${NC}"
    return 0
}

# Function to show help
show_help() {
    echo -e "${BLUE}🦊 Reynard Development Server Queue${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo -e "\n${CYAN}Usage:${NC}"
    echo -e "  $0 status                    - Show all running development servers"
    echo -e "  $0 check <project-path>      - Check if a project can start safely"
    echo -e "  $0 help                      - Show this help message"
    echo -e "\n${CYAN}Examples:${NC}"
    echo -e "  $0 status"
    echo -e "  $0 check packages/reynard-charts"
    echo -e "  $0 check examples/test-app"
    echo -e "\n${CYAN}Integration with pnpm:${NC}"
    echo -e "  Add to your package.json scripts:"
    echo -e "  \"dev:check\": \"bash .husky/dev-server-queue.sh check .\""
    echo -e "  \"dev:status\": \"bash .husky/dev-server-queue.sh status\""
}

# Main script logic
case "${1:-}" in
    "status")
        show_running_servers
        ;;
    "check")
        if [ -z "${2:-}" ]; then
            echo -e "${RED}❌ Error: Project path required${NC}"
            echo -e "${YELLOW}Usage: $0 check <project-path>${NC}"
            exit 1
        fi
        check_dev_server_conflicts "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: ${1:-}${NC}"
        show_help
        exit 1
        ;;
esac
