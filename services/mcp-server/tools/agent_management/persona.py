#!/usr/bin/env python3
"""
Agent Persona Tools
===================

Persona and trait management for agents.
Follows the 140-line axiom and modular architecture principles.
"""

import sys
from pathlib import Path
from typing import Any

# Legacy agent-naming system removed - now using FastAPI ECS backend
from services.backend_agent_manager import BackendAgentManager


class PersonaAgentTools:
    """Handles agent persona and trait management."""

    def __init__(self, agent_manager: BackendAgentManager):
        self.agent_manager = agent_manager

    def get_agent_persona(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive agent persona from ECS system."""
        agent_id = arguments.get("agent_id", "")

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }

        persona = self.agent_manager.get_agent_persona(agent_id)

        if persona:
            persona_text = self._format_persona_response(agent_id, persona)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": persona_text,
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Agent {agent_id} not found or has no persona data",
                    }
                ]
            }

    def get_lora_config(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get LoRA configuration for agent."""
        agent_id = arguments.get("agent_id", "")

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }

        lora_config = self.agent_manager.get_lora_config(agent_id)

        if lora_config:
            lora_text = self._format_lora_response(agent_id, lora_config)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": lora_text,
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Agent {agent_id} not found or has no LoRA configuration",
                    }
                ]
            }

    def _format_persona_response(self, agent_id: str, persona: dict) -> str:
        """Format persona response text."""
        persona_text = f"Agent Persona for {agent_id}:\n"
        persona_text += f"Spirit: {persona.get('spirit', 'Unknown')}\n"
        persona_text += f"Style: {persona.get('style', 'Unknown')}\n"
        persona_text += (
            f"Dominant Traits: {', '.join(persona.get('dominant_traits', []))}\n"
        )
        persona_text += (
            f"Personality: {persona.get('personality_summary', 'Generated')}\n"
        )
        persona_text += f"Communication Style: {persona.get('communication_style', 'professional and clear')}\n"
        persona_text += (
            f"Specializations: {', '.join(persona.get('specializations', []))}\n"
        )

        return persona_text

    def _format_lora_response(self, agent_id: str, lora_config: dict) -> str:
        """Format LoRA configuration response text."""
        lora_text = f"LoRA Configuration for {agent_id}:\n"
        lora_text += f"Base Model: {lora_config.get('base_model', 'Unknown')}\n"
        lora_text += f"LoRA Rank: {lora_config.get('lora_rank', 'N/A')}\n"
        lora_text += f"LoRA Alpha: {lora_config.get('lora_alpha', 'N/A')}\n"
        lora_text += (
            f"Target Modules: {', '.join(lora_config.get('target_modules', []))}\n"
        )
        lora_text += f"Personality Weights: {len(lora_config.get('personality_weights', {}))} traits\n"
        lora_text += (
            f"Physical Weights: {len(lora_config.get('physical_weights', {}))} traits\n"
        )
        lora_text += f"Ability Weights: {len(lora_config.get('ability_weights', {}))} abilities\n"

        return lora_text
