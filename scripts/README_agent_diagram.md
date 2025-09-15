# Agent Contributions Diagram Generator

This script automatically parses the `CHANGELOG.md` file to extract agent contributions and generates a comprehensive mermaid diagram showing the breakdown of what each agent accomplished.

## Features

- **Automatic Parsing**: Extracts agent contributions from changelog entries
- **Smart Categorization**: Automatically categorizes agents into 7 categories based on their work
- **Mermaid Diagram Generation**: Creates a visual diagram with proper mermaid syntax using neutral theme
- **Comprehensive Statistics**: Provides detailed breakdowns and top contributor analysis
- **Flexible Output**: Configurable input and output files
- **Built-in Validation**: Automatically validates generated diagrams for syntax correctness

## Usage

### Basic Usage

```bash
python scripts/generate_agent_diagram.py
```

### Advanced Usage

```bash
# Specify custom changelog and output files
python scripts/generate_agent_diagram.py --changelog docs/CHANGELOG.md --output reports/agent_breakdown.md

# Verbose output to see all contributions
python scripts/generate_agent_diagram.py --verbose

# Help
python scripts/generate_agent_diagram.py --help
```

## Command Line Options

- `--changelog`: Path to changelog file (default: `CHANGELOG.md`)
- `--output`: Output file path (default: `agent_contributions_diagram.md`)
- `--verbose, -v`: Show detailed output including all contributions
- `--help`: Show help message

## Output

The script generates a markdown file containing:

1. **Mermaid Diagram**: Visual representation of agent contributions by category using neutral theme (black text on white boxes)
2. **Summary by Category**: Detailed breakdown of each category
3. **Key Patterns**: Analysis of common themes and patterns
4. **Statistics**: Contribution counts and top contributors

### Mermaid Diagram Features

- **Neutral Theme**: Uses `%%{init: {'theme': 'neutral'}}%%` for black text on white boxes
- **No Custom Styling**: Removes all custom CSS and color styling that could break rendering
- **Clean Syntax**: Properly escaped text and validated syntax
- **Cross-Platform Compatible**: Works with all mermaid renderers

## Categories

The script automatically categorizes agents into:

- **Security & Analysis**: Security testing, code quality, vulnerability analysis
- **Infrastructure & Architecture**: Backend infrastructure, package configuration, refactoring
- **Testing & Quality**: E2E testing, performance testing, quality assurance
- **Documentation & Research**: Documentation, research papers, guides
- **Frontend & UI**: UI components, animations, frontend development
- **Backend & Python**: Python backend, MCP servers, type safety
- **Specialized**: I18n, performance benchmarking, specialized tools

## Example Output

```
🦊 Parsing changelog and generating agent contributions diagram...
Found 68 agent contributions
✅ Successfully generated agent_contributions_diagram.md
📊 Processed 68 contributions from 31 unique agents

📈 Category breakdown:
  - Infrastructure & Architecture: 23 contributions
  - Security & Analysis: 11 contributions
  - Testing & Quality: 10 contributions
  - Documentation & Research: 10 contributions
  - Frontend & UI: 7 contributions
  - Specialized: 5 contributions
  - Backend & Python: 2 contributions

🏆 Top contributors:
  - Loyal-Librarian-56: 9 contributions
  - Otty-Admiral-15: 6 contributions
  - Pteronura-Scientist-35: 4 contributions
  - Crafty-Marshal-21: 3 contributions
  - Stone-Philosopher-8: 3 contributions
```

## Requirements

- Python 3.7+
- No external dependencies (uses only standard library)

## How It Works

1. **Parsing**: Uses regex to find agent credits in changelog entries
2. **Categorization**: Analyzes contribution text to determine category
3. **Diagram Generation**: Creates mermaid diagram with color-coded categories
4. **Statistics**: Calculates contribution counts and patterns
5. **Output**: Generates comprehensive markdown report

## Integration

This script can be integrated into:

- **CI/CD Pipelines**: Automatically update agent diagrams on changelog changes
- **Documentation Workflows**: Generate up-to-date contribution reports
- **Project Dashboards**: Visual representation of team contributions
- **Release Notes**: Automated generation of contribution summaries

## Maintenance

The script automatically adapts to changelog format changes and new agent naming patterns. The categorization logic can be easily extended to handle new types of contributions.
