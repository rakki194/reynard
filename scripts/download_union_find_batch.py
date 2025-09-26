#!/usr/bin/env python3
"""
Union-Find Papers Batch Download Script
======================================

Non-interactive script to download union-find papers in batches.
"""

import asyncio
import json
import logging
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


class BatchUnionFindDownloader:
    """Batch downloads union-find papers."""

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
            'connected components',
            'Kruskal algorithm',
            'minimum spanning tree',
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
        ]

    async def search_and_download_batch(self, max_papers: int = 50) -> None:
        """Search and download papers in one batch."""
        all_papers = {}

        # Search for papers
        for term in self.search_terms:
            logger.info(f"Searching for: '{term}'")

            params = {
                'search_query': term,
                'start': 0,
                'max_results': 50,  # Limit per term to avoid duplicates
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

        # Download papers
        papers_to_download = papers_list[:max_papers]
        await self._download_papers_batch(papers_to_download)

        # Create summary
        self._create_summary()

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

    async def _download_papers_batch(self, papers: List[Dict[str, Any]]) -> None:
        """Download papers in batch."""
        logger.info(f"Starting batch download of {len(papers)} papers...")

        for i, paper in enumerate(papers, 1):
            try:
                # Extract arXiv ID
                arxiv_id = paper['id'].split('/')[-1]

                logger.info(
                    f"[{i}/{len(papers)}] Downloading: {paper['title'][:60]}..."
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
                await asyncio.sleep(0.5)

            except Exception as e:
                logger.error(
                    f"  ❌ Exception downloading {paper['title'][:50]}...: {e}"
                )
                self.failed_downloads.append(
                    {'paper_id': paper['id'], 'title': paper['title'], 'error': str(e)}
                )

    def _create_summary(self) -> None:
        """Create a summary report."""
        total = len(self.downloaded_papers) + len(self.failed_downloads)
        success_rate = len(self.downloaded_papers) / total * 100 if total > 0 else 0

        print("\n" + "=" * 60)
        print("UNION-FIND PAPERS BATCH DOWNLOAD SUMMARY")
        print("=" * 60)
        print(f"Total papers processed: {total}")
        print(f"Successfully downloaded: {len(self.downloaded_papers)}")
        print(f"Failed downloads: {len(self.failed_downloads)}")
        print(f"Success rate: {success_rate:.1f}%")
        print("=" * 60)

        if self.downloaded_papers:
            print(f"\nSUCCESSFULLY DOWNLOADED PAPERS ({len(self.downloaded_papers)}):")
            for i, paper in enumerate(self.downloaded_papers, 1):
                print(f"{i}. {paper['title'][:70]}...")
                print(f"   ID: {paper['paper_id']} | Found via: {paper['search_term']}")

        if self.failed_downloads:
            print(f"\nFAILED DOWNLOADS ({len(self.failed_downloads)}):")
            for i, paper in enumerate(self.failed_downloads, 1):
                print(f"{i}. {paper['title'][:60]}...")
                print(f"   Error: {paper['error']}")


async def main():
    """Main function."""
    downloader = BatchUnionFindDownloader()

    # Get max papers from command line argument or use default
    max_papers = 50
    if len(sys.argv) > 1:
        try:
            max_papers = int(sys.argv[1])
        except ValueError:
            print("Invalid number, using default of 50 papers")

    logger.info(f"Starting batch download of up to {max_papers} union-find papers...")

    try:
        await downloader.search_and_download_batch(max_papers)
        logger.info("Batch download completed!")
    except KeyboardInterrupt:
        logger.info("Download interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
