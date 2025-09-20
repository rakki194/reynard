"""
Tests for AI Email Response Service.

This module contains comprehensive tests for the AI-powered email response functionality.
"""

import pytest
import pytest_asyncio
import asyncio
import json
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock, MagicMock

from app.services.ai_email_response_service import (
    AIEmailResponseService,
    EmailContext,
    AIResponse,
    AIResponseConfig,
    ai_email_response_service
)


class TestAIEmailResponseService:
    """Test cases for AIEmailResponseService."""
    
    @pytest_asyncio.fixture
    async def ai_service(self):
        """Create a test AI service with temporary data directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = AIResponseConfig(
                default_model="gpt-3.5-turbo",
                max_tokens=1000,
                temperature=0.7,
                auto_generate_responses=True,
                require_human_approval=False,
                max_response_length=500,
                min_confidence_threshold=0.7,
                default_tone="professional"
            )
            service = AIEmailResponseService(config=config, data_dir=temp_dir)
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
            "message_id": "msg_12345"
        }
    
    @pytest.fixture
    def mock_openai_response(self):
        """Mock OpenAI API response."""
        return {
            "choices": [
                {
                    "message": {
                        "content": "Thank you for your inquiry. The project is currently on track and expected to be completed by the end of next week. I'll provide you with a detailed status report shortly."
                    }
                }
            ],
            "usage": {
                "total_tokens": 150,
                "prompt_tokens": 100,
                "completion_tokens": 50
            }
        }
    
    @pytest.fixture
    def mock_anthropic_response(self):
        """Mock Anthropic API response."""
        return {
            "content": [
                {
                    "text": "Thank you for reaching out. The project is progressing well and should be completed within the expected timeframe. I'll send you a comprehensive update by tomorrow."
                }
            ],
            "usage": {
                "input_tokens": 120,
                "output_tokens": 45
            }
        }
    
    def test_ai_service_initialization(self, ai_service):
        """Test AI service initialization."""
        assert ai_service.config.default_model == "gpt-3.5-turbo"
        assert ai_service.config.auto_generate_responses is True
        assert ai_service.config.default_model == "gpt-3.5-turbo"
        assert ai_service.config.max_tokens == 1000
        assert ai_service.config.temperature == 0.7
        assert ai_service.config.require_human_approval is False
        assert ai_service.config.max_response_length == 500
        assert ai_service.config.min_confidence_threshold == 0.7
        assert ai_service.data_dir.exists()
        assert ai_service.responses_dir.exists()
        assert ai_service.templates_dir.exists()
        assert isinstance(ai_service.responses, dict)
        assert isinstance(ai_service.templates, dict)
    
    def test_ai_service_initialization_no_apis(self):
        """Test AI service initialization without API access."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = AIResponseConfig(
                default_model="gpt-3.5-turbo",
                auto_generate_responses=False
            )
            service = AIEmailResponseService(config=config, data_dir=temp_dir)
            
            assert service.config.default_model == "gpt-3.5-turbo"
            assert service.config.auto_generate_responses is False
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_success(self, ai_service, sample_email_data):
        """Test successful email context analysis."""
        context = await ai_service.analyze_email_context(sample_email_data)
        
        assert isinstance(context, EmailContext)
        assert context.original_subject == sample_email_data["subject"]
        assert context.original_body == sample_email_data["body"]
        assert context.sender_email == sample_email_data["sender_email"]
        assert context.recipient_email == sample_email_data["recipient_email"]
        assert context.sender_name == sample_email_data["sender_name"]
        assert context.recipient_name == sample_email_data["recipient_name"]
        assert context.email_type in ["question", "request", "complaint", "meeting", "general"]
        assert context.priority in ["low", "normal", "high", "urgent"]
        assert context.sentiment in ["positive", "neutral", "negative"]
        assert context.language in ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "hi", "other"]
        assert context.agent_personality is not None
        assert isinstance(context.extracted_at, datetime)
        
        # Verify context was stored
        assert context.context_id in ai_service.contexts
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_question_type(self, ai_service):
        """Test email context analysis for question type."""
        email_data = {
            "subject": "Quick question",
            "body": "What is the status of my order?",
            "sender_email": "customer@example.com",
            "recipient_email": "support@example.com"
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.email_type == "question"
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_request_type(self, ai_service):
        """Test email context analysis for request type."""
        email_data = {
            "subject": "Request for information",
            "body": "Could you please send me the latest report?",
            "sender_email": "manager@example.com",
            "recipient_email": "analyst@example.com"
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.email_type == "request"
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_complaint_type(self, ai_service):
        """Test email context analysis for complaint type."""
        email_data = {
            "subject": "Complaint about service",
            "body": "I'm very disappointed with the poor service I received. This is unacceptable!",
            "sender_email": "angry@example.com",
            "recipient_email": "support@example.com"
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.email_type == "complaint"
        assert context.sentiment == "negative"
        assert context.priority == "high"
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_meeting_type(self, ai_service):
        """Test email context analysis for meeting type."""
        email_data = {
            "subject": "Meeting request",
            "body": "Let's schedule a meeting to discuss the project next week.",
            "sender_email": "colleague@example.com",
            "recipient_email": "teammate@example.com"
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.email_type == "meeting"
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_urgent_priority(self, ai_service):
        """Test email context analysis for urgent priority."""
        email_data = {
            "subject": "URGENT: System down",
            "body": "The production system is down and we need immediate assistance!",
            "sender_email": "admin@example.com",
            "recipient_email": "support@example.com"
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.priority == "urgent"
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_positive_sentiment(self, ai_service):
        """Test email context analysis for positive sentiment."""
        email_data = {
            "subject": "Thank you",
            "body": "Thank you so much for your excellent service! I'm very happy with the results.",
            "sender_email": "happy@example.com",
            "recipient_email": "service@example.com"
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.sentiment == "positive"
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_negative_sentiment(self, ai_service):
        """Test email context analysis for negative sentiment."""
        email_data = {
            "subject": "Very disappointed",
            "body": "I'm extremely disappointed with the poor quality of service. This is terrible!",
            "sender_email": "unhappy@example.com",
            "recipient_email": "service@example.com"
        }
        
        context = await ai_service.analyze_email_context(email_data)
        assert context.sentiment == "negative"
    
    @pytest.mark.asyncio
    async def test_analyze_email_context_language_detection(self, ai_service):
        """Test email context analysis for language detection."""
        # Test Spanish
        spanish_email = {
            "subject": "Hola",
            "body": "¿Cómo estás? Espero que tengas un buen día.",
            "sender_email": "spanish@example.com",
            "recipient_email": "recipient@example.com"
        }
        
        context = await ai_service.analyze_email_context(spanish_email)
        assert context.language == "es"
        
        # Test French
        french_email = {
            "subject": "Bonjour",
            "body": "Comment allez-vous? J'espère que vous passez une bonne journée.",
            "sender_email": "french@example.com",
            "recipient_email": "recipient@example.com"
        }
        
        context = await ai_service.analyze_email_context(french_email)
        assert context.language == "fr"
    
    @pytest.mark.asyncio
    async def test_generate_response_openai_success(self, ai_service, sample_email_data, mock_openai_response):
        """Test successful response generation with OpenAI."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_openai_response
        ai_service.openai_client = mock_client
        
        response = await ai_service.generate_response(
            email_context=context,
            response_type="reply",
            model="gpt-3.5-turbo"
        )
        
        assert isinstance(response, AIResponse)
        assert response.original_email_id == context.context_id
        assert response.subject.startswith("Re:")
        assert "Thank you for your inquiry" in response.body
        assert response.tone in ["professional", "friendly", "formal", "casual"]
        assert 0.0 <= response.confidence_score <= 1.0
        assert response.response_type == "reply"
        assert response.model_used == "gpt-3.5-turbo"
        assert response.processing_time_ms > 0
        assert isinstance(response.generated_at, datetime)
        assert len(response.suggested_actions) > 0
        
        # Verify response was stored
        assert response.response_id in ai_service.responses
        
        # Verify OpenAI was called correctly
        mock_client.chat.completions.create.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_response_anthropic_success(self, ai_service, sample_email_data, mock_anthropic_response):
        """Test successful response generation with Anthropic."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock Anthropic client
        mock_client = AsyncMock()
        mock_client.messages.create.return_value = mock_anthropic_response
        ai_service.anthropic_client = mock_client
        
        response = await ai_service.generate_response(
            email_context=context,
            response_type="reply",
            model="claude-3-sonnet-20240229"
        )
        
        assert isinstance(response, AIResponse)
        assert response.original_email_id == context.context_id
        assert response.subject.startswith("Re:")
        assert "Thank you for reaching out" in response.body
        assert response.tone in ["professional", "friendly", "formal", "casual"]
        assert 0.0 <= response.confidence_score <= 1.0
        assert response.response_type == "reply"
        assert response.model_used == "claude-3-sonnet-20240229"
        assert response.processing_time_ms > 0
        assert isinstance(response.generated_at, datetime)
        assert len(response.suggested_actions) > 0
        
        # Verify response was stored
        assert response.response_id in ai_service.responses
        
        # Verify Anthropic was called correctly
        mock_client.messages.create.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_response_auto_reply(self, ai_service, sample_email_data):
        """Test automatic reply generation."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = {
            "choices": [{"message": {"content": "Thank you for your email. I'll get back to you soon."}}],
            "usage": {"total_tokens": 50, "prompt_tokens": 30, "completion_tokens": 20}
        }
        ai_service.openai_client = mock_client
        
        response = await ai_service.generate_response(
            email_context=context,
            response_type="auto_reply"
        )
        
        assert response.response_type == "auto_reply"
        assert "Thank you for your email" in response.body
    
    @pytest.mark.asyncio
    async def test_generate_response_follow_up(self, ai_service, sample_email_data):
        """Test follow-up response generation."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = {
            "choices": [{"message": {"content": "Following up on our previous conversation..."}}],
            "usage": {"total_tokens": 60, "prompt_tokens": 40, "completion_tokens": 20}
        }
        ai_service.openai_client = mock_client
        
        response = await ai_service.generate_response(
            email_context=context,
            response_type="follow_up"
        )
        
        assert response.response_type == "follow_up"
        assert "Following up" in response.body
    
    @pytest.mark.asyncio
    async def test_generate_response_custom_instructions(self, ai_service, sample_email_data):
        """Test response generation with custom instructions."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = {
            "choices": [{"message": {"content": "Custom response based on instructions"}}],
            "usage": {"total_tokens": 70, "prompt_tokens": 50, "completion_tokens": 20}
        }
        ai_service.openai_client = mock_client
        
        custom_instructions = "Always be very formal and include a signature"
        
        response = await ai_service.generate_response(
            email_context=context,
            response_type="reply",
            custom_instructions=custom_instructions
        )
        
        assert "Custom response based on instructions" in response.body
        
        # Verify custom instructions were included in the prompt
        call_args = mock_client.chat.completions.create.call_args
        messages = call_args[1]["messages"]
        assert any("Always be very formal" in msg["content"] for msg in messages)
    
    @pytest.mark.asyncio
    async def test_generate_response_no_api_available(self, ai_service, sample_email_data):
        """Test response generation when no API is available."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Disable APIs
        ai_service.openai_client = None
        ai_service.anthropic_client = None
        
        with pytest.raises(ValueError, match="No AI service available"):
            await ai_service.generate_response(
                email_context=context,
                response_type="reply"
            )
    
    @pytest.mark.asyncio
    async def test_generate_response_api_failure(self, ai_service, sample_email_data):
        """Test response generation when API call fails."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock OpenAI client to raise exception
        mock_client = AsyncMock()
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        ai_service.openai_client = mock_client
        
        with pytest.raises(Exception, match="API Error"):
            await ai_service.generate_response(
                email_context=context,
                response_type="reply"
            )
    
    @pytest.mark.asyncio
    async def test_generate_response_caching(self, ai_service, sample_email_data):
        """Test response caching functionality."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = {
            "choices": [{"message": {"content": "Cached response"}}],
            "usage": {"total_tokens": 50, "prompt_tokens": 30, "completion_tokens": 20}
        }
        ai_service.openai_client = mock_client
        
        # Generate first response
        response1 = await ai_service.generate_response(
            email_context=context,
            response_type="reply"
        )
        
        # Generate second response (should use cache)
        response2 = await ai_service.generate_response(
            email_context=context,
            response_type="reply"
        )
        
        # Should be the same response due to caching
        assert response1.response_id == response2.response_id
        assert response1.body == response2.body
        
        # OpenAI should only be called once due to caching
        assert mock_client.chat.completions.create.call_count == 1
    
    @pytest.mark.asyncio
    async def test_get_response_history(self, ai_service, sample_email_data):
        """Test getting response history for an email address."""
        # Create email context
        context = await ai_service.analyze_email_context(sample_email_data)
        
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = {
            "choices": [{"message": {"content": "Test response"}}],
            "usage": {"total_tokens": 50, "prompt_tokens": 30, "completion_tokens": 20}
        }
        ai_service.openai_client = mock_client
        
        # Generate a response
        response = await ai_service.generate_response(
            email_context=context,
            response_type="reply"
        )
        
        # Get response history
        history = await ai_service.get_response_history(
            email_address=sample_email_data["sender_email"],
            limit=10
        )
        
        assert isinstance(history, list)
        assert len(history) == 1
        assert history[0].response_id == response.response_id
        assert history[0].body == response.body
    
    @pytest.mark.asyncio
    async def test_get_response_history_limit(self, ai_service, sample_email_data):
        """Test response history with limit."""
        # Create multiple responses
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = {
            "choices": [{"message": {"content": "Test response"}}],
            "usage": {"total_tokens": 50, "prompt_tokens": 30, "completion_tokens": 20}
        }
        ai_service.openai_client = mock_client
        
        # Generate multiple responses
        for i in range(5):
            email_data = sample_email_data.copy()
            email_data["message_id"] = f"msg_{i}"
            context = await ai_service.analyze_email_context(email_data)
            await ai_service.generate_response(
                email_context=context,
                response_type="reply"
            )
        
        # Get limited history
        history = await ai_service.get_response_history(
            email_address=sample_email_data["sender_email"],
            limit=3
        )
        
        assert len(history) == 3
    
    @pytest.mark.asyncio
    async def test_get_response_history_no_responses(self, ai_service):
        """Test getting response history when no responses exist."""
        history = await ai_service.get_response_history(
            email_address="nonexistent@example.com",
            limit=10
        )
        
        assert history == []
    
    def test_detect_email_type_question(self, ai_service):
        """Test email type detection for questions."""
        text = "What is the status of my order?"
        email_type = ai_service._detect_email_type(text)
        assert email_type == "question"
    
    def test_detect_email_type_request(self, ai_service):
        """Test email type detection for requests."""
        text = "Could you please send me the report?"
        email_type = ai_service._detect_email_type(text)
        assert email_type == "request"
    
    def test_detect_email_type_complaint(self, ai_service):
        """Test email type detection for complaints."""
        text = "I'm very disappointed with the service"
        email_type = ai_service._detect_email_type(text)
        assert email_type == "complaint"
    
    def test_detect_email_type_meeting(self, ai_service):
        """Test email type detection for meetings."""
        text = "Let's schedule a meeting for next week"
        email_type = ai_service._detect_email_type(text)
        assert email_type == "meeting"
    
    def test_detect_email_type_general(self, ai_service):
        """Test email type detection for general emails."""
        text = "Hello, how are you doing today?"
        email_type = ai_service._detect_email_type(text)
        assert email_type == "general"
    
    def test_detect_priority_urgent(self, ai_service):
        """Test priority detection for urgent emails."""
        text = "URGENT: System is down and needs immediate attention!"
        priority = ai_service._detect_priority(text)
        assert priority == "urgent"
    
    def test_detect_priority_high(self, ai_service):
        """Test priority detection for high priority emails."""
        text = "This is important and needs to be addressed soon"
        priority = ai_service._detect_priority(text)
        assert priority == "high"
    
    def test_detect_priority_normal(self, ai_service):
        """Test priority detection for normal priority emails."""
        text = "Regular email with normal priority"
        priority = ai_service._detect_priority(text)
        assert priority == "normal"
    
    def test_detect_priority_low(self, ai_service):
        """Test priority detection for low priority emails."""
        text = "This is not urgent, just a casual inquiry"
        priority = ai_service._detect_priority(text)
        assert priority == "low"
    
    def test_detect_sentiment_positive(self, ai_service):
        """Test sentiment detection for positive emails."""
        text = "Thank you so much! I'm very happy with the service."
        sentiment = ai_service._detect_sentiment(text)
        assert sentiment == "positive"
    
    def test_detect_sentiment_negative(self, ai_service):
        """Test sentiment detection for negative emails."""
        text = "I'm very disappointed and frustrated with this service."
        sentiment = ai_service._detect_sentiment(text)
        assert sentiment == "negative"
    
    def test_detect_sentiment_neutral(self, ai_service):
        """Test sentiment detection for neutral emails."""
        text = "Please provide an update on the project status."
        sentiment = ai_service._detect_sentiment(text)
        assert sentiment == "neutral"
    
    def test_detect_language_english(self, ai_service):
        """Test language detection for English."""
        text = "Hello, how are you today?"
        language = ai_service._detect_language(text)
        assert language == "en"
    
    def test_detect_language_spanish(self, ai_service):
        """Test language detection for Spanish."""
        text = "Hola, ¿cómo estás hoy?"
        language = ai_service._detect_language(text)
        assert language == "es"
    
    def test_detect_language_french(self, ai_service):
        """Test language detection for French."""
        text = "Bonjour, comment allez-vous aujourd'hui?"
        language = ai_service._detect_language(text)
        assert language == "fr"
    
    def test_detect_language_unknown(self, ai_service):
        """Test language detection for unknown language."""
        text = "1234567890 !@#$%^&*()"
        language = ai_service._detect_language(text)
        assert language == "other"
    
    def test_generate_agent_personality(self, ai_service):
        """Test agent personality generation."""
        personality = ai_service._generate_agent_personality()
        assert isinstance(personality, dict)
        assert "tone" in personality
        assert "style" in personality
        assert "communication_preferences" in personality
        assert personality["tone"] in ["professional", "friendly", "formal", "casual"]
        assert personality["style"] in ["concise", "detailed", "conversational", "technical"]
    
    def test_build_prompt_openai(self, ai_service, sample_email_data):
        """Test OpenAI prompt building."""
        context = EmailContext(
            context_id="test_context",
            original_subject=sample_email_data["subject"],
            original_body=sample_email_data["body"],
            sender_email=sample_email_data["sender_email"],
            recipient_email=sample_email_data["recipient_email"],
            sender_name=sample_email_data["sender_name"],
            recipient_name=sample_email_data["recipient_name"],
            email_type="question",
            priority="normal",
            sentiment="neutral",
            language="en",
            agent_personality={"tone": "professional", "style": "concise"},
            extracted_at=datetime.now()
        )
        
        prompt = ai_service._build_prompt(
            context=context,
            response_type="reply",
            model="gpt-3.5-turbo",
            custom_instructions="Be very helpful"
        )
        
        assert isinstance(prompt, list)
        assert len(prompt) > 0
        assert prompt[0]["role"] == "system"
        assert "Be very helpful" in prompt[0]["content"]
        assert prompt[1]["role"] == "user"
        assert sample_email_data["subject"] in prompt[1]["content"]
    
    def test_build_prompt_anthropic(self, ai_service, sample_email_data):
        """Test Anthropic prompt building."""
        context = EmailContext(
            context_id="test_context",
            original_subject=sample_email_data["subject"],
            original_body=sample_email_data["body"],
            sender_email=sample_email_data["sender_email"],
            recipient_email=sample_email_data["recipient_email"],
            sender_name=sample_email_data["sender_name"],
            recipient_name=sample_email_data["recipient_name"],
            email_type="question",
            priority="normal",
            sentiment="neutral",
            language="en",
            agent_personality={"tone": "professional", "style": "concise"},
            extracted_at=datetime.now()
        )
        
        prompt = ai_service._build_prompt(
            context=context,
            response_type="reply",
            model="claude-3-sonnet-20240229",
            custom_instructions="Be very helpful"
        )
        
        assert isinstance(prompt, str)
        assert "Be very helpful" in prompt
        assert sample_email_data["subject"] in prompt
    
    def test_calculate_confidence_score(self, ai_service):
        """Test confidence score calculation."""
        # Test high confidence
        high_confidence = ai_service._calculate_confidence_score(
            email_type="question",
            priority="normal",
            sentiment="neutral",
            response_length=100,
            model_used="gpt-3.5-turbo"
        )
        assert 0.0 <= high_confidence <= 1.0
        
        # Test low confidence
        low_confidence = ai_service._calculate_confidence_score(
            email_type="complaint",
            priority="urgent",
            sentiment="negative",
            response_length=10,
            model_used="unknown"
        )
        assert 0.0 <= low_confidence <= 1.0
        assert low_confidence < high_confidence
    
    def test_generate_suggested_actions(self, ai_service):
        """Test suggested actions generation."""
        context = EmailContext(
            context_id="test_context",
            original_subject="Question about order",
            original_body="What is the status of my order?",
            sender_email="customer@example.com",
            recipient_email="support@example.com",
            email_type="question",
            priority="normal",
            sentiment="neutral",
            language="en",
            agent_personality={"tone": "professional"},
            extracted_at=datetime.now()
        )
        
        actions = ai_service._generate_suggested_actions(context)
        assert isinstance(actions, list)
        assert len(actions) > 0
        assert all(isinstance(action, str) for action in actions)
    
    def test_save_and_load_responses(self, ai_service):
        """Test saving and loading AI responses."""
        # Create test response
        response = AIResponse(
            response_id="test_response_id",
            original_email_id="test_email_id",
            subject="Re: Test Subject",
            body="Test response body",
            html_body="<p>Test response body</p>",
            tone="professional",
            confidence_score=0.8,
            response_type="reply",
            suggested_actions=["Follow up", "Send report"],
            generated_at=datetime.now(),
            model_used="gpt-3.5-turbo",
            processing_time_ms=1500
        )
        ai_service.responses[response.response_id] = response
        
        # Save responses
        ai_service._save_responses()
        
        # Create new service instance to test loading
        new_service = AIEmailResponseService(
            config=ai_service.config,
            data_dir=ai_service.data_dir
        )
        
        # Verify response was loaded
        assert response.response_id in new_service.responses
        loaded_response = new_service.responses[response.response_id]
        assert loaded_response.response_id == response.response_id
        assert loaded_response.subject == response.subject
        assert loaded_response.body == response.body
        assert loaded_response.tone == response.tone
        assert loaded_response.confidence_score == response.confidence_score
    
    def test_save_and_load_contexts(self, ai_service):
        """Test saving and loading email contexts."""
        # Create test context
        context = EmailContext(
            context_id="test_context_id",
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
            extracted_at=datetime.now()
        )
        ai_service.contexts[context.context_id] = context
        
        # Save contexts
        ai_service._save_contexts()
        
        # Create new service instance to test loading
        new_service = AIEmailResponseService(
            config=ai_service.config,
            data_dir=ai_service.data_dir
        )
        
        # Verify context was loaded
        assert context.context_id in new_service.contexts
        loaded_context = new_service.contexts[context.context_id]
        assert loaded_context.context_id == context.context_id
        assert loaded_context.original_subject == context.original_subject
        assert loaded_context.email_type == context.email_type
        assert loaded_context.priority == context.priority
        assert loaded_context.sentiment == context.sentiment
    
    @pytest.mark.asyncio
    async def test_error_handling(self, ai_service):
        """Test error handling in various methods."""
        # Test with invalid data
        with patch.object(ai_service, '_save_responses', side_effect=Exception("Save error")):
            # Should not raise exception
            ai_service._save_responses()
        
        with patch.object(ai_service, '_save_contexts', side_effect=Exception("Save error")):
            # Should not raise exception
            ai_service._save_contexts()
        
        with patch.object(ai_service, '_load_responses', side_effect=Exception("Load error")):
            # Should handle gracefully
            ai_service._load_responses()
            assert ai_service.responses == {}
        
        with patch.object(ai_service, '_load_contexts', side_effect=Exception("Load error")):
            # Should handle gracefully
            ai_service._load_contexts()
            assert ai_service.contexts == {}
    
    @pytest.mark.asyncio
    async def test_global_service_instance(self):
        """Test the global service instance."""
        assert isinstance(ai_email_response_service, AIEmailResponseService)
        assert ai_email_response_service.data_dir.exists()
        assert ai_email_response_service.responses_dir.exists()
        assert ai_email_response_service.contexts_dir.exists()


class TestEmailContext:
    """Test cases for EmailContext dataclass."""
    
    def test_email_context_creation(self):
        """Test EmailContext object creation."""
        context = EmailContext(
            context_id="test_context_id",
            original_subject="Test Subject",
            original_body="Test body content",
            sender_email="sender@example.com",
            recipient_email="recipient@example.com",
            sender_name="Test Sender",
            recipient_name="Test Recipient",
            email_type="question",
            priority="normal",
            sentiment="neutral",
            language="en",
            agent_personality={"tone": "professional", "style": "concise"},
            extracted_at=datetime.now()
        )
        
        assert context.context_id == "test_context_id"
        assert context.original_subject == "Test Subject"
        assert context.original_body == "Test body content"
        assert context.sender_email == "sender@example.com"
        assert context.recipient_email == "recipient@example.com"
        assert context.sender_name == "Test Sender"
        assert context.recipient_name == "Test Recipient"
        assert context.email_type == "question"
        assert context.priority == "normal"
        assert context.sentiment == "neutral"
        assert context.language == "en"
        assert context.agent_personality == {"tone": "professional", "style": "concise"}
        assert isinstance(context.extracted_at, datetime)


class TestAIResponse:
    """Test cases for AIResponse dataclass."""
    
    def test_ai_response_creation(self):
        """Test AIResponse object creation."""
        response = AIResponse(
            response_id="test_response_id",
            original_email_id="test_email_id",
            subject="Re: Test Subject",
            body="Test response body",
            html_body="<p>Test response body</p>",
            tone="professional",
            confidence_score=0.85,
            response_type="reply",
            suggested_actions=["Follow up", "Send report"],
            generated_at=datetime.now(),
            model_used="gpt-3.5-turbo",
            processing_time_ms=1200
        )
        
        assert response.response_id == "test_response_id"
        assert response.original_email_id == "test_email_id"
        assert response.subject == "Re: Test Subject"
        assert response.body == "Test response body"
        assert response.html_body == "<p>Test response body</p>"
        assert response.tone == "professional"
        assert response.confidence_score == 0.85
        assert response.response_type == "reply"
        assert response.suggested_actions == ["Follow up", "Send report"]
        assert isinstance(response.generated_at, datetime)
        assert response.model_used == "gpt-3.5-turbo"
        assert response.processing_time_ms == 1200
    
    def test_ai_response_defaults(self):
        """Test AIResponse default values."""
        response = AIResponse(
            response_id="test_response_id",
            original_email_id="test_email_id",
            subject="Re: Test Subject",
            body="Test response body"
        )
        
        assert response.html_body is None
        assert response.tone == "professional"
        assert response.confidence_score == 0.0
        assert response.response_type == "reply"
        assert response.suggested_actions == []
        assert isinstance(response.generated_at, datetime)
        assert response.model_used == "unknown"
        assert response.processing_time_ms == 0


class TestAIResponseConfig:
    """Test cases for AIResponseConfig dataclass."""
    
    def test_ai_response_config_defaults(self):
        """Test AIResponseConfig default values."""
        config = AIResponseConfig()
        
        assert config.auto_generate_responses is False
        assert config.require_human_approval is True
        assert config.default_model == "gpt-3.5-turbo"
        assert config.max_tokens == 1000
        assert config.temperature == 0.7
        assert config.max_response_length == 500
        assert config.min_confidence_threshold == 0.7
        assert config.default_tone == "professional"
    
    def test_ai_response_config_custom(self):
        """Test AIResponseConfig with custom values."""
        config = AIResponseConfig(
            default_model="claude-3-sonnet-20240229",
            max_tokens=2000,
            temperature=0.5,
            auto_generate_responses=True,
            require_human_approval=False,
            max_response_length=1000,
            min_confidence_threshold=0.8
        )
        
        assert config.auto_generate_responses is True
        assert config.require_human_approval is False
        assert config.default_model == "claude-3-sonnet-20240229"
        assert config.max_tokens == 2000
        assert config.temperature == 0.5
        assert config.max_response_length == 1000
        assert config.min_confidence_threshold == 0.8


if __name__ == "__main__":
    pytest.main([__file__])
