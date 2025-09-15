# Agent Naming Utilities

This directory contains utilities for generating and managing agent names with animal spirit themes inspired by the
Reynard framework.

## Files

- `agent-self-namer.sh` - Script for agents to assign themselves names
- `agent-names.json` - Database of assigned agent names
- `AGENT-NAMING-GUIDE.md` - Comprehensive guide to the agent naming system
- `robot-name-generator.py` - Python script for generating robot/agent names

## Naming Conventions

The system supports three animal spirits:

- 🦊 **Fox** - Strategic cunning and elegant solutions
- 🐺 **Wolf** - Security dominance and adversarial thinking
- 🦦 **Otter** - Testing excellence and playful thoroughness

## Styles

- **Foundation** - Asimov-inspired naming (e.g., Vulpine-Sage-7)
- **Exo** - Destiny-inspired naming (e.g., Fennec-Guard-21)
- **Hybrid** - Mixed conventions (e.g., Vulpes-Prometheus-Alpha)

## Usage

```bash
# Generate a random name
python3 robot-name-generator.py

# Generate fox-themed names
python3 robot-name-generator.py --spirit fox --count 3

# Use the agent self-namer
bash agent-self-namer.sh
```

See `AGENT-NAMING-GUIDE.md` for detailed documentation.
