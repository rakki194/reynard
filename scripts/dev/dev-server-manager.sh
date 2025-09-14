#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HUSKY_DIR="${PROJECT_ROOT}/.husky"

# Function to show help
show_help() {
    echo -e "${BLUE}🦊 Reynard Development Server Manager${NC}"
    echo -e "${BLUE}====================================${NC}"
    echo -e "\n${CYAN}Usage:${NC}"
    echo -e "  $0 status                    - Show all running development servers"
    echo -e "  $0 start <project>           - Start a specific project's dev server"
    echo -e "  $0 stop <project>            - Stop a specific project's dev server"
    echo -e "  $0 stop-all                  - Stop all development servers"
    echo -e "  $0 list                      - List all available projects"
    echo -e "  $0 help                      - Show this help message"
    echo -e "\n${CYAN}Examples:${NC}"
    echo -e "  $0 status"
    echo -e "  $0 start test-app"
    echo -e "  $0 start packages/reynard-charts"
    echo -e "  $0 stop test-app"
    echo -e "  $0 stop-all"
    echo -e "\n${CYAN}Auto-reload Features:${NC}"
    echo -e "  • All servers have auto-reload enabled"
    echo -e "  • No need to restart when making changes"
    echo -e "  • Multiple agents can work simultaneously"
    echo -e "  • Port conflicts are automatically detected"
}

# Function to list all available projects
list_projects() {
    echo -e "${BLUE}🦊 Available Reynard Projects${NC}"
    echo -e "${BLUE}=============================${NC}"

    local config_file="${HUSKY_DIR}/dev-server-config.json"

    for category in packages examples backend e2e; do
        local category_upper
        category_upper=$(echo "${category}" | tr '[:lower:]' '[:upper:]')
        echo -e "\n${CYAN}📦 ${category_upper}${NC}"

        local projects
        projects=$(jq -r ".${category} | keys[]" "${config_file}" 2>/dev/null || echo "")

        if [[ -n "${projects}" ]]; then
            while IFS= read -r project; do
                local port
                port=$(jq -r ".${category}.\"${project}\".port" "${config_file}" 2>/dev/null)
                local description
                description=$(jq -r ".${category}.\"${project}\".description" "${config_file}" 2>/dev/null)
                local auto_reload
                auto_reload=$(jq -r ".${category}.\"${project}\".autoReload" "${config_file}" 2>/dev/null)

                if [[ "${auto_reload}" = "true" ]]; then
                    echo -e "  ${GREEN}✅ ${project}${NC} (port ${port}) - ${description}"
                else
                    echo -e "  ${YELLOW}⚠️  ${project}${NC} (port ${port}) - ${description}"
                fi
            done <<< "${projects}"
        fi
    done
}

# Function to start a specific project
start_project() {
    local project_name="$1"

    if [[ -z "${project_name}" ]]; then
        echo -e "${RED}❌ Error: Project name required${NC}"
        echo -e "${YELLOW}Usage: $0 start <project>${NC}"
        echo -e "${CYAN}Run '$0 list' to see available projects${NC}"
        exit 1
    fi

    # Find the project path
    local project_path=""

    # Check packages
    if [[ -d "${PROJECT_ROOT}/packages/${project_name}" ]]; then
        project_path="${PROJECT_ROOT}/packages/${project_name}"
    # Check examples
    elif [[ -d "${PROJECT_ROOT}/examples/${project_name}" ]]; then
        project_path="${PROJECT_ROOT}/examples/${project_name}"
    # Check backend
    elif [[ "${project_name}" = "backend" ]] && [[ -d "${PROJECT_ROOT}/backend" ]]; then
        project_path="${PROJECT_ROOT}/backend"
    # Check e2e
    elif [[ "${project_name}" = "e2e" ]] && [[ -d "${PROJECT_ROOT}/e2e" ]]; then
        project_path="${PROJECT_ROOT}/e2e"
    else
        echo -e "${RED}❌ Error: Project '${project_name}' not found${NC}"
        echo -e "${CYAN}Run '$0 list' to see available projects${NC}"
        exit 1
    fi

    echo -e "${BLUE}🚀 Starting development server for ${project_name}...${NC}"
    echo -e "${CYAN}📍 Path: ${project_path}${NC}"

    # Change to project directory and start
    cd "${project_path}"

    # Run the pre-dev hook
    if [[ -f "${HUSKY_DIR}/pre-dev" ]]; then
        bash "${HUSKY_DIR}/pre-dev"
    fi

    # Start the development server
    exec pnpm run dev
}

# Function to stop a specific project
stop_project() {
    local project_name="$1"

    if [[ -z "${project_name}" ]]; then
        echo -e "${RED}❌ Error: Project name required${NC}"
        echo -e "${YELLOW}Usage: $0 stop <project>${NC}"
        exit 1
    fi

    # Get project info from config
    local config_file="${HUSKY_DIR}/dev-server-config.json"
    local port=""

    # Find the port for this project
    for category in packages examples backend e2e; do
        local project_port
        project_port=$(jq -r ".${category}.\"${project_name}\".port // empty" "${config_file}" 2>/dev/null)
        if [[ -n "${project_port}" ]] && [[ "${project_port}" != "null" ]]; then
            port="${project_port}"
            break
        fi
    done

    if [[ -z "${port}" ]]; then
        echo -e "${RED}❌ Error: No port configuration found for '${project_name}'${NC}"
        exit 1
    fi

    # Stop processes on this port
    if command -v lsof >/dev/null 2>&1; then
        local pids
        pids=$(lsof -ti ":${port}" 2>/dev/null || echo "")
        if [[ -n "${pids}" ]]; then
            echo -e "${YELLOW}🛑 Stopping ${project_name} (port ${port})...${NC}"
            echo "${pids}" | xargs kill -TERM 2>/dev/null || true
            echo -e "${GREEN}✅ Stopped ${project_name}${NC}"
        else
            echo -e "${YELLOW}⚠️  No running server found for ${project_name} (port ${port})${NC}"
        fi
    else
        echo -e "${RED}❌ Error: lsof command not available${NC}"
        exit 1
    fi
}

# Main script logic
case "${1:-}" in
    "status")
        bash "${HUSKY_DIR}/dev-server-queue.sh" status
        ;;
    "start")
        start_project "$2"
        ;;
    "stop")
        stop_project "$2"
        ;;
    "stop-all")
        bash "${HUSKY_DIR}/pnpm-dev-wrapper.sh" dev:stop
        ;;
    "list")
        list_projects
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
