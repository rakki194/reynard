# Agent Contributions Diagram Generator

A modular Python library for parsing changelog files and generating comprehensive mermaid diagrams showing the breakdown of agent contributions.

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules for parsing, categorization, and generation
- **Automatic Parsing**: Extracts agent contributions from changelog entries using regex patterns
- **Smart Categorization**: Automatically categorizes agents into 7 categories based on their work
- **Mermaid Diagram Generation**: Creates visual diagrams with proper mermaid syntax using neutral theme
- **Comprehensive Statistics**: Provides detailed breakdowns and top contributor analysis
- **Flexible Output**: Configurable input and output files
- **Built-in Validation**: Automatically validates generated diagrams for syntax correctness
- **CLI Interface**: Easy-to-use command-line interface
- **Library API**: Can be imported and used programmatically

## Installation

The library is part of the Reynard scripts package. To use it:

```bash
# From the Reynard project root
cd scripts/agent_diagram
python -m agent_diagram.cli --help
```

## Usage

### Command Line Interface

#### Basic Usage

```bash
# From the Reynard project root
python -m agent_diagram.cli

# Or using the installed script (if available)
agent-diagram
```

#### Advanced Usage

```bash
# Specify custom changelog and output files
python -m agent_diagram.cli --changelog docs/CHANGELOG.md --output reports/agent_breakdown.md

# Verbose output to see all contributions
python -m agent_diagram.cli --verbose

# Help
python -m agent_diagram.cli --help
```

### Programmatic Usage

```python
from agent_diagram import ChangelogParser, MermaidDiagramGenerator

# Parse changelog
parser = ChangelogParser("CHANGELOG.md")
contributions = parser.parse_changelog()

# Generate diagram
generator = MermaidDiagramGenerator(contributions)
diagram = generator.generate_diagram()
summary = generator.generate_summary()
patterns = generator.generate_key_patterns()

# Use the generated content
print(diagram)
```

## Command Line Options

- `--changelog`: Path to changelog file (default: `CHANGELOG.md`)
- `--output`: Output file path (default: `agent_contributions_diagram.md`)
- `--verbose, -v`: Show detailed output including all contributions
- `--help`: Show help message

## Architecture

The library is organized into modular components:

### Core Modules

- **`parser.py`**: `ChangelogParser` - Parses changelog files and extracts agent contributions
- **`categorizer.py`**: `AgentCategorizer` - Categorizes contributions into predefined categories
- **`contribution.py`**: `AgentContribution` - Data model for individual contributions
- **`generator.py`**: `MermaidDiagramGenerator` - Generates mermaid diagrams and summaries

### CLI Module

- **`cli.py`**: Command-line interface that orchestrates the core modules

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

```text
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

- Python 3.8+
- No external dependencies (uses only standard library)

## Development

### Running Tests

```bash
# From the agent_diagram directory
python -m pytest tests/
```

### Project Structure

```text
agent_diagram/
├── __init__.py          # Package initialization and exports
├── cli.py              # Command-line interface
├── core/               # Core processing modules
│   ├── __init__.py
│   ├── categorizer.py  # Agent categorization logic
│   ├── contribution.py # Data models
│   ├── generator.py    # Mermaid diagram generation
│   └── parser.py       # Changelog parsing
├── tests/              # Test suite
├── pyproject.toml      # Project configuration
└── README.md           # This file
```

## How It Works

1. **Parsing**: Uses regex to find agent credits in changelog entries
2. **Categorization**: Analyzes contribution text to determine category
3. **Diagram Generation**: Creates mermaid diagram with color-coded categories
4. **Statistics**: Calculates contribution counts and patterns
5. **Output**: Generates comprehensive markdown report

## Integration

This library can be integrated into:

- **CI/CD Pipelines**: Automatically update agent diagrams on changelog changes
- **Documentation Workflows**: Generate up-to-date contribution reports
- **Project Dashboards**: Visual representation of team contributions
- **Release Notes**: Automated generation of contribution summaries

## Maintenance

The library automatically adapts to changelog format changes and new agent naming patterns. The categorization logic can be easily extended to handle new types of contributions by modifying the `AgentCategorizer` class.

## Contributing

When extending the library:

1. Follow the modular architecture pattern
2. Add tests for new functionality
3. Update documentation as needed
4. Maintain backward compatibility
5. Follow the existing code style and patterns
