#!/usr/bin/env python3
"""
ECS Input Validation

Comprehensive input validation for ECS backend endpoints to prevent
errors and improve performance by catching invalid inputs early.
"""

import logging
import re
from typing import Any, Dict, List, Optional, Union

from fastapi import HTTPException
from pydantic import BaseModel, Field, validator

logger = logging.getLogger(__name__)


class ECSValidationError(Exception):
    """Custom validation error for ECS endpoints."""

    pass


class AgentIDValidator:
    """Validator for agent IDs."""

    # Valid agent ID patterns
    PATTERNS = [
        r"^[a-zA-Z0-9_-]{3,50}$",  # Basic alphanumeric with hyphens/underscores
        r"^agent-[a-zA-Z0-9_-]{3,30}$",  # Agent prefixed
        r"^[a-zA-Z]+-[a-zA-Z0-9_-]{3,30}$",  # Spirit prefixed
    ]

    @classmethod
    def validate(cls, agent_id: str) -> bool:
        """Validate agent ID format.

        Args:
            agent_id: Agent ID to validate

        Returns:
            bool: True if valid, False otherwise
        """
        if not agent_id or not isinstance(agent_id, str):
            return False

        # Check against all patterns
        for pattern in cls.PATTERNS:
            if re.match(pattern, agent_id):
                return True

        return False

    @classmethod
    def validate_and_raise(cls, agent_id: str, field_name: str = "agent_id") -> str:
        """Validate agent ID and raise exception if invalid.

        Args:
            agent_id: Agent ID to validate
            field_name: Name of the field for error messages

        Returns:
            str: Validated agent ID

        Raises:
            HTTPException: If agent ID is invalid
        """
        if not cls.validate(agent_id):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}: '{agent_id}'. Must be 3-50 characters, alphanumeric with hyphens/underscores only.",
            )
        return agent_id


class SpiritValidator:
    """Validator for spirit names."""

    VALID_SPIRITS = {
        # Canines and Foxes
        "fox",
        "wolf",
        "coyote",
        "jackal",
        # Aquatic and Marine
        "otter",
        "dolphin",
        "whale",
        "shark",
        "octopus",
        "axolotl",
        # Birds of Prey and Flight
        "eagle",
        "falcon",
        "raven",
        "owl",
        "hawk",
        # Big Cats and Predators
        "lion",
        "tiger",
        "leopard",
        "jaguar",
        "cheetah",
        "lynx",
        # Bears and Large Mammals
        "bear",
        "panda",
        "elephant",
        "rhino",
        # Primates and Intelligence
        "ape",
        "monkey",
        "lemur",
        # Reptiles and Amphibians
        "snake",
        "lizard",
        "turtle",
        "frog",
        # Insects and Arachnids
        "spider",
        "ant",
        "bee",
        "mantis",
        "dragonfly",
        # Exotic and Unique
        "pangolin",
        "platypus",
        "narwhal",
        "quokka",
        "capybara",
        "aye",
        "kiwi",
        "toucan",
        "flamingo",
        "peacock",
        # Mythical and Legendary
        "dragon",
        "phoenix",
        "griffin",
        "unicorn",
        "kraken",
        "basilisk",
        "chimera",
        "sphinx",
        "manticore",
        "hydra",
        # Extraterrestrial and Cosmic
        "alien",
        "void",
        "star",
        "nebula",
        "blackhole",
        # Cryptids and Supernatural
        "yeti",
        "loch_ness",
        "chupacabra",
        "wendigo",
        "skinwalker",
    }

    @classmethod
    def validate(cls, spirit: str) -> bool:
        """Validate spirit name.

        Args:
            spirit: Spirit name to validate

        Returns:
            bool: True if valid, False otherwise
        """
        if not spirit or not isinstance(spirit, str):
            return False

        return spirit.lower() in cls.VALID_SPIRITS

    @classmethod
    def validate_and_raise(cls, spirit: str, field_name: str = "spirit") -> str:
        """Validate spirit name and raise exception if invalid.

        Args:
            spirit: Spirit name to validate
            field_name: Name of the field for error messages

        Returns:
            str: Validated spirit name

        Raises:
            HTTPException: If spirit name is invalid
        """
        if not cls.validate(spirit):
            valid_spirits = sorted(list(cls.VALID_SPIRITS))[:10]  # Show first 10
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}: '{spirit}'. Must be one of: {', '.join(valid_spirits)}... (and {len(cls.VALID_SPIRITS) - 10} more)",
            )
        return spirit.lower()


class StyleValidator:
    """Validator for naming styles."""

    VALID_STYLES = {
        "foundation",
        "exo",
        "hybrid",
        "cyberpunk",
        "mythological",
        "scientific",
    }

    @classmethod
    def validate(cls, style: str) -> bool:
        """Validate naming style.

        Args:
            style: Style name to validate

        Returns:
            bool: True if valid, False otherwise
        """
        if not style or not isinstance(style, str):
            return False

        return style.lower() in cls.VALID_STYLES

    @classmethod
    def validate_and_raise(cls, style: str, field_name: str = "style") -> str:
        """Validate naming style and raise exception if invalid.

        Args:
            style: Style name to validate
            field_name: Name of the field for error messages

        Returns:
            str: Validated style name

        Raises:
            HTTPException: If style name is invalid
        """
        if not cls.validate(style):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}: '{style}'. Must be one of: {', '.join(sorted(cls.VALID_STYLES))}",
            )
        return style.lower()


class CoordinateValidator:
    """Validator for coordinate values."""

    @classmethod
    def validate(
        cls, value: Union[int, float], field_name: str = "coordinate"
    ) -> float:
        """Validate coordinate value.

        Args:
            value: Coordinate value to validate
            field_name: Name of the field for error messages

        Returns:
            float: Validated coordinate value

        Raises:
            HTTPException: If coordinate is invalid
        """
        try:
            coord = float(value)
            if not (-10000 <= coord <= 10000):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid {field_name}: {coord}. Must be between -10000 and 10000",
                )
            return coord
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}: {value}. Must be a valid number",
            )


class InteractionTypeValidator:
    """Validator for interaction types."""

    VALID_TYPES = {
        "communication",
        "social",
        "collaboration",
        "conflict",
        "breeding",
        "mentoring",
        "learning",
        "playing",
    }

    @classmethod
    def validate(cls, interaction_type: str) -> bool:
        """Validate interaction type.

        Args:
            interaction_type: Interaction type to validate

        Returns:
            bool: True if valid, False otherwise
        """
        if not interaction_type or not isinstance(interaction_type, str):
            return False

        return interaction_type.lower() in cls.VALID_TYPES

    @classmethod
    def validate_and_raise(
        cls, interaction_type: str, field_name: str = "interaction_type"
    ) -> str:
        """Validate interaction type and raise exception if invalid.

        Args:
            interaction_type: Interaction type to validate
            field_name: Name of the field for error messages

        Returns:
            str: Validated interaction type

        Raises:
            HTTPException: If interaction type is invalid
        """
        if not cls.validate(interaction_type):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {field_name}: '{interaction_type}'. Must be one of: {', '.join(sorted(cls.VALID_TYPES))}",
            )
        return interaction_type.lower()


# Pydantic Models with Validation
class ValidatedAgentCreateRequest(BaseModel):
    """Validated request model for creating a new agent."""

    agent_id: str = Field(
        ..., min_length=3, max_length=50, description="Unique agent identifier"
    )
    spirit: Optional[str] = Field("fox", description="Agent spirit type")
    style: Optional[str] = Field("foundation", description="Naming style")
    name: Optional[str] = Field(None, max_length=100, description="Optional agent name")

    @validator("agent_id")
    def validate_agent_id(cls, v):
        return AgentIDValidator.validate_and_raise(v)

    @validator("spirit")
    def validate_spirit(cls, v):
        if v:
            return SpiritValidator.validate_and_raise(v)
        return v

    @validator("style")
    def validate_style(cls, v):
        if v:
            return StyleValidator.validate_and_raise(v)
        return v


class ValidatedOffspringCreateRequest(BaseModel):
    """Validated request model for creating offspring."""

    parent1_id: str = Field(..., description="First parent agent ID")
    parent2_id: str = Field(..., description="Second parent agent ID")
    offspring_id: str = Field(..., description="Offspring agent ID")

    @validator("parent1_id")
    def validate_parent1_id(cls, v):
        return AgentIDValidator.validate_and_raise(v, "parent1_id")

    @validator("parent2_id")
    def validate_parent2_id(cls, v):
        return AgentIDValidator.validate_and_raise(v, "parent2_id")

    @validator("offspring_id")
    def validate_offspring_id(cls, v):
        return AgentIDValidator.validate_and_raise(v, "offspring_id")


class ValidatedMoveRequest(BaseModel):
    """Validated request model for moving an agent."""

    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")

    @validator("x")
    def validate_x(cls, v):
        return CoordinateValidator.validate(v, "x coordinate")

    @validator("y")
    def validate_y(cls, v):
        return CoordinateValidator.validate(v, "y coordinate")


class ValidatedMoveTowardsRequest(BaseModel):
    """Validated request model for moving an agent towards another."""

    target_agent_id: str = Field(..., description="Target agent ID")
    distance: float = Field(50.0, ge=1.0, le=1000.0, description="Distance to maintain")

    @validator("target_agent_id")
    def validate_target_agent_id(cls, v):
        return AgentIDValidator.validate_and_raise(v, "target_agent_id")


class ValidatedInteractionRequest(BaseModel):
    """Validated request model for agent interactions."""

    agent2_id: str = Field(..., description="Second agent ID")
    interaction_type: str = Field("communication", description="Type of interaction")

    @validator("agent2_id")
    def validate_agent2_id(cls, v):
        return AgentIDValidator.validate_and_raise(v, "agent2_id")

    @validator("interaction_type")
    def validate_interaction_type(cls, v):
        return InteractionTypeValidator.validate_and_raise(v)


class ValidatedChatRequest(BaseModel):
    """Validated request model for chat messages."""

    receiver_id: str = Field(..., description="Receiver agent ID")
    message: str = Field(
        ..., min_length=1, max_length=1000, description="Message content"
    )
    interaction_type: str = Field("communication", description="Type of interaction")

    @validator("receiver_id")
    def validate_receiver_id(cls, v):
        return AgentIDValidator.validate_and_raise(v, "receiver_id")

    @validator("interaction_type")
    def validate_interaction_type(cls, v):
        return InteractionTypeValidator.validate_and_raise(v)


class ValidatedSpiritInhabitationRequest(BaseModel):
    """Validated request model for spirit inhabitation."""

    agent_id: str = Field(..., description="Agent ID for spirit inhabitation")
    confirm_inhabitation: bool = Field(True, description="Confirm inhabitation")
    include_genomic_payload: bool = Field(True, description="Include genomic payload")
    include_instructions: bool = Field(True, description="Include instructions")

    @validator("agent_id")
    def validate_agent_id(cls, v):
        return AgentIDValidator.validate_and_raise(v)


# Validation Functions
def validate_agent_exists(
    agent_id: str, agent_data: Optional[Dict[str, Any]] = None
) -> str:
    """Validate that an agent exists.

    Args:
        agent_id: Agent ID to validate
        agent_data: Agent data if already fetched

    Returns:
        str: Validated agent ID

    Raises:
        HTTPException: If agent doesn't exist
    """
    AgentIDValidator.validate_and_raise(agent_id)

    if agent_data is None:
        # This would typically check the database
        # For now, we'll assume the agent exists if the ID is valid
        pass

    return agent_id


def validate_spirit_exists(spirit: str) -> str:
    """Validate that a spirit exists in the system.

    Args:
        spirit: Spirit name to validate

    Returns:
        str: Validated spirit name

    Raises:
        HTTPException: If spirit doesn't exist
    """
    return SpiritValidator.validate_and_raise(spirit)


def validate_query_parameters(
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    max_results: Optional[int] = None,
) -> Dict[str, int]:
    """Validate query parameters.

    Args:
        limit: Limit parameter
        offset: Offset parameter
        max_results: Max results parameter

    Returns:
        Dict[str, int]: Validated parameters

    Raises:
        HTTPException: If parameters are invalid
    """
    validated = {}

    if limit is not None:
        if not isinstance(limit, int) or limit < 1 or limit > 1000:
            raise HTTPException(
                status_code=400, detail="Invalid limit: must be between 1 and 1000"
            )
        validated["limit"] = limit

    if offset is not None:
        if not isinstance(offset, int) or offset < 0:
            raise HTTPException(status_code=400, detail="Invalid offset: must be >= 0")
        validated["offset"] = offset

    if max_results is not None:
        if not isinstance(max_results, int) or max_results < 1 or max_results > 100:
            raise HTTPException(
                status_code=400, detail="Invalid max_results: must be between 1 and 100"
            )
        validated["max_results"] = max_results

    return validated


def validate_breeding_parameters(
    enabled: Optional[bool] = None,
    max_depth: Optional[int] = None,
    radius: Optional[float] = None,
) -> Dict[str, Any]:
    """Validate breeding-related parameters.

    Args:
        enabled: Breeding enabled flag
        max_depth: Maximum lineage depth
        radius: Search radius

    Returns:
        Dict[str, Any]: Validated parameters

    Raises:
        HTTPException: If parameters are invalid
    """
    validated = {}

    if enabled is not None:
        if not isinstance(enabled, bool):
            raise HTTPException(
                status_code=400, detail="Invalid enabled: must be boolean"
            )
        validated["enabled"] = enabled

    if max_depth is not None:
        if not isinstance(max_depth, int) or max_depth < 1 or max_depth > 10:
            raise HTTPException(
                status_code=400, detail="Invalid max_depth: must be between 1 and 10"
            )
        validated["max_depth"] = max_depth

    if radius is not None:
        if not isinstance(radius, (int, float)) or radius < 1.0 or radius > 1000.0:
            raise HTTPException(
                status_code=400, detail="Invalid radius: must be between 1.0 and 1000.0"
            )
        validated["radius"] = float(radius)

    return validated


# Error Handling Utilities
def handle_validation_error(error: Exception, endpoint: str) -> HTTPException:
    """Handle validation errors with proper HTTP status codes.

    Args:
        error: The validation error
        endpoint: The endpoint where the error occurred

    Returns:
        HTTPException: Properly formatted HTTP exception
    """
    if isinstance(error, HTTPException):
        return error

    if isinstance(error, ECSValidationError):
        return HTTPException(status_code=400, detail=str(error))

    # Log unexpected errors
    logger.error(f"Unexpected validation error in {endpoint}: {error}")

    return HTTPException(
        status_code=500, detail=f"Internal validation error in {endpoint}"
    )


def validate_endpoint_inputs(endpoint: str, **kwargs) -> Dict[str, Any]:
    """Validate inputs for a specific endpoint.

    Args:
        endpoint: The endpoint name
        **kwargs: Input parameters to validate

    Returns:
        Dict[str, Any]: Validated inputs

    Raises:
        HTTPException: If validation fails
    """
    validated = {}

    try:
        # Agent ID validation
        if "agent_id" in kwargs:
            validated["agent_id"] = AgentIDValidator.validate_and_raise(
                kwargs["agent_id"]
            )

        if "agent1_id" in kwargs:
            validated["agent1_id"] = AgentIDValidator.validate_and_raise(
                kwargs["agent1_id"], "agent1_id"
            )

        if "agent2_id" in kwargs:
            validated["agent2_id"] = AgentIDValidator.validate_and_raise(
                kwargs["agent2_id"], "agent2_id"
            )

        # Spirit validation
        if "spirit" in kwargs and kwargs["spirit"]:
            validated["spirit"] = SpiritValidator.validate_and_raise(kwargs["spirit"])

        # Style validation
        if "style" in kwargs and kwargs["style"]:
            validated["style"] = StyleValidator.validate_and_raise(kwargs["style"])

        # Coordinate validation
        if "x" in kwargs:
            validated["x"] = CoordinateValidator.validate(kwargs["x"], "x coordinate")

        if "y" in kwargs:
            validated["y"] = CoordinateValidator.validate(kwargs["y"], "y coordinate")

        # Interaction type validation
        if "interaction_type" in kwargs:
            validated["interaction_type"] = InteractionTypeValidator.validate_and_raise(
                kwargs["interaction_type"]
            )

        # Query parameters validation
        query_params = validate_query_parameters(
            limit=kwargs.get("limit"),
            offset=kwargs.get("offset"),
            max_results=kwargs.get("max_results"),
        )
        validated.update(query_params)

        # Breeding parameters validation
        breeding_params = validate_breeding_parameters(
            enabled=kwargs.get("enabled"),
            max_depth=kwargs.get("max_depth"),
            radius=kwargs.get("radius"),
        )
        validated.update(breeding_params)

        return validated

    except Exception as e:
        raise handle_validation_error(e, endpoint)


# Test function
def test_validation():
    """Test the validation functions."""
    print("🐍 Mysterious-Prime-67 ECS Input Validation Test")
    print("=" * 50)

    # Test agent ID validation
    print("\n✅ Testing Agent ID Validation:")
    valid_ids = ["agent-123", "fox-alpha-42", "wolf_beta_99", "test-agent"]
    invalid_ids = ["ab", "invalid@id", "", "a" * 100]

    for agent_id in valid_ids:
        try:
            result = AgentIDValidator.validate_and_raise(agent_id)
            print(f"   ✅ '{agent_id}' -> '{result}'")
        except HTTPException as e:
            print(f"   ❌ '{agent_id}' -> {e.detail}")

    for agent_id in invalid_ids:
        try:
            result = AgentIDValidator.validate_and_raise(agent_id)
            print(f"   ❌ '{agent_id}' -> '{result}' (should have failed)")
        except HTTPException as e:
            print(f"   ✅ '{agent_id}' -> {e.detail}")

    # Test spirit validation
    print("\n✅ Testing Spirit Validation:")
    valid_spirits = ["fox", "wolf", "dragon", "phoenix"]
    invalid_spirits = ["invalid", "cat", "dog", ""]

    for spirit in valid_spirits:
        try:
            result = SpiritValidator.validate_and_raise(spirit)
            print(f"   ✅ '{spirit}' -> '{result}'")
        except HTTPException as e:
            print(f"   ❌ '{spirit}' -> {e.detail}")

    for spirit in invalid_spirits:
        try:
            result = SpiritValidator.validate_and_raise(spirit)
            print(f"   ❌ '{spirit}' -> '{result}' (should have failed)")
        except HTTPException as e:
            print(f"   ✅ '{spirit}' -> {e.detail}")

    # Test Pydantic models
    print("\n✅ Testing Pydantic Models:")
    try:
        request = ValidatedAgentCreateRequest(
            agent_id="test-agent-123", spirit="fox", style="foundation"
        )
        print(f"   ✅ Valid request: {request}")
    except Exception as e:
        print(f"   ❌ Valid request failed: {e}")

    try:
        request = ValidatedAgentCreateRequest(
            agent_id="ab",  # Too short
            spirit="invalid",  # Invalid spirit
            style="invalid",  # Invalid style
        )
        print(f"   ❌ Invalid request succeeded: {request} (should have failed)")
    except Exception as e:
        print(f"   ✅ Invalid request properly rejected: {e}")

    print("\n🎉 Validation tests completed!")


if __name__ == "__main__":
    test_validation()
