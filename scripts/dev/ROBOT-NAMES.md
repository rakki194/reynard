# Reynard Robot Name Generator

_whiskers twitch with cunning intelligence_ A sophisticated robot naming system inspired by Asimov's Foundation and Destiny's Exo conventions, but infused with the animal spirits of the Reynard way.

## Quick Start

```bash
# Generate one random name
python3 robot-name-generator.py

# Generate 5 names with verbose output
python3 robot-name-generator.py --count 5 --verbose

# Generate fox-themed names
python3 robot-name-generator.py --spirit fox --count 3

# Generate Foundation-style names
python3 robot-name-generator.py --style foundation --count 3

# Analyze a specific name
python3 robot-name-generator.py --analyze "Vulpine-Commander-7"
```

## Naming Conventions

### 🦊 Fox Spirit Names

- **Foundation Style**: Vulpine-Sage-7, Reynard-Architect-13
- **Exo Style**: Fennec-Guard-21, Arctic-Sentinel-34
- **Hybrid Style**: Vulpes-Prometheus-Alpha, Reynard-Quantum-Prime

### 🐺 Wolf Spirit Names

- **Foundation Style**: Lupus-Commander-16, Alpha-Strategist-24
- **Exo Style**: Canis-Hunter-32, Fenrir-Protocol-40
- **Hybrid Style**: Lupus-Atlas-Ultra, Alpha-Neural-Mega

### 🦦 Otter Spirit Names

- **Foundation Style**: Lutra-Analyst-5, Pteronura-Designer-10
- **Exo Style**: Enhydra-Scout-15, Aonyx-Core-20
- **Hybrid Style**: Lutra-Vulcan-Hyper, Pteronura-Cyber-Neo

## Number Significance

- **Fox Numbers**: Fibonacci sequence (3, 7, 13, 21, 34, 55, 89) - representing cunning and adaptability
- **Wolf Numbers**: Pack multiples (8, 16, 24, 32, 40, 48, 56) - representing pack coordination
- **Otter Numbers**: Water cycles (5, 10, 15, 20, 25, 30, 35) - representing aquatic precision

## Command Line Options

- `--count, -c`: Number of names to generate (default: 1)
- `--spirit, -s`: Animal spirit theme (fox, wolf, otter)
- `--style`: Naming style (foundation, exo, hybrid)
- `--analyze, -a`: Analyze a specific name for spirit information
- `--verbose, -v`: Show detailed information about generated names

## Examples

```bash
# Generate a pack of wolf Exo names
python3 robot-name-generator.py --spirit wolf --style exo --count 5

# Generate fox Foundation names with analysis
python3 robot-name-generator.py --spirit fox --style foundation --count 3 --verbose

# Analyze any robot name
python3 robot-name-generator.py --analyze "Lutra-Atlas-Prime"
```

_three spirits howl in unison_ Every generated name carries the tactical precision of the fox, the pack coordination of the wolf, and the aquatic grace of the otter - perfect for any robotic companion in the Reynard ecosystem!
