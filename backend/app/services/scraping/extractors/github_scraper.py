"""Specialized GitHub scraper for handling GitHub repositories, issues, and pull requests."""

import logging
import re
from typing import Any

from ..models import ScrapingResult, ScrapingType
from .base_scraper import BaseScraper


class GitHubScraper(BaseScraper):
    """Specialized GitHub scraper for repositories, issues, and pull requests.

    Features:
    - Repository information extraction
    - Issue and pull request content
    - README and documentation scraping
    - Commit history and file content
    - User profile information
    - GitHub API integration
    """

    def __init__(self, logger: logging.Logger | None = None):
        """Initialize the GitHub scraper."""
        super().__init__(logger)
        self.scraper_type = ScrapingType.GITHUB
        self.supported_domains = ["github.com"]
        self.api_base_url = "https://api.github.com"

        # GitHub URL patterns
        self.repo_pattern = re.compile(r"github\.com/([^/]+)/([^/]+)")
        self.issue_pattern = re.compile(r"github\.com/([^/]+)/([^/]+)/issues/(\d+)")
        self.pr_pattern = re.compile(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)")
        self.user_pattern = re.compile(r"github\.com/([^/]+)/?$")

    async def can_handle_url(self, url: str) -> bool:
        """Check if this scraper can handle the given URL."""
        return any(domain in url.lower() for domain in self.supported_domains)

    async def scrape_content(self, url: str) -> ScrapingResult:
        """Scrape content from a GitHub URL.

        Args:
            url: GitHub URL to scrape

        Returns:
            ScrapingResult with extracted content

        """
        try:
            # Determine content type and extract identifiers
            content_type, identifiers = self._parse_github_url(url)

            if not content_type or not identifiers:
                return await self._fallback_scraping(url)

            # Try API first
            content = await self._scrape_with_api(content_type, identifiers, url)

            if content:
                return self._create_result_from_api_content(url, content_type, content)

            # Fallback to web scraping
            return await self._scrape_with_web(url, content_type)

        except Exception as e:
            self.logger.error(f"Failed to scrape GitHub content from {url}: {e}")
            return await self._fallback_scraping(url)

    def _parse_github_url(self, url: str) -> tuple[str | None, dict[str, str] | None]:
        """Parse GitHub URL to determine content type and extract identifiers."""
        # Repository URL
        repo_match = self.repo_pattern.search(url)
        if repo_match:
            return "repository", {
                "owner": repo_match.group(1),
                "repo": repo_match.group(2),
            }

        # Issue URL
        issue_match = self.issue_pattern.search(url)
        if issue_match:
            return "issue", {
                "owner": issue_match.group(1),
                "repo": issue_match.group(2),
                "number": issue_match.group(3),
            }

        # Pull Request URL
        pr_match = self.pr_pattern.search(url)
        if pr_match:
            return "pull_request", {
                "owner": pr_match.group(1),
                "repo": pr_match.group(2),
                "number": pr_match.group(3),
            }

        # User URL
        user_match = self.user_pattern.search(url)
        if user_match:
            return "user", {"username": user_match.group(1)}

        return None, None

    async def _scrape_with_api(
        self,
        content_type: str,
        identifiers: dict[str, str],
        url: str,
    ) -> dict[str, Any] | None:
        """Scrape content using GitHub API."""
        try:
            import aiohttp

            headers = {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Reynard-Scraping/1.0",
            }

            async with aiohttp.ClientSession(headers=headers) as session:
                if content_type == "repository":
                    api_url = f"{self.api_base_url}/repos/{identifiers['owner']}/{identifiers['repo']}"
                elif content_type == "issue":
                    api_url = f"{self.api_base_url}/repos/{identifiers['owner']}/{identifiers['repo']}/issues/{identifiers['number']}"
                elif content_type == "pull_request":
                    api_url = f"{self.api_base_url}/repos/{identifiers['owner']}/{identifiers['repo']}/pulls/{identifiers['number']}"
                elif content_type == "user":
                    api_url = f"{self.api_base_url}/users/{identifiers['username']}"
                else:
                    return None

                async with session.get(api_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        data["content_type"] = content_type
                        data["method"] = "api"
                        return data
                    if response.status == 404:
                        self.logger.warning(f"GitHub API: Resource not found for {url}")
                    else:
                        self.logger.warning(
                            f"GitHub API: Status {response.status} for {url}",
                        )

            return None

        except Exception as e:
            self.logger.error(f"GitHub API scraping failed: {e}")
            return None

    def _create_result_from_api_content(
        self,
        url: str,
        content_type: str,
        content: dict[str, Any],
    ) -> ScrapingResult:
        """Create ScrapingResult from API content."""
        if content_type == "repository":
            return self._create_repository_result(url, content)
        if content_type == "issue":
            return self._create_issue_result(url, content)
        if content_type == "pull_request":
            return self._create_pull_request_result(url, content)
        if content_type == "user":
            return self._create_user_result(url, content)
        return self._create_generic_result(url, content)

    def _create_repository_result(
        self,
        url: str,
        content: dict[str, Any],
    ) -> ScrapingResult:
        """Create result for repository content."""
        title = content.get("name", "GitHub Repository")
        description = content.get("description", "")
        readme_content = content.get("readme", "")

        # Combine description and readme
        full_content = description
        if readme_content:
            full_content += "\n\n" + readme_content

        return ScrapingResult(
            url=url,
            title=title,
            content=full_content,
            metadata={
                "source": "github",
                "extraction_method": "api",
                "content_type": "repository",
                "owner": content.get("owner", {}).get("login", ""),
                "repo_name": content.get("name", ""),
                "full_name": content.get("full_name", ""),
                "description": description,
                "language": content.get("language", ""),
                "stars": content.get("stargazers_count", 0),
                "forks": content.get("forks_count", 0),
                "watchers": content.get("watchers_count", 0),
                "open_issues": content.get("open_issues_count", 0),
                "created_at": content.get("created_at"),
                "updated_at": content.get("updated_at"),
                "pushed_at": content.get("pushed_at"),
                "size": content.get("size", 0),
                "topics": content.get("topics", []),
                "license": (
                    content.get("license", {}).get("name")
                    if content.get("license")
                    else None
                ),
                "has_readme": bool(readme_content),
            },
            quality={
                "score": self._calculate_repository_quality_score(content),
                "factors": {
                    "content_length": len(full_content),
                    "has_description": bool(description),
                    "has_readme": bool(readme_content),
                    "stars": content.get("stargazers_count", 0),
                    "forks": content.get("forks_count", 0),
                    "has_license": bool(content.get("license")),
                    "extraction_method": "api",
                },
            },
        )

    def _create_issue_result(self, url: str, content: dict[str, Any]) -> ScrapingResult:
        """Create result for issue content."""
        title = content.get("title", "GitHub Issue")
        body = content.get("body", "")

        return ScrapingResult(
            url=url,
            title=title,
            content=body,
            metadata={
                "source": "github",
                "extraction_method": "api",
                "content_type": "issue",
                "number": content.get("number"),
                "state": content.get("state"),
                "user": content.get("user", {}).get("login", ""),
                "labels": [
                    label.get("name", "") for label in content.get("labels", [])
                ],
                "assignees": [
                    assignee.get("login", "")
                    for assignee in content.get("assignees", [])
                ],
                "milestone": (
                    content.get("milestone", {}).get("title")
                    if content.get("milestone")
                    else None
                ),
                "comments": content.get("comments", 0),
                "created_at": content.get("created_at"),
                "updated_at": content.get("updated_at"),
                "closed_at": content.get("closed_at"),
                "pull_request": content.get("pull_request") is not None,
            },
            quality={
                "score": self._calculate_issue_quality_score(content),
                "factors": {
                    "content_length": len(body),
                    "has_body": bool(body),
                    "comments": content.get("comments", 0),
                    "has_labels": len(content.get("labels", [])) > 0,
                    "has_assignees": len(content.get("assignees", [])) > 0,
                    "extraction_method": "api",
                },
            },
        )

    def _create_pull_request_result(
        self,
        url: str,
        content: dict[str, Any],
    ) -> ScrapingResult:
        """Create result for pull request content."""
        title = content.get("title", "GitHub Pull Request")
        body = content.get("body", "")

        return ScrapingResult(
            url=url,
            title=title,
            content=body,
            metadata={
                "source": "github",
                "extraction_method": "api",
                "content_type": "pull_request",
                "number": content.get("number"),
                "state": content.get("state"),
                "user": content.get("user", {}).get("login", ""),
                "head": content.get("head", {}).get("ref", ""),
                "base": content.get("base", {}).get("ref", ""),
                "merged": content.get("merged", False),
                "mergeable": content.get("mergeable"),
                "mergeable_state": content.get("mergeable_state"),
                "commits": content.get("commits", 0),
                "additions": content.get("additions", 0),
                "deletions": content.get("deletions", 0),
                "changed_files": content.get("changed_files", 0),
                "comments": content.get("comments", 0),
                "review_comments": content.get("review_comments", 0),
                "created_at": content.get("created_at"),
                "updated_at": content.get("updated_at"),
                "closed_at": content.get("closed_at"),
                "merged_at": content.get("merged_at"),
            },
            quality={
                "score": self._calculate_pull_request_quality_score(content),
                "factors": {
                    "content_length": len(body),
                    "has_body": bool(body),
                    "commits": content.get("commits", 0),
                    "changed_files": content.get("changed_files", 0),
                    "additions": content.get("additions", 0),
                    "deletions": content.get("deletions", 0),
                    "comments": content.get("comments", 0),
                    "extraction_method": "api",
                },
            },
        )

    def _create_user_result(self, url: str, content: dict[str, Any]) -> ScrapingResult:
        """Create result for user content."""
        name = content.get("name", content.get("login", "GitHub User"))
        bio = content.get("bio", "")

        return ScrapingResult(
            url=url,
            title=name,
            content=bio,
            metadata={
                "source": "github",
                "extraction_method": "api",
                "content_type": "user",
                "username": content.get("login", ""),
                "name": content.get("name", ""),
                "email": content.get("email", ""),
                "bio": bio,
                "company": content.get("company", ""),
                "blog": content.get("blog", ""),
                "location": content.get("location", ""),
                "public_repos": content.get("public_repos", 0),
                "public_gists": content.get("public_gists", 0),
                "followers": content.get("followers", 0),
                "following": content.get("following", 0),
                "created_at": content.get("created_at"),
                "updated_at": content.get("updated_at"),
                "type": content.get("type", "User"),
            },
            quality={
                "score": self._calculate_user_quality_score(content),
                "factors": {
                    "content_length": len(bio),
                    "has_bio": bool(bio),
                    "public_repos": content.get("public_repos", 0),
                    "followers": content.get("followers", 0),
                    "has_company": bool(content.get("company")),
                    "has_location": bool(content.get("location")),
                    "extraction_method": "api",
                },
            },
        )

    def _create_generic_result(
        self,
        url: str,
        content: dict[str, Any],
    ) -> ScrapingResult:
        """Create generic result for unknown content types."""
        return ScrapingResult(
            url=url,
            title=content.get("title", "GitHub Content"),
            content=content.get("body", content.get("description", "")),
            metadata={
                "source": "github",
                "extraction_method": "api",
                "content_type": content.get("content_type", "unknown"),
                "raw_data": content,
            },
            quality={
                "score": 0.5,
                "factors": {
                    "extraction_method": "api",
                },
            },
        )

    def _calculate_repository_quality_score(self, content: dict[str, Any]) -> float:
        """Calculate quality score for repository content."""
        score = 0.0

        # Base score for having content
        if content.get("description") or content.get("readme"):
            score += 0.3

        # Stars bonus
        stars = content.get("stargazers_count", 0)
        if stars > 1000:
            score += 0.3
        elif stars > 100:
            score += 0.2
        elif stars > 10:
            score += 0.1

        # Forks bonus
        forks = content.get("forks_count", 0)
        if forks > 100:
            score += 0.1
        elif forks > 10:
            score += 0.05

        # Description bonus
        if content.get("description"):
            score += 0.1

        # README bonus
        if content.get("readme"):
            score += 0.1

        # License bonus
        if content.get("license"):
            score += 0.05

        # Topics bonus
        if content.get("topics"):
            score += 0.05

        return min(score, 1.0)

    def _calculate_issue_quality_score(self, content: dict[str, Any]) -> float:
        """Calculate quality score for issue content."""
        score = 0.0

        # Base score for having content
        if content.get("body"):
            score += 0.4

        # Comments bonus
        comments = content.get("comments", 0)
        if comments > 10:
            score += 0.2
        elif comments > 5:
            score += 0.15
        elif comments > 0:
            score += 0.1

        # Labels bonus
        if content.get("labels"):
            score += 0.1

        # Assignees bonus
        if content.get("assignees"):
            score += 0.1

        # Milestone bonus
        if content.get("milestone"):
            score += 0.05

        return min(score, 1.0)

    def _calculate_pull_request_quality_score(self, content: dict[str, Any]) -> float:
        """Calculate quality score for pull request content."""
        score = 0.0

        # Base score for having content
        if content.get("body"):
            score += 0.3

        # Commits bonus
        commits = content.get("commits", 0)
        if commits > 10:
            score += 0.2
        elif commits > 5:
            score += 0.15
        elif commits > 0:
            score += 0.1

        # Changed files bonus
        changed_files = content.get("changed_files", 0)
        if changed_files > 10:
            score += 0.1
        elif changed_files > 0:
            score += 0.05

        # Comments bonus
        comments = content.get("comments", 0)
        if comments > 5:
            score += 0.1
        elif comments > 0:
            score += 0.05

        # Review comments bonus
        review_comments = content.get("review_comments", 0)
        if review_comments > 0:
            score += 0.1

        return min(score, 1.0)

    def _calculate_user_quality_score(self, content: dict[str, Any]) -> float:
        """Calculate quality score for user content."""
        score = 0.0

        # Base score for having bio
        if content.get("bio"):
            score += 0.3

        # Public repos bonus
        repos = content.get("public_repos", 0)
        if repos > 50:
            score += 0.2
        elif repos > 10:
            score += 0.15
        elif repos > 0:
            score += 0.1

        # Followers bonus
        followers = content.get("followers", 0)
        if followers > 100:
            score += 0.2
        elif followers > 10:
            score += 0.15
        elif followers > 0:
            score += 0.1

        # Additional info bonus
        if content.get("company"):
            score += 0.05
        if content.get("location"):
            score += 0.05
        if content.get("blog"):
            score += 0.05

        return min(score, 1.0)

    async def _scrape_with_web(self, url: str, content_type: str) -> ScrapingResult:
        """Scrape content using web scraping as fallback."""
        try:
            response = await self._make_request(url)
            if not response:
                return await self._fallback_scraping(url)

            soup = self._parse_html(response.text)

            # Extract basic information
            title = soup.find("title")
            title_text = title.get_text() if title else "GitHub Content"

            # Extract main content based on type
            content_text = ""
            if content_type == "repository":
                # Try to find README content
                readme_div = soup.find("div", {"id": "readme"})
                if readme_div:
                    content_text = readme_div.get_text(separator="\n", strip=True)
            elif content_type in ["issue", "pull_request"]:
                # Try to find issue/PR body
                comment_div = soup.find("div", {"class": "comment-body"})
                if comment_div:
                    content_text = comment_div.get_text(separator="\n", strip=True)

            return ScrapingResult(
                url=url,
                title=title_text,
                content=content_text,
                metadata={
                    "source": "github",
                    "extraction_method": "web",
                    "content_type": content_type,
                    "limited_data": True,
                },
                quality={
                    "score": 0.3,
                    "factors": {
                        "content_length": len(content_text),
                        "extraction_method": "web",
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"GitHub web scraping failed: {e}")
            return await self._fallback_scraping(url)

    async def _fallback_scraping(self, url: str) -> ScrapingResult:
        """Fallback scraping method."""
        try:
            response = await self._make_request(url)
            if not response:
                return ScrapingResult(
                    url=url,
                    title="GitHub Content",
                    content="",
                    metadata={
                        "source": "github",
                        "extraction_method": "failed",
                        "error": "Failed to fetch content",
                    },
                    quality={"score": 0.0, "factors": {}},
                )

            soup = self._parse_html(response.text)

            # Extract basic information
            title = soup.find("title")
            title_text = title.get_text() if title else "GitHub Content"

            return ScrapingResult(
                url=url,
                title=title_text,
                content="",
                metadata={
                    "source": "github",
                    "extraction_method": "fallback",
                    "limited_data": True,
                },
                quality={
                    "score": 0.2,
                    "factors": {
                        "extraction_method": "fallback",
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"Fallback scraping failed: {e}")
            return ScrapingResult(
                url=url,
                title="GitHub Content",
                content="",
                metadata={
                    "source": "github",
                    "extraction_method": "failed",
                    "error": str(e),
                },
                quality={"score": 0.0, "factors": {}},
            )
