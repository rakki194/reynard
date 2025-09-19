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

# Function to show help
show_help() {
    echo -e "${BLUE}🦊 Reynard Smart Development Server${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo -e "\n${CYAN}Usage:${NC}"
    echo -e "  $0 dev                    - Start development server with queue management"
    echo -e "  $0 dev:status             - Show all running development servers"
    echo -e "  $0 dev:stop               - Stop all development servers"
    echo -e "  $0 dev:help               - Show this help message"
    echo -e "\n${CYAN}Features:${NC}"
    echo -e "  • Prevents port conflicts between projects"
    echo -e "  • Shows helpful information about auto-reload"
    echo -e "  • Manages multiple development servers"
    echo -e "  • Provides status information for all projects"
    echo -e "\n${CYAN}Auto-reload:${NC}"
    echo -e "  • All servers have auto-reload enabled"
    echo -e "  • No need to restart when making changes"
    echo -e "  • Multiple agents can work simultaneously"
}

# Function to stop all development servers
stop_all_servers() {
    echo -e "${BLUE}🛑 Stopping all Reynard development servers...${NC}"
    
    local stopped_count=0
    
    # Get all configured ports and stop processes
    for category in packages examples backend e2e; do
        local projects=$(jq -r ".$category | keys[]" "$(dirname "$0")/dev-server-config.json" 2>/dev/null || echo "")
        
        if [ -n "$projects" ]; then
            while IFS= read -r project; do
                local port=$(jq -r ".$category.\"$project\".port" "$(dirname "$0")/dev-server-config.json" 2>/dev/null)
                
                if command -v lsof >/dev/null 2>&1; then
                    local pids=$(lsof -ti ":$port" 2>/dev/null || echo "")
                    if [ -n "$pids" ]; then
                        echo -e "${YELLOW}   Stopping $project (port $port)...${NC}"
                        echo "$pids" | xargs kill -TERM 2>/dev/null || true
                        stopped_count=$((stopped_count + 1))
                    fi
                fi
            done <<< "$projects"
        fi
    done
    
    if [ $stopped_count -eq 0 ]; then
        echo -e "${GREEN}✅ No development servers were running${NC}"
    else
        echo -e "${GREEN}✅ Stopped $stopped_count development server(s)${NC}"
    fi
}

# Main script logic
case "${1:-}" in
    "dev")
        # Run the pre-dev hook
        if [ -f "$(dirname "$0")/pre-dev" ]; then
            bash "$(dirname "$0")/pre-dev"
        fi
        
        # Start the actual development server
        echo -e "\n${GREEN}🚀 Starting development server...${NC}"
        exec pnpm run dev
        ;;
    "dev:status")
        dev-server status
        ;;
    "dev:stop")
        dev-server stop-all
        ;;
    "dev:help"|"help")
        show_help
        ;;
    *)
        # If it's not a dev command, pass it through to pnpm
        exec pnpm "$@"
        ;;
esac
