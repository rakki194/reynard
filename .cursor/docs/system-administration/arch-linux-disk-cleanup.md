# Arch Linux Disk Cleanup and Space Management

## Overview

This guide covers comprehensive disk cleanup strategies specifically for Arch Linux systems, including package management cleanup, system maintenance, and integration with disk usage analysis tools.

## Package Management Cleanup

### Remove Orphaned Packages

Orphaned packages are dependencies that are no longer required by any installed package.

```bash
# List orphaned packages
sudo pacman -Qdtq

# Remove orphaned packages
sudo pacman -Rns $(pacman -Qdtq)

# Interactive removal (recommended)
sudo pacman -Rns $(pacman -Qdtq)
```

### Clean Package Cache

Pacman stores downloaded package files in `/var/cache/pacman/pkg/`. Over time, this cache can consume significant disk space.

```bash
# Install pacman-contrib if not already installed
sudo pacman -S pacman-contrib

# Remove all but the 2 most recent versions of each package
sudo paccache -rk2

# Remove all cached packages that are not currently installed
sudo paccache -ruk0

# Remove all cached packages (use with caution)
sudo paccache -rk0
```

### Clean System Cache

```bash
# Clean system cache
sudo pacman -Sc

# Clean system cache and remove uninstalled packages
sudo pacman -Scc
```

### Remove Unused Package Groups

```bash
# List package groups
pacman -Qg

# Remove unused package groups
sudo pacman -Rns $(pacman -Qqg)
```

## System Maintenance

### Clean Journal Logs

```bash
# Clean journal logs (keep last 7 days)
sudo journalctl --vacuum-time=7d

# Clean journal logs (keep last 100MB)
sudo journalctl --vacuum-size=100M

# Clean journal logs (keep last 50 files)
sudo journalctl --vacuum-files=50
```

### Clean Temporary Files

```bash
# Clean system temporary files
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Clean user cache
rm -rf ~/.cache/*

# Clean thumbnails
rm -rf ~/.thumbnails/*

# Clean recent files
rm -rf ~/.local/share/recently-used.xbel
```

### Clean Package Build Directories

```bash
# Clean AUR build directories
rm -rf ~/.cache/yay/*
rm -rf ~/.cache/paru/*

# Clean makepkg cache
rm -rf ~/.cache/makepkg/*
```

## User-specific Cleanup

### Clean Browser Cache

```bash
# Firefox
rm -rf ~/.cache/mozilla/firefox/*/cache2/*

# Chromium/Chrome
rm -rf ~/.cache/chromium/Default/Cache/*
rm -rf ~/.cache/google-chrome/Default/Cache/*

# Opera
rm -rf ~/.cache/opera/Cache/*
```

### Clean Development Tools

```bash
# Node.js
rm -rf ~/.npm/_cacache/*
rm -rf ~/.npm/_logs/*

# Python
rm -rf ~/.cache/pip/*

# Rust
cargo cache --autoclean

# Go
go clean -cache
```

### Clean Media and Downloads

```bash
# Clean old downloads
find ~/Downloads -type f -mtime +30 -delete

# Clean old media files
find ~/Pictures -name "*.tmp" -delete
find ~/Videos -name "*.tmp" -delete
```

## Automated Cleanup Scripts

### Comprehensive Cleanup Script

```bash
#!/bin/bash
# Comprehensive Arch Linux cleanup script

echo "🦊 Starting comprehensive system cleanup..."

# Remove orphaned packages
echo "Removing orphaned packages..."
sudo pacman -Rns $(pacman -Qdtq) 2>/dev/null || echo "No orphaned packages found"

# Clean package cache
echo "Cleaning package cache..."
sudo paccache -rk2
sudo paccache -ruk0

# Clean system cache
echo "Cleaning system cache..."
sudo pacman -Sc

# Clean journal logs
echo "Cleaning journal logs..."
sudo journalctl --vacuum-time=7d

# Clean temporary files
echo "Cleaning temporary files..."
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Clean user cache
echo "Cleaning user cache..."
rm -rf ~/.cache/*

# Clean thumbnails
echo "Cleaning thumbnails..."
rm -rf ~/.thumbnails/*

# Clean AUR build cache
echo "Cleaning AUR build cache..."
rm -rf ~/.cache/yay/* 2>/dev/null || true
rm -rf ~/.cache/paru/* 2>/dev/null || true

# Clean development tools cache
echo "Cleaning development tools cache..."
rm -rf ~/.npm/_cacache/* 2>/dev/null || true
rm -rf ~/.cache/pip/* 2>/dev/null || true

# Clean old downloads
echo "Cleaning old downloads..."
find ~/Downloads -type f -mtime +30 -delete 2>/dev/null || true

echo "✅ Cleanup complete!"
```

### Package Cache Management Script

```bash
#!/bin/bash
# Package cache management script

echo "📦 Managing package cache..."

# Show current cache size
echo "Current package cache size:"
du -sh /var/cache/pacman/pkg/

# Clean old package versions
echo "Cleaning old package versions..."
sudo paccache -rk2

# Clean uninstalled packages
echo "Cleaning uninstalled packages..."
sudo paccache -ruk0

# Show new cache size
echo "New package cache size:"
du -sh /var/cache/pacman/pkg/

echo "✅ Package cache management complete!"
```

## Integration with Disk Usage Tools

### Using Dust for Analysis

```bash
# Quick overview of disk usage
dust -d 2 /

# Analyze home directory
dust -d 3 ~

# Find large directories
dust --reverse -d 1 /
```

### Using Ncdu for Interactive Cleanup

```bash
# Interactive disk usage analysis
ncdu /

# Export results for later review
ncdu -o /tmp/disk_usage.ncdu /
```

### Using Gdu for Fast Analysis

```bash
# Fast disk usage analysis
gdu --ignore-dirs /proc,/sys,/dev /

# Find large files
gdu --only-file --reverse /
```

### Using Agedu for Time-based Analysis

```bash
# Find old, unused files
agedu -s ~
agedu -w
```

## Monitoring and Maintenance

### Regular Maintenance Schedule

```bash
# Add to crontab for regular maintenance
# Daily cleanup
0 2 * * * /path/to/cleanup-script.sh

# Weekly package cache cleanup
0 3 * * 0 sudo paccache -rk2

# Monthly orphaned package removal
0 4 1 * * sudo pacman -Rns $(pacman -Qdtq)
```

### Disk Usage Monitoring

```bash
# Create monitoring script
#!/bin/bash
# Disk usage monitoring script

THRESHOLD=80
USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
    echo "⚠️  Disk usage is at ${USAGE}%"
    echo "Running cleanup..."
    /path/to/cleanup-script.sh
else
    echo "✅ Disk usage is at ${USAGE}%"
fi
```

## Best Practices

### Regular Maintenance

1. **Weekly Package Cache Cleanup**: Run `paccache -rk2` weekly
2. **Monthly Orphaned Package Removal**: Remove orphaned packages monthly
3. **Quarterly System Cache Cleanup**: Clean system cache quarterly
4. **Annual Full System Cleanup**: Perform comprehensive cleanup annually

### Safety Considerations

1. **Backup Important Data**: Always backup important data before cleanup
2. **Review Before Deletion**: Review files before deletion
3. **Test Scripts**: Test cleanup scripts in a safe environment
4. **Monitor System**: Monitor system performance after cleanup

### Performance Optimization

1. **Use SSD Optimization**: Use tools optimized for SSDs
2. **Exclude System Directories**: Exclude system directories from scans
3. **Limit Depth**: Use depth limits for large filesystems
4. **Schedule During Off-peak**: Run cleanup during off-peak hours

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Run with sudo for system directories
sudo pacman -Sc
sudo paccache -rk2
```

#### Large Package Cache

```bash
# Check cache size
du -sh /var/cache/pacman/pkg/

# Clean cache
sudo paccache -rk2
sudo paccache -ruk0
```

#### Slow Performance

```bash
# Use fast tools for analysis
gdu --ignore-dirs /proc,/sys,/dev /

# Limit depth
dust -d 2 /
```

## Related Tools

- **dust**: Modern Rust-based disk usage analyzer
- **ncdu**: Interactive disk usage analyzer
- **gdu**: Fast Go-based disk usage analyzer
- **agedu**: Time-based disk usage analyzer
- **diskonaut**: Visual disk space navigator

## References

- [Arch Linux Package Management](https://wiki.archlinux.org/title/Pacman)
- [Arch Linux System Maintenance](https://wiki.archlinux.org/title/System_maintenance)
- [Pacman Cache Management](https://wiki.archlinux.org/title/Pacman#Cleaning_the_package_cache)
