#!/usr/bin/env python3
"""🦊 Fenrir Profiling CLI
=======================

Command-line interface for Fenrir memory profiling capabilities.
Provides strategic analysis of backend memory usage, startup performance,
and database connection optimization.

Usage:
    python -m fenrir.profile --mode memory
    python -m fenrir.profile --mode startup --output startup_analysis.json
    python -m fenrir.profile --mode database
    python -m fenrir.profile --mode all --session-id my_session

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import argparse
import json
import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel

from .core.fuzzy import Fuzzy

console = Console()


async def run_profiling_mode(mode: str, session_id: str = None, output_path: str = None, verbose: bool = False):
    """Run Fenrir in profiling mode.

    Args:
        mode: Profiling mode (memory, startup, database, all)
        session_id: Optional session identifier
        output_path: Optional output file path
        verbose: Enable verbose output
    """
    console.print(Panel.fit(
        "[bold red]🦊 FENRIR PROFILING MODE[/bold red]\n"
        f"Mode: {mode.upper()}\n"
        "Strategic memory and performance analysis",
        border_style="red"
    ))

    async with Fuzzy() as fuzzer:
        # Enable profiling
        fuzzer.enable_profiling(session_id)

        results = {}

        if mode == "memory" or mode == "all":
            console.print("\n[bold blue]🧠 Running Memory Analysis...[/bold blue]")
            memory_results = await fuzzer.run_memory_analysis(session_id)
            results["memory_analysis"] = memory_results

            if verbose:
                console.print(f"Memory analysis completed: {memory_results['issues_found']} issues found")

        if mode == "startup" or mode == "all":
            console.print("\n[bold cyan]🚀 Running Startup Analysis...[/bold cyan]")
            startup_results = await fuzzer.run_startup_analysis(session_id)
            results["startup_analysis"] = startup_results

            if verbose:
                console.print("Startup analysis completed")

        if mode == "database" or mode == "all":
            console.print("\n[bold magenta]🗄️ Running Database Analysis...[/bold magenta]")
            database_results = await fuzzer.run_database_analysis(session_id)
            results["database_analysis"] = database_results

            if verbose:
                console.print("Database analysis completed")

        if mode == "services" or mode == "all":
            console.print("\n[bold blue]🔍 Running Detailed Service Analysis...[/bold blue]")
            service_results = await fuzzer.run_detailed_service_analysis(session_id)
            results["service_analysis"] = service_results

            if verbose:
                console.print("Detailed service analysis completed")

        # Save results if output path specified
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            console.print(f"[green]Results saved to: {output_path}[/green]")

        # Save profiling session
        session_path = fuzzer.save_profiling_session()
        if session_path:
            console.print(f"[green]Profiling session saved to: {session_path}[/green]")

        console.print(Panel.fit(
            "[bold green]🦊 PROFILING COMPLETE[/bold green]\n"
            "Strategic analysis finished successfully!",
            border_style="green"
        ))

        return results


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="🦊 Fenrir Memory Profiler - Strategic backend analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m fenrir.profile --mode memory
  python -m fenrir.profile --mode startup --output startup_results.json
  python -m fenrir.profile --mode database --verbose
  python -m fenrir.profile --mode services --session-id service_analysis
  python -m fenrir.profile --mode all --session-id production_analysis
        """
    )

    parser.add_argument(
        "--mode",
        choices=["memory", "startup", "database", "services", "all"],
        default="all",
        help="Profiling mode to run"
    )

    parser.add_argument(
        "--session-id",
        help="Session identifier for tracking multiple runs"
    )

    parser.add_argument(
        "--output", "-o",
        help="Output file path for results (JSON format)"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )

    args = parser.parse_args()

    try:
        results = asyncio.run(run_profiling_mode(
            mode=args.mode,
            session_id=args.session_id,
            output_path=args.output,
            verbose=args.verbose
        ))

        if args.verbose:
            console.print("\n[bold yellow]Summary:[/bold yellow]")
            for analysis_type, data in results.items():
                if isinstance(data, dict):
                    console.print(f"  {analysis_type}: {len(data)} metrics collected")

    except KeyboardInterrupt:
        console.print("\n[yellow]Profiling interrupted by user[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n[red]Error during profiling: {e}[/red]")
        if args.verbose:
            import traceback
            console.print(traceback.format_exc())
        sys.exit(1)


if __name__ == "__main__":
    main()
