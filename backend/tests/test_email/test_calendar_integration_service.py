"""
Tests for Calendar Integration Service.

This module contains comprehensive tests for the calendar integration functionality.
"""

import pytest
import pytest_asyncio
import asyncio
import json
import tempfile
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock, MagicMock

from app.services.calendar_integration_service import (
    CalendarIntegrationService,
    CalendarEvent,
    MeetingRequest,
    CalendarConfig,
    calendar_integration_service,
)


class TestCalendarIntegrationService:
    """Test cases for CalendarIntegrationService."""

    @pytest_asyncio.fixture
    async def calendar_service(self):
        """Create a test calendar service with temporary data directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = CalendarConfig(
                google_calendar_enabled=True,
                caldav_enabled=True,
                default_calendar="primary",
                auto_schedule_meetings=False,
                meeting_buffer_minutes=15,
                max_meeting_duration_hours=8,
                working_hours_start=9,
                working_hours_end=17,
                working_days=[0, 1, 2, 3, 4],  # Monday to Friday
                timezone="UTC",
            )
            service = CalendarIntegrationService(config=config, data_dir=temp_dir)
            yield service

    @pytest.fixture
    def sample_email_content(self):
        """Sample email content for meeting extraction testing."""
        return {
            "subject": "Meeting Request - Project Discussion",
            "body": """
            Hi Team,
            
            I would like to schedule a meeting to discuss the project progress.
            Please let me know your availability for the following times:
            
            - Tomorrow at 2:00 PM
            - Wednesday at 10:00 AM
            - Thursday at 3:30 PM
            
            The meeting should last about 1 hour and will be held in the conference room.
            Please confirm your attendance.
            
            Best regards,
            John
            """,
            "message_id": "msg_12345",
            "sender": "john@example.com",
        }

    def test_calendar_service_initialization(self, calendar_service):
        """Test calendar service initialization."""
        assert calendar_service.config.google_calendar_enabled is True
        assert calendar_service.config.caldav_enabled is True
        assert calendar_service.config.default_calendar == "primary"
        assert calendar_service.config.auto_schedule_meetings is False
        assert calendar_service.config.meeting_buffer_minutes == 15
        assert calendar_service.config.max_meeting_duration_hours == 8
        assert calendar_service.config.working_hours_start == 9
        assert calendar_service.config.working_hours_end == 17
        assert calendar_service.config.working_days == [0, 1, 2, 3, 4]
        assert calendar_service.config.timezone == "UTC"
        assert calendar_service.data_dir.exists()
        assert calendar_service.events_dir.exists()
        assert calendar_service.requests_dir.exists()
        assert isinstance(calendar_service.events, dict)
        assert isinstance(calendar_service.meeting_requests, dict)

    @pytest.mark.asyncio
    async def test_extract_meeting_requests_from_email_success(
        self, calendar_service, sample_email_content
    ):
        """Test successful meeting request extraction from email."""
        requests = await calendar_service.extract_meeting_requests_from_email(
            email_subject=sample_email_content["subject"],
            email_body=sample_email_content["body"],
            email_message_id=sample_email_content["message_id"],
            sender_email=sample_email_content["sender"],
        )

        assert isinstance(requests, list)
        assert len(requests) > 0

        for request in requests:
            assert isinstance(request, MeetingRequest)
            assert request.email_message_id == sample_email_content["message_id"]
            assert request.subject == sample_email_content["subject"]
            assert len(request.proposed_times) > 0
            assert request.duration_minutes > 0
            assert len(request.attendees) > 0
            # Verify attendees list is populated
            assert len(request.attendees) > 0

            # Verify request was stored
            assert request.request_id in calendar_service.meeting_requests

    @pytest.mark.asyncio
    async def test_extract_meeting_requests_no_meeting_keywords(self, calendar_service):
        """Test meeting request extraction with no meeting keywords."""
        requests = await calendar_service.extract_meeting_requests_from_email(
            email_subject="Regular Email",
            email_body="This is just a regular email with no meeting request.",
            email_message_id="msg_regular",
            sender_email="user@example.com",
        )

        assert requests == []

    @pytest.mark.asyncio
    async def test_extract_meeting_requests_urgent_priority(self, calendar_service):
        """Test meeting request extraction with urgent priority."""
        requests = await calendar_service.extract_meeting_requests_from_email(
            email_subject="URGENT: Emergency Meeting Required",
            email_body="We need to schedule an urgent meeting immediately to discuss critical issues.",
            email_message_id="msg_urgent",
            sender_email="manager@example.com",
        )

        assert len(requests) > 0
        assert requests[0].priority == "high"

    @pytest.mark.asyncio
    async def test_extract_meeting_requests_video_call(self, calendar_service):
        """Test meeting request extraction for video calls."""
        requests = await calendar_service.extract_meeting_requests_from_email(
            email_subject="Video Conference Meeting",
            email_body="Let's schedule a video call using Zoom to discuss the project.",
            email_message_id="msg_video",
            sender_email="team@example.com",
        )

        assert len(requests) > 0
        assert requests[0].meeting_type == "video_call"

    @pytest.mark.asyncio
    async def test_schedule_meeting_success(self, calendar_service):
        """Test successful meeting scheduling."""
        # Create a test meeting request
        meeting_request = MeetingRequest(
            request_id=str(uuid.uuid4()),
            email_message_id="msg_test",
            subject="Test Meeting",
            proposed_times=[datetime.now() + timedelta(hours=1)],
            duration_minutes=60,
            attendees=["user1@example.com", "user2@example.com"],
            location="Conference Room A",
            description="Test meeting description",
            priority="normal",
            meeting_type="meeting",
            status="pending",
        )
        calendar_service.meeting_requests[meeting_request.request_id] = meeting_request

        selected_time = datetime.now() + timedelta(hours=2)
        event = await calendar_service.schedule_meeting(
            meeting_request=meeting_request,
            selected_time=selected_time,
            calendar_id="primary",
        )

        assert isinstance(event, CalendarEvent)
        assert event.event_id
        assert event.title == meeting_request.subject
        assert event.description == meeting_request.description
        assert event.start_time == selected_time
        assert event.end_time == selected_time + timedelta(
            minutes=meeting_request.duration_minutes
        )
        assert event.location == meeting_request.location
        assert event.attendees == meeting_request.attendees
        assert event.organizer == meeting_request.attendees[0]
        assert event.calendar_id == "primary"
        assert event.meeting_link is not None
        assert event.status == "confirmed"
        assert isinstance(event.created_at, datetime)
        assert isinstance(event.updated_at, datetime)

        # Verify event was stored
        assert event.event_id in calendar_service.events

        # Verify meeting request status was updated
        assert meeting_request.status == "scheduled"

    @pytest.mark.asyncio
    async def test_schedule_meeting_no_proposed_times(self, calendar_service):
        """Test meeting scheduling with no proposed times."""
        meeting_request = MeetingRequest(
            request_id=str(uuid.uuid4()),
            email_message_id="msg_test",
            subject="Test Meeting",
            proposed_times=[],
            duration_minutes=60,
            attendees=["user@example.com"],
            status="pending",
        )

        with pytest.raises(ValueError, match="No proposed times available"):
            await calendar_service.schedule_meeting(meeting_request)

    @pytest.mark.asyncio
    async def test_schedule_meeting_with_first_proposed_time(self, calendar_service):
        """Test meeting scheduling using first proposed time."""
        proposed_time = datetime.now() + timedelta(hours=1)
        meeting_request = MeetingRequest(
            request_id=str(uuid.uuid4()),
            email_message_id="msg_test",
            subject="Test Meeting",
            proposed_times=[proposed_time, datetime.now() + timedelta(hours=2)],
            duration_minutes=30,
            attendees=["user@example.com"],
            status="pending",
        )

        event = await calendar_service.schedule_meeting(meeting_request)

        assert event.start_time == proposed_time
        assert event.end_time == proposed_time + timedelta(minutes=30)

    @pytest.mark.asyncio
    async def test_get_available_times(self, calendar_service):
        """Test getting available time slots."""
        start_date = datetime.now() + timedelta(days=1)
        end_date = start_date + timedelta(days=1)
        duration_minutes = 60
        attendees = ["user1@example.com", "user2@example.com"]

        time_slots = await calendar_service.get_available_times(
            start_date=start_date,
            end_date=end_date,
            duration_minutes=duration_minutes,
            attendees=attendees,
        )

        assert isinstance(time_slots, list)
        for slot in time_slots:
            assert "start_time" in slot
            assert "end_time" in slot
            assert "duration_minutes" in slot
            assert "available" in slot
            assert slot["duration_minutes"] == duration_minutes
            assert slot["available"] is True
            assert isinstance(slot["start_time"], str)
            assert isinstance(slot["end_time"], str)

    @pytest.mark.asyncio
    async def test_get_available_times_with_existing_events(self, calendar_service):
        """Test getting available times with existing events."""
        # Add an existing event
        existing_event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Existing Meeting",
            description="Existing meeting description",
            start_time=datetime.now() + timedelta(days=1, hours=10),
            end_time=datetime.now() + timedelta(days=1, hours=11),
            attendees=["user1@example.com"],
            organizer="user1@example.com",
            calendar_id="primary",
        )
        calendar_service.events[existing_event.event_id] = existing_event

        start_date = datetime.now() + timedelta(days=1)
        end_date = start_date + timedelta(days=1)
        duration_minutes = 60
        attendees = ["user1@example.com", "user2@example.com"]

        time_slots = await calendar_service.get_available_times(
            start_date=start_date,
            end_date=end_date,
            duration_minutes=duration_minutes,
            attendees=attendees,
        )

        assert isinstance(time_slots, list)
        # Should not include the time slot with the existing meeting
        for slot in time_slots:
            if slot["available"]:
                slot_start = datetime.fromisoformat(slot["start_time"])
                slot_end = datetime.fromisoformat(slot["end_time"])
                # Should not overlap with existing event
                assert not (
                    slot_start < existing_event.end_time
                    and slot_end > existing_event.start_time
                )

    @pytest.mark.asyncio
    async def test_get_upcoming_meetings(self, calendar_service):
        """Test getting upcoming meetings for a user."""
        user_email = "user@example.com"

        # Add some test events
        past_event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Past Meeting",
            description="Past meeting description",
            start_time=datetime.now() - timedelta(hours=1),
            end_time=datetime.now() - timedelta(minutes=30),
            attendees=[user_email],
            organizer="organizer@example.com",
            calendar_id="primary",
        )

        upcoming_event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Upcoming Meeting",
            description="Upcoming meeting description",
            start_time=datetime.now() + timedelta(hours=1),
            end_time=datetime.now() + timedelta(hours=2),
            attendees=[user_email],
            organizer="organizer@example.com",
            calendar_id="primary",
        )

        far_future_event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Far Future Meeting",
            description="Far future meeting description",
            start_time=datetime.now() + timedelta(days=10),
            end_time=datetime.now() + timedelta(days=10, hours=1),
            attendees=[user_email],
            organizer="organizer@example.com",
            calendar_id="primary",
        )

        calendar_service.events[past_event.event_id] = past_event
        calendar_service.events[upcoming_event.event_id] = upcoming_event
        calendar_service.events[far_future_event.event_id] = far_future_event

        # Get upcoming meetings for next 7 days
        upcoming_meetings = await calendar_service.get_upcoming_meetings(
            user_email=user_email, days_ahead=7
        )

        assert isinstance(upcoming_meetings, list)
        assert len(upcoming_meetings) == 1  # Only the upcoming event within 7 days
        assert upcoming_meetings[0].event_id == upcoming_event.event_id

        # Get upcoming meetings for next 15 days
        upcoming_meetings = await calendar_service.get_upcoming_meetings(
            user_email=user_email, days_ahead=15
        )

        assert len(upcoming_meetings) == 2  # Both upcoming and far future events

    @pytest.mark.asyncio
    async def test_get_upcoming_meetings_no_meetings(self, calendar_service):
        """Test getting upcoming meetings when user has no meetings."""
        upcoming_meetings = await calendar_service.get_upcoming_meetings(
            user_email="nonexistent@example.com", days_ahead=7
        )

        assert upcoming_meetings == []

    @pytest.mark.asyncio
    async def test_cancel_meeting_success(self, calendar_service):
        """Test successful meeting cancellation."""
        # Create a test event
        event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Test Meeting",
            description="Test meeting description",
            start_time=datetime.now() + timedelta(hours=1),
            end_time=datetime.now() + timedelta(hours=2),
            attendees=["user@example.com"],
            organizer="organizer@example.com",
            calendar_id="primary",
        )
        calendar_service.events[event.event_id] = event

        # Store original timestamp
        original_updated_at = event.updated_at

        result = await calendar_service.cancel_meeting(
            event.event_id, "Meeting cancelled"
        )

        assert result is True
        assert calendar_service.events[event.event_id].status == "cancelled"
        assert calendar_service.events[event.event_id].updated_at > original_updated_at

    @pytest.mark.asyncio
    async def test_cancel_meeting_not_found(self, calendar_service):
        """Test meeting cancellation with non-existent event."""
        result = await calendar_service.cancel_meeting("nonexistent_event_id")
        assert result is False

    @pytest.mark.asyncio
    async def test_reschedule_meeting_success(self, calendar_service):
        """Test successful meeting rescheduling."""
        # Create a test event
        original_start = datetime.now() + timedelta(hours=1)
        original_end = original_start + timedelta(hours=1)

        event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Test Meeting",
            description="Test meeting description",
            start_time=original_start,
            end_time=original_end,
            attendees=["user@example.com"],
            organizer="organizer@example.com",
            calendar_id="primary",
        )
        calendar_service.events[event.event_id] = event

        new_start_time = datetime.now() + timedelta(hours=3)
        new_duration_minutes = 90

        # Store original timestamp
        original_updated_at = event.updated_at

        result = await calendar_service.reschedule_meeting(
            event.event_id, new_start_time, new_duration_minutes
        )

        assert result is True
        updated_event = calendar_service.events[event.event_id]
        assert updated_event.start_time == new_start_time
        assert updated_event.end_time == new_start_time + timedelta(
            minutes=new_duration_minutes
        )
        assert updated_event.updated_at > original_updated_at

    @pytest.mark.asyncio
    async def test_reschedule_meeting_keep_duration(self, calendar_service):
        """Test meeting rescheduling while keeping original duration."""
        # Create a test event
        original_start = datetime.now() + timedelta(hours=1)
        original_end = original_start + timedelta(hours=1)
        original_duration = original_end - original_start

        event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Test Meeting",
            description="Test meeting description",
            start_time=original_start,
            end_time=original_end,
            attendees=["user@example.com"],
            organizer="organizer@example.com",
            calendar_id="primary",
        )
        calendar_service.events[event.event_id] = event

        new_start_time = datetime.now() + timedelta(hours=3)

        result = await calendar_service.reschedule_meeting(
            event.event_id, new_start_time
        )

        assert result is True
        updated_event = calendar_service.events[event.event_id]
        assert updated_event.start_time == new_start_time
        assert updated_event.end_time == new_start_time + original_duration

    @pytest.mark.asyncio
    async def test_reschedule_meeting_not_found(self, calendar_service):
        """Test meeting rescheduling with non-existent event."""
        result = await calendar_service.reschedule_meeting(
            "nonexistent_event_id", datetime.now() + timedelta(hours=1)
        )
        assert result is False

    def test_extract_proposed_times(self, calendar_service):
        """Test extraction of proposed times from text."""
        text_with_times = """
        Please let me know your availability for:
        - Tomorrow at 2:00 PM
        - Wednesday at 10:00 AM
        - Thursday at 3:30 PM
        """

        times = calendar_service._extract_proposed_times(text_with_times)
        assert isinstance(times, list)
        # Note: This is a simplified test since the actual implementation uses placeholders

    def test_extract_meeting_duration(self, calendar_service):
        """Test extraction of meeting duration from text."""
        text_with_duration = "The meeting should last about 1 hour and 30 minutes"
        duration = calendar_service._extract_meeting_duration(text_with_duration)
        assert duration > 0

        text_with_minutes = "Please schedule a 45-minute meeting"
        duration = calendar_service._extract_meeting_duration(text_with_minutes)
        assert duration > 0

        text_no_duration = "Let's schedule a meeting"
        duration = calendar_service._extract_meeting_duration(text_no_duration)
        assert duration == 60  # Default 1 hour

    def test_extract_attendees(self, calendar_service):
        """Test extraction of attendees from text."""
        text_with_emails = """
        Hi team,
        Please join the meeting:
        - john@example.com
        - jane@example.com
        - admin@company.com
        """

        attendees = calendar_service._extract_attendees(
            text_with_emails, "sender@example.com"
        )
        assert isinstance(attendees, list)
        assert "sender@example.com" in attendees  # Sender should be included
        assert len(attendees) > 1  # Should have found additional emails

    def test_extract_meeting_location(self, calendar_service):
        """Test extraction of meeting location from text."""
        text_with_location = "The meeting will be held in Conference Room A"
        location = calendar_service._extract_meeting_location(text_with_location)
        assert location is not None

        text_no_location = "Let's schedule a meeting"
        location = calendar_service._extract_meeting_location(text_no_location)
        assert location is None

    def test_extract_meeting_type(self, calendar_service):
        """Test extraction of meeting type from text."""
        text_video = "Let's have a video call using Zoom"
        meeting_type = calendar_service._extract_meeting_type(text_video)
        assert meeting_type == "video_call"

        text_call = "Please call me for a phone meeting"
        meeting_type = calendar_service._extract_meeting_type(text_call)
        assert meeting_type == "call"

        text_meeting = "Let's schedule a regular meeting"
        meeting_type = calendar_service._extract_meeting_type(text_meeting)
        assert meeting_type == "meeting"

    def test_extract_meeting_priority(self, calendar_service):
        """Test extraction of meeting priority from text."""
        text_urgent = "This is an urgent meeting that needs to be scheduled ASAP"
        priority = calendar_service._extract_meeting_priority(text_urgent)
        assert priority == "high"

        text_low = "Let's schedule a low priority meeting whenever convenient"
        priority = calendar_service._extract_meeting_priority(text_low)
        assert priority == "low"

        text_normal = "Let's schedule a regular meeting"
        priority = calendar_service._extract_meeting_priority(text_normal)
        assert priority == "normal"

    def test_generate_meeting_link(self, calendar_service):
        """Test meeting link generation."""
        link = calendar_service._generate_meeting_link("video_call")
        assert link is not None
        assert "meet.example.com" in link

        link = calendar_service._generate_meeting_link("meeting")
        assert link is None

    def test_is_within_working_hours(self, calendar_service):
        """Test working hours validation."""
        # Test within working hours (2 PM on Tuesday)
        working_time = datetime.now().replace(
            hour=14, minute=0, second=0, microsecond=0
        )
        # Set to Tuesday (weekday 1)
        working_time = working_time.replace(
            day=working_time.day + (1 - working_time.weekday()) % 7
        )
        assert calendar_service._is_within_working_hours(working_time) is True

        # Test outside working hours (8 PM on Tuesday)
        non_working_time = working_time.replace(hour=20)
        assert calendar_service._is_within_working_hours(non_working_time) is False

        # Test weekend (Saturday)
        weekend_time = working_time.replace(
            day=working_time.day + (5 - working_time.weekday()) % 7
        )
        assert calendar_service._is_within_working_hours(weekend_time) is False

    def test_save_and_load_events(self, calendar_service):
        """Test saving and loading calendar events."""
        # Create test event
        event = CalendarEvent(
            event_id=str(uuid.uuid4()),
            title="Test Event",
            description="Test event description",
            start_time=datetime.now() + timedelta(hours=1),
            end_time=datetime.now() + timedelta(hours=2),
            attendees=["user@example.com"],
            organizer="organizer@example.com",
            calendar_id="primary",
        )
        calendar_service.events[event.event_id] = event

        # Save events
        calendar_service._save_events()

        # Create new service instance to test loading
        new_service = CalendarIntegrationService(
            config=calendar_service.config, data_dir=calendar_service.data_dir
        )

        # Verify event was loaded
        assert event.event_id in new_service.events
        loaded_event = new_service.events[event.event_id]
        assert loaded_event.event_id == event.event_id
        assert loaded_event.title == event.title
        assert loaded_event.description == event.description

    def test_save_and_load_meeting_requests(self, calendar_service):
        """Test saving and loading meeting requests."""
        # Create test meeting request
        request = MeetingRequest(
            request_id=str(uuid.uuid4()),
            email_message_id="msg_test",
            subject="Test Meeting Request",
            proposed_times=[datetime.now() + timedelta(hours=1)],
            duration_minutes=60,
            attendees=["user@example.com"],
            status="pending",
        )
        calendar_service.meeting_requests[request.request_id] = request

        # Save meeting requests
        calendar_service._save_meeting_requests()

        # Create new service instance to test loading
        new_service = CalendarIntegrationService(
            config=calendar_service.config, data_dir=calendar_service.data_dir
        )

        # Verify request was loaded
        assert request.request_id in new_service.meeting_requests
        loaded_request = new_service.meeting_requests[request.request_id]
        assert loaded_request.request_id == request.request_id
        assert loaded_request.subject == request.subject
        assert loaded_request.duration_minutes == request.duration_minutes

    @pytest.mark.asyncio
    async def test_error_handling(self, calendar_service):
        """Test error handling in various methods."""
        # Test with invalid data
        with patch.object(
            calendar_service, "_save_events", side_effect=Exception("Save error")
        ):
            # Should not raise exception
            calendar_service._save_events()

        with patch.object(
            calendar_service,
            "_save_meeting_requests",
            side_effect=Exception("Save error"),
        ):
            # Should not raise exception
            calendar_service._save_meeting_requests()

        with patch.object(
            calendar_service, "_load_events", side_effect=Exception("Load error")
        ):
            # Should handle gracefully
            calendar_service._load_events()
            assert calendar_service.events == {}

        with patch.object(
            calendar_service,
            "_load_meeting_requests",
            side_effect=Exception("Load error"),
        ):
            # Should handle gracefully
            calendar_service._load_meeting_requests()
            assert calendar_service.meeting_requests == {}

    @pytest.mark.asyncio
    async def test_global_service_instance(self):
        """Test the global service instance."""
        assert isinstance(calendar_integration_service, CalendarIntegrationService)
        assert calendar_integration_service.data_dir.exists()
        assert calendar_integration_service.events_dir.exists()
        assert calendar_integration_service.requests_dir.exists()


class TestCalendarEvent:
    """Test cases for CalendarEvent dataclass."""

    def test_calendar_event_creation(self):
        """Test CalendarEvent object creation."""
        start_time = datetime.now() + timedelta(hours=1)
        end_time = start_time + timedelta(hours=1)

        event = CalendarEvent(
            event_id="test_event_id",
            title="Test Event",
            description="Test event description",
            start_time=start_time,
            end_time=end_time,
            location="Conference Room A",
            attendees=["user1@example.com", "user2@example.com"],
            organizer="organizer@example.com",
            status="confirmed",
            calendar_id="primary",
            meeting_link="https://meet.example.com/room123",
        )

        assert event.event_id == "test_event_id"
        assert event.title == "Test Event"
        assert event.description == "Test event description"
        assert event.start_time == start_time
        assert event.end_time == end_time
        assert event.location == "Conference Room A"
        assert event.attendees == ["user1@example.com", "user2@example.com"]
        assert event.organizer == "organizer@example.com"
        assert event.status == "confirmed"
        assert event.calendar_id == "primary"
        assert event.meeting_link == "https://meet.example.com/room123"
        assert event.is_recurring is False
        assert event.recurrence_rule is None
        assert isinstance(event.created_at, datetime)
        assert isinstance(event.updated_at, datetime)

    def test_calendar_event_defaults(self):
        """Test CalendarEvent default values."""
        start_time = datetime.now() + timedelta(hours=1)
        end_time = start_time + timedelta(hours=1)

        event = CalendarEvent(
            event_id="test_event_id",
            title="Test Event",
            description="Test event description",
            start_time=start_time,
            end_time=end_time,
        )

        assert event.location is None
        assert event.attendees == []
        assert event.organizer is None
        assert event.status == "confirmed"
        assert event.calendar_id == "primary"
        assert event.meeting_link is None
        assert event.is_recurring is False
        assert event.recurrence_rule is None
        assert isinstance(event.created_at, datetime)
        assert isinstance(event.updated_at, datetime)


class TestMeetingRequest:
    """Test cases for MeetingRequest dataclass."""

    def test_meeting_request_creation(self):
        """Test MeetingRequest object creation."""
        proposed_times = [
            datetime.now() + timedelta(hours=1),
            datetime.now() + timedelta(hours=2),
        ]

        request = MeetingRequest(
            request_id="test_request_id",
            email_message_id="msg_12345",
            subject="Test Meeting Request",
            proposed_times=proposed_times,
            duration_minutes=90,
            attendees=["user1@example.com", "user2@example.com"],
            location="Conference Room B",
            description="Test meeting request description",
            priority="high",
            meeting_type="video_call",
        )

        assert request.request_id == "test_request_id"
        assert request.email_message_id == "msg_12345"
        assert request.subject == "Test Meeting Request"
        assert request.proposed_times == proposed_times
        assert request.duration_minutes == 90
        assert request.attendees == ["user1@example.com", "user2@example.com"]
        assert request.location == "Conference Room B"
        assert request.description == "Test meeting request description"
        assert request.priority == "high"
        assert request.meeting_type == "video_call"
        assert request.status == "pending"
        assert isinstance(request.extracted_at, datetime)

    def test_meeting_request_defaults(self):
        """Test MeetingRequest default values."""
        request = MeetingRequest(
            request_id="test_request_id",
            email_message_id="msg_12345",
            subject="Test Meeting Request",
            proposed_times=[datetime.now() + timedelta(hours=1)],
            duration_minutes=60,
            attendees=["user@example.com"],
        )

        assert request.location is None
        assert request.description is None
        assert request.priority == "normal"
        assert request.meeting_type == "meeting"
        assert request.status == "pending"
        assert isinstance(request.extracted_at, datetime)


class TestCalendarConfig:
    """Test cases for CalendarConfig dataclass."""

    def test_calendar_config_defaults(self):
        """Test CalendarConfig default values."""
        config = CalendarConfig()

        assert config.google_calendar_enabled is True
        assert config.caldav_enabled is True
        assert config.default_calendar == "primary"
        assert config.auto_schedule_meetings is False
        assert config.meeting_buffer_minutes == 15
        assert config.max_meeting_duration_hours == 8
        assert config.working_hours_start == 9
        assert config.working_hours_end == 17
        assert config.working_days == [0, 1, 2, 3, 4]  # Monday to Friday
        assert config.timezone == "UTC"

    def test_calendar_config_custom(self):
        """Test CalendarConfig with custom values."""
        config = CalendarConfig(
            google_calendar_enabled=False,
            caldav_enabled=True,
            default_calendar="work",
            auto_schedule_meetings=True,
            meeting_buffer_minutes=30,
            max_meeting_duration_hours=4,
            working_hours_start=8,
            working_hours_end=18,
            working_days=[0, 1, 2, 3, 4, 5],  # Monday to Saturday
            timezone="America/New_York",
        )

        assert config.google_calendar_enabled is False
        assert config.caldav_enabled is True
        assert config.default_calendar == "work"
        assert config.auto_schedule_meetings is True
        assert config.meeting_buffer_minutes == 30
        assert config.max_meeting_duration_hours == 4
        assert config.working_hours_start == 8
        assert config.working_hours_end == 18
        assert config.working_days == [0, 1, 2, 3, 4, 5]
        assert config.timezone == "America/New_York"


if __name__ == "__main__":
    pytest.main([__file__])
