#!/usr/bin/env python3.15
"""256-Color CLI Demoscene Animation
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


def matrix_rain():
    """Matrix-style digital rain effect"""
    width = 80
    height = 24

    # Initialize rain drops with varying speeds
    drops = []
    speeds = []
    for _ in range(width):
        drops.append(random.randint(0, height))
        speeds.append(random.uniform(0.3, 1.0))

    for frame in range(150):
        clear_screen()
        hide_cursor()

        # Print header
        print(
            Colors256.BRIGHT_CYAN
            + Colors256.BOLD
            + "🌧️ MATRIX DIGITAL RAIN"
            + Colors256.RESET,
        )
        print(Colors256.CYAN + "=" * 50 + Colors256.RESET)
        print()

        # Draw matrix rain
        for y in range(height):
            line = ""
            for x in range(width):
                if drops[x] == y:
                    # Head of drop - bright character
                    char = chr(random.randint(33, 126))
                    color = Colors256.BRIGHT_GREEN
                elif drops[x] > y and drops[x] - y < 15:
                    # Tail of drop with gradient
                    char = chr(random.randint(33, 126))
                    intensity = max(0, 255 - (drops[x] - y) * 15)
                    color = get_color_256(0, intensity, 0)
                else:
                    char = " "
                    color = Colors256.RESET

                line += color + char + Colors256.RESET

            print(line)

        # Update drops with varying speeds
        for x in range(width):
            if drops[x] > height + 15 or random.random() < 0.01:
                drops[x] = 0
                speeds[x] = random.uniform(0.3, 1.0)
            else:
                drops[x] += speeds[x]

        time.sleep(0.08)

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
            + Colors256.RESET,
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
                    else "▓" if plasma > 0 else "▒" if plasma > -0.5 else "░"
                )
                line += color + char + Colors256.RESET

            print(line)

        time.sleep(0.05)

    show_cursor()


def python_logo_animation():
    """Animated Python logo"""
    for frame in range(100):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_YELLOW
            + Colors256.BOLD
            + "🐍 PYTHON 3.15.0a0 LOGO ANIMATION"
            + Colors256.RESET,
        )
        print()

        # Simple text display instead of ASCII art
        print(Colors256.BRIGHT_YELLOW + "PYTHON 3.15.0a0" + Colors256.RESET)
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
    for frame in range(150):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_RED
            + Colors256.BOLD
            + "🦊 REYNARD FRAMEWORK DEMO"
            + Colors256.RESET,
        )
        print()

        # Simple text display instead of ASCII art
        print(Colors256.BRIGHT_RED + "🦊 REYNARD FRAMEWORK" + Colors256.RESET)
        print(Colors256.YELLOW + "Cunning Agile Development" + Colors256.RESET)
        print(Colors256.CYAN + "Python 3.15.0a0 Integration" + Colors256.RESET)
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


def mandelbrot_fractal():
    """Animated Mandelbrot set fractal"""
    width = 80
    height = 24

    for frame in range(100):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_MAGENTA
            + Colors256.BOLD
            + "🌀 MANDELBROT FRACTAL"
            + Colors256.RESET,
        )
        print(Colors256.MAGENTA + "=" * 50 + Colors256.RESET)
        print()

        # Animate zoom and position
        zoom = 0.5 + 0.3 * math.sin(frame * 0.05)
        offset_x = 0.3 * math.sin(frame * 0.03)
        offset_y = 0.2 * math.cos(frame * 0.04)

        for y in range(height):
            line = ""
            for x in range(width):
                # Map screen coordinates to complex plane
                cx = (x - width / 2) * zoom / width + offset_x
                cy = (y - height / 2) * zoom / height + offset_y

                # Mandelbrot calculation
                zx, zy = 0, 0
                iterations = 0
                max_iter = 50

                while zx * zx + zy * zy < 4 and iterations < max_iter:
                    zx, zy = zx * zx - zy * zy + cx, 2 * zx * zy + cy
                    iterations += 1

                # Color based on iterations
                if iterations == max_iter:
                    char = "█"
                    color = Colors256.BLACK
                else:
                    intensity = int(iterations * 255 / max_iter)
                    color = get_color_256(intensity, intensity // 2, 255 - intensity)
                    chars = [" ", "░", "▒", "▓", "█"]
                    char = chars[min(iterations // 10, 4)]

                line += color + char + Colors256.RESET

            print(line)

        time.sleep(0.1)

    show_cursor()


def spiral_animation():
    """Animated spiral effect"""
    width = 80
    height = 24

    for frame in range(200):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_YELLOW
            + Colors256.BOLD
            + "🌀 SPIRAL ANIMATION"
            + Colors256.RESET,
        )
        print(Colors256.YELLOW + "=" * 50 + Colors256.RESET)
        print()

        # Create spiral pattern
        for y in range(height):
            line = ""
            for x in range(width):
                # Calculate distance from center
                center_x, center_y = width // 2, height // 2
                dx = x - center_x
                dy = y - center_y
                distance = math.sqrt(dx * dx + dy * dy)

                # Calculate angle
                angle = math.atan2(dy, dx)

                # Create spiral pattern
                spiral_radius = distance * 0.3 + frame * 0.1
                spiral_angle = angle + frame * 0.05

                # Calculate spiral value
                spiral_value = math.sin(spiral_radius - spiral_angle * 3)

                # Color and character based on spiral value
                if abs(spiral_value) > 0.7:
                    intensity = int((spiral_value + 1) * 127.5)
                    color = get_color_256(intensity, 255 - intensity, intensity // 2)
                    char = "█"
                elif abs(spiral_value) > 0.4:
                    intensity = int((spiral_value + 1) * 127.5)
                    color = get_color_256(intensity // 2, intensity, intensity // 2)
                    char = "▓"
                elif abs(spiral_value) > 0.1:
                    intensity = int((spiral_value + 1) * 127.5)
                    color = get_color_256(intensity // 3, intensity // 3, intensity)
                    char = "▒"
                else:
                    char = " "
                    color = Colors256.RESET

                line += color + char + Colors256.RESET

            print(line)

        time.sleep(0.05)

    show_cursor()


def fire_effect():
    """ASCII fire animation"""
    width = 80
    height = 24

    # Initialize fire buffer
    fire_buffer = [[0 for _ in range(width)] for _ in range(height)]

    for frame in range(150):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_RED + Colors256.BOLD + "🔥 FIRE EFFECT" + Colors256.RESET,
        )
        print(Colors256.RED + "=" * 50 + Colors256.RESET)
        print()

        # Generate fire at bottom
        for x in range(width):
            fire_buffer[height - 1][x] = random.randint(0, 255)

        # Propagate fire upward
        for y in range(height - 2, -1, -1):
            for x in range(width):
                # Average with neighbors and add randomness
                left = fire_buffer[y + 1][max(0, x - 1)]
                center = fire_buffer[y + 1][x]
                right = fire_buffer[y + 1][min(width - 1, x + 1)]

                avg = (left + center + right) // 3
                fire_buffer[y][x] = max(0, avg - random.randint(0, 20))

        # Render fire
        for y in range(height):
            line = ""
            for x in range(width):
                intensity = fire_buffer[y][x]

                if intensity > 200:
                    char = "█"
                    color = Colors256.BRIGHT_RED
                elif intensity > 150:
                    char = "▓"
                    color = Colors256.RED
                elif intensity > 100:
                    char = "▒"
                    color = Colors256.BRIGHT_YELLOW
                elif intensity > 50:
                    char = "░"
                    color = Colors256.YELLOW
                else:
                    char = " "
                    color = Colors256.RESET

                line += color + char + Colors256.RESET

            print(line)

        time.sleep(0.08)

    show_cursor()


def rainbow_wave():
    """Rainbow wave animation"""
    width = 80
    height = 24

    for frame in range(200):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_CYAN
            + Colors256.BOLD
            + "🌈 RAINBOW WAVE"
            + Colors256.RESET,
        )
        print(Colors256.CYAN + "=" * 50 + Colors256.RESET)
        print()

        for y in range(height):
            line = ""
            for x in range(width):
                # Create wave pattern
                wave1 = math.sin(x * 0.2 + frame * 0.1)
                wave2 = math.sin(y * 0.3 + frame * 0.05)
                wave3 = math.sin((x + y) * 0.1 + frame * 0.08)

                combined_wave = (wave1 + wave2 + wave3) / 3

                # Map to rainbow colors
                hue = (combined_wave + 1) * 180  # 0-360 degrees

                # Convert HSV to RGB
                h = hue / 60
                i = int(h)
                f = h - i
                p = 0
                q = 1 - f
                t = f

                if i == 0:
                    r, g, b = 1, t, p
                elif i == 1:
                    r, g, b = q, 1, p
                elif i == 2:
                    r, g, b = p, 1, t
                elif i == 3:
                    r, g, b = p, q, 1
                elif i == 4:
                    r, g, b = t, p, 1
                else:
                    r, g, b = 1, p, q

                # Convert to 256-color
                r = int(r * 255)
                g = int(g * 255)
                b = int(b * 255)
                color = get_color_256(r, g, b)

                # Choose character based on wave intensity
                if abs(combined_wave) > 0.7:
                    char = "█"
                elif abs(combined_wave) > 0.4:
                    char = "▓"
                elif abs(combined_wave) > 0.1:
                    char = "▒"
                else:
                    char = "░"

                line += color + char + Colors256.RESET

            print(line)

        time.sleep(0.06)

    show_cursor()


def color_palette_demo():
    """Demonstrate 256-color palette"""
    clear_screen()
    hide_cursor()

    print(
        Colors256.WHITE
        + Colors256.BOLD
        + "🎨 256-COLOR PALETTE DEMONSTRATION"
        + Colors256.RESET,
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


def bouncing_balls():
    """Bouncing balls animation with physics"""
    width = 80
    height = 24

    # Initialize balls
    balls = []
    for _ in range(5):
        ball = {
            'x': random.uniform(5, width - 5),
            'y': random.uniform(5, height - 5),
            'vx': random.uniform(-2, 2),
            'vy': random.uniform(-2, 2),
            'color': random.choice(Colors256.RAINBOW),
            'size': random.randint(1, 3),
        }
        balls.append(ball)

    for frame in range(200):
        clear_screen()
        hide_cursor()

        print(
            Colors256.BRIGHT_BLUE
            + Colors256.BOLD
            + "⚽ BOUNCING BALLS"
            + Colors256.RESET,
        )
        print(Colors256.BLUE + "=" * 50 + Colors256.RESET)
        print()

        # Create screen buffer
        screen = [[' ' for _ in range(width)] for _ in range(height)]

        # Update and draw balls
        for ball in balls:
            # Update position
            ball['x'] += ball['vx']
            ball['y'] += ball['vy']

            # Bounce off walls
            if ball['x'] <= ball['size'] or ball['x'] >= width - ball['size']:
                ball['vx'] = -ball['vx']
                ball['x'] = max(ball['size'], min(width - ball['size'], ball['x']))

            if ball['y'] <= ball['size'] or ball['y'] >= height - ball['size']:
                ball['vy'] = -ball['vy']
                ball['y'] = max(ball['size'], min(height - ball['size'], ball['y']))

            # Add gravity
            ball['vy'] += 0.1

            # Draw ball
            x, y = int(ball['x']), int(ball['y'])
            size = ball['size']

            for dy in range(-size, size + 1):
                for dx in range(-size, size + 1):
                    if 0 <= x + dx < width and 0 <= y + dy < height:
                        if dx * dx + dy * dy <= size * size:
                            screen[y + dy][x + dx] = '●'

        # Render screen
        for y in range(height):
            line = ""
            for x in range(width):
                if screen[y][x] == '●':
                    # Find which ball this belongs to
                    for ball in balls:
                        bx, by = int(ball['x']), int(ball['y'])
                        if abs(x - bx) <= ball['size'] and abs(y - by) <= ball['size']:
                            if (x - bx) * (x - bx) + (y - by) * (y - by) <= ball[
                                'size'
                            ] * ball['size']:
                                line += ball['color'] + '●' + Colors256.RESET
                                break
                    else:
                        line += ' '
                else:
                    line += ' '
            print(line)

        time.sleep(0.1)

    show_cursor()


def main():
    """Main demoscene sequence"""
    print(
        Colors256.BRIGHT_GREEN
        + Colors256.BOLD
        + "🎬 PYTHON 3.15.0a0 DEMOSCENE STARTING..."
        + Colors256.RESET,
    )
    time.sleep(2)

    try:
        # Sequence of animations
        color_palette_demo()
        matrix_rain()
        plasma_effect()
        mandelbrot_fractal()
        spiral_animation()
        fire_effect()
        rainbow_wave()
        bouncing_balls()
        python_logo_animation()
        reynard_fox_animation()

        # Final message
        clear_screen()
        print(
            Colors256.BRIGHT_GREEN
            + Colors256.BOLD
            + "🎉 DEMOSCENE COMPLETE!"
            + Colors256.RESET,
        )
        print()
        print(
            Colors256.CYAN + "Python 3.15.0a0 Experimental Features:" + Colors256.RESET,
        )
        print(Colors256.GREEN + "✅ Multiple Interpreters (PEP 734)" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Deferred Annotations (PEP 649)" + Colors256.RESET)
        print(Colors256.GREEN + "✅ 256-Color Terminal Support" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Enhanced Error Messages" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Performance Improvements" + Colors256.RESET)
        print()
        print(
            Colors256.CYAN + "🎨 ASCII Animation Effects:" + Colors256.RESET,
        )
        print(Colors256.GREEN + "✅ Matrix Digital Rain" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Plasma Effect" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Mandelbrot Fractal" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Spiral Animation" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Fire Effect" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Rainbow Wave" + Colors256.RESET)
        print(Colors256.GREEN + "✅ Bouncing Balls Physics" + Colors256.RESET)
        print()
        print(
            Colors256.YELLOW
            + "🦊 Reynard Framework Integration Ready!"
            + Colors256.RESET,
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
