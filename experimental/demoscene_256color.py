#!/usr/bin/env python3.15
"""
256-Color CLI Demoscene Animation
Showcasing Python 3.15.0a0 features with retro demoscene aesthetics
"""

import math
import os
import random
import time


# ANSI color codes for 256-color palette
class Colors256:
    # Basic colors
    BLACK = "\033[38;5;0m"
    WHITE = "\033[38;5;15m"
    RED = "\033[38;5;1m"
    GREEN = "\033[38;5;2m"
    BLUE = "\033[38;5;4m"
    YELLOW = "\033[38;5;3m"
    MAGENTA = "\033[38;5;5m"
    CYAN = "\033[38;5;6m"

    # Bright colors
    BRIGHT_RED = "\033[38;5;9m"
    BRIGHT_GREEN = "\033[38;5;10m"
    BRIGHT_BLUE = "\033[38;5;12m"
    BRIGHT_YELLOW = "\033[38;5;11m"
    BRIGHT_MAGENTA = "\033[38;5;13m"
    BRIGHT_CYAN = "\033[38;5;14m"

    # Grayscale
    GRAY = "\033[38;5;8m"
    LIGHT_GRAY = "\033[38;5;7m"

    # Rainbow colors
    RAINBOW = [
        "\033[38;5;196m",  # Red
        "\033[38;5;202m",  # Orange
        "\033[38;5;226m",  # Yellow
        "\033[38;5;46m",  # Green
        "\033[38;5;51m",  # Cyan
        "\033[38;5;21m",  # Blue
        "\033[38;5;129m",  # Purple
        "\033[38;5;201m",  # Magenta
    ]

    # Reset
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"


def clear_screen():
    """Clear the screen"""
    os.system("clear" if os.name == "posix" else "cls")


def hide_cursor():
    """Hide the cursor"""
    print("\033[?25l", end="")


def show_cursor():
    """Show the cursor"""
    print("\033[?25h", end="")


def get_color_256(r, g, b):
    """Convert RGB to 256-color ANSI code"""
    if r == g == b:
        # Grayscale
        gray = int(r * 23 / 255)
        return f"\033[38;5;{232 + gray}m"
    # Color cube
    r = int(r * 5 / 255)
    g = int(g * 5 / 255)
    b = int(b * 5 / 255)
    color = 16 + (r * 36) + (g * 6) + b
    return f"\033[38;5;{color}m"


def draw_ascii_art(text, color_func, frame=0):
    """Draw ASCII art with color effects"""
    lines = text.split("\n")
    for i, line in enumerate(lines):
        colored_line = ""
        for j, char in enumerate(line):
            if char != " ":
                color = color_func(i, j, frame)
                colored_line += color + char + Colors256.RESET
            else:
                colored_line += " "
        print(colored_line)


def python_logo_color(i, j, frame):
    """Color function for Python logo"""
    # Create a pulsing rainbow effect
    phase = (frame * 0.1) % (2 * math.pi)
    color_index = int((i + j + frame * 2) % len(Colors256.RAINBOW))
    return Colors256.RAINBOW[color_index]


def reynard_logo_color(i, j, frame):
    """Color function for Reynard logo"""
    # Fox-inspired orange gradient
    intensity = int(255 * (0.5 + 0.5 * math.sin(frame * 0.2 + i * 0.1)))
    return get_color_256(intensity, intensity // 2, 0)


def matrix_rain():
    """Matrix-style digital rain effect"""
    width = 80
    height = 24

    # Initialize rain drops
    drops = []
    for _ in range(width):
        drops.append(random.randint(0, height))

    for frame in range(100):
        clear_screen()
        hide_cursor()

        # Print header
        print(
            Colors256.BRIGHT_CYAN
            + Colors256.BOLD
            + "🐍 PYTHON 3.15.0a0 DEMOSCENE"
            + Colors256.RESET
        )
        print(Colors256.CYAN + "=" * 50 + Colors256.RESET)
        print()

        # Draw matrix rain
        for y in range(height):
            line = ""
            for x in range(width):
                if drops[x] == y:
                    # Head of drop
                    char = chr(random.randint(33, 126))
                    color = Colors256.BRIGHT_GREEN
                elif drops[x] > y and drops[x] - y < 10:
                    # Tail of drop
                    char = chr(random.randint(33, 126))
                    intensity = 255 - (drops[x] - y) * 25
                    color = get_color_256(0, intensity, 0)
                else:
                    char = " "
                    color = Colors256.RESET

                line += color + char + Colors256.RESET

            print(line)

        # Update drops
        for x in range(width):
            if drops[x] > height or random.random() < 0.02:
                drops[x] = 0
            else:
                drops[x] += 1

        time.sleep(0.1)

    show_cursor()


def plasma_effect():
    """Plasma effect with 256 colors"""
    width = 80
    height = 24

    for frame in range(200):
        clear_screen()
        hide_cursor()

        # Print header
        print(
            Colors256.BRIGHT_MAGENTA
            + Colors256.BOLD
            + "🌊 PLASMA EFFECT"
            + Colors256.RESET
        )
        print(Colors256.MAGENTA + "=" * 30 + Colors256.RESET)
        print()

        for y in range(height):
            line = ""
            for x in range(width):
                # Create plasma pattern
                value1 = math.sin(x * 0.1 + frame * 0.05)
                value2 = math.sin(y * 0.1 + frame * 0.03)
                value3 = math.sin((x + y) * 0.05 + frame * 0.02)
                value4 = math.sin(math.sqrt(x * x + y * y) * 0.1 + frame * 0.04)

                plasma = (value1 + value2 + value3 + value4) / 4

                # Convert to color
                intensity = int((plasma + 1) * 127.5)
                color = get_color_256(intensity, intensity // 2, 255 - intensity)

                char = (
                    "█"
                    if plasma > 0.5
                    else "▓"
                    if plasma > 0
                    else "▒"
                    if plasma > -0.5
                    else "░"
                )
                line += color + char + Colors256.RESET

            print(line)

        time.sleep(0.05)

    show_cursor()


def python_logo_animation():
    """Animated Python logo"""
    python_logo = """
    ╔═══════════════════════════════════════╗
    ║                                       ║
    ║    ██████╗ ██╗   ██╗████████╗██╗  ██╗ ║
    ║   ██╔═══██╗╚██╗ ██╔╝╚══██╔══╝██║  ██║ ║
    ║   ██║   ██║ ╚████╔╝    ██║   ███████║ ║
    ║   ██║   ██║  ╚██╔╝     ██║   ██╔══██║ ║
    ║   ╚██████╔╝   ██║      ██║   ██║  ██║ ║
    ║    ╚═════╝    ╚═╝      ╚═╝   ╚═╝  ╚═╝ ║
    ║                                       ║
    ║           3.15.0a0 DEMO               ║
    ║                                       ║
    ╚═══════════════════════════════════════╝
    """

    for frame in range(100):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_YELLOW
            + Colors256.BOLD
            + "🐍 PYTHON 3.15.0a0 LOGO ANIMATION"
            + Colors256.RESET
        )
        print()

        draw_ascii_art(python_logo, python_logo_color, frame)

        print()
        print(Colors256.CYAN + "Features being showcased:" + Colors256.RESET)
        features = [
            "✨ PEP 734: Multiple Interpreters",
            "🔄 PEP 649: Deferred Annotations",
            "🎨 256-Color Terminal Support",
            "⚡ Performance Improvements",
            "🛡️ Enhanced Error Messages",
        ]

        for i, feature in enumerate(features):
            color = Colors256.RAINBOW[i % len(Colors256.RAINBOW)]
            print(f"  {color}{feature}{Colors256.RESET}")

        time.sleep(0.1)

    show_cursor()


def reynard_fox_animation():
    """Animated Reynard fox logo"""
    fox_logo = """
    ╔═══════════════════════════════════════╗
    ║                                       ║
    ║        🦊 REYNARD FRAMEWORK           ║
    ║                                       ║
    ║           /\\_/\\                       ║
    ║          (  o.o  )                    ║
    ║           > ^ <                       ║
    ║                                       ║
    ║    Cunning Agile Development          ║
    ║    Python 3.15.0a0 Integration        ║
    ║                                       ║
    ╚═══════════════════════════════════════╝
    """

    for frame in range(150):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_RED
            + Colors256.BOLD
            + "🦊 REYNARD FRAMEWORK DEMO"
            + Colors256.RESET
        )
        print()

        draw_ascii_art(fox_logo, reynard_logo_color, frame)

        print()
        print(Colors256.YELLOW + "Experimental Features:" + Colors256.RESET)
        features = [
            "🔧 MCP Server Integration",
            "🎯 Agent Naming System",
            "🌍 ECS World Simulation",
            "📊 Monolith Detection",
            "🔍 Semantic Search",
        ]

        for i, feature in enumerate(features):
            color = Colors256.RAINBOW[i % len(Colors256.RAINBOW)]
            print(f"  {color}{feature}{Colors256.RESET}")

        time.sleep(0.08)

    show_cursor()


def color_palette_demo():
    """Demonstrate 256-color palette"""
    clear_screen()
    hide_cursor()

    print(
        Colors256.WHITE
        + Colors256.BOLD
        + "🎨 256-COLOR PALETTE DEMONSTRATION"
        + Colors256.RESET
    )
    print(Colors256.WHITE + "=" * 50 + Colors256.RESET)
    print()

    # System colors (0-15)
    print(Colors256.BRIGHT_CYAN + "System Colors (0-15):" + Colors256.RESET)
    for i in range(16):
        color_code = f"\033[38;5;{i}m"
        print(f"{color_code}█{Colors256.RESET}", end="")
    print("\n")

    # Color cube (16-231)
    print(Colors256.BRIGHT_CYAN + "Color Cube (16-231):" + Colors256.RESET)
    for r in range(6):
        for g in range(6):
            for b in range(6):
                color = 16 + (r * 36) + (g * 6) + b
                color_code = f"\033[38;5;{color}m"
                print(f"{color_code}█{Colors256.RESET}", end="")
            print()
    print()

    # Grayscale (232-255)
    print(Colors256.BRIGHT_CYAN + "Grayscale (232-255):" + Colors256.RESET)
    for i in range(24):
        color = 232 + i
        color_code = f"\033[38;5;{color}m"
        print(f"{color_code}█{Colors256.RESET}", end="")
    print("\n")

    show_cursor()
    input("Press Enter to continue...")


def main():
    """Main demoscene sequence"""
    print(
        Colors256.BRIGHT_GREEN
        + Colors256.BOLD
        + "🎬 PYTHON 3.15.0a0 DEMOSCENE STARTING..."
        + Colors256.RESET
    )
    time.sleep(2)

    try:
        # Sequence of animations
        color_palette_demo()
        matrix_rain()
        plasma_effect()
        python_logo_animation()
        reynard_fox_animation()

        # Final message
        clear_screen()
        print(
            Colors256.BRIGHT_GREEN
            + Colors256.BOLD
            + "🎉 DEMOSCENE COMPLETE!"
            + Colors256.RESET
        )
        print()
        print(
            Colors256.CYAN + "Python 3.15.0a0 Experimental Features:" + Colors256.RESET
        )
        print(Colors256.GREEN + "✅ Multiple Interpreters (PEP 734)" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Deferred Annotations (PEP 649)" + Colors256.RESET)
        print(Colors256.GREEN + "✅ 256-Color Terminal Support" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Enhanced Error Messages" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Performance Improvements" + Colors256.RESET)
        print()
        print(
            Colors256.YELLOW
            + "🦊 Reynard Framework Integration Ready!"
            + Colors256.RESET
        )

    except KeyboardInterrupt:
        clear_screen()
        show_cursor()
        print(Colors256.RED + "Demo interrupted by user" + Colors256.RESET)
    except Exception as e:
        clear_screen()
        show_cursor()
        print(Colors256.RED + f"Demo error: {e}" + Colors256.RESET)
    finally:
        show_cursor()


if __name__ == "__main__":
    main()
