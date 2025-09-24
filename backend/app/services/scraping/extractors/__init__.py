"""Scraping Extractors for Reynard Backend

Base classes and implementations for content extraction from various sources.
"""

from .base_scraper import BaseScraper
from .enhanced_extractor import EnhancedContentExtractor
from .general_scraper import GeneralScraper
from .github_scraper import GitHubScraper
from .hackernews_scraper import HackerNewsScraper
from .twitter_scraper import TwitterScraper
from .wikipedia_scraper import WikipediaScraper

# TODO: Implement other scrapers as needed
# from .stackoverflow_scraper import StackOverflowScraper
# from .wikifur_scraper import WikiFurScraper
# from .e621_wiki_scraper import E621WikiScraper
# from .arstechnica_scraper import ArsTechnicaScraper
# from .techcrunch_scraper import TechCrunchScraper
# from .wired_scraper import WiredScraper

__all__ = [
    "BaseScraper",
    "EnhancedContentExtractor",
    "GeneralScraper",
    "GitHubScraper",
    "HackerNewsScraper",
    "TwitterScraper",
    "WikipediaScraper",
    # "StackOverflowScraper",
    # "WikiFurScraper",
    # "E621WikiScraper",
    # "ArsTechnicaScraper",
    # "TechCrunchScraper",
    # "WiredScraper",
]
