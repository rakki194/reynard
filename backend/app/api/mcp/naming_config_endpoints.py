"""Agent Naming Configuration API Endpoints
=======================================

Backend API endpoints for managing dynamic agent naming configuration.
Provides REST API access to naming system configuration management.
"""

import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp/naming-config", tags=["naming_config"])


class NamingConfigResponse(BaseModel):
    """Response model for naming configuration."""

    version: str = Field(..., description="Configuration version")
    last_updated: str = Field(..., description="Last update timestamp")
    default_scheme: str = Field(..., description="Default naming scheme")
    default_style: str = Field(..., description="Default naming style")
    weighted_distribution: bool = Field(..., description="Use weighted distribution")
    enabled_schemes: list[str] = Field(..., description="List of enabled schemes")
    enabled_styles: list[str] = Field(..., description="List of enabled styles")
    enabled_spirits: list[str] = Field(..., description="List of enabled spirits")
    total_schemes: int = Field(..., description="Total number of schemes")
    total_styles: int = Field(..., description="Total number of styles")
    total_spirits: int = Field(..., description="Total number of spirits")
    total_components: int = Field(..., description="Total number of components")
    total_generations: int = Field(..., description="Total number of generations")


class SchemeConfigResponse(BaseModel):
    """Response model for scheme configuration."""

    name: str = Field(..., description="Scheme name")
    enabled: bool = Field(..., description="Whether scheme is enabled")
    description: str = Field(..., description="Scheme description")
    default_style: str | None = Field(None, description="Default style for scheme")
    supported_styles: list[str] = Field(..., description="Supported styles")


class StyleConfigResponse(BaseModel):
    """Response model for style configuration."""

    name: str = Field(..., description="Style name")
    enabled: bool = Field(..., description="Whether style is enabled")
    description: str = Field(..., description="Style description")
    format_template: str = Field(..., description="Name format template")
    components: list[str] = Field(..., description="Required components")


class SpiritConfigResponse(BaseModel):
    """Response model for spirit configuration."""

    name: str = Field(..., description="Spirit name")
    enabled: bool = Field(..., description="Whether spirit is enabled")
    description: str = Field(..., description="Spirit description")
    base_names: list[str] = Field(..., description="Available base names")
    generation_numbers: list[int] = Field(..., description="Generation numbers")
    weight: float = Field(..., description="Selection weight")


class ConfigUpdateRequest(BaseModel):
    """Request model for configuration updates."""

    default_scheme: str | None = Field(None, description="New default scheme")
    default_style: str | None = Field(None, description="New default style")
    weighted_distribution: bool | None = Field(
        None,
        description="Weighted distribution setting",
    )


class ConfigValidationResponse(BaseModel):
    """Response model for configuration validation."""

    valid: bool = Field(..., description="Whether configuration is valid")
    issues: list[str] = Field(..., description="List of validation issues")


async def _get_config_manager():
    """Get the dynamic configuration manager."""
    try:
        from reynard_agent_naming.agent_naming.dynamic_config import (
            DynamicConfigManager,
        )

        return DynamicConfigManager()
    except ImportError as e:
        logger.error(f"Failed to import DynamicConfigManager: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Agent naming configuration service not available",
        )


@router.get("/", response_model=NamingConfigResponse)
async def get_naming_config() -> NamingConfigResponse:
    """Get current naming system configuration."""
    try:
        config_manager = await _get_config_manager()
        config = config_manager.get_config()

        return NamingConfigResponse(
            version=config.version,
            last_updated=config.last_updated,
            default_scheme=config.default_scheme,
            default_style=config.default_style,
            weighted_distribution=config.weighted_distribution,
            enabled_schemes=list(config.get_enabled_schemes().keys()),
            enabled_styles=list(config.get_enabled_styles().keys()),
            enabled_spirits=list(config.get_enabled_spirits().keys()),
            total_schemes=len(config.schemes),
            total_styles=len(config.styles),
            total_spirits=len(config.spirits),
            total_components=len(config.components),
            total_generations=len(config.generations),
        )
    except Exception as e:
        logger.exception("Failed to get naming configuration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get naming configuration: {e}",
        )


@router.get("/schemes", response_model=list[SchemeConfigResponse])
async def get_available_schemes() -> list[SchemeConfigResponse]:
    """Get list of available naming schemes."""
    try:
        config_manager = await _get_config_manager()
        config = config_manager.get_config()

        schemes = []
        for name, scheme_config in config.schemes.items():
            schemes.append(
                SchemeConfigResponse(
                    name=scheme_config.name,
                    enabled=scheme_config.enabled,
                    description=scheme_config.description,
                    default_style=scheme_config.default_style,
                    supported_styles=scheme_config.supported_styles,
                ),
            )

        return schemes
    except Exception as e:
        logger.exception("Failed to get available schemes")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available schemes: {e}",
        )


@router.get("/styles", response_model=list[StyleConfigResponse])
async def get_available_styles() -> list[StyleConfigResponse]:
    """Get list of available naming styles."""
    try:
        config_manager = await _get_config_manager()
        config = config_manager.get_config()

        styles = []
        for name, style_config in config.styles.items():
            styles.append(
                StyleConfigResponse(
                    name=style_config.name,
                    enabled=style_config.enabled,
                    description=style_config.description,
                    format_template=style_config.format_template,
                    components=style_config.components,
                ),
            )

        return styles
    except Exception as e:
        logger.exception("Failed to get available styles")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available styles: {e}",
        )


@router.get("/spirits", response_model=list[SpiritConfigResponse])
async def get_available_spirits() -> list[SpiritConfigResponse]:
    """Get list of available animal spirits."""
    try:
        config_manager = await _get_config_manager()
        config = config_manager.get_config()

        spirits = []
        for name, spirit_config in config.spirits.items():
            spirits.append(
                SpiritConfigResponse(
                    name=spirit_config.name,
                    enabled=spirit_config.enabled,
                    description=spirit_config.description,
                    base_names=spirit_config.base_names,
                    generation_numbers=spirit_config.generation_numbers,
                    weight=spirit_config.weight,
                ),
            )

        return spirits
    except Exception as e:
        logger.exception("Failed to get available spirits")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available spirits: {e}",
        )


@router.put("/default-scheme/{scheme_name}")
async def set_default_scheme(scheme_name: str) -> dict[str, str]:
    """Set the default naming scheme."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.set_default_scheme(scheme_name)

        if success:
            return {"message": f"Default scheme set to '{scheme_name}'"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme '{scheme_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to set default scheme")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set default scheme: {e}",
        )


@router.put("/default-style/{style_name}")
async def set_default_style(style_name: str) -> dict[str, str]:
    """Set the default naming style."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.set_default_style(style_name)

        if success:
            return {"message": f"Default style set to '{style_name}'"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style '{style_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to set default style")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set default style: {e}",
        )


@router.put("/schemes/{scheme_name}/enable")
async def enable_scheme(scheme_name: str) -> dict[str, str]:
    """Enable a naming scheme."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.enable_scheme(scheme_name)

        if success:
            return {"message": f"Scheme '{scheme_name}' enabled"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme '{scheme_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to enable scheme")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable scheme: {e}",
        )


@router.put("/schemes/{scheme_name}/disable")
async def disable_scheme(scheme_name: str) -> dict[str, str]:
    """Disable a naming scheme."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.disable_scheme(scheme_name)

        if success:
            return {"message": f"Scheme '{scheme_name}' disabled"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme '{scheme_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to disable scheme")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable scheme: {e}",
        )


@router.put("/styles/{style_name}/enable")
async def enable_style(style_name: str) -> dict[str, str]:
    """Enable a naming style."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.enable_style(style_name)

        if success:
            return {"message": f"Style '{style_name}' enabled"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style '{style_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to enable style")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable style: {e}",
        )


@router.put("/styles/{style_name}/disable")
async def disable_style(style_name: str) -> dict[str, str]:
    """Disable a naming style."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.disable_style(style_name)

        if success:
            return {"message": f"Style '{style_name}' disabled"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style '{style_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to disable style")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable style: {e}",
        )


@router.put("/spirits/{spirit_name}/enable")
async def enable_spirit(spirit_name: str) -> dict[str, str]:
    """Enable an animal spirit."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.enable_spirit(spirit_name)

        if success:
            return {"message": f"Spirit '{spirit_name}' enabled"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Spirit '{spirit_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to enable spirit")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable spirit: {e}",
        )


@router.put("/spirits/{spirit_name}/disable")
async def disable_spirit(spirit_name: str) -> dict[str, str]:
    """Disable an animal spirit."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.disable_spirit(spirit_name)

        if success:
            return {"message": f"Spirit '{spirit_name}' disabled"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Spirit '{spirit_name}' not found",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to disable spirit")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable spirit: {e}",
        )


@router.post("/reload")
async def reload_config() -> dict[str, str]:
    """Reload naming configuration from file."""
    try:
        config_manager = await _get_config_manager()
        success = config_manager.reload_config()

        if success:
            return {"message": "Configuration reloaded successfully"}
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reload configuration",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to reload configuration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload configuration: {e}",
        )


@router.get("/validate", response_model=ConfigValidationResponse)
async def validate_config() -> ConfigValidationResponse:
    """Validate current naming configuration."""
    try:
        config_manager = await _get_config_manager()
        issues = config_manager.validate_config()

        return ConfigValidationResponse(valid=len(issues) == 0, issues=issues)
    except Exception as e:
        logger.exception("Failed to validate configuration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate configuration: {e}",
        )


@router.put("/update")
async def update_config(request: ConfigUpdateRequest) -> dict[str, str]:
    """Update naming configuration settings."""
    try:
        config_manager = await _get_config_manager()

        updates = {}
        if request.default_scheme is not None:
            updates["default_scheme"] = request.default_scheme
        if request.default_style is not None:
            updates["default_style"] = request.default_style
        if request.weighted_distribution is not None:
            updates["weighted_distribution"] = request.weighted_distribution

        success = config_manager.update_config(updates)

        if success:
            return {"message": "Configuration updated successfully"}
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update configuration",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to update configuration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update configuration: {e}",
        )
