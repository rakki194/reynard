# Gdu - Fast Go-based Disk Usage Analyzer

## Overview

Gdu (Go Disk Usage) is a fast disk usage analyzer written in Go, optimized for SSDs but also effective on HDDs. It provides a terminal-based interface to explore disk usage with exceptional performance and an intuitive user experience.

## Installation

### Arch Linux (AUR)

```bash
yay -S gdu
```

### Alternative Installation Methods

```bash
# Using Go
go install github.com/dundee/gdu/v5/cmd/gdu@latest

# Using homebrew (macOS)
brew install gdu

# Using snap
sudo snap install gdu-disk-usage-analyzer

# Using apt (Ubuntu/Debian)
wget https://github.com/dundee/gdu/releases/latest/download/gdu_linux_amd64.tgz
tar -xzf gdu_linux_amd64.tgz
sudo mv gdu /usr/local/bin/
```

## Basic Usage

### Analyze Current Directory

```bash
gdu
```

### Analyze Specific Directory

```bash
gdu /path/to/directory
```

### Analyze Root Directory

```bash
gdu /
```

## Advanced Options

### Ignore Directories

```bash
# Ignore multiple directories
gdu --ignore-dirs /proc,/sys,/dev

# Ignore specific patterns
gdu --ignore-dirs "*.log,*.tmp"

# Ignore hidden directories
gdu --ignore-dirs ".*"
```

### Display Options

```bash
# Show apparent size instead of disk usage
gdu --show-apparent-size

# Show hidden files
gdu --show-hidden

# Color output
gdu --color=always

# No color output
gdu --color=never
```

### Performance Options

```bash
# Follow symlinks
gdu --follow-symlinks

# Don't cross filesystem boundaries
gdu --no-cross

# Extended attributes
gdu --extended
```

### Output Formatting

```bash
# Show in reverse order
gdu --reverse

# Show only directories
gdu --only-dir

# Show only files
gdu --only-file

# Show item count
gdu --show-item-count
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

## Practical Examples

### System-wide Analysis

```bash
gdu --ignore-dirs /proc,/sys,/dev /
```

### Home Directory Analysis

```bash
gdu ~
```

### Project Directory Analysis

```bash
gdu --ignore-dirs node_modules,.git,dist ~/projects/my-project
```

### Find Large Files

```bash
gdu --only-file --reverse /
```

### Analyze with Specific Exclusions

```bash
gdu --ignore-dirs "*.log,*.tmp,node_modules,.git" /var/log
```

## Performance Features

### SSD Optimization

- Gdu is specifically optimized for SSD performance
- Uses efficient I/O patterns for modern storage
- Minimizes random access patterns

### Memory Efficiency

- Low memory footprint compared to other tools
- Efficient data structures for large filesystems
- Streaming processing for very large directories

### Speed Comparison

```bash
# Benchmark different tools
time gdu /
time ncdu /
time dust /
```

## Output Interpretation

### Size Display

- **Sizes**: Shown in human-readable format (KB, MB, GB, TB)
- **Percentages**: Relative size within current directory
- **Item Count**: Number of files and directories

### Color Coding

- **Blue**: Directories
- **White**: Regular files
- **Red**: Large files/directories
- **Yellow**: Medium-sized items

### Status Information

- **Bottom Bar**: Shows current path and available actions
- **Progress**: Shows scan progress during initial analysis

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Run with sudo for system directories
sudo gdu /
```

#### Slow Performance on HDDs

```bash
# Use --no-cross to avoid slow filesystems
gdu --no-cross /

# Exclude slow directories
gdu --ignore-dirs /proc,/sys,/dev
```

#### Large Memory Usage

```bash
# Use --only-dir to reduce memory usage
gdu --only-dir /

# Limit depth by excluding deep directories
gdu --ignore-dirs "*/node_modules"
```

## Integration with Other Tools

### Combine with find

```bash
# Find large files and analyze with gdu
find /path -type f -size +100M | xargs gdu
```

### Use with cron for regular monitoring

```bash
# Add to crontab for daily scans
0 2 * * * gdu --ignore-dirs /proc,/sys,/dev / > /var/log/disk_usage_$(date +\%Y\%m\%d).log
```

### Script Integration

```bash
#!/bin/bash
# Automated cleanup script using gdu
echo "Starting disk usage analysis..."
gdu --ignore-dirs /proc,/sys,/dev / > /tmp/disk_usage.txt
echo "Analysis complete. Check /tmp/disk_usage.txt"
```

## Best Practices

1. **Use SSD Optimization**: Gdu is optimized for SSDs, use it on modern systems
2. **Exclude System Directories**: Use `--ignore-dirs` for system-wide scans
3. **Regular Monitoring**: Schedule regular scans to monitor disk usage
4. **Interactive Cleanup**: Use the interactive interface for safe file deletion
5. **Performance Tuning**: Use appropriate flags for your filesystem type

## Configuration

### Environment Variables

```bash
# Set default ignore directories
export GDU_IGNORE_DIRS="/proc,/sys,/dev"

# Set default color scheme
export GDU_COLOR=always
```

### Alias Setup

```bash
# Add to ~/.bashrc or ~/.zshrc
alias g='gdu'
alias gs='gdu --ignore-dirs /proc,/sys,/dev'
alias gh='gdu --show-hidden'
alias gf='gdu --only-file'
```

## Comparison with Other Tools

| Feature       | gdu       | dust | ncdu   | agedu     |
| ------------- | --------- | ---- | ------ | --------- |
| Speed         | Very Fast | Fast | Medium | Slow      |
| SSD Optimized | Yes       | Yes  | No     | No        |
| Interactive   | Yes       | Yes  | Yes    | Web-based |
| File Deletion | Yes       | No   | Yes    | No        |
| Go-based      | Yes       | No   | No     | No        |

## Advanced Usage

### Automated Monitoring

```bash
#!/bin/bash
# Daily disk usage monitoring script
DATE=$(date +%Y%m%d)
gdu --ignore-dirs /proc,/sys,/dev / > "/var/log/disk_usage_${DATE}.log"
echo "Daily disk usage scan completed: /var/log/disk_usage_${DATE}.log"
```

### Performance Benchmarking

```bash
#!/bin/bash
# Benchmark disk usage tools
echo "Benchmarking disk usage tools..."
echo "Gdu:"
time gdu --ignore-dirs /proc,/sys,/dev / > /dev/null
echo "Dust:"
time dust --exclude-dirs /proc,/sys,/dev / > /dev/null
echo "Ncdu:"
time ncdu --exclude /proc --exclude /sys --exclude /dev / > /dev/null
```

### Cleanup Automation

```bash
#!/bin/bash
# Automated cleanup based on gdu results
gdu --ignore-dirs /proc,/sys,/dev / > /tmp/scan.txt
# Process results and clean up old files
find /tmp -name "*.tmp" -mtime +7 -delete
```

## Performance Tips

### For SSDs

- Use default settings for optimal performance
- Gdu is specifically optimized for SSD access patterns
- Avoid unnecessary exclusions that might slow down scanning

### For HDDs

- Use `--no-cross` to avoid slow filesystems
- Exclude system directories that might cause delays
- Consider using `--only-dir` for faster directory-only scans

### For Large Filesystems

- Use appropriate ignore patterns
- Consider using `--only-dir` for overview scans
- Monitor memory usage during large scans

## Related Tools

- **dust**: Modern Rust-based disk usage analyzer
- **ncdu**: Interactive disk usage analyzer
- **agedu**: Time-based disk usage analyzer
- **diskonaut**: Visual disk space navigator

## References

- [Gdu GitHub Repository](https://github.com/dundee/gdu)
- [Arch Linux AUR Package](https://aur.archlinux.org/packages/gdu)
- [Go Package Registry](https://pkg.go.dev/github.com/dundee/gdu)
