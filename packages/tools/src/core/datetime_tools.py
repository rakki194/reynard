"""
Date/Time tools for the yipyap assistant.

This module provides datetime-related tools that allow the assistant to perform
time operations including getting current time with timezone support and
formatting time in various formats.
"""

import logging
from typing import Any, Dict, List

from .base import (
    BaseTool,
    ParameterType,
    ToolExecutionContext,
    ToolParameter,
    ToolResult,
)
from .decorators import tool

logger = logging.getLogger("uvicorn")


def get_datetime_service():
    """Get datetime service without circular imports."""
    # Import here to avoid circular dependency
    from ..services.access import get_service_manager

    service_manager = get_service_manager()
    if not service_manager:
        raise RuntimeError("Service manager unavailable")

    datetime_service = service_manager.get_service("datetime_service")
    if not datetime_service:
        raise RuntimeError("DateTime service unavailable")

    return datetime_service


@tool(
    name="get_current_time",
    description="Get the current date and time with timezone support and multiple format options",
    category="datetime",
    tags=["datetime", "time", "timezone", "current"],
    required_permission="read",
    parameters={
        "timezone": {
            "type": "string",
            "description": "Timezone name or alias (e.g., 'UTC', 'America/New_York', 'EST'). If not provided, uses UTC",
            "required": False,
            "default": "UTC",
        },
        "format_name": {
            "type": "string",
            "description": "Time format preset to use (iso, iso_utc, date, time, datetime, readable, short, rfc2822, unix)",
            "required": False,
            "default": "iso",
            "choices": [
                "iso",
                "iso_utc",
                "date",
                "time",
                "datetime",
                "readable",
                "short",
                "rfc2822",
                "unix",
            ],
        },
        "include_timezone_info": {
            "type": "boolean",
            "description": "Whether to include detailed timezone information in the response",
            "required": False,
            "default": True,
        },
    },
)
async def get_current_time_tool(
    timezone: str = "UTC", format_name: str = "iso", include_timezone_info: bool = True
) -> Dict[str, Any]:
    """
    Get current date and time with timezone support.

    Args:
        timezone: Timezone name or alias
        format_name: Time format preset to use
        include_timezone_info: Whether to include timezone details

    Returns:
        Dictionary containing current time information
    """
    try:
        from ..utils.datetime_utils import DateTimeUtils

        # Get current time in specified timezone
        current_time = DateTimeUtils.get_current_time(timezone)
        if not current_time:
            raise ValueError(f"Invalid timezone: {timezone}")

        # Format the time
        formatted_time = DateTimeUtils.format_time(current_time, format_name)

        # Get timezone information
        timezone_info = {}
        if include_timezone_info:
            tz_obj = DateTimeUtils.get_timezone(timezone)
            if tz_obj:
                timezone_info = {
                    "name": timezone,
                    "offset_hours": int(
                        current_time.utcoffset().total_seconds() / 3600
                    ),
                    "abbreviation": current_time.strftime("%Z"),
                    "is_dst": bool(current_time.dst()),
                    "timezone_object": str(tz_obj),
                }

        # Get Unix timestamp
        unix_timestamp = int(current_time.timestamp())

        return {
            "current_time": current_time.isoformat(),
            "formatted_time": formatted_time,
            "format_used": format_name,
            "timezone": timezone,
            "timezone_info": timezone_info,
            "unix_timestamp": unix_timestamp,
            "utc_time": current_time.utctimetuple(),
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error getting current time: {e}")
        return {
            "success": False,
            "error": str(e),
            "current_time": None,
            "formatted_time": None,
            "timezone": timezone,
            "timezone_info": {},
            "unix_timestamp": None,
        }


@tool(
    name="format_time",
    description="Format a given date/time string or timestamp in various formats with timezone conversion",
    category="datetime",
    tags=["datetime", "format", "timezone", "conversion"],
    required_permission="read",
    parameters={
        "time_input": {
            "type": "string",
            "description": "Time input to format. Can be ISO string, Unix timestamp, or readable date string",
            "required": True,
        },
        "input_format": {
            "type": "string",
            "description": "Format of the input time (auto, iso, unix, custom). Use 'auto' for automatic detection",
            "required": False,
            "default": "auto",
            "choices": ["auto", "iso", "unix", "custom"],
        },
        "output_format": {
            "type": "string",
            "description": "Output format preset (iso, iso_utc, date, time, datetime, readable, short, rfc2822, unix)",
            "required": False,
            "default": "iso",
            "choices": [
                "iso",
                "iso_utc",
                "date",
                "time",
                "datetime",
                "readable",
                "short",
                "rfc2822",
                "unix",
            ],
        },
        "source_timezone": {
            "type": "string",
            "description": "Timezone of the input time (if not specified in the input). Defaults to UTC",
            "required": False,
            "default": "UTC",
        },
        "target_timezone": {
            "type": "string",
            "description": "Timezone to convert to. If not provided, keeps the source timezone",
            "required": False,
            "default": "",
        },
        "custom_format": {
            "type": "string",
            "description": "Custom format string (used when input_format or output_format is 'custom')",
            "required": False,
            "default": "",
        },
    },
)
async def format_time_tool(
    time_input: str,
    input_format: str = "auto",
    output_format: str = "iso",
    source_timezone: str = "UTC",
    target_timezone: str = "",
    custom_format: str = "",
) -> Dict[str, Any]:
    """
    Format a given time input in various formats with timezone conversion.

    Args:
        time_input: Time input to format
        input_format: Format of the input time
        output_format: Output format preset
        source_timezone: Timezone of the input time
        target_timezone: Timezone to convert to
        custom_format: Custom format string

    Returns:
        Dictionary containing formatted time information
    """
    try:
        from ..utils.datetime_utils import DateTimeUtils

        # Parse the input time
        parsed_time = None

        if input_format == "auto":
            # Try to auto-detect the format
            parsed_time = DateTimeUtils.parse_time_auto(time_input, source_timezone)
        elif input_format == "iso":
            parsed_time = DateTimeUtils.parse_iso_time(time_input, source_timezone)
        elif input_format == "unix":
            parsed_time = DateTimeUtils.parse_unix_timestamp(
                time_input, source_timezone
            )
        elif input_format == "custom" and custom_format and custom_format.strip():
            parsed_time = DateTimeUtils.parse_custom_time(
                time_input, custom_format, source_timezone
            )
        else:
            raise ValueError(f"Invalid input format: {input_format}")

        if not parsed_time:
            raise ValueError(f"Could not parse time input: {time_input}")

        # Convert timezone if requested
        final_time = parsed_time
        if (
            target_timezone
            and target_timezone.strip()
            and target_timezone != source_timezone
        ):
            converted_time = DateTimeUtils.convert_timezone(
                parsed_time, target_timezone
            )
            if converted_time:
                final_time = converted_time
            else:
                raise ValueError(f"Could not convert to timezone: {target_timezone}")

        # Format the output
        if output_format == "custom" and custom_format:
            formatted_output = final_time.strftime(custom_format)
        else:
            formatted_output = DateTimeUtils.format_time(final_time, output_format)

        # Get timezone information
        timezone_info = {
            "source_timezone": source_timezone,
            "target_timezone": target_timezone or source_timezone,
            "offset_hours": int(final_time.utcoffset().total_seconds() / 3600),
            "abbreviation": final_time.strftime("%Z"),
            "is_dst": bool(final_time.dst()),
        }

        return {
            "original_input": time_input,
            "parsed_time": parsed_time.isoformat(),
            "formatted_output": formatted_output,
            "output_format": output_format,
            "timezone_info": timezone_info,
            "unix_timestamp": int(final_time.timestamp()),
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error formatting time: {e}")
        return {
            "success": False,
            "error": str(e),
            "original_input": time_input,
            "parsed_time": None,
            "formatted_output": None,
            "output_format": output_format,
            "timezone_info": {},
            "unix_timestamp": None,
        }


class GetCurrentTimeTool(BaseTool):
    """Tool for getting current date and time with timezone support."""

    @property
    def name(self) -> str:
        return "get_current_time"

    @property
    def description(self) -> str:
        return "Get the current date and time with timezone support and multiple format options"

    @property
    def parameters(self) -> List[ToolParameter]:
        return [
            ToolParameter(
                name="timezone",
                type=ParameterType.STRING,
                description="Timezone name or alias (e.g., 'UTC', 'America/New_York', 'EST'). If not provided, uses UTC",
                required=False,
                default="UTC",
            ),
            ToolParameter(
                name="format_name",
                type=ParameterType.STRING,
                description="Time format preset to use (iso, iso_utc, date, time, datetime, readable, short, rfc2822, unix)",
                required=False,
                default="iso",
                choices=[
                    "iso",
                    "iso_utc",
                    "date",
                    "time",
                    "datetime",
                    "readable",
                    "short",
                    "rfc2822",
                    "unix",
                ],
            ),
            ToolParameter(
                name="include_timezone_info",
                type=ParameterType.BOOLEAN,
                description="Whether to include detailed timezone information in the response",
                required=False,
                default=True,
            ),
        ]

    @property
    def category(self) -> str:
        return "datetime"

    @property
    def tags(self) -> List[str]:
        return ["datetime", "time", "timezone", "current"]

    @property
    def required_permission(self) -> str:
        return "read"

    async def execute(self, context: ToolExecutionContext, **params) -> ToolResult:
        """Execute the get current time tool."""
        try:
            result = await get_current_time_tool(**params)
            return ToolResult(
                success=result.get("success", False),
                data=result,
                error=result.get("error") if not result.get("success") else None,
            )
        except Exception as e:
            logger.error(f"Error executing get_current_time tool: {e}")
            return ToolResult(success=False, data={}, error=str(e))


class FormatTimeTool(BaseTool):
    """Tool for formatting time in various formats with timezone conversion."""

    @property
    def name(self) -> str:
        return "format_time"

    @property
    def description(self) -> str:
        return "Format a given date/time string or timestamp in various formats with timezone conversion"

    @property
    def parameters(self) -> List[ToolParameter]:
        return [
            ToolParameter(
                name="time_input",
                type=ParameterType.STRING,
                description="Time input to format. Can be ISO string, Unix timestamp, or readable date string",
                required=True,
            ),
            ToolParameter(
                name="input_format",
                type=ParameterType.STRING,
                description="Format of the input time (auto, iso, unix, custom). Use 'auto' for automatic detection",
                required=False,
                default="auto",
                choices=["auto", "iso", "unix", "custom"],
            ),
            ToolParameter(
                name="output_format",
                type=ParameterType.STRING,
                description="Output format preset (iso, iso_utc, date, time, datetime, readable, short, rfc2822, unix)",
                required=False,
                default="iso",
                choices=[
                    "iso",
                    "iso_utc",
                    "date",
                    "time",
                    "datetime",
                    "readable",
                    "short",
                    "rfc2822",
                    "unix",
                ],
            ),
            ToolParameter(
                name="source_timezone",
                type=ParameterType.STRING,
                description="Timezone of the input time (if not specified in the input). Defaults to UTC",
                required=False,
                default="UTC",
            ),
            ToolParameter(
                name="target_timezone",
                type=ParameterType.STRING,
                description="Timezone to convert to. If not provided, keeps the source timezone",
                required=False,
                default="",
            ),
            ToolParameter(
                name="custom_format",
                type=ParameterType.STRING,
                description="Custom format string (used when input_format or output_format is 'custom')",
                required=False,
                default="",
            ),
        ]

    @property
    def category(self) -> str:
        return "datetime"

    @property
    def tags(self) -> List[str]:
        return ["datetime", "format", "timezone", "conversion"]

    @property
    def required_permission(self) -> str:
        return "read"

    async def execute(self, context: ToolExecutionContext, **params) -> ToolResult:
        """Execute the format time tool."""
        try:
            result = await format_time_tool(**params)
            return ToolResult(
                success=result.get("success", False),
                data=result,
                error=result.get("error") if not result.get("success") else None,
            )
        except Exception as e:
            logger.error(f"Error executing format_time tool: {e}")
            return ToolResult(success=False, data={}, error=str(e))
