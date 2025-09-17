# Agedu - Time-based Disk Usage Analyzer

## Overview

Agedu is a specialized disk usage analyzer that focuses on identifying wasted disk space by analyzing file access times. Unlike traditional disk usage tools that only show current sizes, agedu helps you find files that haven't been accessed for a long time, making it perfect for identifying truly unused files and directories.

## Installation

### Arch Linux (AUR)

```bash
yay -S agedu
```

### Alternative Installation Methods

```bash
# Ubuntu/Debian
sudo apt install agedu

# CentOS/RHEL/Fedora
sudo yum install agedu
# or
sudo dnf install agedu

# macOS
brew install agedu

# Compile from source
wget https://www.chiark.greenend.org.uk/~sgtatham/agedu/agedu-20211212.8b8e7.tar.gz
tar -xzf agedu-20211212.8b8e7.tar.gz
cd agedu-20211212.8b8e7
./configure && make && sudo make install
```

## Basic Usage

### Scan Directory and Build Index

```bash
# Scan current directory
agedu -s .

# Scan specific directory
agedu -s /path/to/directory

# Scan home directory
agedu -s ~
```

### View Results in Web Browser

```bash
# Start web server to view results
agedu -w

# Specify port
agedu -w --port 8080

# Specify host
agedu -w --host 0.0.0.0
```

## Advanced Options

### Scan Options

```bash
# Exclude specific directories
agedu -s --exclude /proc --exclude /sys --exclude /dev /

# Exclude using patterns
agedu -s --exclude '*.log' --exclude '*.tmp'

# Follow symlinks
agedu -s --follow-symlinks

# Don't cross filesystem boundaries
agedu -s --one-file-system
```

### Time-based Filtering

```bash
# Show files older than 30 days
agedu -s --older-than 30d

# Show files older than 1 year
agedu -s --older-than 1y

# Show files accessed in last 7 days
agedu -s --newer-than 7d
```

### Output Options

```bash
# Export results to file
agedu -s -o /tmp/agedu_results /

# Import and view previous results
agedu -f /tmp/agedu_results

# Export in different formats
agedu -s --format csv -o /tmp/results.csv /
agedu -s --format json -o /tmp/results.json /
```

### Web Interface Options

```bash
# Custom web interface port
agedu -w --port 8080

# Bind to specific interface
agedu -w --host 127.0.0.1

# Disable web interface
agedu -s --no-web /
```

## Practical Examples

### Find Old Files in Home Directory

```bash
# Scan home directory
agedu -s ~

# View results in browser
agedu -w
```

### System-wide Analysis

```bash
# Scan system excluding system directories
agedu -s --exclude /proc --exclude /sys --exclude /dev /

# View results
agedu -w
```

### Find Files Older Than 1 Year

```bash
# Scan for files older than 1 year
agedu -s --older-than 1y ~

# View results
agedu -w
```

### Export Results for Analysis

```bash
# Export to CSV for spreadsheet analysis
agedu -s --format csv -o ~/disk_usage_$(date +%Y%m%d).csv /

# Export to JSON for programmatic analysis
agedu -s --format json -o ~/disk_usage_$(date +%Y%m%d).json /
```

### Compare Scans Over Time

```bash
# First scan
agedu -s -o /tmp/scan1.agedu /

# Second scan (after some time)
agedu -s -o /tmp/scan2.agedu /

# Compare results
agedu -f /tmp/scan1.agedu
agedu -f /tmp/scan2.agedu
```

## Web Interface Features

### Navigation

- **Tree View**: Browse directory structure
- **Size View**: See disk usage by size
- **Age View**: See disk usage by access time
- **Search**: Find specific files or directories

### Filtering Options

- **Date Range**: Filter by access time
- **Size Range**: Filter by file size
- **File Type**: Filter by file extension
- **Directory**: Filter by directory path

### Export Options

- **CSV Export**: Export filtered results to CSV
- **JSON Export**: Export filtered results to JSON
- **HTML Export**: Export filtered results to HTML

## Output Interpretation

### Age Categories

- **Recent**: Files accessed in the last 30 days
- **Old**: Files accessed 30 days to 1 year ago
- **Very Old**: Files accessed more than 1 year ago
- **Ancient**: Files accessed more than 5 years ago

### Size Display

- **Sizes**: Shown in human-readable format (KB, MB, GB, TB)
- **Percentages**: Relative size within current directory
- **Access Time**: Last access time for each file

### Color Coding

- **Red**: Very old files (potential candidates for deletion)
- **Yellow**: Old files (review for deletion)
- **Green**: Recent files (likely still in use)
- **Blue**: Directories

## Performance Considerations

### Large Filesystems

- Agedu builds an index during scanning, which can take time
- Use `--one-file-system` to avoid scanning mounted filesystems
- Exclude system directories for faster system-wide scans

### Memory Usage

- Memory usage scales with number of files
- Consider using `--exclude` for very large filesystems
- Monitor memory usage during large scans

### Disk I/O

- Agedu reads file access times, which can be I/O intensive
- Use on SSDs for better performance
- Consider running during off-peak hours

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Run with sudo for system directories
sudo agedu -s /
```

#### Slow Scanning

```bash
# Exclude slow filesystems
agedu -s --exclude /proc --exclude /sys --exclude /dev

# Use one-file-system flag
agedu -s --one-file-system /
```

#### Web Interface Not Accessible

```bash
# Check if port is in use
netstat -tlnp | grep :4868

# Use different port
agedu -w --port 8080
```

#### Large Memory Usage

```bash
# Exclude deep directories
agedu -s --exclude '*/node_modules' --exclude '*/target'
```

## Integration with Other Tools

### Combine with find

```bash
# Find old files and analyze with agedu
find /path -type f -atime +365 | xargs agedu -s
```

### Use with cron for regular monitoring

```bash
# Add to crontab for weekly scans
0 2 * * 0 agedu -s -o /var/log/agedu_$(date +\%Y\%m\%d).agedu /
```

### Script Integration

```bash
#!/bin/bash
# Automated cleanup script using agedu
echo "Starting agedu scan..."
agedu -s -o /tmp/agedu_scan.agedu /
echo "Scan complete. View results with: agedu -f /tmp/agedu_scan.agedu"
```

## Best Practices

1. **Regular Scans**: Schedule regular scans to monitor file usage over time
2. **Export Results**: Save scan results for comparison over time
3. **Exclude System Directories**: Use `--exclude` for system-wide scans
4. **Review Before Deletion**: Always review old files before deletion
5. **Backup Important Data**: Backup important data before cleanup

## Configuration

### Environment Variables

```bash
# Set default exclusions
export AGEDU_EXCLUDE="/proc,/sys,/dev"

# Set default port
export AGEDU_PORT=4868
```

### Alias Setup

```bash
# Add to ~/.bashrc or ~/.zshrc
alias a='agedu -s'
alias aw='agedu -w'
alias as='agedu -s --exclude /proc --exclude /sys --exclude /dev'
```

## Comparison with Other Tools

| Feature             | agedu | dust | ncdu | gdu |
| ------------------- | ----- | ---- | ---- | --- |
| Time-based Analysis | Yes   | No   | No   | No  |
| Web Interface       | Yes   | No   | No   | No  |
| Access Time Focus   | Yes   | No   | No   | No  |
| Export Formats      | Yes   | No   | Yes  | No  |
| Mature              | Yes   | New  | Yes  | New |

## Advanced Usage

### Automated Monitoring

```bash
#!/bin/bash
# Weekly agedu monitoring script
DATE=$(date +%Y%m%d)
agedu -s -o "/var/log/agedu_${DATE}.agedu" /
echo "Weekly agedu scan completed: /var/log/agedu_${DATE}.agedu"
```

### Cleanup Automation

```bash
#!/bin/bash
# Automated cleanup based on agedu results
agedu -s -o /tmp/scan.agedu /
# Process results and clean up old files
find /tmp -name "*.tmp" -atime +30 -delete
```

### Trend Analysis

```bash
#!/bin/bash
# Compare agedu scans over time
agedu -f /var/log/agedu_20240101.agedu
agedu -f /var/log/agedu_20240201.agedu
agedu -f /var/log/agedu_20240301.agedu
```

## Related Tools

- **dust**: Modern Rust-based disk usage analyzer
- **ncdu**: Interactive disk usage analyzer
- **gdu**: Fast Go-based disk usage analyzer
- **diskonaut**: Visual disk space navigator

## References

- [Agedu Official Website](https://www.chiark.greenend.org.uk/~sgtatham/agedu/)
- [Arch Linux AUR Package](https://aur.archlinux.org/packages/agedu)
- [Agedu Manual Page](https://www.chiark.greenend.org.uk/~sgtatham/agedu/agedu.html)
