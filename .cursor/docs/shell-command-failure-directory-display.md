# Shell Command Failure Directory Display Setup Guide

## Overview

This guide shows how to configure your shell so that, whenever a command fails, the current working directory is
displayed automatically. This is especially useful for LLM agents, as it helps them maintain awareness of their present
location in the filesystem after an error, while still preserving the original command output.

## Features

- ✅ Displays current working directory when commands fail
- ✅ Preserves original command output completely
- ✅ Works with both Bash and Zsh
- ✅ Compatible with zoxide and other shell enhancements
- ✅ Works in both interactive and non-interactive shells
- ✅ No performance impact on successful commands

## Prerequisites

- Bash 4.0+ or Zsh 5.0+
- Basic understanding of shell configuration files

## Installation

### For Bash Users

Add the following configuration to your `~/.bashrc` file:

```bash
# Command failure detection with directory display
# Function to execute before each prompt
__prompt_command() {
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        echo "You are currently in the $(pwd) directory!"
    fi
}

# Initialize zoxide (this will modify PROMPT_COMMAND)
eval "$(zoxide init bash)"

# Add our command failure detection to the existing PROMPT_COMMAND
# zoxide sets PROMPT_COMMAND to "__zoxide_hook;..." so we append our function
if [[ -n "$PROMPT_COMMAND" ]]; then
    PROMPT_COMMAND="${PROMPT_COMMAND};__prompt_command"
else
    PROMPT_COMMAND="__prompt_command"
fi
```

### For Zsh Users

Add the following configuration to your `~/.zshrc` file:

```zsh
# Command failure detection with directory display
# Function to execute after each command
__precmd() {
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        echo "You are currently in the $(pwd) directory!"
    fi
}

# Set up the hook for zsh
autoload -Uz add-zsh-hook
add-zsh-hook precmd __precmd
```

## How It Works

### Bash Implementation

- **PROMPT_COMMAND**: A special variable that contains commands to execute before displaying the prompt
- **Exit Status Check**: The `$?` variable contains the exit status of the last command
- **Zoxide Integration**: The configuration works alongside zoxide by appending to the existing PROMPT_COMMAND

### Zsh Implementation

- **precmd Hook**: A hook that runs before each prompt is displayed
- **add-zsh-hook**: The modern way to add functions to zsh hooks
- **Exit Status Check**: Same as Bash, using `$?` to check the last command's exit status

## Testing

After adding the configuration, test it with these commands:

```bash
# Test with a simple failure
false

# Test with a file operation failure
ls /nonexistent/directory

# Test with a command that doesn't exist
nonexistent_command

# Verify successful commands don't trigger the message
echo "This should succeed"
```

Expected output for failed commands:

```text
[original error message]
You are currently in the /path/to/current/directory directory!
```

## Advanced Configuration

### Customizing the Message

You can customize the directory message by modifying the echo statement:

```bash
# More detailed message
echo "❌ Command failed in: $(pwd)"

# With timestamp
echo "Command failed at $(date) in: $(pwd)"

# With exit code
echo "Command failed (exit code: $exit_status) in: $(pwd)"
```

### Adding Color

For colored output, you can use ANSI escape codes:

```bash
# Red text for failures
echo -e "\033[31mYou are currently in the $(pwd) directory!\033[0m"

# Or using tput for better compatibility
echo "$(tput setaf 1)You are currently in the $(pwd) directory!$(tput sgr0)"
```

### Conditional Display

You can add conditions to only show the message in certain directories:

```bash
__prompt_command() {
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        # Only show in development directories
        if [[ "$(pwd)" == *"/dev"* ]] || [[ "$(pwd)" == *"/projects"* ]]; then
            echo "You are currently in the $(pwd) directory!"
        fi
    fi
}
```

## Troubleshooting

### Common Issues

1. **Message not appearing**: Ensure the configuration is at the end of your shell config file
2. **Zoxide conflicts**: Make sure zoxide is initialized before adding the PROMPT_COMMAND
3. **Performance issues**: The configuration is lightweight, but if you experience slowdowns, check for other shell enhancements

### Debugging

To debug the configuration:

```bash
# Check if PROMPT_COMMAND is set (Bash)
echo "PROMPT_COMMAND: $PROMPT_COMMAND"

# Check if function is defined
type __prompt_command

# Test the function directly
__prompt_command
```

### Verification

Verify the configuration is working:

```bash
# This should show the directory message
false

# This should not show the directory message
echo "success"
```

## Integration with Other Tools

### Zoxide Compatibility

This configuration is designed to work seamlessly with zoxide. The key is to:

1. Initialize zoxide first
2. Append to the existing PROMPT_COMMAND rather than replacing it

### Oh My Zsh Compatibility

For Zsh users with Oh My Zsh, the configuration works without conflicts. The `add-zsh-hook` approach is the recommended
method for modern zsh configurations.

### Other Shell Enhancements

This configuration should work with most shell enhancements, including:

- Starship prompt
- Powerlevel10k
- Bash-it
- Prezto

## Best Practices

1. **Place at the end**: Add this configuration at the end of your shell config file
2. **Test thoroughly**: Test with various command types and failure modes
3. **Keep it simple**: Avoid complex logic in the prompt command functions
4. **Document changes**: Keep track of any customizations you make

## Alternative Approaches

### Using ERR Trap (Bash)

An alternative approach using the ERR trap:

```bash
trap 'if [ $? -ne 0 ]; then echo "You are currently in the $(pwd) directory!"; fi' ERR
```

**Pros**: Simpler, works in non-interactive shells
**Cons**: May interfere with other error handling, less reliable in some contexts

### Using DEBUG Trap (Bash)

Another alternative using the DEBUG trap:

```bash
trap 'if [ $? -ne 0 ]; then echo "You are currently in the $(pwd) directory!"; fi' DEBUG
```

**Pros**: More control over when it triggers
**Cons**: Can be verbose, may interfere with debugging

## Conclusion

This configuration provides a simple yet effective way to always know which directory you're in when commands fail.
It's particularly useful for:

- Debugging scripts and commands
- Understanding context when working in multiple directories
- Improving productivity in complex development environments

The implementation is lightweight, compatible with modern shell enhancements, and follows shell configuration best practices.

## References

- [Bash PROMPT_COMMAND Documentation](https://www.gnu.org/software/bash/manual/html_node/Controlling-the-Prompt.html)
- [Zsh Hook Functions Documentation](https://zsh.sourceforge.io/Doc/Release/Functions.html#Hook-Functions)
- [Zoxide GitHub Repository](https://github.com/ajeetdsouza/zoxide)
- [Shell Configuration Best Practices](https://mywiki.wooledge.org/DotFiles)
