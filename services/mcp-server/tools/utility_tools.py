#!/usr/bin/env python3
"""
Utility Tool Handlers
=====================

Handles utility-related MCP tool calls (time, location).
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
import os
import signal
import subprocess
import zoneinfo
from datetime import datetime
from typing import Any

import requests
from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)


@register_tool(
    name="get_current_time",
    category="utility",
    description="Get current date and time with timezone support",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_current_time(**kwargs) -> dict[str, Any]:
    """Get the current date and time with timezone support."""
    arguments = kwargs.get("arguments", {})
    format_type = arguments.get("format", "iso")
    timezone_str = arguments.get("timezone", None)

    # Get timezone-aware datetime
    if timezone_str:
        try:
            tz = zoneinfo.ZoneInfo(timezone_str)
            now = datetime.now(tz)
        except zoneinfo.ZoneInfoNotFoundError:
            logger.warning(
                "Invalid timezone: %s, falling back to local time", timezone_str
            )
            now = datetime.now()
    else:
        # Try to get timezone from location service
        try:
            response = requests.get("https://ipinfo.io/json", timeout=5)
            response.raise_for_status()
            data = response.json()
            timezone_str = data.get("timezone", "UTC")
            tz = zoneinfo.ZoneInfo(timezone_str)
            now = datetime.now(tz)
        except Exception as e:
            logger.warning("Could not determine timezone: %s, using local time", e)
            now = datetime.now()

    if format_type == "iso":
        time_str = now.isoformat()
    elif format_type == "readable":
        time_str = now.strftime("%Y-%m-%d %H:%M:%S %Z")
    elif format_type == "timestamp":
        time_str = str(int(now.timestamp()))
    else:
        time_str = now.strftime(format_type)

    timezone_info = f" ({timezone_str})" if timezone_str else ""
    return {
        "content": [
            {
                "type": "text",
                "text": f"Current time: {time_str}{timezone_info}",
            }
        ]
    }


@register_tool(
    name="get_current_location",
    category="utility",
    description="Get location based on IP address",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_current_location(**kwargs) -> dict[str, Any]:
    """Get the current location based on IP address."""
    arguments = kwargs.get("arguments", {})
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
        logger.exception("Unexpected error fetching location: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Unexpected error fetching location: {e!s}",
                }
            ]
        }


@register_tool(
    name="send_desktop_notification",
    category="utility",
    description="Send desktop notifications using libnotify",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def send_desktop_notification(**kwargs) -> dict[str, Any]:
    """Send a desktop notification using libnotify."""
    arguments = kwargs.get("arguments", {})
    title = arguments.get("title", "MCP Notification")
    message = arguments.get("message", "")
    urgency = arguments.get("urgency", "normal")  # low, normal, critical
    timeout = arguments.get("timeout", 5000)  # milliseconds
    icon = arguments.get("icon", "dialog-information")

    try:
        # Check if notify-send is available
        try:
            subprocess.run(["which", "notify-send"], check=True, capture_output=True)
        except subprocess.CalledProcessError:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: notify-send not found. Please install libnotify-bin package.",
                    }
                ]
            }

        # Build notify-send command
        cmd = [
            "notify-send",
            f"--urgency={urgency}",
            f"--expire-time={timeout}",
            f"--icon={icon}",
            title,
            message,
        ]

        # Execute the notification
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=10, check=False
        )

        if result.returncode == 0:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Desktop notification sent successfully: '{title}' - {message}",
                    }
                ]
            }
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Failed to send notification: {result.stderr}",
                }
            ]
        }

    except subprocess.TimeoutExpired:
        return {
            "content": [
                {
                    "type": "text",
                    "text": "Error: Notification command timed out",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error sending desktop notification: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Error sending desktop notification: {e!s}",
                }
            ]
        }
