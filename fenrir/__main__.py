#!/usr/bin/env python3
"""🦊 Fenrir Module Entry Point
=============================

Main entry point for running Fenrir as a module with support for both
exploit testing and memory profiling modes.

Usage:
    # Run exploit testing (default)
    python -m fenrir

    # Run memory profiling
    python -m fenrir --mode profiling
    python -m fenrir --mode profiling --profile-type memory
    python -m fenrir --mode profiling --profile-type startup --output results.json

Author: Reynard Development Team
Version: 1.0.0
"""

import argparse
import asyncio
import sys
from pathlib import Path

from rich.console import Console

# Import main components
from .core.fuzzy import main as fuzzy_main
from .profile import run_profiling_mode

console = Console()


def main():
    """Main entry point for Fenrir module."""
    parser = argparse.ArgumentParser(
        description="🦊 Fenrir - Exploit Testing and Memory Profiling Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Modes:
  exploit    Run comprehensive exploit testing (default)
  profiling  Run memory and performance profiling

Profiling Types:
  memory     Comprehensive memory analysis
  startup    Backend startup profiling
  database   Database connection analysis
  all        Run all profiling types

Examples:
  python -m fenrir                                    # Run exploit testing
  python -m fenrir --mode profiling                  # Run all profiling
  python -m fenrir --mode profiling --profile-type memory
  python -m fenrir --mode profiling --profile-type startup --output results.json
        """
    )

    parser.add_argument(
        "--mode",
        choices=["exploit", "profiling"],
        default="exploit",
        help="Operation mode (default: exploit)"
    )

    # Profiling-specific arguments
    parser.add_argument(
        "--profile-type",
        choices=["memory", "startup", "database", "all"],
        default="all",
        help="Profiling type when in profiling mode"
    )

    parser.add_argument(
        "--session-id",
        help="Session identifier for profiling tracking"
    )

    parser.add_argument(
        "--output", "-o",
        help="Output file path for profiling results"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )

    args = parser.parse_args()

    try:
        if args.mode == "exploit":
            # Run exploit testing
            console.print("🐺 [bold red]Starting Fenrir Exploit Testing Mode[/bold red]")
            asyncio.run(fuzzy_main())

        elif args.mode == "profiling":
            # Run profiling
            console.print("🦊 [bold blue]Starting Fenrir Profiling Mode[/bold blue]")
            asyncio.run(run_profiling_mode(
                mode=args.profile_type,
                session_id=args.session_id,
                output_path=args.output,
                verbose=args.verbose
            ))

    except KeyboardInterrupt:
        console.print("\n[yellow]Operation interrupted by user[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        if args.verbose:
            import traceback
            console.print(traceback.format_exc())
        sys.exit(1)


if __name__ == "__main__":
    main()
