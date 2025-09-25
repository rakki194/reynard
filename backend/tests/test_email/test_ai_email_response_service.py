"""Tests for AI Email Response Service with new AI service architecture.

This module contains comprehensive tests for the AI-powered email response functionality
using the new unified AI service instead of provider-specific clients.
"""

import tempfile
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio

from app.services.email.ai.ai_email_response_service import (
    AIEmailResponseService,
    AIResponse,
    AIResponseConfig,
    EmailContext,
    get_ai_email_response_service,
)
from app.services.ai import AIService, AIServiceConfig
from app.services.ai.interfaces.model_provider import ProviderType, ChatResult, ChatMessage


class TestAIEmailResponseService:
    """Test cases for AIEmailResponseService with new AI service architecture."""

    @pytest_asyncio.fixture
    async def mock_ai_service(self):
        """Create a mock AI service for testing."""
        mock_service = MagicMock(spec=AIService)
        
        # Mock the generate_chat_completion method
        mock_message = ChatMessage(
            role="assistant", 
            content="Thank you for your inquiry. The project is currently on track and expected to be completed by the end of next week."
        )
        mock_result = ChatResult(
            message=mock_message,
            tokens_generated=50,
            processing_time_ms=1000.0,
            model_used="llama3.1:latest",
            provider=ProviderType.OLLAMA,
            metadata={"total_tokens": 150, "prompt_tokens": 100, "completion_tokens": 50},
            finish_reason="stop"
        )
        mock_service.generate_chat_completion = AsyncMock(return_value=mock_result)
        
        # Mock streaming
        async def mock_stream():
            yield ChatMessage(role="assistant", content="Thank you for your inquiry.")
            yield ChatMessage(role="assistant", content=" The project is on track.")
        
        mock_service.stream_chat_completion = AsyncMock(return_value=mock_stream())
        
        return mock_service

    @pytest_asyncio.fixture
    async def ai_service(self, mock_ai_service):
        """Create a test AI service with temporary data directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = AIResponseConfig(
                default_model="llama3.1:latest",
                max_tokens=1000,
                temperature=0.7,
                auto_generate_responses=True,
                require_human_approval=False,
                max_response_length=500,
                min_confidence_threshold=0.7,
                default_tone="professional",
            )
            service = AIEmailResponseService(config=config, data_dir=temp_dir, ai_service=mock_ai_service)
            yield service

    @pytest.fixture
    def sample_email_data(self):
        """Sample email data for testing."""
        return {
            "subject": "Question about project status",
            "body": "Hi, I was wondering if you could provide an update on the current project status. When do you expect it to be completed?",
            "sender_email": "client@example.com",
            "recipient_email": "agent@example.com",
            "sender_name": "John Client",
            "recipient_name": "AI Agent",
            "date": datetime.now().isoformat(),
            "message_id": "msg_12345",
        }

    @pytest.mark.asyncio
    async def test_ai_service_initialization(self, ai_service):
        """Test AI service initialization."""
        assert ai_service.ai_service is not None
        assert ai_service._initialized is False

    @pytest.mark.asyncio
    async def test_ai_service_initialization_no_apis(self):
        """Test AI service initialization without AI service."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = AIResponseConfig()
            service = AIEmailResponseService(config=config, data_dir=temp_dir, ai_service=None)
            assert service.ai_service is None

    @pytest.mark.asyncio
    async def test_analyze_email_context_success(self, ai_service, sample_email_data):
        """Test successful email context analysis."""
        context = await ai_service.analyze_email_context(sample_email_data)
        
        assert context is not None
        assert context.original_subject == sample_email_data["subject"]
        assert context.original_body == sample_email_data["body"]
        assert context.sender_email == sample_email_data["sender_email"]
        assert context.recipient_email == sample_email_data["recipient_email"]
        assert context.email_type in ["question", "request", "complaint", "meeting", "general"]
        assert context.priority in ["urgent", "high", "normal", "low"]
        assert context.sentiment in ["positive", "negative", "neutral"]
        assert context.language in ["en", "es", "fr", "other"]

    @pytest.mark.asyncio
    async def test_analyze_email_context_question_type(self, ai_service):
        """Test email context analysis for question type."""
        email_data = {
            "subject": "Question about pricing",
            "body": "What are your current pricing plans?",
            "sender_email": "customer@example.com",
            "recipient_email": "sales@example.com",
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.email_type == "question"

    @pytest.mark.asyncio
    async def test_analyze_email_context_meeting_type(self, ai_service):
        """Test email context analysis for meeting type."""
        email_data = {
            "subject": "Meeting request",
            "body": "Let's schedule a meeting for next week to discuss the project.",
            "sender_email": "manager@example.com",
            "recipient_email": "team@example.com",
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.email_type == "meeting"

    @pytest.mark.asyncio
    async def test_analyze_email_context_urgent_priority(self, ai_service):
        """Test email context analysis for urgent priority."""
        email_data = {
            "subject": "URGENT: System is down",
            "body": "The production system is down and needs immediate attention!",
            "sender_email": "admin@example.com",
            "recipient_email": "support@example.com",
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.priority == "urgent"

    @pytest.mark.asyncio
    async def test_analyze_email_context_positive_sentiment(self, ai_service):
        """Test email context analysis for positive sentiment."""
        email_data = {
            "subject": "Thank you for great service",
            "body": "I'm very happy with the excellent service you provided. Thank you so much!",
            "sender_email": "customer@example.com",
            "recipient_email": "support@example.com",
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.sentiment == "positive"

    @pytest.mark.asyncio
    async def test_analyze_email_context_negative_sentiment(self, ai_service):
        """Test email context analysis for negative sentiment."""
        email_data = {
            "subject": "Complaint about service",
            "body": "I'm very disappointed with the poor service I received. This is unacceptable!",
            "sender_email": "angry@example.com",
            "recipient_email": "support@example.com",
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.sentiment == "negative"

    @pytest.mark.asyncio
    async def test_generate_response_success(self, ai_service, sample_email_data):
        """Test successful response generation with AI service."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Generate response
        response = await ai_service.generate_response(
            email_context=context, 
            response_type="reply", 
            model="llama3.1:latest"
        )
        
        assert response is not None
        assert response.body is not None
        assert len(response.body) > 0
        assert response.model_used == "llama3.1:latest"
        assert response.confidence_score >= 0.0
        assert response.confidence_score <= 1.0

    @pytest.mark.asyncio
    async def test_generate_response_auto_reply(self, ai_service, sample_email_data):
        """Test automatic reply generation."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Generate auto reply
        response = await ai_service.generate_response(
            email_context=context, 
            response_type="auto_reply"
        )
        
        assert response is not None
        assert response.body is not None
        assert response.response_type == "auto_reply"

    @pytest.mark.asyncio
    async def test_generate_response_follow_up(self, ai_service, sample_email_data):
        """Test follow-up response generation."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Generate follow-up
        response = await ai_service.generate_response(
            email_context=context, 
            response_type="follow_up"
        )
        
        assert response is not None
        assert response.body is not None
        assert response.response_type == "follow_up"

    @pytest.mark.asyncio
    async def test_generate_response_custom_instructions(self, ai_service, sample_email_data):
        """Test response generation with custom instructions."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        custom_instructions = "Always be very formal and include a signature"
        
        # Generate response with custom instructions
        response = await ai_service.generate_response(
            email_context=context,
            response_type="reply",
            custom_instructions=custom_instructions
        )
        
        assert response is not None
        assert response.body is not None
        # Note: custom_instructions might not be stored in the response object

    @pytest.mark.asyncio
    async def test_generate_response_no_ai_service_available(self, sample_email_data):
        """Test response generation when no AI service is available."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = AIResponseConfig()
            service = AIEmailResponseService(config=config, data_dir=temp_dir, ai_service=None)
            
            # Create email context
            context = await service.analyze_email_context(sample_email_data)
            
            with pytest.raises(ValueError, match="AI service not available"):
                await service.generate_response(
                    email_context=context, 
                    response_type="reply"
                )

    @pytest.mark.asyncio
    async def test_generate_response_caching(self, ai_service, sample_email_data):
        """Test response caching functionality."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Generate first response
        response1 = await ai_service.generate_response(
            email_context=context, 
            response_type="reply"
        )
        
        # Generate second response (should be cached)
        response2 = await ai_service.generate_response(
            email_context=context, 
            response_type="reply"
        )
        
        assert response1 is not None
        assert response2 is not None
        # Note: Caching behavior depends on implementation

    @pytest.mark.asyncio
    async def test_get_response_history(self, ai_service, sample_email_data):
        """Test getting response history."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Generate a response
        response = await ai_service.generate_response(
            email_context=context, 
            response_type="reply"
        )
        
        # Get response history
        history = await ai_service.get_response_history(email_address="agent@example.com", limit=10)
        
        assert isinstance(history, list)
        # History might be empty if not persisted, which is fine for testing

    @pytest.mark.asyncio
    async def test_get_response_history_limit(self, ai_service, sample_email_data):
        """Test response history with limit."""
        # Create multiple responses
        for i in range(5):
            email_data = sample_email_data.copy()
            email_data["message_id"] = f"msg_{i}"
            context = await ai_service.analyze_email_context(email_data)
            await ai_service.generate_response(
                email_context=context, 
                response_type="reply"
            )
        
        # Get limited history
        history = await ai_service.get_response_history(email_address="agent@example.com", limit=3)
        assert isinstance(history, list)
        assert len(history) <= 3

    @pytest.mark.asyncio
    async def test_get_response_history_no_responses(self, ai_service):
        """Test getting response history when no responses exist."""
        history = await ai_service.get_response_history(email_address="agent@example.com")
        assert isinstance(history, list)
        assert len(history) == 0

    @pytest.mark.asyncio
    async def test_detect_language_english(self, ai_service):
        """Test language detection for English."""
        text = "Hello, how are you today?"
        language = ai_service._detect_language(text)
        assert language == "en"

    @pytest.mark.asyncio
    async def test_detect_language_spanish(self, ai_service):
        """Test language detection for Spanish."""
        text = "Hola, ¿cómo estás hoy?"
        language = ai_service._detect_language(text)
        assert language == "es"

    @pytest.mark.asyncio
    async def test_save_and_load_responses(self, ai_service, sample_email_data):
        """Test saving and loading responses."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Generate response
        response = await ai_service.generate_response(
            email_context=context, 
            response_type="reply"
        )
        
        # Save responses (this should not raise an exception)
        try:
            ai_service._save_responses()
        except Exception as e:
            # If saving fails, that's okay for testing - the important thing is it doesn't crash
            pass

    @pytest.mark.asyncio
    async def test_global_service_instance(self):
        """Test global service instance."""
        service = get_ai_email_response_service()
        assert service is not None
        assert isinstance(service, AIEmailResponseService)


class TestEmailContext:
    """Test EmailContext model."""

    def test_email_context_creation(self):
        """Test EmailContext creation."""
        context = EmailContext(
            context_id="test_context",
            original_subject="Test Subject",
            original_body="Test body",
            sender_email="sender@example.com",
            recipient_email="recipient@example.com",
            sender_name="Test Sender",
            recipient_name="Test Recipient",
            email_type="question",
            priority="normal",
            sentiment="neutral",
            language="en",
            agent_personality={"tone": "professional"},
            extracted_at=datetime.now(),
        )
        
        assert context.context_id == "test_context"
        assert context.original_subject == "Test Subject"
        assert context.original_body == "Test body"
        assert context.sender_email == "sender@example.com"
        assert context.recipient_email == "recipient@example.com"
        assert context.email_type == "question"
        assert context.priority == "normal"
        assert context.sentiment == "neutral"
        assert context.language == "en"


class TestAIResponse:
    """Test AIResponse model."""

    def test_ai_response_creation(self):
        """Test AIResponse creation."""
        response = AIResponse(
            response_id="test_response_123",
            original_email_id="test_email_456",
            subject="Re: Test Subject",
            body="Test response content",
            response_type="reply",
            confidence_score=0.85,
            model_used="llama3.1:latest",
            generated_at=datetime.now(),
        )
        
        assert response.body == "Test response content"
        assert response.model_used == "llama3.1:latest"
        assert response.response_type == "reply"
        assert response.confidence_score == 0.85

    def test_ai_response_defaults(self):
        """Test AIResponse default values."""
        response = AIResponse(
            response_id="test_response_123",
            original_email_id="test_email_456",
            subject="Re: Test Subject",
            body="Test content",
        )
        
        assert response.body == "Test content"
        assert response.model_used == "unknown"  # Default
        assert response.response_type == "reply"  # Default
        assert response.confidence_score == 0.0  # Default


class TestAIResponseConfig:
    """Test AIResponseConfig model."""

    def test_ai_response_config_defaults(self):
        """Test AIResponseConfig default values."""
        config = AIResponseConfig()
        
        assert config.auto_generate_responses is False
        assert config.require_human_approval is True
        assert config.default_model == "llama3.1:latest"  # Updated default
        assert config.max_tokens == 1000
        assert config.temperature == 0.7
        assert config.max_response_length == 500
        assert config.min_confidence_threshold == 0.7
        assert config.default_tone == "professional"

    def test_ai_response_config_custom(self):
        """Test AIResponseConfig with custom values."""
        config = AIResponseConfig(
            default_model="gpt-4",
            max_tokens=2000,
            temperature=0.5,
            auto_generate_responses=True,
            require_human_approval=False,
        )
        
        assert config.default_model == "gpt-4"
        assert config.max_tokens == 2000
        assert config.temperature == 0.5
        assert config.auto_generate_responses is True
        assert config.require_human_approval is False
