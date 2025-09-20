"""
AI-Powered Email Response Service for Reynard Backend.

This module provides AI-powered email response generation using LLM integration.
"""

import asyncio
import logging
import json
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict
from pathlib import Path
import uuid

# AI/LLM imports
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    import requests
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class EmailContext:
    """Email context for AI response generation."""
    
    context_id: str
    original_subject: str
    original_body: str
    sender_email: str
    recipient_email: str
    sender_name: Optional[str] = None
    recipient_name: Optional[str] = None
    email_type: str = "general"  # general, question, request, complaint, meeting, etc.
    priority: str = "normal"  # low, normal, high, urgent
    sentiment: str = "neutral"  # positive, neutral, negative
    language: str = "en"
    previous_emails: List[Dict[str, Any]] = None
    agent_personality: Optional[Dict[str, Any]] = None
    extracted_at: Optional[datetime] = None
    
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
    html_body: Optional[str] = None
    tone: str = "professional"  # professional, friendly, formal, casual
    confidence_score: float = 0.0  # 0.0 to 1.0
    response_type: str = "reply"  # reply, forward, new
    suggested_actions: List[str] = None
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
    default_model: str = "gpt-3.5-turbo"  # or claude-3-sonnet
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
    supported_languages: List[str] = None
    auto_detect_language: bool = True
    
    def __post_init__(self):
        if self.supported_languages is None:
            self.supported_languages = ["en", "es", "fr", "de", "it", "pt", "zh", "ja"]


class AIEmailResponseService:
    """Service for AI-powered email response generation."""
    
    def __init__(self, config: Optional[AIResponseConfig] = None, data_dir: str = "data/ai_responses"):
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
        
        # AI clients
        self.openai_client = None
        self.anthropic_client = None
        self.ollama_available = False
        
        # Context storage
        self.contexts: Dict[str, EmailContext] = {}
        
        # Initialize OpenAI client only if API key is available
        if OPENAI_AVAILABLE:
            try:
                import os
                if os.getenv('OPENAI_API_KEY'):
                    self.openai_client = openai.AsyncOpenAI()
                    logger.info("OpenAI client initialized successfully")
                else:
                    logger.info("OpenAI API key not found, skipping OpenAI initialization")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        
        # Initialize Anthropic client only if API key is available
        if ANTHROPIC_AVAILABLE:
            try:
                import os
                if os.getenv('ANTHROPIC_API_KEY'):
                    self.anthropic_client = Anthropic()
                    logger.info("Anthropic client initialized successfully")
                else:
                    logger.info("Anthropic API key not found, skipping Anthropic initialization")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")
        
        # Check Ollama availability
        if OLLAMA_AVAILABLE:
            try:
                import requests
                response = requests.get("http://localhost:11434/api/tags", timeout=2)
                if response.status_code == 200:
                    self.ollama_available = True
                    logger.info("Ollama service detected and available")
                else:
                    logger.info("Ollama service not responding")
            except Exception as e:
                logger.info(f"Ollama service not available: {e}")
        
        # Log available AI services
        available_services = []
        if self.openai_client:
            available_services.append("OpenAI")
        if self.anthropic_client:
            available_services.append("Anthropic")
        if self.ollama_available:
            available_services.append("Ollama")
        
        if available_services:
            logger.info(f"Available AI services: {', '.join(available_services)}")
        else:
            logger.warning("No AI services available - email response generation will be limited")
        
        # Load existing responses and templates
        self._load_responses()
        self._load_templates()
    
    def _load_responses(self) -> None:
        """Load existing AI responses."""
        try:
            responses_file = self.data_dir / "responses.json"
            if responses_file.exists():
                with open(responses_file, 'r', encoding='utf-8') as f:
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
                with open(templates_file, 'r', encoding='utf-8') as f:
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
            
            with open(responses_file, 'w', encoding='utf-8') as f:
                json.dump(responses_data, f, indent=2, default=str)
                
        except Exception as e:
            logger.error(f"Failed to save AI responses: {e}")
    
    def _save_templates(self) -> None:
        """Save response templates."""
        try:
            templates_file = self.data_dir / "templates.json"
            with open(templates_file, 'w', encoding='utf-8') as f:
                json.dump(self.templates, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save templates: {e}")
    
    def _create_default_templates(self) -> Dict[str, Any]:
        """Create default response templates."""
        return {
            "greeting": {
                "professional": "Dear {name},",
                "friendly": "Hi {name}!",
                "formal": "Dear {name},",
                "casual": "Hey {name},"
            },
            "closing": {
                "professional": "Best regards,\n{agent_name}",
                "friendly": "Best,\n{agent_name}",
                "formal": "Sincerely,\n{agent_name}",
                "casual": "Thanks,\n{agent_name}"
            },
            "disclaimer": "This response was generated with AI assistance. Please review before sending.",
            "signature": "{agent_name}\n{agent_title}\n{company_name}"
        }
    
    async def analyze_email_context(self, email_data: Dict[str, Any]) -> EmailContext:
        """
        Analyze email to extract context for AI response generation.
        
        Args:
            email_data: Email data dictionary
            
        Returns:
            EmailContext object
        """
        try:
            start_time = datetime.now()
            
            # Extract basic information
            subject = email_data.get('subject', '')
            body = email_data.get('body', '')
            sender_email = email_data.get('sender_email', email_data.get('sender', ''))
            recipient_email = email_data.get('recipient_email', email_data.get('recipient', ''))
            
            # Analyze email type
            email_type = self._classify_email_type(subject, body)
            
            # Analyze priority
            priority = self._analyze_priority(subject, body)
            
            # Analyze sentiment
            sentiment = self._analyze_sentiment(body)
            
            # Detect language
            language = self._detect_language(body)
            
            # Extract names (use provided names if available, otherwise extract from email)
            sender_name = email_data.get('sender_name') or self._extract_name_from_email(sender_email)
            recipient_name = email_data.get('recipient_name') or self._extract_name_from_email(recipient_email)
            
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
                extracted_at=datetime.now()
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
        custom_instructions: Optional[str] = None,
        model: Optional[str] = None
    ) -> AIResponse:
        """
        Generate AI-powered email response.
        
        Args:
            email_context: Email context for response generation
            response_type: Type of response to generate
            custom_instructions: Custom instructions for the AI
            model: Specific model to use
            
        Returns:
            AIResponse object
        """
        try:
            start_time = datetime.now()
            
            # Determine which model to use (default to Ollama if available)
            if not model:
                if self.ollama_available:
                    model = "llama3.1"  # Default Ollama model
                elif self.openai_client:
                    model = self.config.default_model
                elif self.anthropic_client:
                    model = "claude-3-sonnet-20240229"
                else:
                    raise ValueError("No AI services available")
            
            # Generate the response
            if self.ollama_available and (model in ["llama3.1", "llama3", "mistral", "codellama"] or not model.startswith(("gpt", "claude"))):
                response_data = await self._generate_ollama_response(
                    email_context, response_type, custom_instructions, model
                )
            elif model.startswith("gpt") and self.openai_client:
                response_data = await self._generate_openai_response(
                    email_context, response_type, custom_instructions, model
                )
            elif model.startswith("claude") and self.anthropic_client:
                response_data = await self._generate_anthropic_response(
                    email_context, response_type, custom_instructions, model
                )
            else:
                raise ValueError(f"Unsupported model: {model} or service not available")
            
            # Create AIResponse object
            response = AIResponse(
                response_id=str(uuid.uuid4()),
                original_email_id=email_context.sender_email,  # Placeholder
                subject=response_data.get('subject', ''),
                body=response_data.get('body', ''),
                html_body=response_data.get('html_body'),
                tone=response_data.get('tone', self.config.default_tone),
                confidence_score=response_data.get('confidence_score', 0.0),
                response_type=response_type,
                suggested_actions=response_data.get('suggested_actions', []),
                model_used=model,
                processing_time_ms=int((datetime.now() - start_time).total_seconds() * 1000)
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
        agent_config: Dict[str, Any]
    ) -> AIResponse:
        """
        Generate automatic reply for agent emails.
        
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
                custom_instructions=custom_instructions
            )
            
        except Exception as e:
            logger.error(f"Failed to generate auto-reply: {e}")
            raise
    
    async def suggest_response_improvements(
        self,
        response: AIResponse,
        email_context: EmailContext
    ) -> List[str]:
        """
        Suggest improvements for an AI-generated response.
        
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
                suggestions.append("Consider using a more professional tone for negative sentiment emails.")
            
            # Check for missing information
            if email_context.email_type == "question" and "?" not in response.body:
                suggestions.append("Consider addressing the specific question asked.")
            
            # Check for appropriate closing
            if not any(word in response.body.lower() for word in ["regards", "sincerely", "thanks", "best"]):
                suggestions.append("Consider adding an appropriate closing.")
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Failed to suggest improvements: {e}")
            return []
    
    async def get_response_history(self, email_address: str, limit: int = 10) -> List[AIResponse]:
        """
        Get response history for an email address.
        
        Args:
            email_address: Email address to get history for
            limit: Maximum number of responses to return
            
        Returns:
            List of AIResponse objects
        """
        try:
            # Filter responses by email address
            relevant_responses = [
                response for response in self.responses.values()
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
        
        if any(word in text for word in ['meeting', 'schedule', 'appointment', 'call']):
            return 'meeting'
        elif any(word in text for word in ['question', '?', 'how', 'what', 'when', 'where', 'why']):
            return 'question'
        elif any(word in text for word in ['request', 'please', 'can you', 'could you']):
            return 'request'
        elif any(word in text for word in ['complaint', 'problem', 'issue', 'error', 'bug']):
            return 'complaint'
        elif any(word in text for word in ['thank', 'thanks', 'appreciate']):
            return 'gratitude'
        elif any(word in text for word in ['urgent', 'asap', 'immediately', 'critical']):
            return 'urgent'
        else:
            return 'general'
    
    def _analyze_priority(self, subject: str, body: str) -> str:
        """Analyze email priority."""
        text = f"{subject} {body}".lower()
        
        if any(word in text for word in ['urgent', 'asap', 'immediately', 'critical', 'emergency']):
            return 'urgent'
        elif any(word in text for word in ['important', 'priority', 'high']):
            return 'high'
        elif any(word in text for word in ['low', 'whenever', 'flexible', 'no rush']):
            return 'low'
        else:
            return 'normal'
    
    def _analyze_sentiment(self, body: str) -> str:
        """Analyze email sentiment."""
        text = body.lower()
        
        positive_words = ['thank', 'thanks', 'appreciate', 'great', 'excellent', 'good', 'happy', 'pleased']
        negative_words = ['problem', 'issue', 'error', 'bug', 'angry', 'frustrated', 'disappointed', 'bad']
        
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def _detect_language(self, text: str) -> str:
        """Detect email language."""
        # Simple language detection based on common words
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['the', 'and', 'is', 'are', 'was', 'were']):
            return 'en'
        elif any(word in text_lower for word in ['el', 'la', 'de', 'que', 'y', 'en']):
            return 'es'
        elif any(word in text_lower for word in ['le', 'la', 'de', 'et', 'est', 'dans']):
            return 'fr'
        elif any(word in text_lower for word in ['der', 'die', 'das', 'und', 'ist', 'sind']):
            return 'de'
        else:
            return 'en'  # Default to English
    
    def _extract_name_from_email(self, email: str) -> Optional[str]:
        """Extract name from email address."""
        if '@' in email:
            local_part = email.split('@')[0]
            # Remove numbers and special characters
            name = re.sub(r'[0-9._-]', ' ', local_part)
            # Capitalize words
            name = ' '.join(word.capitalize() for word in name.split())
            return name if name else None
        return None
    
    async def _get_agent_personality(self, email: str) -> Optional[Dict[str, Any]]:
        """Get agent personality configuration."""
        try:
            # This would integrate with the agent system
            # For now, return a placeholder
            return {
                'agent_name': 'AI Assistant',
                'personality': 'Professional and helpful',
                'role': 'Email Assistant',
                'company': 'Reynard Systems'
            }
        except Exception as e:
            logger.error(f"Failed to get agent personality: {e}")
            return None
    
    async def _generate_openai_response(
        self,
        email_context: EmailContext,
        response_type: str,
        custom_instructions: Optional[str],
        model: str
    ) -> Dict[str, Any]:
        """Generate response using OpenAI API."""
        try:
            # Build the prompt
            prompt = self._build_openai_prompt(email_context, response_type, custom_instructions)
            
            # Call OpenAI API
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a professional email assistant. Generate appropriate email responses."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature
            )
            
            # Parse the response
            response_text = response.choices[0].message.content
            
            # Extract subject and body
            subject, body = self._parse_response_text(response_text)
            
            return {
                'subject': subject,
                'body': body,
                'tone': self._detect_tone(body),
                'confidence_score': 0.8,  # Placeholder
                'suggested_actions': self._extract_suggested_actions(body)
            }
            
        except Exception as e:
            logger.error(f"OpenAI response generation failed: {e}")
            raise
    
    async def _generate_anthropic_response(
        self,
        email_context: EmailContext,
        response_type: str,
        custom_instructions: Optional[str],
        model: str
    ) -> Dict[str, Any]:
        """Generate response using Anthropic API."""
        try:
            # Build the prompt
            prompt = self._build_anthropic_prompt(email_context, response_type, custom_instructions)
            
            # Call Anthropic API
            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Parse the response
            response_text = response.content[0].text
            
            # Extract subject and body
            subject, body = self._parse_response_text(response_text)
            
            return {
                'subject': subject,
                'body': body,
                'tone': self._detect_tone(body),
                'confidence_score': 0.8,  # Placeholder
                'suggested_actions': self._extract_suggested_actions(body)
            }
            
        except Exception as e:
            logger.error(f"Anthropic response generation failed: {e}")
            raise
    
    def _build_openai_prompt(
        self,
        email_context: EmailContext,
        response_type: str,
        custom_instructions: Optional[str]
    ) -> str:
        """Build prompt for OpenAI API."""
        prompt = f"""
        Generate a {response_type} email response with the following context:
        
        Original Email:
        Subject: {email_context.original_subject}
        From: {email_context.sender_name or email_context.sender_email}
        Body: {email_context.original_body}
        
        Email Type: {email_context.email_type}
        Priority: {email_context.priority}
        Sentiment: {email_context.sentiment}
        
        Agent Personality: {email_context.agent_personality or 'Professional and helpful'}
        
        {custom_instructions or ''}
        
        Please generate:
        1. An appropriate subject line
        2. A professional response body
        3. Use tone: {self.config.default_tone}
        4. Keep response under {self.config.max_response_length} characters
        5. Include appropriate greeting and closing
        
        Format your response as:
        SUBJECT: [subject line]
        BODY: [response body]
        """
        
        return prompt
    
    def _build_anthropic_prompt(
        self,
        email_context: EmailContext,
        response_type: str,
        custom_instructions: Optional[str]
    ) -> str:
        """Build prompt for Anthropic API."""
        # Similar to OpenAI prompt but adapted for Anthropic
        return self._build_openai_prompt(email_context, response_type, custom_instructions)
    
    def _parse_response_text(self, response_text: str) -> Tuple[str, str]:
        """Parse AI response text to extract subject and body."""
        try:
            lines = response_text.strip().split('\n')
            subject = ""
            body_lines = []
            
            in_body = False
            for line in lines:
                if line.startswith('SUBJECT:'):
                    subject = line.replace('SUBJECT:', '').strip()
                elif line.startswith('BODY:'):
                    body_lines.append(line.replace('BODY:', '').strip())
                    in_body = True
                elif in_body:
                    body_lines.append(line)
            
            body = '\n'.join(body_lines).strip()
            
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
        
        if any(word in text_lower for word in ['hi', 'hey', 'hello', 'thanks', 'cheers']):
            return 'friendly'
        elif any(word in text_lower for word in ['sincerely', 'respectfully', 'regards']):
            return 'formal'
        elif any(word in text_lower for word in ['yo', 'sup', 'lol', 'haha']):
            return 'casual'
        else:
            return 'professional'
    
    def _extract_suggested_actions(self, text: str) -> List[str]:
        """Extract suggested actions from response text."""
        actions = []
        
        if 'follow up' in text.lower():
            actions.append('Schedule follow-up')
        if 'meeting' in text.lower():
            actions.append('Schedule meeting')
        if 'call' in text.lower():
            actions.append('Make phone call')
        if 'document' in text.lower() or 'file' in text.lower():
            actions.append('Attach document')
        
        return actions
    
    async def _generate_ollama_response(
        self,
        email_context: EmailContext,
        response_type: str,
        custom_instructions: Optional[str],
        model: str
    ) -> Dict[str, Any]:
        """Generate response using Ollama."""
        try:
            import requests
            import json
            
            # Build the prompt
            prompt = self._build_ollama_prompt(email_context, response_type, custom_instructions)
            
            # Prepare the request payload
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": self.config.max_response_length
                }
            }
            
            # Make the request to Ollama
            response = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise ValueError(f"Ollama API error: {response.status_code}")
            
            result = response.json()
            response_text = result.get('response', '')
            
            if not response_text:
                raise ValueError("Empty response from Ollama")
            
            # Parse the response
            subject, body = self._parse_response_text(response_text)
            
            return {
                'subject': subject,
                'body': body,
                'html_body': None,
                'tone': self._detect_tone(body),
                'confidence_score': 0.8,  # Ollama responses are generally reliable
                'suggested_actions': self._extract_suggested_actions(body)
            }
            
        except Exception as e:
            logger.error(f"Ollama response generation failed: {e}")
            raise
    
    def _build_ollama_prompt(
        self,
        email_context: EmailContext,
        response_type: str,
        custom_instructions: Optional[str]
    ) -> str:
        """Build prompt for Ollama."""
        prompt = f"""You are an AI assistant helping to generate professional email responses.

Original Email:
From: {email_context.sender_email}
Subject: {email_context.original_subject}
Body: {email_context.original_body}

Email Type: {email_context.email_type}
Priority: {email_context.priority}
Sentiment: {email_context.sentiment}

Agent Personality: {email_context.agent_personality or 'Professional and helpful'}

{custom_instructions or ''}

Please generate a professional email response with:
1. An appropriate subject line
2. A professional response body
3. Use tone: {self.config.default_tone}
4. Keep response under {self.config.max_response_length} characters
5. Include appropriate greeting and closing

Format your response as:
SUBJECT: [subject line]
BODY: [response body]
"""
        
        return prompt


# Global AI response service instance
ai_email_response_service = AIEmailResponseService()
