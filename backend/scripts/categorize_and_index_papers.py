#!/usr/bin/env python3
"""
Paper Categorization and RAG Indexing Script
===========================================

Strategic script to categorize and index academic papers for the RAG system.
Integrates with the existing Reynard infrastructure for optimal organization.

🦊 Fox approach: We strategically organize papers with the cunning precision of a fox,
ensuring every document finds its perfect place in the knowledge ecosystem!
"""

import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Optional

# Add the backend app to the path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.rag.document_categorization_service import (
    DocumentCategorizationService,
)
from app.services.rag.paper_indexing_integration import PaperIndexingIntegration

# Configure logging
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def categorize_papers_only(
    papers_directory: Path,
    output_file: Optional[Path] = None,
    max_papers: Optional[int] = None,
) -> None:
    """Run only categorization without RAG indexing."""

    logger.info("Starting paper categorization...")

    categorization_service = DocumentCategorizationService()

    if output_file is None:
        output_file = papers_directory.parent / "paper_categorizations.json"

    results = await categorization_service.batch_categorize_papers(
        papers_directory=papers_directory, output_file=output_file
    )

    # Generate and display statistics
    stats = categorization_service.get_domain_statistics(results)

    print("\n" + "=" * 60)
    print("PAPER CATEGORIZATION RESULTS")
    print("=" * 60)
    print(f"Total papers categorized: {stats['total_papers']}")
    print(f"Overall average confidence: {stats['overall_average_confidence']:.2f}")
    print("\nDomain Distribution:")

    for domain, count in sorted(
        stats['domain_distribution'].items(), key=lambda x: x[1], reverse=True
    ):
        avg_conf = stats['average_confidence_by_domain'].get(domain, 0)
        print(f"  {domain}: {count} papers (avg confidence: {avg_conf:.2f})")

    print(f"\nResults saved to: {output_file}")


async def full_rag_processing(
    papers_directory: Path,
    max_papers: Optional[int] = None,
    force_reprocess: bool = False,
) -> None:
    """Run full RAG processing including categorization and indexing preparation."""

    logger.info("Starting full RAG processing...")

    integration_service = PaperIndexingIntegration()

    results = await integration_service.batch_process_papers(
        papers_directory=papers_directory,
        max_papers=max_papers,
        force_reprocess=force_reprocess,
    )

    # Display results
    print("\n" + "=" * 60)
    print("RAG PROCESSING RESULTS")
    print("=" * 60)

    summary = results["processing_summary"]
    print(f"Total papers: {summary['total_papers']}")
    print(f"Successfully processed: {summary['successfully_processed']}")
    print(f"Failed: {summary['failed']}")
    print(f"Success rate: {summary['success_rate']:.1f}%")

    print("\nDomain Distribution:")
    domain_stats = results["domain_statistics"]
    for domain, count in sorted(
        domain_stats["domain_distribution"].items(), key=lambda x: x[1], reverse=True
    ):
        avg_conf = domain_stats["average_confidence_by_domain"].get(domain, 0)
        print(f"  {domain}: {count} papers (avg confidence: {avg_conf:.2f})")

    # Generate RAG index summary
    rag_summary = await integration_service.generate_rag_index_summary()

    print(f"\nRAG Index Summary:")
    print(f"  Total papers in RAG index: {rag_summary['total_papers']}")
    print(
        f"  Papers with processed content: {rag_summary['content_availability']['with_content']}"
    )
    print(
        f"  Papers without content: {rag_summary['content_availability']['without_content']}"
    )

    print(f"\nConfidence Distribution:")
    conf_dist = rag_summary["confidence_distribution"]
    print(f"  High confidence (≥0.7): {conf_dist['high']}")
    print(f"  Medium confidence (0.4-0.7): {conf_dist['medium']}")
    print(f"  Low confidence (<0.4): {conf_dist['low']}")


async def get_rag_ready_papers(
    domain_filter: Optional[str] = None,
    min_confidence: float = 0.0,
    limit: Optional[int] = None,
) -> None:
    """Get and display papers ready for RAG indexing."""

    logger.info("Retrieving RAG-ready papers...")

    integration_service = PaperIndexingIntegration()

    # Convert domain filter string to enum if provided
    domain_enum = None
    if domain_filter:
        from app.services.rag.document_categorization_service import ScientificDomain

        try:
            domain_enum = ScientificDomain(domain_filter)
        except ValueError:
            logger.error(f"Invalid domain filter: {domain_filter}")
            print(f"Available domains: {[d.value for d in ScientificDomain]}")
            return

    ready_papers = await integration_service.get_rag_ready_papers(
        domain_filter=domain_enum, min_confidence=min_confidence, limit=limit
    )

    print(f"\nFound {len(ready_papers)} RAG-ready papers")

    if ready_papers:
        print("\nTop Papers:")
        for i, paper in enumerate(ready_papers[:10], 1):
            paper_id = paper["paper_id"]
            domain = paper["categorization"]["primary_domain"]
            confidence = paper["categorization"]["confidence"]
            title = paper["original_metadata"]["title"][:80]

            print(f"{i:2d}. {paper_id} | {domain} ({confidence:.2f}) | {title}...")


async def main():
    """Main function with argument parsing."""

    parser = argparse.ArgumentParser(
        description="Categorize and index academic papers for RAG system",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Categorize all papers in the default directory
  python categorize_and_index_papers.py --categorize-only
  
  # Full RAG processing with limit
  python categorize_and_index_papers.py --full-processing --max-papers 50
  
  # Get RAG-ready papers for a specific domain
  python categorize_and_index_papers.py --get-ready --domain computer_science --min-confidence 0.7
  
  # Force reprocess all papers
  python categorize_and_index_papers.py --full-processing --force-reprocess
        """,
    )

    parser.add_argument(
        "--papers-dir",
        type=Path,
        default=None,  # Will be determined dynamically
        help="Directory containing paper metadata files (default: backend/data/papers/arxiv)",
    )

    parser.add_argument(
        "--max-papers", type=int, help="Maximum number of papers to process"
    )

    parser.add_argument(
        "--output-file", type=Path, help="Output file for categorization results"
    )

    parser.add_argument(
        "--categorize-only",
        action="store_true",
        help="Run only categorization without RAG indexing",
    )

    parser.add_argument(
        "--full-processing",
        action="store_true",
        help="Run full RAG processing (categorization + indexing preparation)",
    )

    parser.add_argument(
        "--get-ready",
        action="store_true",
        help="Get and display papers ready for RAG indexing",
    )

    parser.add_argument(
        "--domain", type=str, help="Filter by scientific domain (for --get-ready)"
    )

    parser.add_argument(
        "--min-confidence",
        type=float,
        default=0.0,
        help="Minimum confidence threshold (default: 0.0)",
    )

    parser.add_argument(
        "--limit", type=int, help="Limit number of results (for --get-ready)"
    )

    parser.add_argument(
        "--force-reprocess",
        action="store_true",
        help="Force reprocessing of already processed papers",
    )

    args = parser.parse_args()

    # Set default papers directory if not provided
    if args.papers_dir is None:
        current_file = Path(__file__)
        project_root = (
            current_file.parent.parent.parent
        )  # scripts -> backend -> project root
        args.papers_dir = project_root / "backend" / "data" / "papers" / "arxiv"

    # Validate arguments
    if not args.papers_dir.exists():
        logger.error(f"Papers directory does not exist: {args.papers_dir}")
        return

    if not any([args.categorize_only, args.full_processing, args.get_ready]):
        logger.error(
            "Must specify one of: --categorize-only, --full-processing, or --get-ready"
        )
        return

    try:
        if args.categorize_only:
            await categorize_papers_only(
                papers_directory=args.papers_dir,
                output_file=args.output_file,
                max_papers=args.max_papers,
            )

        elif args.full_processing:
            await full_rag_processing(
                papers_directory=args.papers_dir,
                max_papers=args.max_papers,
                force_reprocess=args.force_reprocess,
            )

        elif args.get_ready:
            await get_rag_ready_papers(
                domain_filter=args.domain,
                min_confidence=args.min_confidence,
                limit=args.limit,
            )

    except KeyboardInterrupt:
        logger.info("Operation interrupted by user")
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
