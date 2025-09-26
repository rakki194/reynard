"""ECS Trait System API
====================

Trait definitions, spirit profiles, and trait configuration endpoints.
"""

import json
import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/traits", tags=["ECS Traits"])


def _get_data_file_path(filename: str) -> Path:
    """Get the path to a data file in the ECS data directory."""
    backend_dir = Path(__file__).parent.parent.parent.parent
    return backend_dir / "data" / "ecs" / filename


def _load_json_data(filename: str):
    """Load JSON data from the ECS data directory."""
    try:
        file_path = _get_data_file_path(filename)
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Data file {filename} not found",
            )

        with file_path.open(encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.exception("Error parsing JSON from %s", filename)
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON in {filename}",
        ) from e
    except Exception as e:
        logger.exception("Error loading data from %s", filename)
        raise HTTPException(status_code=500, detail=f"Failed to load {filename}") from e


# Personality Traits Endpoints


@router.get("/personality")
async def get_personality_traits() -> dict[str, Any]:
    """Get all personality trait definitions."""
    try:
        return _load_json_data("personality_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting personality traits")
        raise HTTPException(
            status_code=500,
            detail="Failed to get personality traits",
        ) from e


@router.get("/personality/{spirit}")
async def get_spirit_personality_traits(spirit: str) -> dict[str, Any]:
    """Get personality traits for a specific spirit."""
    try:
        data = _load_json_data("personality_traits.json")
        if spirit not in data.get("spirit_base_traits", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_traits"][spirit],
            "trait_definitions": data["personality_traits"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting personality traits for spirit %s", spirit)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get personality traits for spirit {spirit}",
        ) from e


# Physical Traits Endpoints


@router.get("/physical")
async def get_physical_traits() -> dict[str, Any]:
    """Get all physical trait definitions."""
    try:
        return _load_json_data("physical_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting physical traits")
        raise HTTPException(
            status_code=500,
            detail="Failed to get physical traits",
        ) from e


@router.get("/physical/{spirit}")
async def get_spirit_physical_traits(spirit: str) -> dict[str, Any]:
    """Get physical traits for a specific spirit."""
    try:
        data = _load_json_data("physical_traits.json")
        if spirit not in data.get("spirit_base_physical", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_physical"][spirit],
            "trait_definitions": data["physical_traits"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting physical traits for spirit %s", spirit)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get physical traits for spirit {spirit}",
        ) from e


# Ability Traits Endpoints


@router.get("/abilities")
async def get_ability_traits() -> dict[str, Any]:
    """Get all ability trait definitions."""
    try:
        return _load_json_data("ability_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting ability traits")
        raise HTTPException(
            status_code=500,
            detail="Failed to get ability traits",
        ) from e


@router.get("/abilities/{spirit}")
async def get_spirit_ability_traits(spirit: str) -> dict[str, Any]:
    """Get ability traits for a specific spirit."""
    try:
        data = _load_json_data("ability_traits.json")
        if spirit not in data.get("spirit_base_abilities", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_abilities"][spirit],
            "trait_definitions": data["ability_traits"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting ability traits for spirit %s", spirit)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get ability traits for spirit {spirit}",
        ) from e


# Trait Configuration Endpoints


@router.get("/config")
async def get_trait_config() -> dict[str, Any]:
    """Get the complete trait system configuration."""
    try:
        return _load_json_data("trait_config.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting trait config")
        raise HTTPException(status_code=500, detail="Failed to get trait config") from e


@router.get("/spirit/{spirit}")
async def get_spirit_trait_profile(spirit: str) -> dict[str, Any]:
    """Get complete trait profile for a specific spirit."""
    try:
        config_data = _load_json_data("trait_config.json")
        personality_data = _load_json_data("personality_traits.json")
        physical_data = _load_json_data("physical_traits.json")
        ability_data = _load_json_data("ability_traits.json")

        if spirit not in config_data.get("spirit_configurations", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")

        spirit_config = config_data["spirit_configurations"][spirit]

        return {
            "spirit": spirit,
            "configuration": spirit_config,
            "personality_traits": personality_data["spirit_base_traits"].get(
                spirit,
                {},
            ),
            "physical_traits": physical_data["spirit_base_physical"].get(spirit, {}),
            "ability_traits": ability_data["spirit_base_abilities"].get(spirit, {}),
            "trait_definitions": {
                "personality": personality_data["personality_traits"],
                "physical": physical_data["physical_traits"],
                "abilities": ability_data["ability_traits"],
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting trait profile for spirit %s", spirit)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get trait profile for spirit {spirit}",
        ) from e
