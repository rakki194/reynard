# Dust - Modern Disk Usage Analyzer

## Overview

Dust is a modern, Rust-based alternative to the traditional `du` command, providing an intuitive and user-friendly
interface for analyzing disk usage. It offers a visual representation of directory sizes with color-coded output, making
it easier to identify large files and directories.

## Installation

### Arch Linux (AUR)

```bash
yay -S dust
```

### Alternative Installation Methods

```bash
# Using cargo (if Rust is installed)
cargo install du-dust

# Using homebrew (macOS)
brew install dust

# Using snap
sudo snap install dust
```

## Basic Usage

### Analyze Current Directory

```bash
dust
```

### Analyze Specific Directory

```bash
dust /path/to/directory
```

### Analyze Root Directory

```bash
dust /
```

## Advanced Options

### Depth Control

```bash
# Show only 2 levels deep
dust -d 2

# Show 5 levels deep
dust -d 5
```

### Exclude Directories

```bash
# Exclude multiple directories
dust --exclude-dirs node_modules,.git,target

# Exclude specific patterns
dust --exclude-dirs "*.log"
```

### File Type Filtering

```bash
# Show only directories
dust --only-dir

# Show only files
dust --only-file
```

### Output Formatting

```bash
# Show apparent size instead of disk usage
dust --apparent-size

# Show in reverse order (smallest first)
dust --reverse

# Show hidden files
dust --all
```

### Interactive Mode

```bash
# Enable interactive navigation
dust -i

# Start in interactive mode by default
dust --interactive
```

## Output Interpretation

### Color Coding

- **Red**: Large directories/files
- **Yellow**: Medium-sized directories/files
- **Green**: Small directories/files
- **Blue**: System directories

### Size Display

- Sizes are shown in human-readable format (KB, MB, GB, TB)
- Percentages show relative size within the current directory
- Tree structure shows directory hierarchy

## Practical Examples

### Find Large Files in Home Directory

```bash
dust -d 3 ~
```

### Analyze Project Directory

```bash
dust --exclude-dirs node_modules,.git,dist ~/projects/my-project
```

### System-wide Analysis

```bash
dust -d 2 --exclude-dirs /proc,/sys,/dev /
```

### Find Largest Directories

```bash
dust --reverse -d 1 /
```

## Performance Considerations

### Large Filesystems

- Dust is optimized for speed with Rust implementation
- Use `-d` flag to limit depth for faster scanning
- Exclude system directories like `/proc`, `/sys` for system-wide scans

### Memory Usage

- Dust loads directory information into memory
- For very large filesystems, consider using `-d` to limit depth
- Monitor memory usage during large scans

## Comparison with Other Tools

| Feature     | Dust        | du   | ncdu        | gdu         |
| ----------- | ----------- | ---- | ----------- | ----------- |
| Speed       | Fast        | Slow | Medium      | Very Fast   |
| Visual      | Color-coded | Text | Interactive | Interactive |
| Rust        | Yes         | No   | No          | No          |
| Interactive | Yes         | No   | Yes         | Yes         |

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Run with sudo for system directories
sudo dust /
```

#### Large Output

```bash
# Limit depth to reduce output
dust -d 2

# Use pager for large output
dust | less
```

#### Slow Performance

```bash
# Exclude slow filesystems
dust --exclude-dirs /proc,/sys,/dev

# Limit depth
dust -d 1
```

## Integration with Other Tools

### Combine with find

```bash
# Find large files and analyze with dust
find /path -type f -size +100M | xargs dust
```

### Use with grep

```bash
# Filter dust output
dust | grep -E "(GB|TB)"
```

### Script Integration

```bash
#!/bin/bash
# Automated cleanup script using dust
LARGE_DIRS=$(dust -d 1 --only-dir | head -10)
echo "Largest directories:"
echo "$LARGE_DIRS"
```

## Best Practices

1. **Start with depth limits** for large filesystems
2. **Exclude system directories** when scanning root
3. **Use color output** for better visualization
4. **Combine with other tools** for comprehensive analysis
5. **Regular monitoring** to prevent disk space issues

## Configuration

### Environment Variables

```bash
# Set default depth
export DUST_DEFAULT_DEPTH=3

# Set default exclusions
export DUST_DEFAULT_EXCLUDE="node_modules,.git,target"
```

### Alias Setup

```bash
# Add to ~/.bashrc or ~/.zshrc
alias d='dust -d 2'
alias ds='dust --exclude-dirs node_modules,.git,target'
alias dsys='sudo dust --exclude-dirs /proc,/sys,/dev -d 2'
```

## Related Tools

- **ncdu**: Interactive disk usage analyzer
- **gdu**: Fast Go-based disk usage analyzer
- **agedu**: Time-based disk usage analyzer
- **diskonaut**: Visual disk space navigator

## References

- [Dust GitHub Repository](https://github.com/bootandy/dust)
- [Arch Linux AUR Package](https://aur.archlinux.org/packages/dust)
- [Rust Package Registry](https://crates.io/crates/du-dust)
