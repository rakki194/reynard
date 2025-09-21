#!/usr/bin/env python3
"""
Humility Detector - Detection of Boastful Language
Part of the Reynard project's commitment to humble communication.

This detector combines multiple analysis techniques:
- Pattern-based detection
- Transformer model analysis (BERT, RoBERTa)
- HEXACO personality assessment
- Epistemic humility evaluation
- LIWC linguistic analysis
- Sentiment and emotional analysis
- Cultural context adaptation
- Explainable AI features
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from core import HumilityConfig, HumilityDetector
from utils.report_generator import ReportGenerator


def setup_logging(verbose: bool = False) -> None:
    """Setup logging configuration."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


async def main():
    """Main entry point for the humility detector."""
    parser = argparse.ArgumentParser(
        description="Humility Detector - Boastful language detection",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 humility-detector.py README.md
  python3 humility-detector.py docs/ --extensions .md .txt
  python3 humility-detector.py . --output report.json --format json
  python3 humility-detector.py . --min-severity high --cultural-context western
  python3 humility-detector.py . --enable-all-features --verbose
        """,
    )

    # Basic arguments
    parser.add_argument("path", help="File or directory path to scan")
    parser.add_argument("--output", "-o", help="Output file for report")
    parser.add_argument(
        "--format",
        "-f",
        choices=["text", "json", "html", "csv"],
        default="text",
        help="Output format (default: text)",
    )
    parser.add_argument(
        "--extensions",
        "-e",
        nargs="+",
        default=[".md", ".txt", ".py", ".js", ".ts", ".tsx", ".jsx", ".json"],
        help="File extensions to scan",
    )

    # Filtering arguments
    parser.add_argument(
        "--min-severity",
        "-s",
        choices=["low", "medium", "high", "critical"],
        help="Minimum severity level to report",
    )
    parser.add_argument(
        "--min-confidence",
        "-c",
        type=float,
        default=0.6,
        help="Minimum confidence threshold (0.0-1.0)",
    )
    parser.add_argument(
        "--max-findings", type=int, default=100, help="Maximum findings per file"
    )

    # Advanced features
    parser.add_argument(
        "--enable-all-features",
        action="store_true",
        help="Enable all advanced analysis features",
    )
    parser.add_argument(
        "--cultural-context",
        choices=["western", "eastern", "nordic"],
        help="Cultural context for analysis",
    )
    parser.add_argument("--save-config", help="Save current configuration to file")
    parser.add_argument("--load-config", help="Load configuration from file")

    # Utility options
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable verbose logging"
    )
    parser.add_argument(
        "--cache-results",
        action="store_true",
        default=True,
        help="Cache analysis results",
    )
    parser.add_argument(
        "--clear-cache", action="store_true", help="Clear analysis cache"
    )

    args = parser.parse_args()

    # Setup logging
    setup_logging(args.verbose)
    logger = logging.getLogger(__name__)

    # Load configuration if specified
    if args.load_config:
        config_path = Path(args.load_config)
        if config_path.exists():
            config = HumilityConfig.from_file(config_path)
            logger.info(f"Configuration loaded from {config_path}")
        else:
            logger.error(f"Configuration file {config_path} not found")
            return 1
    else:
        # Create configuration
        config = HumilityConfig()
        config.min_confidence_threshold = args.min_confidence
        config.max_findings_per_file = args.max_findings
        config.cache_results = args.cache_results
        config.output_format = args.format

        # Enable advanced features if requested
        if args.enable_all_features:
            config.use_transformer_models = True
            config.use_hexaco_assessment = True
            config.use_epistemic_humility = True
            config.use_liwc_analysis = True
            config.use_sentiment_analysis = True
            config.enable_cultural_adaptation = True
            logger.info("All advanced features enabled")

        # Set cultural context
        if args.cultural_context:
            config.cultural_context = args.cultural_context
            logger.info(f"Cultural context set to: {args.cultural_context}")

    # Save configuration if requested
    if args.save_config:
        config_path = Path(args.save_config)
        config.to_file(config_path)
        logger.info(f"Configuration saved to {config_path}")
        return 0

    # Initialize detector
    detector = HumilityDetector(config)

    # Clear cache if requested
    if args.clear_cache:
        detector.clear_cache()
        logger.info("Cache cleared")
        return 0

    # Process input path
    input_path = Path(args.path)

    if not input_path.exists():
        logger.error(f"Path {input_path} does not exist")
        return 1

    try:
        # Analyze files
        if input_path.is_file():
            logger.info(f"Analyzing file: {input_path}")
            profile = await detector.analyze_file(input_path)
            profiles = {str(input_path): profile}
        else:
            logger.info(f"Analyzing directory: {input_path}")
            profiles = await detector.analyze_directory(input_path, args.extensions)

        # Filter by minimum severity if specified
        if args.min_severity:
            from core.models import SeverityLevel

            min_severity = SeverityLevel(args.min_severity)
            severity_order = [
                SeverityLevel.LOW,
                SeverityLevel.MEDIUM,
                SeverityLevel.HIGH,
                SeverityLevel.CRITICAL,
            ]
            min_index = severity_order.index(min_severity)

            for file_path, profile in profiles.items():
                filtered_findings = [
                    f
                    for f in profile.findings
                    if severity_order.index(f.severity) >= min_index
                ]
                profile.findings = filtered_findings

        # Generate report
        report_generator = ReportGenerator(config)
        report = report_generator.generate_report(profiles)

        # Output report
        if args.output:
            output_path = Path(args.output)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(report)
            logger.info(f"Report written to {output_path}")
        else:
            print(report)

            # Calculate overall statistics
            total_findings = sum(len(profile.findings) for profile in profiles.values())
            avg_score = (
                sum(profile.overall_score for profile in profiles.values())
                / len(profiles)
                if profiles
                else 0
            )

            logger.info(f"Analysis complete:")
            logger.info(f"  Files analyzed: {len(profiles)}")
            logger.info(f"  Total findings: {total_findings}")
            logger.info(f"  Average humility score: {avg_score:.1f}/100")

            # Cache statistics
            cache_stats = detector.get_cache_stats()
            if cache_stats["cache_enabled"]:
                logger.info(f"  Cache size: {cache_stats['cache_size']} entries")

                # Exit with appropriate code
                if total_findings > 0:
                    logger.warning(
                        "Boastful language detected. Consider reviewing findings."
                    )
                    return 1
            else:
                logger.info(
                    "No boastful language detected. Great job maintaining humble communication!"
                )
                return 0

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        if args.verbose:
            import traceback

            traceback.print_exc()
            return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
