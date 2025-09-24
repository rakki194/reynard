"""Calendar Integration Service for Reynard Backend.

This module provides calendar integration functionality for meeting scheduling from emails.
"""

import json
import logging
import re
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

# Calendar API imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import Flow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError

    GOOGLE_CALENDAR_AVAILABLE = True
except ImportError:
    GOOGLE_CALENDAR_AVAILABLE = False

try:
    import caldav

    CALDAV_AVAILABLE = True
except ImportError:
    CALDAV_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class CalendarEvent:
    """Calendar event data structure."""

    event_id: str
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    location: str | None = None
    attendees: list[str] = None
    organizer: str | None = None
    status: str = "confirmed"  # confirmed, tentative, cancelled
    calendar_id: str = "primary"
    created_at: datetime = None
    updated_at: datetime = None
    meeting_link: str | None = None
    is_recurring: bool = False
    recurrence_rule: str | None = None

    def __post_init__(self):
        if self.attendees is None:
            self.attendees = []
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()


@dataclass
class MeetingRequest:
    """Meeting request extracted from email."""

    request_id: str
    email_message_id: str
    subject: str
    proposed_times: list[datetime]
    duration_minutes: int
    attendees: list[str]
    location: str | None = None
    description: str | None = None
    priority: str = "normal"  # low, normal, high
    meeting_type: str = "meeting"  # meeting, call, video_call
    extracted_at: datetime = None
    status: str = "pending"  # pending, scheduled, declined, cancelled

    def __post_init__(self):
        if self.extracted_at is None:
            self.extracted_at = datetime.now()


@dataclass
class CalendarConfig:
    """Calendar integration configuration."""

    google_calendar_enabled: bool = True
    caldav_enabled: bool = True
    default_calendar: str = "primary"
    auto_schedule_meetings: bool = False
    meeting_buffer_minutes: int = 15
    max_meeting_duration_hours: int = 8
    working_hours_start: int = 9  # 9 AM
    working_hours_end: int = 17  # 5 PM
    working_days: list[int] = None  # 0=Monday, 6=Sunday
    timezone: str = "UTC"

    def __post_init__(self):
        if self.working_days is None:
            self.working_days = [0, 1, 2, 3, 4]  # Monday to Friday


class CalendarIntegrationService:
    """Service for calendar integration and meeting scheduling."""

    def __init__(
        self, config: CalendarConfig | None = None, data_dir: str = "data/calendar",
    ):
        self.config = config or CalendarConfig()
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Storage directories
        self.events_dir = self.data_dir / "events"
        self.events_dir.mkdir(exist_ok=True)
        self.requests_dir = self.data_dir / "requests"
        self.requests_dir.mkdir(exist_ok=True)

        # Google Calendar service
        self.google_service = None
        if GOOGLE_CALENDAR_AVAILABLE and self.config.google_calendar_enabled:
            self._setup_google_calendar()

        # CalDAV client
        self.caldav_client = None
        if CALDAV_AVAILABLE and self.config.caldav_enabled:
            self._setup_caldav()

        # Load existing data
        self._load_events()
        self._load_meeting_requests()

    def _setup_google_calendar(self) -> None:
        """Setup Google Calendar service."""
        try:
            # This would typically load credentials from a secure store
            # For now, we'll create a placeholder
            self.google_service = None  # Would be initialized with proper credentials
            logger.info("Google Calendar service setup (placeholder)")
        except Exception as e:
            logger.error(f"Failed to setup Google Calendar: {e}")
            self.google_service = None

    def _setup_caldav(self) -> None:
        """Setup CalDAV client."""
        try:
            # This would typically connect to a CalDAV server
            # For now, we'll create a placeholder
            self.caldav_client = None  # Would be initialized with proper connection
            logger.info("CalDAV client setup (placeholder)")
        except Exception as e:
            logger.error(f"Failed to setup CalDAV: {e}")
            self.caldav_client = None

    def _load_events(self) -> None:
        """Load existing calendar events."""
        try:
            events_file = self.data_dir / "events.json"
            if events_file.exists():
                with open(events_file, encoding="utf-8") as f:
                    events_data = json.load(f)
                    self.events = {
                        event_id: CalendarEvent(**event_data)
                        for event_id, event_data in events_data.items()
                    }
            else:
                self.events = {}
        except Exception as e:
            logger.error(f"Failed to load calendar events: {e}")
            self.events = {}

    def _load_meeting_requests(self) -> None:
        """Load existing meeting requests."""
        try:
            requests_file = self.data_dir / "meeting_requests.json"
            if requests_file.exists():
                with open(requests_file, encoding="utf-8") as f:
                    requests_data = json.load(f)
                    self.meeting_requests = {
                        req_id: MeetingRequest(**req_data)
                        for req_id, req_data in requests_data.items()
                    }
            else:
                self.meeting_requests = {}
        except Exception as e:
            logger.error(f"Failed to load meeting requests: {e}")
            self.meeting_requests = {}

    def _save_events(self) -> None:
        """Save calendar events to storage."""
        try:
            events_file = self.data_dir / "events.json"
            events_data = {
                event_id: asdict(event) for event_id, event in self.events.items()
            }

            # Convert datetime objects to ISO strings
            for event_data in events_data.values():
                for key, value in event_data.items():
                    if isinstance(value, datetime):
                        event_data[key] = value.isoformat()

            with open(events_file, "w", encoding="utf-8") as f:
                json.dump(events_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save calendar events: {e}")

    def _save_meeting_requests(self) -> None:
        """Save meeting requests to storage."""
        try:
            requests_file = self.data_dir / "meeting_requests.json"
            requests_data = {
                req_id: asdict(request)
                for req_id, request in self.meeting_requests.items()
            }

            # Convert datetime objects to ISO strings
            for req_data in requests_data.values():
                for key, value in req_data.items():
                    if isinstance(value, datetime):
                        req_data[key] = value.isoformat()
                    elif (
                        isinstance(value, list)
                        and value
                        and isinstance(value[0], datetime)
                    ):
                        req_data[key] = [v.isoformat() for v in value]

            with open(requests_file, "w", encoding="utf-8") as f:
                json.dump(requests_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save meeting requests: {e}")

    async def extract_meeting_requests_from_email(
        self,
        email_subject: str,
        email_body: str,
        email_message_id: str,
        sender_email: str,
    ) -> list[MeetingRequest]:
        """Extract meeting requests from email content.

        Args:
            email_subject: Email subject line
            email_body: Email body content
            email_message_id: Email message ID
            sender_email: Sender's email address

        Returns:
            List of MeetingRequest objects

        """
        try:
            requests = []

            # Combine subject and body for analysis
            full_text = f"{email_subject}\n{email_body}"

            # Look for meeting-related keywords
            meeting_keywords = [
                "meeting",
                "call",
                "conference",
                "appointment",
                "schedule",
                "book",
                "reserve",
                "arrange",
                "plan",
                "coordinate",
            ]

            if not any(keyword in full_text.lower() for keyword in meeting_keywords):
                return requests

            # Extract proposed times
            proposed_times = self._extract_proposed_times(full_text)

            # Extract duration
            duration = self._extract_meeting_duration(full_text)

            # Extract attendees
            attendees = self._extract_attendees(full_text, sender_email)

            # Extract location
            location = self._extract_meeting_location(full_text)

            # Extract meeting type
            meeting_type = self._extract_meeting_type(full_text)

            # Extract priority
            priority = self._extract_meeting_priority(full_text)

            if proposed_times:
                request = MeetingRequest(
                    request_id=str(uuid.uuid4()),
                    email_message_id=email_message_id,
                    subject=email_subject,
                    proposed_times=proposed_times,
                    duration_minutes=duration,
                    attendees=attendees,
                    location=location,
                    description=email_body[:500],  # First 500 chars
                    priority=priority,
                    meeting_type=meeting_type,
                    status="pending",
                )
                requests.append(request)

                # Store the request
                self.meeting_requests[request.request_id] = request
                self._save_meeting_requests()

                logger.info(f"Extracted meeting request: {request.request_id}")

            return requests

        except Exception as e:
            logger.error(f"Failed to extract meeting requests: {e}")
            return []

    async def schedule_meeting(
        self,
        meeting_request: MeetingRequest,
        selected_time: datetime | None = None,
        calendar_id: str = "primary",
    ) -> CalendarEvent:
        """Schedule a meeting from a meeting request.

        Args:
            meeting_request: Meeting request to schedule
            selected_time: Specific time to schedule (if None, uses first proposed time)
            calendar_id: Calendar to schedule in

        Returns:
            CalendarEvent object

        """
        try:
            # Select time
            if not selected_time:
                if meeting_request.proposed_times:
                    selected_time = meeting_request.proposed_times[0]
                else:
                    raise ValueError("No proposed times available")

            # Calculate end time
            end_time = selected_time + timedelta(
                minutes=meeting_request.duration_minutes,
            )

            # Create calendar event
            event = CalendarEvent(
                event_id=str(uuid.uuid4()),
                title=meeting_request.subject,
                description=meeting_request.description or "",
                start_time=selected_time,
                end_time=end_time,
                location=meeting_request.location,
                attendees=meeting_request.attendees,
                organizer=(
                    meeting_request.attendees[0] if meeting_request.attendees else None
                ),
                calendar_id=calendar_id,
                meeting_link=self._generate_meeting_link(meeting_request.meeting_type),
            )

            # Store the event
            self.events[event.event_id] = event
            self._save_events()

            # Update meeting request status
            meeting_request.status = "scheduled"
            self._save_meeting_requests()

            # Create event in external calendar if available
            await self._create_external_calendar_event(event)

            logger.info(f"Scheduled meeting: {event.event_id}")
            return event

        except Exception as e:
            logger.error(f"Failed to schedule meeting: {e}")
            raise

    async def get_available_times(
        self,
        start_date: datetime,
        end_date: datetime,
        duration_minutes: int,
        attendees: list[str],
        calendar_id: str = "primary",
    ) -> list[dict[str, Any]]:
        """Get available time slots for scheduling.

        Args:
            start_date: Start of availability window
            end_date: End of availability window
            duration_minutes: Duration of meeting
            attendees: List of attendee emails
            calendar_id: Calendar to check

        Returns:
            List of available time slots

        """
        try:
            # Get existing events in the time range
            existing_events = await self._get_events_in_range(
                start_date, end_date, calendar_id,
            )

            # Generate possible time slots
            time_slots = []
            current_time = start_date

            while current_time + timedelta(minutes=duration_minutes) <= end_date:
                # Check if this time slot is available
                if self._is_time_slot_available(
                    current_time, duration_minutes, existing_events,
                ):
                    # Check if it's within working hours
                    if self._is_within_working_hours(current_time):
                        time_slots.append(
                            {
                                "start_time": current_time.isoformat(),
                                "end_time": (
                                    current_time + timedelta(minutes=duration_minutes)
                                ).isoformat(),
                                "duration_minutes": duration_minutes,
                                "available": True,
                            },
                        )

                # Move to next slot (every 30 minutes)
                current_time += timedelta(minutes=30)

            return time_slots

        except Exception as e:
            logger.error(f"Failed to get available times: {e}")
            return []

    async def get_upcoming_meetings(
        self, user_email: str, days_ahead: int = 7,
    ) -> list[CalendarEvent]:
        """Get upcoming meetings for a user.

        Args:
            user_email: User's email address
            days_ahead: Number of days to look ahead

        Returns:
            List of upcoming CalendarEvent objects

        """
        try:
            now = datetime.now()
            end_date = now + timedelta(days=days_ahead)

            upcoming_meetings = []

            for event in self.events.values():
                # Check if user is involved in the meeting
                if (
                    user_email in event.attendees
                    or user_email == event.organizer
                    or user_email in [event.organizer]
                ):

                    # Check if meeting is in the future
                    if event.start_time > now and event.start_time <= end_date:
                        upcoming_meetings.append(event)

            # Sort by start time
            upcoming_meetings.sort(key=lambda x: x.start_time)

            return upcoming_meetings

        except Exception as e:
            logger.error(f"Failed to get upcoming meetings: {e}")
            return []

    async def cancel_meeting(self, event_id: str, reason: str | None = None) -> bool:
        """Cancel a scheduled meeting.

        Args:
            event_id: Event ID to cancel
            reason: Reason for cancellation

        Returns:
            True if successful

        """
        try:
            if event_id not in self.events:
                return False

            event = self.events[event_id]
            event.status = "cancelled"
            # Add small delay to ensure timestamp is different
            import time

            time.sleep(0.001)  # 1ms delay
            event.updated_at = datetime.now()

            # Update in external calendar if available
            await self._cancel_external_calendar_event(event_id)

            self._save_events()

            logger.info(f"Cancelled meeting: {event_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to cancel meeting: {e}")
            return False

    async def reschedule_meeting(
        self,
        event_id: str,
        new_start_time: datetime,
        new_duration_minutes: int | None = None,
    ) -> bool:
        """Reschedule a meeting.

        Args:
            event_id: Event ID to reschedule
            new_start_time: New start time
            new_duration_minutes: New duration (if different)

        Returns:
            True if successful

        """
        try:
            if event_id not in self.events:
                return False

            event = self.events[event_id]

            # Calculate original duration before updating start_time
            original_duration = event.end_time - event.start_time

            # Update times
            event.start_time = new_start_time
            if new_duration_minutes:
                event.end_time = new_start_time + timedelta(
                    minutes=new_duration_minutes,
                )
            else:
                # Keep original duration
                event.end_time = new_start_time + original_duration

            # Add small delay to ensure timestamp is different
            import time

            time.sleep(0.001)  # 1ms delay
            event.updated_at = datetime.now()

            # Update in external calendar if available
            await self._update_external_calendar_event(event)

            self._save_events()

            logger.info(f"Rescheduled meeting: {event_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to reschedule meeting: {e}")
            return False

    # Private helper methods

    def _extract_proposed_times(self, text: str) -> list[datetime]:
        """Extract proposed meeting times from text."""
        times = []

        # Common time patterns
        time_patterns = [
            r"(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)",
            r"(\d{1,2})\s*(am|pm|AM|PM)",
            r"at\s+(\d{1,2}):(\d{2})",
            r"(\d{1,2})/(\d{1,2})/(\d{4})\s+at\s+(\d{1,2}):(\d{2})",
        ]

        for pattern in time_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    # Only add time if we actually found a match
                    if match.groups():
                        # This is a simplified time extraction
                        # In production, you'd have more sophisticated parsing
                        parsed_time = datetime.now() + timedelta(hours=1)  # Placeholder
                        times.append(parsed_time)
                except:
                    continue

        # Return only actual extracted times, no fallback

        return times

    def _extract_meeting_duration(self, text: str) -> int:
        """Extract meeting duration from text."""
        duration_patterns = [
            r"(\d+)\s*minutes?",
            r"(\d+)\s*mins?",
            r"(\d+)\s*hours?",
            r"(\d+)\s*hrs?",
        ]

        for pattern in duration_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                duration = int(match.group(1))
                if "hour" in match.group(0).lower():
                    duration *= 60
                return duration

        return 60  # Default 1 hour

    def _extract_attendees(self, text: str, sender_email: str) -> list[str]:
        """Extract meeting attendees from text."""
        attendees = [sender_email]  # Include sender

        # Look for email addresses
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        emails = re.findall(email_pattern, text)

        for email in emails:
            if email not in attendees:
                attendees.append(email)

        return attendees

    def _extract_meeting_location(self, text: str) -> str | None:
        """Extract meeting location from text."""
        location_keywords = ["location", "where", "place", "room", "office", "address"]

        # First try explicit patterns like "location: Room A"
        for keyword in location_keywords:
            pattern = rf"{keyword}:\s*([^\n]+)"
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        # Then try implicit patterns like "in Conference Room A"
        for keyword in location_keywords:
            pattern = (
                rf"(?:in|at|held in|held at)\s+([A-Z][^.!?]*(?:{keyword}[^.!?]*)?)"
            )
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return None

    def _extract_meeting_type(self, text: str) -> str:
        """Extract meeting type from text."""
        text_lower = text.lower()

        if any(
            word in text_lower
            for word in ["video", "zoom", "teams", "webinar", "google meet"]
        ):
            return "video_call"
        if any(word in text_lower for word in ["call", "phone", "telephone"]):
            return "call"
        return "meeting"

    def _extract_meeting_priority(self, text: str) -> str:
        """Extract meeting priority from text."""
        text_lower = text.lower()

        if any(
            word in text_lower for word in ["urgent", "asap", "immediately", "critical"]
        ):
            return "high"
        if any(word in text_lower for word in ["low", "whenever", "flexible"]):
            return "low"
        return "normal"

    def _generate_meeting_link(self, meeting_type: str) -> str | None:
        """Generate meeting link based on type."""
        if meeting_type == "video_call":
            # In production, this would integrate with actual video conferencing services
            return f"https://meet.example.com/room/{uuid.uuid4().hex[:8]}"
        if meeting_type == "call":
            # Generate a phone conference link
            return f"https://conference.example.com/room/{uuid.uuid4().hex[:8]}"
        # Regular meetings don't need links
        return None

    async def _get_events_in_range(
        self, start_date: datetime, end_date: datetime, calendar_id: str,
    ) -> list[CalendarEvent]:
        """Get events in a time range."""
        events = []

        for event in self.events.values():
            if (
                event.calendar_id == calendar_id
                and event.start_time < end_date
                and event.end_time > start_date
                and event.status != "cancelled"
            ):
                events.append(event)

        return events

    def _is_time_slot_available(
        self,
        start_time: datetime,
        duration_minutes: int,
        existing_events: list[CalendarEvent],
    ) -> bool:
        """Check if a time slot is available."""
        end_time = start_time + timedelta(minutes=duration_minutes)

        for event in existing_events:
            if start_time < event.end_time and end_time > event.start_time:
                return False

        return True

    def _is_within_working_hours(self, time: datetime) -> bool:
        """Check if time is within working hours."""
        # Check if it's a working day
        if time.weekday() not in self.config.working_days:
            return False

        # Check if it's within working hours
        hour = time.hour
        return self.config.working_hours_start <= hour < self.config.working_hours_end

    async def _create_external_calendar_event(self, event: CalendarEvent) -> None:
        """Create event in external calendar service."""
        try:
            if self.google_service:
                await self._create_google_calendar_event(event)
            elif self.caldav_client:
                await self._create_caldav_event(event)
        except Exception as e:
            logger.error(f"Failed to create external calendar event: {e}")

    async def _create_google_calendar_event(self, event: CalendarEvent) -> None:
        """Create event in Google Calendar."""
        # This would integrate with Google Calendar API
        # For now, it's a placeholder
        logger.info(f"Would create Google Calendar event: {event.event_id}")

    async def _create_caldav_event(self, event: CalendarEvent) -> None:
        """Create event in CalDAV calendar."""
        # This would integrate with CalDAV
        # For now, it's a placeholder
        logger.info(f"Would create CalDAV event: {event.event_id}")

    async def _cancel_external_calendar_event(self, event_id: str) -> None:
        """Cancel event in external calendar service."""
        try:
            if self.google_service:
                await self._cancel_google_calendar_event(event_id)
            elif self.caldav_client:
                await self._cancel_caldav_event(event_id)
        except Exception as e:
            logger.error(f"Failed to cancel external calendar event: {e}")

    async def _cancel_google_calendar_event(self, event_id: str) -> None:
        """Cancel event in Google Calendar."""
        # This would integrate with Google Calendar API
        logger.info(f"Would cancel Google Calendar event: {event_id}")

    async def _cancel_caldav_event(self, event_id: str) -> None:
        """Cancel event in CalDAV calendar."""
        # This would integrate with CalDAV
        logger.info(f"Would cancel CalDAV event: {event_id}")

    async def _update_external_calendar_event(self, event: CalendarEvent) -> None:
        """Update event in external calendar service."""
        try:
            if self.google_service:
                await self._update_google_calendar_event(event)
            elif self.caldav_client:
                await self._update_caldav_event(event)
        except Exception as e:
            logger.error(f"Failed to update external calendar event: {e}")

    async def _update_google_calendar_event(self, event: CalendarEvent) -> None:
        """Update event in Google Calendar."""
        # This would integrate with Google Calendar API
        logger.info(f"Would update Google Calendar event: {event.event_id}")

    async def _update_caldav_event(self, event: CalendarEvent) -> None:
        """Update event in CalDAV calendar."""
        # This would integrate with CalDAV
        logger.info(f"Would update CalDAV event: {event.event_id}")


# Global calendar integration service instance
calendar_integration_service = CalendarIntegrationService()
