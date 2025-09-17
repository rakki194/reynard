# Diskonaut - Visual Disk Space Navigator

## Overview

Diskonaut is a terminal-based disk space navigator that provides a visual representation of disk usage. It offers an interactive interface to explore and visualize disk usage with a focus on user experience and visual clarity. Diskonaut is particularly useful for understanding disk usage patterns and identifying large files and directories.

## Installation

### Arch Linux (AUR)

```bash
yay -S diskonaut
```

### Alternative Installation Methods

```bash
# Using cargo (if Rust is installed)
cargo install diskonaut

# Using homebrew (macOS)
brew install diskonaut

# Using snap
sudo snap install diskonaut

# Download binary from GitHub
wget https://github.com/imsnif/diskonaut/releases/latest/download/diskonaut-0.14.0-x86_64-unknown-linux-gnu.tar.gz
tar -xzf diskonaut-0.14.0-x86_64-unknown-linux-gnu.tar.gz
sudo mv diskonaut /usr/local/bin/
```

## Basic Usage

### Analyze Current Directory

```bash
diskonaut
```

### Analyze Specific Directory

```bash
diskonaut /path/to/directory
```

### Analyze Root Directory

```bash
diskonaut /
```

## Advanced Options

### Display Options

```bash
# Show hidden files
diskonaut --show-hidden

# Show apparent size instead of disk usage
diskonaut --apparent-size

# Color output
diskonaut --color=always

# No color output
diskonaut --color=never
```

### Performance Options

```bash
# Follow symlinks
diskonaut --follow-symlinks

# Don't cross filesystem boundaries
diskonaut --one-file-system

# Extended attributes
diskonaut --extended
```

### Output Options

```bash
# Non-interactive mode
diskonaut --non-interactive

# Export results to file
diskonaut --output /tmp/disk_usage.txt

# Show only directories
diskonaut --only-dirs

# Show only files
diskonaut --only-files
```

## Interactive Interface

### Navigation

- **Arrow Keys**: Navigate up/down through directories
- **Enter**: Enter selected directory
- **Left Arrow/Backspace**: Go back to parent directory
- **q**: Quit application
- **h**: Show help

### File Operations

- **d**: Delete selected file/directory
- **r**: Refresh current directory
- **n**: Sort by name
- **s**: Sort by size
- **C**: Sort by items
- **a**: Toggle between apparent size and disk usage

### View Options

- **i**: Show item information
- **e**: Show extended information
- **c**: Show item count
- **h**: Toggle human-readable sizes
- **g**: Toggle between GiB and GB

### Visual Options

- **v**: Toggle visual mode
- **t**: Toggle tree view
- **l**: Toggle list view
- **b**: Toggle bar chart view

## Practical Examples

### System-wide Analysis

```bash
diskonaut --one-file-system /
```

### Home Directory Analysis

```bash
diskonaut ~
```

### Project Directory Analysis

```bash
diskonaut --show-hidden ~/projects/my-project
```

### Export Results

```bash
diskonaut --output /tmp/disk_usage.txt /
```

### Non-interactive Mode

```bash
diskonaut --non-interactive --output /tmp/disk_usage.txt /
```

## Visual Features

### Tree View

- Hierarchical display of directory structure
- Size visualization with proportional bars
- Color coding for different file types

### List View

- Tabular display of files and directories
- Sortable columns for size, name, and type
- Detailed information for each item

### Bar Chart View

- Visual representation of disk usage
- Proportional sizing for easy comparison
- Color coding for different categories

### Color Coding

- **Blue**: Directories
- **White**: Regular files
- **Red**: Large files/directories
- **Yellow**: Medium-sized items
- **Green**: Small items

## Performance Considerations

### Large Filesystems

- Diskonaut builds a visual representation during scanning
- Use `--one-file-system` to avoid scanning mounted filesystems
- Exclude system directories for faster system-wide scans

### Memory Usage

- Memory usage scales with number of files/directories
- Consider using `--only-dirs` for overview scans
- Monitor memory usage during large scans

### Visual Performance

- Visual rendering can be slower on large directories
- Use `--non-interactive` for faster processing
- Consider using `--only-dirs` for better performance

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Run with sudo for system directories
sudo diskonaut /
```

#### Slow Performance

```bash
# Use one-file-system flag
diskonaut --one-file-system /

# Use non-interactive mode
diskonaut --non-interactive /
```

#### Large Memory Usage

```bash
# Use only-dirs flag
diskonaut --only-dirs /

# Exclude deep directories
diskonaut --exclude '*/node_modules'
```

#### Visual Issues

```bash
# Disable color output
diskonaut --color=never

# Use non-interactive mode
diskonaut --non-interactive
```

## Integration with Other Tools

### Combine with find

```bash
# Find large files and analyze with diskonaut
find /path -type f -size +100M | xargs diskonaut
```

### Use with cron for regular monitoring

```bash
# Add to crontab for daily scans
0 2 * * * diskonaut --non-interactive --output /var/log/disk_usage_$(date +\%Y\%m\%d).txt /
```

### Script Integration

```bash
#!/bin/bash
# Automated cleanup script using diskonaut
echo "Starting disk usage analysis..."
diskonaut --non-interactive --output /tmp/disk_usage.txt /
echo "Analysis complete. Check /tmp/disk_usage.txt"
```

## Best Practices

1. **Use Visual Mode**: Take advantage of the visual interface for better understanding
2. **Exclude System Directories**: Use `--one-file-system` for system-wide scans
3. **Regular Monitoring**: Schedule regular scans to monitor disk usage
4. **Interactive Cleanup**: Use the interactive interface for safe file deletion
5. **Performance Tuning**: Use appropriate flags for your filesystem type

## Configuration

### Environment Variables

```bash
# Set default color scheme
export DISKONAUT_COLOR=always

# Set default output format
export DISKONAUT_OUTPUT_FORMAT=text
```

### Alias Setup

```bash
# Add to ~/.bashrc or ~/.zshrc
alias d='diskonaut'
alias ds='diskonaut --one-file-system'
alias dh='diskonaut --show-hidden'
alias dn='diskonaut --non-interactive'
```

## Comparison with Other Tools

| Feature          | diskonaut | dust | ncdu | gdu |
| ---------------- | --------- | ---- | ---- | --- |
| Visual Interface | Yes       | Yes  | Yes  | Yes |
| Interactive      | Yes       | Yes  | Yes  | Yes |
| File Deletion    | Yes       | No   | Yes  | Yes |
| Visual Mode      | Yes       | No   | No   | No  |
| Rust-based       | Yes       | Yes  | No   | No  |

## Advanced Usage

### Automated Monitoring

```bash
#!/bin/bash
# Daily disk usage monitoring script
DATE=$(date +%Y%m%d)
diskonaut --non-interactive --output "/var/log/disk_usage_${DATE}.txt" /
echo "Daily disk usage scan completed: /var/log/disk_usage_${DATE}.txt"
```

### Performance Benchmarking

```bash
#!/bin/bash
# Benchmark disk usage tools
echo "Benchmarking disk usage tools..."
echo "Diskonaut:"
time diskonaut --non-interactive / > /dev/null
echo "Dust:"
time dust / > /dev/null
echo "Ncdu:"
time ncdu / > /dev/null
```

### Cleanup Automation

```bash
#!/bin/bash
# Automated cleanup based on diskonaut results
diskonaut --non-interactive --output /tmp/scan.txt /
# Process results and clean up old files
find /tmp -name "*.tmp" -mtime +7 -delete
```

## Visual Features Deep Dive

### Tree Visualization

- Proportional sizing based on disk usage
- Hierarchical structure with indentation
- Color coding for different file types
- Interactive navigation through the tree

### Bar Chart Visualization

- Horizontal bars showing relative sizes
- Color coding for different categories
- Easy comparison between directories
- Visual representation of disk usage patterns

### List Visualization

- Tabular format with sortable columns
- Detailed information for each item
- Size, name, and type information
- Easy scanning of large directories

## Performance Tips

### For Large Filesystems

- Use `--one-file-system` to avoid slow filesystems
- Use `--non-interactive` for faster processing
- Consider using `--only-dirs` for overview scans

### For Visual Performance

- Use `--color=never` on slow terminals
- Use `--non-interactive` for automated processing
- Consider using `--only-dirs` for better visual performance

### For Memory Usage

- Use `--only-dirs` to reduce memory usage
- Exclude deep directories that might consume memory
- Monitor memory usage during large scans

## Related Tools

- **dust**: Modern Rust-based disk usage analyzer
- **ncdu**: Interactive disk usage analyzer
- **gdu**: Fast Go-based disk usage analyzer
- **agedu**: Time-based disk usage analyzer

## References

- [Diskonaut GitHub Repository](https://github.com/imsnif/diskonaut)
- [Arch Linux AUR Package](https://aur.archlinux.org/packages/diskonaut)
- [Rust Package Registry](https://crates.io/crates/diskonaut)
