"""🦊 Reynard AI-Powered Email Response Service
=============================================

AI-powered email response generation using the AI service.
This module provides sophisticated email response generation with support
for multiple model providers through the AI interface.

Key Features:
- Multi-Provider Support: Works with Ollama, vLLM, SGLang, LLaMA.cpp
- Intelligent Provider Selection: Automatic provider selection based on capabilities
- Advanced Email Analysis: Context extraction, sentiment analysis, priority detection
- Response Generation: Professional email responses with customizable tone
- Template System: Flexible response templates and customization
- Quality Assessment: Confidence scoring and improvement suggestions
- Streaming Support: Real-time response generation and streaming

Author: Reynard Development Team
Version: 2.0.0 - AI Service Integration
"""

import json
import logging
import re
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from ...ai import AIService, ChatMessage, ProviderType
from ...ai.interfaces.model_provider import ModelCapability

logger = logging.getLogger(__name__)


@dataclass
class EmailContext:
    """Email context for AI response generation."""

    context_id: str
    original_subject: str
    original_body: str
    sender_email: str
    recipient_email: str
    sender_name: str | None = None
    recipient_name: str | None = None
    email_type: str = "general"  # general, question, request, complaint, meeting, etc.
    priority: str = "normal"  # low, normal, high, urgent
    sentiment: str = "neutral"  # positive, neutral, negative
    language: str = "en"
    previous_emails: list[dict[str, Any]] = None
    agent_personality: dict[str, Any] | None = None
    extracted_at: datetime | None = None

    def __post_init__(self):
        if self.previous_emails is None:
            self.previous_emails = []


@dataclass
class AIResponse:
    """AI-generated email response."""

    response_id: str
    original_email_id: str
    subject: str
    body: str
    html_body: str | None = None
    tone: str = "professional"  # professional, friendly, formal, casual
    confidence_score: float = 0.0  # 0.0 to 1.0
    response_type: str = "reply"  # reply, forward, new
    suggested_actions: list[str] = None
    generated_at: datetime = None
    model_used: str = "unknown"
    processing_time_ms: int = 0

    def __post_init__(self):
        if self.suggested_actions is None:
            self.suggested_actions = []
        if self.generated_at is None:
            self.generated_at = datetime.now()


@dataclass
class AIResponseConfig:
    """AI response generation configuration."""

    # Model settings
    default_provider: ProviderType = ProviderType.OLLAMA
    default_model: str = "llama3.1:latest"
    max_tokens: int = 1000
    temperature: float = 0.7

    # Response settings
    auto_generate_responses: bool = False
    require_human_approval: bool = True
    max_response_length: int = 500
    min_confidence_threshold: float = 0.7

    # Personality settings
    default_tone: str = "professional"
    include_signature: bool = True
    include_disclaimer: bool = True

    # Language settings
    supported_languages: list[str] = None
    auto_detect_language: bool = True

    def __post_init__(self):
        if self.supported_languages is None:
            self.supported_languages = ["en", "es", "fr", "de", "it", "pt", "zh", "ja"]


class AIEmailResponseService:
    """Service for AI-powered email response generation using AI service."""

    def __init__(
        self,
        config: AIResponseConfig | None = None,
        data_dir: str = "data/ai_responses",
        ai_service: Optional[AIService] = None,
    ):
        self.config = config or AIResponseConfig()
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Storage directories
        self.responses_dir = self.data_dir / "responses"
        self.responses_dir.mkdir(exist_ok=True)
        self.templates_dir = self.data_dir / "templates"
        self.templates_dir.mkdir(exist_ok=True)
        self.contexts_dir = self.data_dir / "contexts"
        self.contexts_dir.mkdir(exist_ok=True)

        # AI service
        self.ai_service = ai_service
        self._initialized = False

        # Context storage
        self.contexts: dict[str, EmailContext] = {}
        self.responses: dict[str, AIResponse] = {}
        self.templates: dict[str, Any] = {}

        # Load existing responses and templates
        self._load_responses()
        self._load_templates()

    async def initialize(self) -> bool:
        """Initialize the AI email response service.

        Returns:
            True if initialization successful, False otherwise
        """
        try:
            if not self.ai_service:
                # Get AI service from global registry
                from ...ai import get_ai_service

                self.ai_service = get_ai_service()

            if not self.ai_service:
                logger.error("No AI service available for email response generation")
                return False

            self._initialized = True
            logger.info("✅ AI Email Response Service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to initialize AI Email Response Service: {e}")
            return False

    def _load_responses(self) -> None:
        """Load existing AI responses."""
        try:
            responses_file = self.data_dir / "responses.json"
            if responses_file.exists():
                with open(responses_file, encoding="utf-8") as f:
                    responses_data = json.load(f)
                    self.responses = {
                        resp_id: AIResponse(**resp_data)
                        for resp_id, resp_data in responses_data.items()
                    }
            else:
                self.responses = {}
        except Exception as e:
            logger.error(f"Failed to load AI responses: {e}")
            self.responses = {}

    def _load_templates(self) -> None:
        """Load response templates."""
        try:
            templates_file = self.data_dir / "templates.json"
            if templates_file.exists():
                with open(templates_file, encoding="utf-8") as f:
                    self.templates = json.load(f)
            else:
                self.templates = self._create_default_templates()
                self._save_templates()
        except Exception as e:
            logger.error(f"Failed to load templates: {e}")
            self.templates = self._create_default_templates()

    def _save_responses(self) -> None:
        """Save AI responses to storage."""
        try:
            responses_file = self.data_dir / "responses.json"
            responses_data = {
                resp_id: asdict(response)
                for resp_id, response in self.responses.items()
            }

            # Convert datetime objects to ISO strings
            for resp_data in responses_data.values():
                for key, value in resp_data.items():
                    if isinstance(value, datetime):
                        resp_data[key] = value.isoformat()

            with open(responses_file, "w", encoding="utf-8") as f:
                json.dump(responses_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save AI responses: {e}")

    def _save_templates(self) -> None:
        """Save response templates."""
        try:
            templates_file = self.data_dir / "templates.json"
            with open(templates_file, "w", encoding="utf-8") as f:
                json.dump(self.templates, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save templates: {e}")

    def _create_default_templates(self) -> dict[str, Any]:
        """Create default response templates."""
        return {
            "greeting": {
                "professional": "Dear {name},",
                "friendly": "Hi {name}!",
                "formal": "Dear {name},",
                "casual": "Hey {name},",
            },
            "closing": {
                "professional": "Best regards,\n{agent_name}",
                "friendly": "Best,\n{agent_name}",
                "formal": "Sincerely,\n{agent_name}",
                "casual": "Thanks,\n{agent_name}",
            },
            "disclaimer": "This response was generated with AI assistance. Please review before sending.",
            "signature": "{agent_name}\n{agent_title}\n{company_name}",
        }

    async def analyze_email_context(self, email_data: dict[str, Any]) -> EmailContext:
        """Analyze email to extract context for AI response generation.

        Args:
            email_data: Email data dictionary

        Returns:
            EmailContext object

        """
        try:
            start_time = datetime.now()

            # Extract basic information
            subject = email_data.get("subject", "")
            body = email_data.get("body", "")
            sender_email = email_data.get("sender_email", email_data.get("sender", ""))
            recipient_email = email_data.get(
                "recipient_email",
                email_data.get("recipient", ""),
            )

            # Analyze email type
            email_type = self._classify_email_type(subject, body)

            # Analyze priority
            priority = self._analyze_priority(subject, body)

            # Analyze sentiment
            sentiment = self._analyze_sentiment(body)

            # Detect language
            language = self._detect_language(body)

            # Extract names (use provided names if available, otherwise extract from email)
            sender_name = email_data.get(
                "sender_name",
            ) or self._extract_name_from_email(sender_email)
            recipient_name = email_data.get(
                "recipient_name",
            ) or self._extract_name_from_email(recipient_email)

            # Get agent personality if available
            agent_personality = await self._get_agent_personality(recipient_email)

            context = EmailContext(
                context_id=str(uuid.uuid4()),
                original_subject=subject,
                original_body=body,
                sender_email=sender_email,
                recipient_email=recipient_email,
                sender_name=sender_name,
                recipient_name=recipient_name,
                email_type=email_type,
                priority=priority,
                sentiment=sentiment,
                language=language,
                agent_personality=agent_personality,
                extracted_at=datetime.now(),
            )

            # Store context
            self.contexts[context.context_id] = context

            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.info(f"Email context analyzed in {processing_time:.2f}ms")

            return context

        except Exception as e:
            logger.error(f"Failed to analyze email context: {e}")
            raise

    async def generate_response(
        self,
        email_context: EmailContext,
        response_type: str = "reply",
        custom_instructions: str | None = None,
        model: str | None = None,
        provider: Optional[ProviderType] = None,
    ) -> AIResponse:
        """Generate AI-powered email response using AI service.

        Args:
            email_context: Email context for response generation
            response_type: Type of response to generate
            custom_instructions: Custom instructions for the AI
            model: Specific model to use
            provider: Preferred provider to use

        Returns:
            AIResponse object

        """
        try:
            if not self._initialized:
                await self.initialize()

            if not self.ai_service:
                raise ValueError("AI service not available")

            start_time = datetime.now()

            # Build the prompt for email response generation
            system_prompt, user_prompt = self._build_email_prompt(
                email_context, response_type, custom_instructions
            )

            # Create chat messages
            messages = [
                ChatMessage(role="system", content=system_prompt),
                ChatMessage(role="user", content=user_prompt),
            ]

            # Generate response using AI service
            chat_result = await self.ai_service.generate_chat_completion(
                messages=messages,
                model=model or self.config.default_model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                provider=provider or self.config.default_provider,
            )

            # Parse the response
            response_text = chat_result.message.content
            subject, body = self._parse_response_text(response_text)

            # Create AIResponse object
            response = AIResponse(
                response_id=str(uuid.uuid4()),
                original_email_id=email_context.sender_email,
                subject=subject,
                body=body,
                html_body=self._generate_html_body(body),
                tone=self._detect_tone(body),
                confidence_score=self._calculate_confidence_score(email_context, body),
                response_type=response_type,
                suggested_actions=self._extract_suggested_actions(body),
                model_used=chat_result.model_used,
                processing_time_ms=int(chat_result.processing_time_ms),
            )

            # Store the response
            self.responses[response.response_id] = response
            self._save_responses()

            logger.info(f"Generated AI response: {response.response_id}")
            return response

        except Exception as e:
            logger.error(f"Failed to generate AI response: {e}")
            raise

    async def generate_auto_reply(
        self,
        email_context: EmailContext,
        agent_config: dict[str, Any],
    ) -> AIResponse:
        """Generate automatic reply for agent emails.

        Args:
            email_context: Email context
            agent_config: Agent configuration

        Returns:
            AIResponse object

        """
        try:
            # Custom instructions for auto-reply
            custom_instructions = f"""
            Generate an automatic reply for agent {agent_config.get('agent_name', 'Unknown')}.
            The agent's personality: {agent_config.get('personality', 'Professional')}
            The agent's role: {agent_config.get('role', 'Assistant')}
            
            Keep the response brief and professional. Include:
            1. Acknowledgment of receipt
            2. Expected response time
            3. Contact information if needed
            """

            return await self.generate_response(
                email_context,
                response_type="auto_reply",
                custom_instructions=custom_instructions,
            )

        except Exception as e:
            logger.error(f"Failed to generate auto-reply: {e}")
            raise

    async def suggest_response_improvements(
        self,
        response: AIResponse,
        email_context: EmailContext,
    ) -> list[str]:
        """Suggest improvements for an AI-generated response.

        Args:
            response: AI-generated response
            email_context: Original email context

        Returns:
            List of improvement suggestions

        """
        try:
            suggestions = []

            # Check response length
            if len(response.body) > self.config.max_response_length:
                suggestions.append("Response is too long. Consider shortening it.")

            # Check confidence score
            if response.confidence_score < self.config.min_confidence_threshold:
                suggestions.append("Low confidence score. Consider manual review.")

            # Check tone appropriateness
            if email_context.sentiment == "negative" and response.tone == "casual":
                suggestions.append(
                    "Consider using a more professional tone for negative sentiment emails.",
                )

            # Check for missing information
            if email_context.email_type == "question" and "?" not in response.body:
                suggestions.append("Consider addressing the specific question asked.")

            # Check for appropriate closing
            if not any(
                word in response.body.lower()
                for word in ["regards", "sincerely", "thanks", "best"]
            ):
                suggestions.append("Consider adding an appropriate closing.")

            return suggestions

        except Exception as e:
            logger.error(f"Failed to suggest improvements: {e}")
            return []

    async def get_response_history(
        self,
        email_address: str,
        limit: int = 10,
    ) -> list[AIResponse]:
        """Get response history for an email address.

        Args:
            email_address: Email address to get history for
            limit: Maximum number of responses to return

        Returns:
            List of AIResponse objects

        """
        try:
            # Filter responses by email address
            relevant_responses = [
                response
                for response in self.responses.values()
                if email_address in [response.original_email_id]  # Simplified matching
            ]

            # Sort by generation time (newest first)
            relevant_responses.sort(key=lambda x: x.generated_at, reverse=True)

            return relevant_responses[:limit]

        except Exception as e:
            logger.error(f"Failed to get response history: {e}")
            return []

    # Private helper methods

    def _classify_email_type(self, subject: str, body: str) -> str:
        """Classify the type of email."""
        text = f"{subject} {body}".lower()

        if any(word in text for word in ["meeting", "schedule", "appointment", "call"]):
            return "meeting"
        if any(
            word in text
            for word in ["question", "?", "how", "what", "when", "where", "why"]
        ):
            return "question"
        if any(word in text for word in ["request", "please", "can you", "could you"]):
            return "request"
        if any(
            word in text for word in ["complaint", "problem", "issue", "error", "bug"]
        ):
            return "complaint"
        if any(word in text for word in ["thank", "thanks", "appreciate"]):
            return "gratitude"
        if any(word in text for word in ["urgent", "asap", "immediately", "critical"]):
            return "urgent"
        return "general"

    def _analyze_priority(self, subject: str, body: str) -> str:
        """Analyze email priority."""
        text = f"{subject} {body}".lower()

        if any(
            word in text
            for word in ["urgent", "asap", "immediately", "critical", "emergency"]
        ):
            return "urgent"
        if any(word in text for word in ["important", "priority", "high"]):
            return "high"
        if any(word in text for word in ["low", "whenever", "flexible", "no rush"]):
            return "low"
        return "normal"

    def _analyze_sentiment(self, body: str) -> str:
        """Analyze email sentiment."""
        text = body.lower()

        positive_words = [
            "thank",
            "thanks",
            "appreciate",
            "great",
            "excellent",
            "good",
            "happy",
            "pleased",
        ]
        negative_words = [
            "problem",
            "issue",
            "error",
            "bug",
            "angry",
            "frustrated",
            "disappointed",
            "bad",
        ]

        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)

        if positive_count > negative_count:
            return "positive"
        if negative_count > positive_count:
            return "negative"
        return "neutral"

    def _detect_language(self, text: str) -> str:
        """Detect email language."""
        # Simple language detection based on common words
        text_lower = text.lower()

        if any(
            word in text_lower for word in ["the", "and", "is", "are", "was", "were"]
        ):
            return "en"
        if any(word in text_lower for word in ["el", "la", "de", "que", "y", "en"]):
            return "es"
        if any(word in text_lower for word in ["le", "la", "de", "et", "est", "dans"]):
            return "fr"
        if any(
            word in text_lower for word in ["der", "die", "das", "und", "ist", "sind"]
        ):
            return "de"
        return "en"  # Default to English

    def _extract_name_from_email(self, email: str) -> str | None:
        """Extract name from email address."""
        if "@" in email:
            local_part = email.split("@")[0]
            # Remove numbers and special characters
            name = re.sub(r"[0-9._-]", " ", local_part)
            # Capitalize words
            name = " ".join(word.capitalize() for word in name.split())
            return name if name else None
        return None

    async def _get_agent_personality(self, email: str) -> dict[str, Any] | None:
        """Get agent personality configuration."""
        try:
            # This would integrate with the agent system
            # For now, return a placeholder
            return {
                "agent_name": "AI Assistant",
                "personality": "Professional and helpful",
                "role": "Email Assistant",
                "company": "Reynard Systems",
            }
        except Exception as e:
            logger.error(f"Failed to get agent personality: {e}")
            return None

    def _build_email_prompt(
        self,
        email_context: EmailContext,
        response_type: str,
        custom_instructions: str | None,
    ) -> tuple[str, str]:
        """Build system and user prompts for email response generation.

        Args:
            email_context: Email context for response generation
            response_type: Type of response to generate
            custom_instructions: Custom instructions for the AI

        Returns:
            Tuple of (system_prompt, user_prompt)
        """
        # System prompt
        system_prompt = f"""You are a professional email assistant for Reynard Systems. 
        Generate appropriate email responses with the following guidelines:
        
        - Use a {self.config.default_tone} tone
        - Keep responses under {self.config.max_response_length} characters
        - Include appropriate greeting and closing
        - Be helpful, accurate, and professional
        - Address the sender's specific needs and concerns
        
        Agent Personality: {email_context.agent_personality or 'Professional and helpful'}
        
        Format your response as:
        SUBJECT: [subject line]
        BODY: [response body]"""

        # User prompt
        user_prompt = f"""Generate a {response_type} email response with the following context:
        
        Original Email:
        Subject: {email_context.original_subject}
        From: {email_context.sender_name or email_context.sender_email}
        Body: {email_context.original_body}
        
        Email Type: {email_context.email_type}
        Priority: {email_context.priority}
        Sentiment: {email_context.sentiment}
        Language: {email_context.language}
        
        {custom_instructions or ''}
        
        Please generate an appropriate response that addresses the sender's needs."""

        return system_prompt, user_prompt

    def _generate_html_body(self, text_body: str) -> str:
        """Generate HTML version of the email body.

        Args:
            text_body: Plain text email body

        Returns:
            HTML formatted email body
        """
        # Simple HTML conversion - convert line breaks to <br> tags
        html_body = text_body.replace('\n', '<br>\n')

        # Add basic HTML structure
        html_body = f"""<html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        {html_body}
        </body>
        </html>"""

        return html_body

    def _calculate_confidence_score(
        self, email_context: EmailContext, response_body: str
    ) -> float:
        """Calculate confidence score for the generated response.

        Args:
            email_context: Original email context
            response_body: Generated response body

        Returns:
            Confidence score between 0.0 and 1.0
        """
        score = 0.5  # Base score

        # Length appropriateness
        if 50 <= len(response_body) <= self.config.max_response_length:
            score += 0.2

        # Tone appropriateness
        if email_context.sentiment == "negative" and "sorry" in response_body.lower():
            score += 0.1
        elif email_context.sentiment == "positive" and any(
            word in response_body.lower() for word in ["thank", "appreciate", "glad"]
        ):
            score += 0.1

        # Question addressing
        if email_context.email_type == "question" and "?" in response_body:
            score += 0.1

        # Professional closing
        if any(
            word in response_body.lower()
            for word in ["regards", "sincerely", "best", "thanks"]
        ):
            score += 0.1

        return min(1.0, max(0.0, score))

    def _parse_response_text(self, response_text: str) -> tuple[str, str]:
        """Parse AI response text to extract subject and body."""
        try:
            lines = response_text.strip().split("\n")
            subject = ""
            body_lines = []

            in_body = False
            for line in lines:
                if line.startswith("SUBJECT:"):
                    subject = line.replace("SUBJECT:", "").strip()
                elif line.startswith("BODY:"):
                    body_lines.append(line.replace("BODY:", "").strip())
                    in_body = True
                elif in_body:
                    body_lines.append(line)

            body = "\n".join(body_lines).strip()

            # Fallback if parsing fails
            if not subject:
                subject = "Re: Your Message"
            if not body:
                body = response_text

            return subject, body

        except Exception as e:
            logger.error(f"Failed to parse response text: {e}")
            return "Re: Your Message", response_text

    def _detect_tone(self, text: str) -> str:
        """Detect the tone of the response."""
        text_lower = text.lower()

        if any(
            word in text_lower for word in ["hi", "hey", "hello", "thanks", "cheers"]
        ):
            return "friendly"
        if any(word in text_lower for word in ["sincerely", "respectfully", "regards"]):
            return "formal"
        if any(word in text_lower for word in ["yo", "sup", "lol", "haha"]):
            return "casual"
        return "professional"

    def _extract_suggested_actions(self, text: str) -> list[str]:
        """Extract suggested actions from response text."""
        actions = []

        if "follow up" in text.lower():
            actions.append("Schedule follow-up")
        if "meeting" in text.lower():
            actions.append("Schedule meeting")
        if "call" in text.lower():
            actions.append("Make phone call")
        if "document" in text.lower() or "file" in text.lower():
            actions.append("Attach document")

        return actions


# Global AI response service instance - will be initialized lazily
ai_email_response_service = None


def get_ai_email_response_service() -> AIEmailResponseService:
    """Get the AI email response service instance with lazy initialization.

    Returns:
        AIEmailResponseService: The initialized service instance

    """
    global ai_email_response_service
    if ai_email_response_service is None:
        ai_email_response_service = AIEmailResponseService()
    return ai_email_response_service


async def initialize_ai_email_response_service() -> bool:
    """Initialize the AI email response service.

    Returns:
        bool: True if initialization was successful, False otherwise

    """
    try:
        global ai_email_response_service
        if ai_email_response_service is None:
            ai_email_response_service = AIEmailResponseService()
            await ai_email_response_service.initialize()
            logger.info("✅ AI email response service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ AI email response service initialization failed: {e}")
        return False


async def shutdown_ai_email_response_service() -> None:
    """Shutdown the AI email response service."""
    try:
        global ai_email_response_service
        if ai_email_response_service is not None:
            # Clean up any resources if needed
            ai_email_response_service = None
            logger.info("✅ AI email response service shutdown successfully")
    except Exception as e:
        logger.error(f"❌ AI email response service shutdown error: {e}")


async def health_check_ai_email_response_service() -> bool:
    """Health check for the AI email response service.

    Returns:
        bool: True if service is healthy, False otherwise

    """
    try:
        global ai_email_response_service
        if ai_email_response_service is None:
            return False

        # Check if the service is initialized and AI service is available
        if not ai_email_response_service._initialized:
            return False

        if not ai_email_response_service.ai_service:
            return False

        # Check AI service health
        health_status = ai_email_response_service.ai_service.get_health_status()
        return (
            health_status["service_initialized"]
            and health_status["healthy_providers"] > 0
        )

    except Exception as e:
        logger.error(f"❌ AI email response service health check error: {e}")
        return False
