#!/bin/bash
# Agent Self-Naming Tool
# Allows agents to generate and assign themselves custom names using the Reynard robot name generator

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROBOT_GENERATOR="${SCRIPT_DIR}/robot-name-generator.py"
AGENT_NAME_FILE="${SCRIPT_DIR}/.agent-name"
LOG_FILE="${SCRIPT_DIR}/agent-naming.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    local message
    message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "${message}" >> "${LOG_FILE}"
}

# Check if robot generator exists
if [[ ! -f "${ROBOT_GENERATOR}" ]]; then
    echo -e "${RED}ERROR: Robot name generator not found at ${ROBOT_GENERATOR}${NC}" >&2
    exit 1
fi

# Function to generate a new agent name
generate_agent_name() {
    local spirit="${1:-}"
    local style="${2:-}"
    local count="${3:-1}"

    log "Generating new agent name (spirit: ${spirit:-random}, style: ${style:-random})"

    # Build command arguments
    local cmd_args=("--count" "${count}")

    if [[ -n "${spirit}" ]]; then
        cmd_args+=("--spirit" "${spirit}")
    fi

    if [[ -n "${style}" ]]; then
        cmd_args+=("--style" "${style}")
    fi

    # Generate the name
    local generated_name
    generated_name=$(python3 "${ROBOT_GENERATOR}" "${cmd_args[@]}")

    if [[ $? -eq 0 && -n "${generated_name}" ]]; then
        echo "${generated_name}"
        log "Generated name: ${generated_name}"
    else
        echo -e "${RED}ERROR: Failed to generate agent name${NC}" >&2
        log "ERROR: Failed to generate agent name"
        exit 1
    fi
}

# Function to assign name to agent
assign_agent_name() {
    local name="$1"

    # Save to file for persistence
    echo "${name}" > "${AGENT_NAME_FILE}"

    # Set environment variable for current session
    export AGENT_NAME="${name}"

    # Log the assignment
    log "Assigned agent name: ${name}"

    echo -e "${GREEN}✓ Agent name assigned: ${BLUE}${name}${NC}"
    echo -e "${YELLOW}Name saved to: ${AGENT_NAME_FILE}${NC}"
    echo -e "${YELLOW}Environment variable AGENT_NAME set for current session${NC}"
}

# Function to get current agent name
get_current_name() {
    if [[ -f "${AGENT_NAME_FILE}" ]]; then
        cat "${AGENT_NAME_FILE}"
    else
        echo "No name assigned"
    fi
}

# Function to show usage
show_usage() {
    cat << EOF
Agent Self-Naming Tool
=====================

Usage: $0 [OPTIONS] [COMMAND]

Commands:
  generate [spirit] [style]    Generate a new name with expanded options
  assign [name]               Assign a specific name to the agent
  current                     Show current agent name
  reset                       Remove current agent name
  help                        Show this help message

Options:
  --spirit SPIRIT             Animal spirit theme (fox, wolf, otter, dolphin, eagle, lion, axolotl, etc.)
  --style STYLE               Naming style (foundation, exo, hybrid, cyberpunk, mythological, scientific)
  --count COUNT               Number of names to generate (default: 1)

Available Spirits:
  Canines: fox, wolf, coyote, jackal
  Aquatic: otter, dolphin, whale, shark, octopus, axolotl
  Birds: eagle, falcon, raven, owl, hawk, toucan, flamingo, peacock
  Big Cats: lion, tiger, leopard, jaguar, cheetah, lynx
  Large Mammals: bear, panda, elephant, rhino
  Primates: ape, monkey, lemur
  Reptiles: snake, lizard, turtle, frog
  Insects: spider, ant, bee, mantis, dragonfly
  Exotic: pangolin, platypus, narwhal, quokka, capybara, aye-aye, kiwi

Available Styles:
  foundation    - Strategic/intellectual names (Vulpine-Sage-21)
  exo          - Combat/technical names (Lupus-Strike-16)
  hybrid       - Mythological/historical names (Lutra-Atlas-Prime)
  cyberpunk    - Tech-prefixed names (Cyber-Axolotl-Nexus)
  mythological - Divine/mystical names (Apollo-Falcon-Divine)
  scientific   - Latin/scientific names (Panthera-Leo-Alpha)

Examples:
  $0 generate                                    # Generate random name
  $0 generate fox foundation                     # Generate fox-themed Foundation name
  $0 generate axolotl cyberpunk                  # Generate axolotl Cyberpunk name
  $0 generate dolphin mythological               # Generate dolphin Mythological name
  $0 --spirit eagle --style scientific generate # Generate eagle Scientific name
  $0 --spirit narwhal --style cyberpunk --count 3  # Generate 3 narwhal Cyberpunk names
  $0 assign "Cyber-Axolotl-Nexus"               # Assign specific name
  $0 current                                     # Show current name

EOF
}

# Main logic
main() {
    local command="${1:-help}"
    local spirit=""
    local style=""
    local count=1

    # Parse options first
    while [[ $# -gt 0 ]]; do
        case $1 in
            --spirit)
                spirit="$2"
                shift 2
                ;;
            --style)
                style="$2"
                shift 2
                ;;
            --count)
                count="$2"
                shift 2
                ;;
            generate|assign|current|reset|help|--help|-h)
                command="$1"
                shift
                break
                ;;
            *)
                # This might be a positional argument for generate command
                break
                ;;
        esac
    done

    case "${command}" in
        generate)
            local new_name
            # Handle positional arguments for spirit and style
            if [[ $# -ge 1 && -n "$1" ]]; then
                spirit="$1"
            fi
            if [[ $# -ge 2 && -n "$2" ]]; then
                style="$2"
            fi
            new_name=$(generate_agent_name "${spirit}" "${style}" "${count}")
            assign_agent_name "${new_name}"
            ;;
        assign)
            if [[ $# -lt 1 ]]; then
                echo -e "${RED}ERROR: No name provided for assignment${NC}" >&2
                exit 1
            fi
            assign_agent_name "$1"
            ;;
        current)
            local current_name
            current_name=$(get_current_name)
            echo -e "${BLUE}Current agent name: ${GREEN}${current_name}${NC}"
            ;;
        reset)
            if [[ -f "${AGENT_NAME_FILE}" ]]; then
                rm "${AGENT_NAME_FILE}"
                unset AGENT_NAME
                log "Agent name reset"
                echo -e "${GREEN}✓ Agent name reset${NC}"
            else
                echo -e "${YELLOW}No agent name to reset${NC}"
            fi
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo -e "${RED}ERROR: Unknown command '${command}'${NC}" >&2
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
