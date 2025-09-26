# Color Output in CLIs - Python 3.14

_Comprehensive guide to the enhanced color output capabilities in Python 3.14 command-line interfaces_

## Overview

Python 3.14 introduces significant improvements to color output in command-line interfaces, including better terminal detection, enhanced color support, and improved accessibility features. These enhancements make it easier to create visually appealing and accessible CLI applications.

## What's New in Python 3.14

### Enhanced Color Support

```python
import sys
import os

def demonstrate_enhanced_color_support():
    """Show enhanced color support in Python 3.14"""

    # 1. Automatic terminal detection
    def check_terminal_capabilities():
        print(f"Terminal supports colors: {sys.stdout.isatty()}")
        print(f"Terminal type: {os.getenv('TERM', 'unknown')}")
        print(f"Color depth: {sys.stdout.color_depth}")
        print(f"Supports true color: {sys.stdout.supports_true_color}")
        print(f"Supports 256 colors: {sys.stdout.supports_256_colors}")

    # 2. Enhanced color constants
    from colorama import Fore, Back, Style

    def show_enhanced_colors():
        print(f"{Fore.RED}Red text{Style.RESET_ALL}")
        print(f"{Fore.GREEN}Green text{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Blue text{Style.RESET_ALL}")
        print(f"{Back.YELLOW}Yellow background{Style.RESET_ALL}")
        print(f"{Style.BRIGHT}Bright text{Style.RESET_ALL}")
        print(f"{Style.DIM}Dim text{Style.RESET_ALL}")

    # 3. True color support
    def show_true_colors():
        if sys.stdout.supports_true_color:
            # RGB color support
            print(f"\033[38;2;255;0;0mTrue color red\033[0m")
            print(f"\033[38;2;0;255;0mTrue color green\033[0m")
            print(f"\033[38;2;0;0;255mTrue color blue\033[0m")
        else:
            print("True color not supported")

    check_terminal_capabilities()
    show_enhanced_colors()
    show_true_colors()
```

### Improved Terminal Detection

```python
import sys
import os

def improved_terminal_detection():
    """Show improved terminal detection capabilities"""

    def detect_terminal_type():
        """Detect terminal type and capabilities"""
        term = os.getenv('TERM', 'unknown')
        term_program = os.getenv('TERM_PROGRAM', 'unknown')
        term_program_version = os.getenv('TERM_PROGRAM_VERSION', 'unknown')

        print(f"Terminal: {term}")
        print(f"Terminal program: {term_program}")
        print(f"Terminal version: {term_program_version}")

        # Check for specific terminals
        if 'xterm' in term:
            print("XTerm-compatible terminal detected")
        elif 'screen' in term:
            print("Screen terminal detected")
        elif 'tmux' in term:
            print("Tmux terminal detected")
        elif term_program == 'iTerm.app':
            print("iTerm2 detected")
        elif term_program == 'vscode':
            print("VS Code terminal detected")

    def check_color_support():
        """Check color support capabilities"""
        # Check if stdout is a TTY
        is_tty = sys.stdout.isatty()
        print(f"stdout is TTY: {is_tty}")

        # Check color support
        supports_colors = hasattr(sys.stdout, 'color_depth') and sys.stdout.color_depth > 1
        print(f"Supports colors: {supports_colors}")

        # Check specific color depths
        if hasattr(sys.stdout, 'color_depth'):
            depth = sys.stdout.color_depth
            print(f"Color depth: {depth}")

            if depth >= 24:
                print("Supports true color (24-bit)")
            elif depth >= 8:
                print("Supports 256 colors (8-bit)")
            elif depth >= 4:
                print("Supports 16 colors (4-bit)")
            else:
                print("Limited color support")

    detect_terminal_type()
    check_color_support()
```

## Color Output Libraries

### Using colorama (Enhanced)

```python
from colorama import Fore, Back, Style, init
import sys

def enhanced_colorama_usage():
    """Show enhanced colorama usage in Python 3.14"""

    # Initialize colorama with enhanced options
    init(
        autoreset=True,  # Automatically reset colors after each print
        strip=False,     # Don't strip colors when not supported
        convert=True     # Convert colors for Windows
    )

    def basic_colors():
        """Show basic color usage"""
        print(f"{Fore.RED}This is red text{Style.RESET_ALL}")
        print(f"{Fore.GREEN}This is green text{Style.RESET_ALL}")
        print(f"{Fore.BLUE}This is blue text{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}This is yellow text{Style.RESET_ALL}")
        print(f"{Fore.MAGENTA}This is magenta text{Style.RESET_ALL}")
        print(f"{Fore.CYAN}This is cyan text{Style.RESET_ALL}")
        print(f"{Fore.WHITE}This is white text{Style.RESET_ALL}")

    def background_colors():
        """Show background color usage"""
        print(f"{Back.RED}Red background{Style.RESET_ALL}")
        print(f"{Back.GREEN}Green background{Style.RESET_ALL}")
        print(f"{Back.BLUE}Blue background{Style.RESET_ALL}")
        print(f"{Back.YELLOW}Yellow background{Style.RESET_ALL}")
        print(f"{Back.MAGENTA}Magenta background{Style.RESET_ALL}")
        print(f"{Back.CYAN}Cyan background{Style.RESET_ALL}")
        print(f"{Back.WHITE}White background{Style.RESET_ALL}")

    def text_styles():
        """Show text style usage"""
        print(f"{Style.DIM}Dim text{Style.RESET_ALL}")
        print(f"{Style.NORMAL}Normal text{Style.RESET_ALL}")
        print(f"{Style.BRIGHT}Bright text{Style.RESET_ALL}")
        print(f"{Style.RESET_ALL}Reset all styles")

    def combined_styles():
        """Show combined color and style usage"""
        print(f"{Fore.RED}{Style.BRIGHT}Bright red text{Style.RESET_ALL}")
        print(f"{Fore.GREEN}{Back.YELLOW}Green text on yellow background{Style.RESET_ALL}")
        print(f"{Fore.BLUE}{Style.DIM}Dim blue text{Style.RESET_ALL}")
        print(f"{Fore.WHITE}{Back.RED}{Style.BRIGHT}Bright white text on red background{Style.RESET_ALL}")

    basic_colors()
    print()
    background_colors()
    print()
    text_styles()
    print()
    combined_styles()
```

### Using rich (Enhanced)

```python
from rich.console import Console
from rich.text import Text
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress
import time

def enhanced_rich_usage():
    """Show enhanced rich library usage in Python 3.14"""

    # Create console with enhanced options
    console = Console(
        color_system="auto",  # Automatically detect color system
        force_terminal=True,  # Force terminal output
        width=120,           # Set console width
        height=30            # Set console height
    )

    def basic_rich_output():
        """Show basic rich output"""
        console.print("Hello, [bold red]World[/bold red]!")
        console.print("This is [italic blue]italic blue text[/italic blue]")
        console.print("This is [underline green]underlined green text[/underline green]")
        console.print("This is [strike magenta]strikethrough magenta text[/strike magenta]")

    def rich_panels():
        """Show rich panels"""
        console.print(Panel("This is a panel with [bold]bold text[/bold]", title="Panel Title"))
        console.print(Panel("This is a [red]red panel[/red]", border_style="red"))
        console.print(Panel("This is a [green]green panel[/green]", border_style="green"))

    def rich_tables():
        """Show rich tables"""
        table = Table(title="Sample Table")
        table.add_column("Name", style="cyan")
        table.add_column("Age", style="magenta")
        table.add_column("City", style="green")

        table.add_row("Alice", "25", "New York")
        table.add_row("Bob", "30", "London")
        table.add_row("Charlie", "35", "Tokyo")

        console.print(table)

    def rich_progress():
        """Show rich progress bars"""
        with Progress() as progress:
            task = progress.add_task("[green]Processing...", total=100)

            for i in range(100):
                progress.update(task, advance=1)
                time.sleep(0.01)

    basic_rich_output()
    print()
    rich_panels()
    print()
    rich_tables()
    print()
    rich_progress()
```

## Advanced Color Features

### True Color Support

```python
import sys

def true_color_support():
    """Show true color (24-bit) support"""

    def rgb_color(r, g, b, text):
        """Create RGB color text"""
        if sys.stdout.supports_true_color:
            return f"\033[38;2;{r};{g};{b}m{text}\033[0m"
        else:
            return text

    def background_rgb_color(r, g, b, text):
        """Create RGB background color text"""
        if sys.stdout.supports_true_color:
            return f"\033[48;2;{r};{g};{b}m{text}\033[0m"
        else:
            return text

    def show_rainbow_text():
        """Show rainbow text using true colors"""
        text = "Rainbow text with true colors!"
        colors = [
            (255, 0, 0),    # Red
            (255, 127, 0),  # Orange
            (255, 255, 0),  # Yellow
            (0, 255, 0),    # Green
            (0, 0, 255),    # Blue
            (75, 0, 130),   # Indigo
            (148, 0, 211)   # Violet
        ]

        for i, char in enumerate(text):
            color = colors[i % len(colors)]
            print(rgb_color(*color, char), end="")
        print()

    def show_gradient_text():
        """Show gradient text using true colors"""
        text = "Gradient text effect"

        for i, char in enumerate(text):
            # Create gradient from red to blue
            r = int(255 * (1 - i / len(text)))
            g = 0
            b = int(255 * (i / len(text)))
            print(rgb_color(r, g, b, char), end="")
        print()

    def show_color_palette():
        """Show a color palette using true colors"""
        print("True Color Palette:")

        # Show different shades of red
        for i in range(0, 256, 32):
            print(rgb_color(i, 0, 0, f"Red {i:3d}"), end=" ")
        print()

        # Show different shades of green
        for i in range(0, 256, 32):
            print(rgb_color(0, i, 0, f"Green {i:3d}"), end=" ")
        print()

        # Show different shades of blue
        for i in range(0, 256, 32):
            print(rgb_color(0, 0, i, f"Blue {i:3d}"), end=" ")
        print()

    show_rainbow_text()
    show_gradient_text()
    show_color_palette()
```

### 256 Color Support

```python
def color_256_support():
    """Show 256 color support"""

    def color_256(color_code, text):
        """Create 256 color text"""
        if sys.stdout.supports_256_colors:
            return f"\033[38;5;{color_code}m{text}\033[0m"
        else:
            return text

    def background_color_256(color_code, text):
        """Create 256 background color text"""
        if sys.stdout.supports_256_colors:
            return f"\033[48;5;{color_code}m{text}\033[0m"
        else:
            return text

    def show_256_color_cube():
        """Show 256 color cube"""
        print("256 Color Cube:")

        # Show color cube (6x6x6)
        for r in range(6):
            for g in range(6):
                for b in range(6):
                    color_code = 16 + r * 36 + g * 6 + b
                    print(color_256(color_code, "█"), end="")
                print(" ", end="")
            print()

    def show_256_grayscale():
        """Show 256 grayscale colors"""
        print("256 Grayscale:")

        for i in range(232, 256):
            print(color_256(i, "█"), end="")
        print()

    def show_256_system_colors():
        """Show 256 system colors"""
        print("256 System Colors:")

        # Standard colors (0-15)
        for i in range(16):
            print(color_256(i, f"{i:2d}"), end=" ")
        print()

    show_256_color_cube()
    show_256_grayscale()
    show_256_system_colors()
```

## Accessibility Features

### High Contrast Mode

```python
import sys
import os

def accessibility_features():
    """Show accessibility features for color output"""

    def detect_high_contrast():
        """Detect high contrast mode"""
        # Check for high contrast environment variables
        high_contrast = os.getenv('HIGH_CONTRAST', '0') == '1'
        print(f"High contrast mode: {high_contrast}")

        # Check for accessibility preferences
        accessibility = os.getenv('ACCESSIBILITY', '0') == '1'
        print(f"Accessibility mode: {accessibility}")

        return high_contrast or accessibility

    def high_contrast_colors():
        """Show high contrast color combinations"""
        if detect_high_contrast():
            # High contrast color combinations
            print(f"{Fore.WHITE}{Back.BLACK}White on black{Style.RESET_ALL}")
            print(f"{Fore.BLACK}{Back.WHITE}Black on white{Style.RESET_ALL}")
            print(f"{Fore.YELLOW}{Back.BLACK}Yellow on black{Style.RESET_ALL}")
            print(f"{Fore.BLACK}{Back.YELLOW}Black on yellow{Style.RESET_ALL}")
        else:
            # Normal color combinations
            print(f"{Fore.RED}Red text{Style.RESET_ALL}")
            print(f"{Fore.GREEN}Green text{Style.RESET_ALL}")
            print(f"{Fore.BLUE}Blue text{Style.RESET_ALL}")

    def colorblind_friendly_colors():
        """Show colorblind-friendly color combinations"""
        # Use colors that are distinguishable for colorblind users
        print(f"{Fore.RED}Red (protanopia safe){Style.RESET_ALL}")
        print(f"{Fore.BLUE}Blue (deuteranopia safe){Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Yellow (tritanopia safe){Style.RESET_ALL}")
        print(f"{Fore.MAGENTA}Magenta (all types safe){Style.RESET_ALL}")

    def alternative_indicators():
        """Show alternative indicators for color"""
        # Use symbols and text in addition to colors
        print(f"{Fore.GREEN}✓ Success{Style.RESET_ALL}")
        print(f"{Fore.RED}✗ Error{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}⚠ Warning{Style.RESET_ALL}")
        print(f"{Fore.BLUE}ℹ Info{Style.RESET_ALL}")

        # Use different text styles
        print(f"{Style.BRIGHT}Important message{Style.RESET_ALL}")
        print(f"{Style.DIM}Less important message{Style.RESET_ALL}")
        print(f"{Style.UNDERLINE}Underlined message{Style.RESET_ALL}")

    high_contrast_colors()
    print()
    colorblind_friendly_colors()
    print()
    alternative_indicators()
```

### Color Detection and Fallbacks

```python
def color_detection_and_fallbacks():
    """Show color detection and fallback mechanisms"""

    def detect_color_capabilities():
        """Detect color capabilities and set appropriate fallbacks"""
        capabilities = {
            'true_color': sys.stdout.supports_true_color,
            '256_colors': sys.stdout.supports_256_colors,
            '16_colors': hasattr(sys.stdout, 'color_depth') and sys.stdout.color_depth >= 4,
            'monochrome': not sys.stdout.isatty()
        }

        print("Color capabilities detected:")
        for capability, supported in capabilities.items():
            print(f"  {capability}: {supported}")

        return capabilities

    def adaptive_color_output():
        """Show adaptive color output based on capabilities"""
        capabilities = detect_color_capabilities()

        if capabilities['true_color']:
            # Use true colors
            print(f"\033[38;2;255;0;0mTrue color red\033[0m")
        elif capabilities['256_colors']:
            # Use 256 colors
            print(f"\033[38;5;196m256 color red\033[0m")
        elif capabilities['16_colors']:
            # Use 16 colors
            print(f"\033[31m16 color red\033[0m")
        else:
            # Use text indicators
            print("RED: This would be red text")

    def graceful_degradation():
        """Show graceful degradation for different terminals"""
        def colorize(text, color):
            """Colorize text with graceful degradation"""
            if not sys.stdout.isatty():
                return text  # No colors for non-TTY

            if sys.stdout.supports_true_color:
                color_map = {
                    'red': '\033[38;2;255;0;0m',
                    'green': '\033[38;2;0;255;0m',
                    'blue': '\033[38;2;0;0;255m'
                }
            elif sys.stdout.supports_256_colors:
                color_map = {
                    'red': '\033[38;5;196m',
                    'green': '\033[38;5;46m',
                    'blue': '\033[38;5;21m'
                }
            else:
                color_map = {
                    'red': '\033[31m',
                    'green': '\033[32m',
                    'blue': '\033[34m'
                }

            return f"{color_map.get(color, '')}{text}\033[0m"

        print(colorize("This is red text", "red"))
        print(colorize("This is green text", "green"))
        print(colorize("This is blue text", "blue"))

    detect_color_capabilities()
    print()
    adaptive_color_output()
    print()
    graceful_degradation()
```

## CLI Application Examples

### Progress Bars with Colors

```python
import time
import sys

def colored_progress_bars():
    """Show colored progress bars"""

    def simple_progress_bar():
        """Simple colored progress bar"""
        total = 100

        for i in range(total + 1):
            # Calculate progress percentage
            progress = i / total

            # Create progress bar
            bar_length = 50
            filled_length = int(bar_length * progress)
            bar = "█" * filled_length + "░" * (bar_length - filled_length)

            # Color based on progress
            if progress < 0.3:
                color = "\033[31m"  # Red
            elif progress < 0.7:
                color = "\033[33m"  # Yellow
            else:
                color = "\033[32m"  # Green

            # Print progress bar
            print(f"\r{color}[{bar}] {progress:.1%}\033[0m", end="", flush=True)
            time.sleep(0.05)

        print()  # New line after completion

    def multi_stage_progress():
        """Multi-stage progress bar with different colors"""
        stages = [
            ("Initializing", 20, "\033[36m"),  # Cyan
            ("Processing", 40, "\033[33m"),    # Yellow
            ("Finalizing", 30, "\033[32m"),    # Green
            ("Complete", 10, "\033[35m")       # Magenta
        ]

        total = sum(stage[1] for stage in stages)
        current = 0

        for stage_name, stage_length, color in stages:
            print(f"\n{color}{stage_name}...\033[0m")

            for i in range(stage_length):
                current += 1
                progress = current / total

                bar_length = 50
                filled_length = int(bar_length * progress)
                bar = "█" * filled_length + "░" * (bar_length - filled_length)

                print(f"\r{color}[{bar}] {progress:.1%}\033[0m", end="", flush=True)
                time.sleep(0.02)

        print("\n\033[32m✓ All stages completed!\033[0m")

    simple_progress_bar()
    multi_stage_progress()
```

### Status Messages with Colors

```python
def colored_status_messages():
    """Show colored status messages"""

    def status_message(message, status):
        """Create colored status message"""
        status_colors = {
            'success': '\033[32m✓\033[0m',  # Green checkmark
            'error': '\033[31m✗\033[0m',    # Red X
            'warning': '\033[33m⚠\033[0m',  # Yellow warning
            'info': '\033[34mℹ\033[0m',     # Blue info
            'debug': '\033[35m🐛\033[0m'    # Magenta bug
        }

        color = status_colors.get(status, '')
        return f"{color} {message}"

    def show_status_messages():
        """Show various status messages"""
        messages = [
            ("Operation completed successfully", "success"),
            ("An error occurred", "error"),
            ("This is a warning", "warning"),
            ("Here's some information", "info"),
            ("Debug information", "debug")
        ]

        for message, status in messages:
            print(status_message(message, status))

    def log_with_timestamp():
        """Show log messages with colored timestamps"""
        import datetime

        def log_message(level, message):
            """Create log message with colored level"""
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")

            level_colors = {
                'INFO': '\033[34m',    # Blue
                'WARN': '\033[33m',    # Yellow
                'ERROR': '\033[31m',   # Red
                'DEBUG': '\033[35m'    # Magenta
            }

            color = level_colors.get(level, '')
            reset = '\033[0m'

            return f"{timestamp} {color}[{level}]{reset} {message}"

        print(log_message("INFO", "Application started"))
        print(log_message("WARN", "Configuration file not found"))
        print(log_message("ERROR", "Failed to connect to database"))
        print(log_message("DEBUG", "Processing user request"))

    show_status_messages()
    print()
    log_with_timestamp()
```

### Interactive CLI with Colors

```python
def interactive_cli_with_colors():
    """Show interactive CLI with colors"""

    def colored_prompt():
        """Create colored prompt"""
        prompt = "\033[32muser@host\033[0m:\033[34m~/project\033[0m$ "
        return input(prompt)

    def colored_help():
        """Show colored help text"""
        print("\033[1mAvailable commands:\033[0m")
        print("  \033[32mhelp\033[0m     - Show this help message")
        print("  \033[32mstatus\033[0m   - Show system status")
        print("  \033[32mconfig\033[0m   - Show configuration")
        print("  \033[32mquit\033[0m     - Exit the application")

    def colored_status():
        """Show colored system status"""
        print("\033[1mSystem Status:\033[0m")
        print(f"  CPU: \033[32m85%\033[0m")
        print(f"  Memory: \033[33m67%\033[0m")
        print(f"  Disk: \033[31m92%\033[0m")
        print(f"  Network: \033[32mConnected\033[0m")

    def colored_config():
        """Show colored configuration"""
        print("\033[1mConfiguration:\033[0m")
        print(f"  Host: \033[36mlocalhost\033[0m")
        print(f"  Port: \033[36m8080\033[0m")
        print(f"  Debug: \033[33mEnabled\033[0m")
        print(f"  Log Level: \033[35mINFO\033[0m")

    def interactive_loop():
        """Interactive CLI loop"""
        print("\033[1mWelcome to the Interactive CLI!\033[0m")
        print("Type 'help' for available commands.")

        while True:
            try:
                command = colored_prompt().strip().lower()

                if command == 'help':
                    colored_help()
                elif command == 'status':
                    colored_status()
                elif command == 'config':
                    colored_config()
                elif command == 'quit':
                    print("\033[32mGoodbye!\033[0m")
                    break
                else:
                    print(f"\033[31mUnknown command: {command}\033[0m")
                    print("Type 'help' for available commands.")

            except KeyboardInterrupt:
                print("\n\033[33mUse 'quit' to exit.\033[0m")
            except EOFError:
                print("\n\033[32mGoodbye!\033[0m")
                break

    # Uncomment to run interactive CLI
    # interactive_loop()

    # Show examples instead
    colored_help()
    print()
    colored_status()
    print()
    colored_config()
```

## Best Practices

### Color Usage Guidelines

```python
def color_usage_guidelines():
    """Show color usage guidelines and best practices"""

    def color_semantics():
        """Show semantic color usage"""
        print("\033[1mSemantic Color Usage:\033[0m")
        print("  \033[32mGreen\033[0m  - Success, positive actions, go")
        print("  \033[31mRed\033[0m    - Error, danger, stop")
        print("  \033[33mYellow\033[0m - Warning, caution, attention")
        print("  \033[34mBlue\033[0m   - Information, neutral actions")
        print("  \033[35mMagenta\033[0m - Debug, development info")
        print("  \033[36mCyan\033[0m   - Links, secondary actions")

    def accessibility_guidelines():
        """Show accessibility guidelines"""
        print("\033[1mAccessibility Guidelines:\033[0m")
        print("  • Don't rely solely on color to convey information")
        print("  • Use symbols and text in addition to colors")
        print("  • Provide high contrast options")
        print("  • Test with colorblind users")
        print("  • Support monochrome terminals")

    def performance_considerations():
        """Show performance considerations"""
        print("\033[1mPerformance Considerations:\033[0m")
        print("  • Avoid excessive color changes")
        print("  • Use color caching for repeated output")
        print("  • Disable colors in non-interactive mode")
        print("  • Consider terminal capabilities")

    def cross_platform_compatibility():
        """Show cross-platform compatibility tips"""
        print("\033[1mCross-Platform Compatibility:\033[0m")
        print("  • Use colorama for Windows compatibility")
        print("  • Test on different terminals")
        print("  • Provide fallbacks for unsupported terminals")
        print("  • Handle different color depths gracefully")

    color_semantics()
    print()
    accessibility_guidelines()
    print()
    performance_considerations()
    print()
    cross_platform_compatibility()
```

### Error Handling and Fallbacks

```python
def error_handling_and_fallbacks():
    """Show error handling and fallback mechanisms"""

    def safe_color_output():
        """Show safe color output with error handling"""
        def safe_print(text, color_code=None):
            """Safely print colored text with fallbacks"""
            try:
                if color_code and sys.stdout.isatty():
                    print(f"{color_code}{text}\033[0m")
                else:
                    print(text)
            except (OSError, UnicodeEncodeError):
                # Fallback to plain text
                print(text)

        # Test safe color output
        safe_print("This is safe colored text", "\033[32m")
        safe_print("This is safe plain text")

    def color_detection_with_fallback():
        """Show color detection with fallback"""
        def get_color_code(color_name):
            """Get color code with fallback"""
            colors = {
                'red': '\033[31m',
                'green': '\033[32m',
                'blue': '\033[34m',
                'yellow': '\033[33m'
            }

            if sys.stdout.isatty() and hasattr(sys.stdout, 'color_depth'):
                return colors.get(color_name, '')
            else:
                return ''  # No colors for non-TTY or unsupported terminals

        # Test color detection
        print(f"{get_color_code('red')}Red text{get_color_code('')}")
        print(f"{get_color_code('green')}Green text{get_color_code('')}")
        print(f"{get_color_code('blue')}Blue text{get_color_code('')}")

    def graceful_degradation():
        """Show graceful degradation for different scenarios"""
        def adaptive_output(text, color_name):
            """Adaptive output based on terminal capabilities"""
            if not sys.stdout.isatty():
                return text  # No colors for non-TTY

            if sys.stdout.supports_true_color:
                color_map = {
                    'red': '\033[38;2;255;0;0m',
                    'green': '\033[38;2;0;255;0m',
                    'blue': '\033[38;2;0;0;255m'
                }
            elif sys.stdout.supports_256_colors:
                color_map = {
                    'red': '\033[38;5;196m',
                    'green': '\033[38;5;46m',
                    'blue': '\033[38;5;21m'
                }
            else:
                color_map = {
                    'red': '\033[31m',
                    'green': '\033[32m',
                    'blue': '\033[34m'
                }

            color = color_map.get(color_name, '')
            return f"{color}{text}\033[0m"

        # Test adaptive output
        print(adaptive_output("Adaptive red text", "red"))
        print(adaptive_output("Adaptive green text", "green"))
        print(adaptive_output("Adaptive blue text", "blue"))

    safe_color_output()
    print()
    color_detection_with_fallback()
    print()
    graceful_degradation()
```

## Summary

Python 3.14's enhanced color output capabilities provide:

### Key Features

- **Enhanced terminal detection** with better capability detection
- **True color support** for 24-bit RGB colors
- **256 color support** for extended color palettes
- **Accessibility features** including high contrast mode
- **Graceful degradation** for different terminal types
- **Cross-platform compatibility** with improved Windows support

### Best Practices

- **Semantic color usage** for consistent user experience
- **Accessibility considerations** for inclusive design
- **Performance optimization** for efficient color output
- **Error handling** with proper fallbacks
- **Cross-platform testing** for broad compatibility

### Use Cases

- **CLI applications** with rich visual feedback
- **Progress indicators** with color-coded status
- **Logging systems** with colored log levels
- **Interactive tools** with enhanced user experience
- **Development tools** with better debugging output

The enhanced color output capabilities make Python 3.14 an excellent choice for creating visually appealing and accessible command-line applications that work across different platforms and terminal types.
