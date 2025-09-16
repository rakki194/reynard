# Ncdu - NCurses Disk Usage Analyzer

## Overview

Ncdu (NCurses Disk Usage) is a disk usage analyzer with an ncurses interface, providing an interactive way to explore and manage disk space. It offers a user-friendly terminal interface for navigating directories, viewing sizes, and even deleting files directly from the application.

## Installation

### Arch Linux (Official Repository)

```bash
sudo pacman -S ncdu
```

### Alternative Installation Methods

```bash
# Ubuntu/Debian
sudo apt install ncdu

# CentOS/RHEL/Fedora
sudo yum install ncdu
# or
sudo dnf install ncdu

# macOS
brew install ncdu

# Using snap
sudo snap install ncdu
```

## Basic Usage

### Scan Current Directory

```bash
ncdu
```

### Scan Specific Directory

```bash
ncdu /path/to/directory
```

### Scan Root Directory

```bash
ncdu /
```

## Advanced Options

### Export and Import Results

```bash
# Export scan results to file
ncdu -o /tmp/scan_results

# Import and view previous scan
ncdu -f /tmp/scan_results

# Export in JSON format
ncdu -o /tmp/scan.json --json
```

### Exclude Directories

```bash
# Exclude multiple directories
ncdu --exclude /proc --exclude /sys --exclude /dev /

# Exclude using patterns
ncdu --exclude '*.log' --exclude '*.tmp'
```

### Display Options

```bash
# Show apparent size instead of disk usage
ncdu --apparent-size

# Show hidden files
ncdu --show-hidden

# Color output
ncdu --color=dark
```

### Performance Options

```bash
# Follow symlinks
ncdu --follow-symlinks

# Don't cross filesystem boundaries
ncdu --one-file-system

# Extended attributes
ncdu --extended
```

## Interactive Interface

### Navigation

- **Arrow Keys**: Navigate up/down through directories
- **Enter**: Enter selected directory
- **Left Arrow/Backspace**: Go back to parent directory
- **q**: Quit application

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
ncdu --exclude /proc --exclude /sys --exclude /dev /
```

### Home Directory Analysis

```bash
ncdu ~
```

### Project Directory Analysis

```bash
ncdu --exclude node_modules --exclude .git ~/projects/my-project
```

### Export Results for Later Review

```bash
ncdu -o ~/disk_usage_$(date +%Y%m%d).ncdu /
```

### Compare Two Scans

```bash
# First scan
ncdu -o /tmp/scan1.ncdu /

# Second scan (after some time)
ncdu -o /tmp/scan2.ncdu /

# Compare using diff
diff /tmp/scan1.ncdu /tmp/scan2.ncdu
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

## Performance Considerations

### Large Filesystems

- Ncdu builds an in-memory database during scanning
- Use `--one-file-system` to avoid scanning mounted filesystems
- Exclude system directories for faster system-wide scans

### Memory Usage

- Memory usage scales with number of files/directories
- Consider using `--exclude` for very large filesystems
- Monitor memory usage during large scans

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Run with sudo for system directories
sudo ncdu /
```

#### Slow Scanning

```bash
# Exclude slow filesystems
ncdu --exclude /proc --exclude /sys --exclude /dev

# Use one-file-system flag
ncdu --one-file-system /
```

#### Large Memory Usage

```bash
# Limit depth by excluding deep directories
ncdu --exclude '*/node_modules' --exclude '*/target'
```

## Integration with Other Tools

### Combine with find

```bash
# Find large files and analyze with ncdu
find /path -type f -size +100M -exec ncdu {} \;
```

### Use with cron for regular monitoring

```bash
# Add to crontab for daily scans
0 2 * * * ncdu -o /var/log/disk_usage_$(date +\%Y\%m\%d).ncdu /
```

### Script Integration

```bash
#!/bin/bash
# Automated cleanup script using ncdu
echo "Starting disk usage analysis..."
ncdu -o /tmp/current_scan.ncdu /
echo "Analysis complete. View with: ncdu -f /tmp/current_scan.ncdu"
```

## Best Practices

1. **Regular Scans**: Schedule regular scans to monitor disk usage
2. **Export Results**: Save scan results for comparison over time
3. **Exclude System Directories**: Use `--exclude` for system-wide scans
4. **Interactive Cleanup**: Use the interactive interface for safe file deletion
5. **Backup Before Deletion**: Always backup important data before deletion

## Configuration

### Environment Variables

```bash
# Set default exclusions
export NCDU_EXCLUDE="/proc,/sys,/dev"

# Set default color scheme
export NCDU_COLOR=dark
```

### Alias Setup

```bash
# Add to ~/.bashrc or ~/.zshrc
alias n='ncdu'
alias ns='ncdu --exclude /proc --exclude /sys --exclude /dev'
alias nh='ncdu --show-hidden'
```

## Comparison with Other Tools

| Feature       | ncdu | dust | gdu | agedu     |
| ------------- | ---- | ---- | --- | --------- |
| Interactive   | Yes  | Yes  | Yes | Web-based |
| File Deletion | Yes  | No   | Yes | No        |
| Export/Import | Yes  | No   | No  | Yes       |
| Mature        | Yes  | New  | New | Yes       |
| C-based       | Yes  | Rust | Go  | C         |

## Advanced Usage

### Automated Monitoring

```bash
#!/bin/bash
# Daily disk usage monitoring script
DATE=$(date +%Y%m%d)
ncdu -o "/var/log/disk_usage_${DATE}.ncdu" /
echo "Daily disk usage scan completed: /var/log/disk_usage_${DATE}.ncdu"
```

### Cleanup Automation

```bash
#!/bin/bash
# Automated cleanup based on ncdu results
ncdu -o /tmp/scan.ncdu /
# Process results and clean up old files
find /tmp -name "*.tmp" -mtime +7 -delete
```

## Related Tools

- **dust**: Modern Rust-based disk usage analyzer
- **gdu**: Fast Go-based disk usage analyzer
- **agedu**: Time-based disk usage analyzer
- **diskonaut**: Visual disk space navigator

## References

- [Ncdu Official Website](https://dev.yorhel.nl/ncdu)
- [Arch Linux Package](https://archlinux.org/packages/community/x86_64/ncdu/)
- [Ncdu Manual Page](https://dev.yorhel.nl/ncdu/man)
