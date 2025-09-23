#!/usr/bin/env python3
"""
Playwright Tool Definitions
===========================

Defines Playwright MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


def get_playwright_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get Playwright MCP tool definitions."""
    return {
        "take_webpage_screenshot": {
            "name": "take_webpage_screenshot",
            "description": "Take screenshots of webpages using Playwright browser automation",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL to screenshot (required)"
                    },
                    "output_path": {
                        "type": "string",
                        "description": "Optional output file path"
                    },
                    "viewport_width": {
                        "type": "integer",
                        "description": "Browser width (default: 1920)",
                        "default": 1920
                    },
                    "viewport_height": {
                        "type": "integer",
                        "description": "Browser height (default: 1080)",
                        "default": 1080
                    },
                    "full_page": {
                        "type": "boolean",
                        "description": "Whether to capture full page (default: true)",
                        "default": True
                    },
                    "selector": {
                        "type": "string",
                        "description": "Optional CSS selector for element screenshot"
                    },
                    "open_with_imv": {
                        "type": "boolean",
                        "description": "Whether to open with imv (default: true)",
                        "default": True
                    }
                },
                "required": ["url"]
            }
        },
        "scrape_webpage_content": {
            "name": "scrape_webpage_content",
            "description": "Scrape content from webpages using Playwright browser automation",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL to scrape (required)"
                    },
                    "selector": {
                        "type": "string",
                        "description": "Optional CSS selector to extract specific content"
                    },
                    "viewport_width": {
                        "type": "integer",
                        "description": "Browser width (default: 1920)",
                        "default": 1920
                    },
                    "viewport_height": {
                        "type": "integer",
                        "description": "Browser height (default: 1080)",
                        "default": 1080
                    },
                    "wait_for": {
                        "type": "string",
                        "description": "Optional selector to wait for before scraping"
                    }
                },
                "required": ["url"]
            }
        },
        "test_playwright_connection": {
            "name": "test_playwright_connection",
            "description": "Test Playwright browser connection and capabilities",
            "inputSchema": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
