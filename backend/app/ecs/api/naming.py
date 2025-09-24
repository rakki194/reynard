"""ECS Naming System API
=====================

Name generation, spirit management, and naming configuration endpoints.
"""

import json
import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from ..cache_decorators import (
    cache_naming_components,
    cache_naming_config,
    cache_naming_spirits,
)
from ..database import NamingComponent, NamingConfig, NamingSpirit, ecs_db
from ..postgres_service import get_postgres_ecs_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/naming", tags=["ECS Naming"])


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
                status_code=404, detail=f"Data file {filename} not found",
            )

        with file_path.open(encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.exception("Error parsing JSON from %s", filename)
        raise HTTPException(
            status_code=500, detail=f"Invalid JSON in {filename}",
        ) from e
    except Exception as e:
        logger.exception("Error loading data from %s", filename)
        raise HTTPException(status_code=500, detail=f"Failed to load {filename}") from e


def _get_race_data_from_db(spirit: str) -> dict[str, Any]:
    """Load race data for a specific spirit from the database."""
    try:
        with ecs_db.get_session() as session:
            naming_spirit = (
                session.query(NamingSpirit).filter(NamingSpirit.name == spirit).first()
            )

            if not naming_spirit:
                raise HTTPException(
                    status_code=404, detail=f"Race data for spirit '{spirit}' not found",
                )

            return {
                "name": naming_spirit.name,
                "category": naming_spirit.category,
                "description": naming_spirit.description,
                "emoji": naming_spirit.emoji,
                "traits": naming_spirit.traits,
                "names": naming_spirit.base_names,
                "generation_numbers": naming_spirit.generation_numbers,
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error loading race data for %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to load race data for {spirit}",
        ) from e


@cache_naming_spirits(ttl=1800)
async def _get_all_races_data_from_db() -> dict[str, Any]:
    """Load all race data from the database with full details."""
    try:
        with ecs_db.get_session() as session:
            naming_spirits = session.query(NamingSpirit).all()
            all_races = {}

            for spirit in naming_spirits:
                all_races[spirit.name] = {
                    "name": spirit.name,
                    "category": spirit.category,
                    "description": spirit.description,
                    "emoji": spirit.emoji,
                    "traits": spirit.traits,
                    "names": spirit.base_names,
                    "generation_numbers": spirit.generation_numbers,
                }

            return {"races": all_races}
    except Exception as e:
        logger.exception("Error loading races data")
        raise HTTPException(status_code=500, detail="Failed to load races data") from e


@cache_naming_components(ttl=1800)
async def _get_naming_components_from_db() -> dict[str, Any]:
    """Load naming components from the database."""
    try:
        with ecs_db.get_session() as session:
            components = session.query(NamingComponent).all()
            components_dict = {}

            for component in components:
                if component.component_type not in components_dict:
                    components_dict[component.component_type] = {
                        "category": component.component_type,
                        "description": f"Naming components for {component.component_type}",
                        "enabled": component.enabled,
                        "values": [],
                    }

                if component.enabled:
                    components_dict[component.component_type]["values"].append(
                        component.component_value,
                    )

            return components_dict
    except Exception as e:
        logger.exception("Error loading naming components")
        raise HTTPException(
            status_code=500, detail="Failed to load naming components",
        ) from e


@cache_naming_config(ttl=3600)
async def _get_naming_config_from_db() -> dict[str, Any]:
    """Load naming configuration from the database."""
    try:
        with ecs_db.get_session() as session:
            configs = session.query(NamingConfig).all()
            config_dict = {}

            for config in configs:
                config_dict[config.config_key] = config.config_value

            return config_dict
    except Exception as e:
        logger.exception("Error loading naming config")
        raise HTTPException(
            status_code=500, detail="Failed to load naming config",
        ) from e


# Animal Spirits Endpoints


@router.get("/animal-spirits")
async def get_animal_spirits() -> dict[str, Any]:
    """Get all animal spirit names organized by spirit type."""
    try:
        return await _get_all_races_data_from_db()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting animal spirits")
        raise HTTPException(
            status_code=500, detail="Failed to get animal spirits",
        ) from e


@router.get("/animal-spirits/{spirit}")
async def get_animal_spirit_names(spirit: str) -> dict[str, Any]:
    """Get names for a specific animal spirit."""
    try:
        race_data = _get_race_data_from_db(spirit)
        return {"spirit": spirit, "names": race_data["names"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting names for spirit %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to get names for spirit {spirit}",
        ) from e


# Naming Components Endpoints


@router.get("/components")
async def get_naming_components() -> dict[str, Any]:
    """Get all naming components (suffixes, prefixes, etc.)."""
    try:
        return await _get_naming_components_from_db()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming components")
        raise HTTPException(
            status_code=500, detail="Failed to get naming components",
        ) from e


@router.get("/components/{component_type}")
async def get_naming_component_type(component_type: str) -> dict[str, Any]:
    """Get a specific type of naming component."""
    try:
        components = await _get_naming_components_from_db()
        if component_type not in components:
            raise HTTPException(
                status_code=404, detail=f"Component type '{component_type}' not found",
            )
        return components[component_type]
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting component type %s", component_type)
        raise HTTPException(
            status_code=500, detail=f"Failed to get component type {component_type}",
        ) from e


# Configuration Endpoints


@router.get("/config")
async def get_naming_config() -> dict[str, Any]:
    """Get the complete naming configuration."""
    try:
        return await _get_naming_config_from_db()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming config")
        raise HTTPException(
            status_code=500, detail="Failed to get naming config",
        ) from e


@router.get("/config/schemes")
async def get_naming_schemes() -> dict[str, Any]:
    """Get all available naming schemes."""
    try:
        config = await _get_naming_config_from_db()
        return {"schemes": config.get("schemes", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming schemes")
        raise HTTPException(
            status_code=500, detail="Failed to get naming schemes",
        ) from e


@router.get("/config/styles")
async def get_naming_styles() -> dict[str, Any]:
    """Get all available naming styles."""
    try:
        config = await _get_naming_config_from_db()
        return {"styles": config.get("styles", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming styles")
        raise HTTPException(
            status_code=500, detail="Failed to get naming styles",
        ) from e


@router.get("/config/spirits")
async def get_naming_spirits() -> dict[str, Any]:
    """Get all available spirits with their configurations from database."""
    try:
        # Get database service
        db = get_postgres_ecs_service()

        # Get all naming spirits from database
        return await db.get_naming_spirits()

    except Exception as e:
        logger.exception("Error getting naming spirits from database")
        raise HTTPException(
            status_code=500, detail="Failed to get naming spirits from database",
        ) from e


# Generation Numbers Endpoints


@router.get("/generation-numbers")
async def get_generation_numbers() -> dict[str, Any]:
    """Get generation numbers for all spirits from database."""
    try:
        # Get database service
        db = get_postgres_ecs_service()

        # Get generation numbers from database
        return await db.get_generation_numbers()

    except Exception as e:
        logger.exception("Error getting generation numbers from database")
        raise HTTPException(
            status_code=500, detail="Failed to get generation numbers from database",
        ) from e


@router.get("/generation-numbers/{spirit}")
async def get_spirit_generation_numbers(spirit: str) -> dict[str, Any]:
    """Get generation numbers for a specific spirit."""
    try:
        race_data = _get_race_data_from_db(spirit)
        return {"spirit": spirit, "generation_numbers": race_data["generation_numbers"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting generation numbers for spirit %s", spirit)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get generation numbers for spirit {spirit}",
        ) from e


# Enums and Categories Endpoints


@router.get("/enums")
async def get_naming_enums() -> dict[str, Any]:
    """Get all naming enums and categories from database."""
    try:
        # Get database session
        db = get_postgres_ecs_service()

        # Get all naming spirits
        spirits = await db.get_naming_spirits()

        # Get all naming components (styles, etc.)
        components = await db.get_naming_components()

        # Get naming config
        config = await db.get_naming_config()

        # Build enums response
        return {
            "spirits": spirits,
            "components": components,
            "config": config,
            "styles": {
                "foundation": {
                    "enabled": True,
                    "description": "Asimov-inspired strategic names",
                },
                "exo": {
                    "enabled": True,
                    "description": "Combat/technical operational names",
                },
                "hybrid": {
                    "enabled": True,
                    "description": "Mythological/historical references",
                },
                "cyberpunk": {
                    "enabled": True,
                    "description": "Tech-prefixed cyber names",
                },
                "mythological": {
                    "enabled": True,
                    "description": "Divine/mystical references",
                },
                "scientific": {
                    "enabled": True,
                    "description": "Latin scientific classifications",
                },
            },
        }

    except Exception as e:
        logger.exception("Error getting naming enums from database")
        raise HTTPException(
            status_code=500, detail="Failed to get naming enums from database",
        ) from e


# Characters Endpoints


@router.get("/characters")
async def get_characters() -> dict[str, Any]:
    """Get all stored characters."""
    try:
        return _load_json_data("characters.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting characters")
        raise HTTPException(status_code=500, detail="Failed to get characters") from e


@router.get("/characters/{character_id}")
async def get_character(character_id: str) -> dict[str, Any]:
    """Get a specific character by ID."""
    try:
        data = _load_json_data("characters.json")
        if character_id not in data:
            raise HTTPException(
                status_code=404, detail=f"Character '{character_id}' not found",
            )
        return {"character_id": character_id, "character": data[character_id]}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting character %s", character_id)
        raise HTTPException(
            status_code=500, detail=f"Failed to get character {character_id}",
        ) from e
