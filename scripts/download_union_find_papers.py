#!/usr/bin/env python3
"""
Union-Find Papers Download Script
=================================

Downloads all union-find related papers from arXiv and organizes them
for the Reynard RAG system.
"""

import asyncio
import json
import logging
import os
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import aiohttp

# Add the MCP server tools to the path
# Get project root and add mcp-server to path
current_file = Path(__file__)
project_root = current_file.parent.parent  # scripts -> project root
sys.path.append(str(project_root / "services" / "mcp-server"))
from tools.research.paper_management import PaperManagementService

# Configure logging
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class UnionFindPaperDownloader:
    """Downloads and organizes union-find papers for Reynard's RAG system."""

    def __init__(self):
        self.paper_service = PaperManagementService()
        self.base_url = 'http://export.arxiv.org/api/query'
        self.downloaded_papers = []
        self.failed_downloads = []

        # Union-find related search terms
        self.search_terms = [
            'union find',
            'disjoint set',
            'union-find',
            'disjoint-set',
            'connected components',
            'Kruskal algorithm',
            'minimum spanning tree',
            'graph connectivity',
            'union find algorithm',
            'disjoint set data structure',
            'union by rank',
            'path compression',
            'disjoint-set forest',
            'find-union',
            'connected components algorithm',
        ]

        # Keywords to filter relevant papers
        self.union_find_keywords = [
            'union find',
            'union-find',
            'disjoint set',
            'disjoint-set',
            'connected component',
            'kruskal',
            'minimum spanning tree',
            'graph connectivity',
            'find-union',
            'union by rank',
            'path compression',
            'disjoint-set forest',
            'union find algorithm',
            'disjoint set data structure',
            'connected components algorithm',
        ]

    async def search_all_papers(self) -> List[Dict[str, Any]]:
        """Search for all union-find related papers."""
        all_papers = {}

        for term in self.search_terms:
            logger.info(f"Searching for: '{term}'")

            params = {
                'search_query': term,
                'start': 0,
                'max_results': 100,
                'sortBy': 'relevance',
                'sortOrder': 'descending',
            }

            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        self.base_url, params=params, timeout=30
                    ) as response:
                        if response.status == 200:
                            xml_content = await response.text()
                            papers = self._parse_arxiv_response(xml_content)

                            # Filter for relevant papers
                            relevant_papers = self._filter_relevant_papers(papers, term)

                            for paper in relevant_papers:
                                paper_id = paper['id']
                                if paper_id not in all_papers:
                                    all_papers[paper_id] = paper

                            logger.info(
                                f"  Found {len(relevant_papers)} relevant papers"
                            )
                        else:
                            logger.error(f"  HTTP Error: {response.status}")
            except Exception as e:
                logger.error(f"  Error searching for '{term}': {e}")

        # Convert to list and sort by publication date
        papers_list = list(all_papers.values())
        papers_list.sort(key=lambda x: x['published'], reverse=True)

        logger.info(f"Total unique relevant papers found: {len(papers_list)}")
        return papers_list

    def _parse_arxiv_response(self, xml_content: str) -> List[Dict[str, Any]]:
        """Parse arXiv XML response."""
        try:
            root = ET.fromstring(xml_content)
            entries = root.findall('.//{http://www.w3.org/2005/Atom}entry')

            papers = []
            for entry in entries:
                # Extract paper ID
                id_elem = entry.find('.//{http://www.w3.org/2005/Atom}id')
                if id_elem is not None:
                    paper_id = id_elem.text

                    # Extract other fields
                    title_elem = entry.find('.//{http://www.w3.org/2005/Atom}title')
                    title = title_elem.text if title_elem is not None else ''

                    summary_elem = entry.find('.//{http://www.w3.org/2005/Atom}summary')
                    summary = summary_elem.text if summary_elem is not None else ''

                    published_elem = entry.find(
                        './/{http://www.w3.org/2005/Atom}published'
                    )
                    published = (
                        published_elem.text if published_elem is not None else ''
                    )

                    # Extract authors
                    authors = []
                    for author in entry.findall(
                        './/{http://www.w3.org/2005/Atom}author'
                    ):
                        name_elem = author.find('.//{http://www.w3.org/2005/Atom}name')
                        if name_elem is not None:
                            authors.append(name_elem.text)

                    # Extract categories
                    categories = []
                    for cat in entry.findall(
                        './/{http://www.w3.org/2005/Atom}category'
                    ):
                        if cat.get('term'):
                            categories.append(cat.get('term'))

                    papers.append(
                        {
                            'id': paper_id,
                            'title': title,
                            'summary': summary,
                            'authors': authors,
                            'published': published,
                            'categories': categories,
                        }
                    )

            return papers

        except Exception as e:
            logger.error(f"Failed to parse arXiv response: {e}")
            return []

    def _filter_relevant_papers(
        self, papers: List[Dict[str, Any]], search_term: str
    ) -> List[Dict[str, Any]]:
        """Filter papers to only include those actually about union-find."""
        relevant_papers = []

        for paper in papers:
            text_content = (paper['title'] + ' ' + paper['summary']).lower()

            # Check if paper is actually about union-find/disjoint sets
            is_relevant = any(
                keyword in text_content for keyword in self.union_find_keywords
            )

            if is_relevant:
                paper['search_term'] = search_term
                relevant_papers.append(paper)

        return relevant_papers

    async def download_papers(
        self, papers: List[Dict[str, Any]], max_papers: int = None
    ) -> None:
        """Download all papers using the paper management service."""
        if max_papers:
            papers = papers[:max_papers]

        logger.info(f"Starting download of {len(papers)} papers...")

        for i, paper in enumerate(papers, 1):
            try:
                # Extract arXiv ID
                arxiv_id = paper['id'].split('/')[-1]

                logger.info(
                    f"[{i}/{len(papers)}] Downloading: {paper['title'][:80]}..."
                )

                # Download using the paper service
                result = await self.paper_service.download_arxiv_paper(
                    paper_id=arxiv_id,
                    title=paper['title'],
                    authors=paper['authors'],
                    abstract=paper['summary'],
                    categories=paper['categories'],
                    published_date=(
                        paper['published'][:10] if paper['published'] else ''
                    ),
                )

                if result['success']:
                    self.downloaded_papers.append(
                        {
                            'paper_id': arxiv_id,
                            'title': paper['title'],
                            'path': result['path'],
                            'search_term': paper.get('search_term', 'unknown'),
                        }
                    )
                    logger.info(f"  ✅ Downloaded successfully")
                else:
                    self.failed_downloads.append(
                        {
                            'paper_id': arxiv_id,
                            'title': paper['title'],
                            'error': result['error'],
                        }
                    )
                    logger.error(f"  ❌ Failed: {result['error']}")

                # Add delay to be respectful to arXiv
                await asyncio.sleep(1)

            except Exception as e:
                logger.error(
                    f"  ❌ Exception downloading {paper['title'][:50]}...: {e}"
                )
                self.failed_downloads.append(
                    {'paper_id': paper['id'], 'title': paper['title'], 'error': str(e)}
                )

    def create_summary_report(self) -> None:
        """Create a summary report of the download process."""
        report = {
            'download_date': datetime.now().isoformat(),
            'total_papers_found': len(self.downloaded_papers)
            + len(self.failed_downloads),
            'successful_downloads': len(self.downloaded_papers),
            'failed_downloads': len(self.failed_downloads),
            'success_rate': (
                len(self.downloaded_papers)
                / (len(self.downloaded_papers) + len(self.failed_downloads))
                * 100
                if (len(self.downloaded_papers) + len(self.failed_downloads)) > 0
                else 0
            ),
            'downloaded_papers': self.downloaded_papers,
            'failed_downloads': self.failed_downloads,
        }

        # Save report
        # Get project root for report path
        current_file = Path(__file__)
        project_root = current_file.parent.parent  # scripts -> project root
        report_path = (
            project_root
            / "backend"
            / "data"
            / "papers"
            / "union_find_download_report.json"
        )
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

        logger.info(f"Download report saved to: {report_path}")

        # Print summary
        print("\n" + "=" * 60)
        print("UNION-FIND PAPERS DOWNLOAD SUMMARY")
        print("=" * 60)
        print(f"Total papers found: {report['total_papers_found']}")
        print(f"Successfully downloaded: {report['successful_downloads']}")
        print(f"Failed downloads: {report['failed_downloads']}")
        print(f"Success rate: {report['success_rate']:.1f}%")
        print("=" * 60)

        if self.downloaded_papers:
            print("\nSUCCESSFULLY DOWNLOADED PAPERS:")
            for i, paper in enumerate(self.downloaded_papers[:10], 1):
                print(f"{i}. {paper['title'][:80]}...")
                print(f"   ID: {paper['paper_id']} | Found via: {paper['search_term']}")

            if len(self.downloaded_papers) > 10:
                print(f"... and {len(self.downloaded_papers) - 10} more papers")

        if self.failed_downloads:
            print(f"\nFAILED DOWNLOADS ({len(self.failed_downloads)}):")
            for i, paper in enumerate(self.failed_downloads[:5], 1):
                print(f"{i}. {paper['title'][:60]}...")
                print(f"   Error: {paper['error']}")

            if len(self.failed_downloads) > 5:
                print(f"... and {len(self.failed_downloads) - 5} more failures")


async def main():
    """Main function to download all union-find papers."""
    downloader = UnionFindPaperDownloader()

    try:
        # Search for all papers
        logger.info("Searching for union-find papers...")
        papers = await downloader.search_all_papers()

        if not papers:
            logger.error("No papers found!")
            return

        # Ask user how many papers to download
        print(f"\nFound {len(papers)} union-find related papers.")
        print("How many papers would you like to download?")
        print("1. Download all papers (this may take a while)")
        print("2. Download first 50 papers")
        print("3. Download first 20 papers")
        print("4. Enter custom number")

        choice = input("\nEnter your choice (1-4): ").strip()

        max_papers = None
        if choice == "1":
            max_papers = None
        elif choice == "2":
            max_papers = 50
        elif choice == "3":
            max_papers = 20
        elif choice == "4":
            try:
                max_papers = int(input("Enter number of papers to download: "))
            except ValueError:
                print("Invalid input, downloading first 20 papers")
                max_papers = 20
        else:
            print("Invalid choice, downloading first 20 papers")
            max_papers = 20

        # Download papers
        await downloader.download_papers(papers, max_papers)

        # Create summary report
        downloader.create_summary_report()

        logger.info("Download process completed!")

    except KeyboardInterrupt:
        logger.info("Download interrupted by user")
        downloader.create_summary_report()
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        downloader.create_summary_report()


if __name__ == "__main__":
    asyncio.run(main())
