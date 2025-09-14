#!/usr/bin/env python3
"""
Utility Tool Handlers
=====================

Handles utility-related MCP tool calls (time, location).
Follows the 100-line axiom and modular architecture principles.
"""

import logging
from datetime import datetime
from typing import Any

import requests

logger = logging.getLogger(__name__)


class UtilityTools:
    """Handles utility-related tool operations."""

    def get_current_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get the current date and time."""
        format_type = arguments.get("format", "iso")
        now = datetime.now()

        if format_type == "iso":
            time_str = now.isoformat()
        elif format_type == "readable":
            time_str = now.strftime("%Y-%m-%d %H:%M:%S")
        elif format_type == "timestamp":
            time_str = str(int(now.timestamp()))
        else:
            time_str = now.strftime(format_type)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Current time: {time_str}",
                }
            ]
        }

    def get_current_location(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get the current location based on IP address."""
        include_coordinates = arguments.get("include_coordinates", True)

        try:
            # Get location data from ipinfo.io
            response = requests.get("https://ipinfo.io/json", timeout=10)
            response.raise_for_status()
            data = response.json()

            location_info = {
                "ip": data.get("ip", "Unknown"),
                "city": data.get("city", "Unknown"),
                "region": data.get("region", "Unknown"),
                "country": data.get("country", "Unknown"),
                "timezone": data.get("timezone", "Unknown"),
            }

            if include_coordinates and "loc" in data:
                lat, lon = data["loc"].split(",")
                location_info["latitude"] = lat.strip()
                location_info["longitude"] = lon.strip()

            # Format the response
            location_text = f"Location: {location_info['city']}, {location_info['region']}, {location_info['country']}"
            if include_coordinates and "latitude" in location_info:
                location_text += f"\nCoordinates: {location_info['latitude']}, {location_info['longitude']}"
            location_text += (
                f"\nIP: {location_info['ip']}\nTimezone: {location_info['timezone']}"
            )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": location_text,
                    }
                ]
            }

        except requests.RequestException as e:
            logger.exception("Error fetching location: %s", e)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error fetching location: {e!s}",
                    }
                ]
            }
        except Exception as e:
            logger.exception("Error processing location data: %s", e)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error processing location data: {e!s}",
                    }
                ]
            }
