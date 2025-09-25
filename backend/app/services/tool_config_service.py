#!/usr/bin/env python3
"""
PostgreSQL Tool Configuration Service
====================================

Service for managing tool configurations using PostgreSQL database.
Provides CRUD operations, audit trail, and configuration management.

Author: Reynard Development Team
Version: 1.0.0
"""

import json
import logging
from datetime import datetime, UTC
from typing import Any, Dict, List, Optional, Set

from sqlalchemy import and_, desc, func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db_session
import logging
from app.models.tool_config_models import (
    Tool,
    ToolCategory,
    ToolCategoryEnum,
    ToolConfigHistory,
    ToolConfiguration,
)

logger = logging.getLogger(__name__)


class ToolConfigService:
    """PostgreSQL-based tool configuration service."""

    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the tool configuration service."""
        self.db_session = db_session
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 300  # 5 minutes

    def _get_db_session(self) -> Session:
        """Get database session."""
        if self.db_session:
            return self.db_session
        return next(get_db_session())

    def get_all_tools(self, include_disabled: bool = False) -> List[Dict[str, Any]]:
        """Get all tools with optional filtering."""
        db = self._get_db_session()
        try:
            query = db.query(Tool).options(joinedload(Tool.category))
            
            if not include_disabled:
                query = query.filter(Tool.enabled == True)
            
            tools = query.order_by(Tool.name).all()
            return [tool.to_dict() for tool in tools]
        except Exception as e:
            logger.error(f"Failed to get all tools: {e}")
            return []
        finally:
            if not self.db_session:
                db.close()

    def get_tool_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get a specific tool by name."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).options(joinedload(Tool.category)).filter(Tool.name == name).first()
            return tool.to_dict() if tool else None
        except Exception as e:
            logger.error(f"Failed to get tool {name}: {e}")
            return None
        finally:
            if not self.db_session:
                db.close()

    def get_tools_by_category(self, category: str, include_disabled: bool = False) -> List[Dict[str, Any]]:
        """Get tools by category."""
        db = self._get_db_session()
        try:
            query = db.query(Tool).options(joinedload(Tool.category)).join(ToolCategory).filter(
                ToolCategory.name == ToolCategoryEnum(category.upper())
            )
            
            if not include_disabled:
                query = query.filter(Tool.enabled == True)
            
            tools = query.order_by(Tool.name).all()
            return [tool.to_dict() for tool in tools]
        except Exception as e:
            logger.error(f"Failed to get tools by category {category}: {e}")
            return []
        finally:
            if not self.db_session:
                db.close()

    def get_enabled_tools(self) -> Set[str]:
        """Get set of enabled tool names."""
        db = self._get_db_session()
        try:
            tools = db.query(Tool.name).filter(Tool.enabled == True).all()
            return {tool.name for tool in tools}
        except Exception as e:
            logger.error(f"Failed to get enabled tools: {e}")
            return set()
        finally:
            if not self.db_session:
                db.close()

    def is_tool_enabled(self, name: str) -> bool:
        """Check if a tool is enabled."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).filter(Tool.name == name).first()
            return tool.enabled if tool else False
        except Exception as e:
            logger.error(f"Failed to check if tool {name} is enabled: {e}")
            return False
        finally:
            if not self.db_session:
                db.close()

    def enable_tool(self, name: str, changed_by: str = "system") -> Optional[Dict[str, Any]]:
        """Enable a tool."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).filter(Tool.name == name).first()
            if not tool:
                logger.warning(f"Tool {name} not found")
                return False
            
            if tool.enabled:
                return tool.to_dict()  # Already enabled
            
            # Record history
            self._record_change(db, tool, "enabled", {"enabled": False}, {"enabled": True}, changed_by)
            
            tool.enabled = True
            tool.updated_at = datetime.now(UTC)
            db.commit()
            
            logger.info(f"Enabled tool: {name}")
            return tool.to_dict()
        except Exception as e:
            logger.error(f"Failed to enable tool {name}: {e}")
            db.rollback()
            return False
        finally:
            if not self.db_session:
                db.close()

    def disable_tool(self, name: str, changed_by: str = "system") -> Optional[Dict[str, Any]]:
        """Disable a tool."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).filter(Tool.name == name).first()
            if not tool:
                logger.warning(f"Tool {name} not found")
                return False
            
            if not tool.enabled:
                return tool.to_dict()  # Already disabled
            
            # Record history
            self._record_change(db, tool, "disabled", {"enabled": True}, {"enabled": False}, changed_by)
            
            tool.enabled = False
            tool.updated_at = datetime.now(UTC)
            db.commit()
            
            logger.info(f"Disabled tool: {name}")
            return tool.to_dict()
        except Exception as e:
            logger.error(f"Failed to disable tool {name}: {e}")
            db.rollback()
            return False
        finally:
            if not self.db_session:
                db.close()

    def toggle_tool(self, name: str, changed_by: str = "system") -> bool:
        """Toggle a tool's enabled state."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).filter(Tool.name == name).first()
            if not tool:
                logger.warning(f"Tool {name} not found")
                return False
            
            old_enabled = tool.enabled
            new_enabled = not old_enabled
            
            # Record history
            self._record_change(db, tool, "toggled", {"enabled": old_enabled}, {"enabled": new_enabled}, changed_by)
            
            tool.enabled = new_enabled
            tool.updated_at = datetime.now(UTC)
            db.commit()
            
            logger.info(f"Toggled tool {name} to {'enabled' if new_enabled else 'disabled'}")
            return new_enabled
        except Exception as e:
            logger.error(f"Failed to toggle tool {name}: {e}")
            db.rollback()
            return False
        finally:
            if not self.db_session:
                db.close()

    def create_tool(self, tool_data: Dict[str, Any], changed_by: str = "system") -> Optional[Dict[str, Any]]:
        """Create a new tool."""
        db = self._get_db_session()
        try:
            # Get category - handle both category name and category_id
            if "category_id" in tool_data:
                # Convert string UUID to UUID object if needed
                category_id = tool_data["category_id"]
                if isinstance(category_id, str):
                    try:
                        import uuid
                        category_id = uuid.UUID(category_id)
                    except ValueError:
                        logger.error(f"Invalid UUID format: {category_id}")
                        return False
                
                category = db.query(ToolCategory).filter(
                    ToolCategory.id == category_id
                ).first()
                if not category:
                    logger.error(f"Category with ID {tool_data['category_id']} not found")
                    return False
            elif "category" in tool_data:
                category = db.query(ToolCategory).filter(
                    ToolCategory.name == ToolCategoryEnum(tool_data["category"].upper())
                ).first()
                if not category:
                    logger.error(f"Category {tool_data['category']} not found")
                    return False
            else:
                logger.error("Either 'category' or 'category_id' must be provided")
                return False
            
            # Check if tool already exists
            existing = db.query(Tool).filter(Tool.name == tool_data["name"]).first()
            if existing:
                logger.warning(f"Tool {tool_data['name']} already exists")
                return False
            
            # Create tool
            tool = Tool(
                name=tool_data["name"],
                category_id=category.id,
                enabled=tool_data.get("enabled", True),
                description=tool_data.get("description", ""),
                dependencies=tool_data.get("dependencies", []),
                config=tool_data.get("config", {}),
                version=tool_data.get("version", "1.0.0"),
                is_system_tool=tool_data.get("is_system_tool", False),
                execution_type=tool_data.get("execution_type", "sync"),
                timeout_seconds=tool_data.get("timeout_seconds", 30),
                max_concurrent=tool_data.get("max_concurrent", 1),
            )
            
            db.add(tool)
            db.flush()  # Get the ID
            
            # Record history
            self._record_change(db, tool, "created", None, tool.to_dict(), changed_by)
            
            db.commit()
            logger.info(f"Created tool: {tool_data['name']}")
            return tool.to_dict()
        except Exception as e:
            logger.error(f"Failed to create tool {tool_data.get('name', 'unknown')}: {e}")
            db.rollback()
            return False
        finally:
            if not self.db_session:
                db.close()

    def update_tool(self, name: str, tool_data: Dict[str, Any], changed_by: str = "system") -> Optional[Dict[str, Any]]:
        """Update an existing tool."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).filter(Tool.name == name).first()
            if not tool:
                logger.warning(f"Tool {name} not found")
                return False
            
            # Store old values for history
            old_values = tool.to_dict()
            
            # Update fields
            if "description" in tool_data:
                tool.description = tool_data["description"]
            if "dependencies" in tool_data:
                tool.dependencies = tool_data["dependencies"]
            if "config" in tool_data:
                tool.config = tool_data["config"]
            if "version" in tool_data:
                tool.version = tool_data["version"]
            if "enabled" in tool_data:
                tool.enabled = tool_data["enabled"]
            if "execution_type" in tool_data:
                tool.execution_type = tool_data["execution_type"]
            if "timeout_seconds" in tool_data:
                tool.timeout_seconds = tool_data["timeout_seconds"]
            if "max_concurrent" in tool_data:
                tool.max_concurrent = tool_data["max_concurrent"]
            
            tool.updated_at = datetime.now(UTC)
            
            # Record history
            new_values = tool.to_dict()
            self._record_change(db, tool, "updated", old_values, new_values, changed_by)
            
            db.commit()
            logger.info(f"Updated tool: {name}")
            return tool.to_dict()
        except Exception as e:
            logger.error(f"Failed to update tool {name}: {e}")
            db.rollback()
            return False
        finally:
            if not self.db_session:
                db.close()

    def delete_tool(self, name: str, changed_by: str = "system") -> bool:
        """Delete a tool."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).filter(Tool.name == name).first()
            if not tool:
                logger.warning(f"Tool {name} not found")
                return False
            
            # Record history before deleting
            self._record_change(db, tool, "deleted", tool.to_dict(), None, changed_by)
            
            # Delete history records first (due to foreign key constraint)
            db.query(ToolConfigHistory).filter(ToolConfigHistory.tool_id == tool.id).delete()
            
            # Delete the tool
            db.delete(tool)
            db.commit()
            
            logger.info(f"Deleted tool: {name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete tool {name}: {e}")
            db.rollback()
            return False
        finally:
            if not self.db_session:
                db.close()

    def get_tool_categories(self) -> List[Dict[str, Any]]:
        """Get all tool categories."""
        db = self._get_db_session()
        try:
            categories = db.query(ToolCategory).filter(ToolCategory.is_active == True).order_by(ToolCategory.sort_order).all()
            return [
                {
                    "id": str(cat.id),
                    "name": cat.name,
                    "display_name": cat.display_name,
                    "description": cat.description,
                    "icon": cat.icon,
                    "color": cat.color,
                    "sort_order": cat.sort_order,
                    "tool_count": len(cat.tools),
                }
                for cat in categories
            ]
        except Exception as e:
            logger.error(f"Failed to get tool categories: {e}")
            return []
        finally:
            if not self.db_session:
                db.close()

    def get_tool_statistics(self) -> Dict[str, Any]:
        """Get tool configuration statistics."""
        db = self._get_db_session()
        try:
            total_tools = db.query(func.count(Tool.id)).scalar()
            enabled_tools = db.query(func.count(Tool.id)).filter(Tool.enabled == True).scalar()
            disabled_tools = total_tools - enabled_tools
            
            # Count by category
            category_stats = db.query(
                ToolCategory.name,
                func.count(Tool.id).label('count')
            ).join(Tool).group_by(ToolCategory.name).all()
            
            categories = {cat.name: cat.count for cat in category_stats}
            
            return {
                "total_tools": total_tools,
                "enabled_tools": enabled_tools,
                "disabled_tools": disabled_tools,
                "categories": categories,
                "last_updated": datetime.now(UTC).isoformat(),
            }
        except Exception as e:
            logger.error(f"Failed to get tool statistics: {e}")
            return {}
        finally:
            if not self.db_session:
                db.close()

    def get_tool_history(self, name: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get change history for a tool."""
        db = self._get_db_session()
        try:
            tool = db.query(Tool).filter(Tool.name == name).first()
            if not tool:
                return []
            
            history = db.query(ToolConfigHistory).filter(
                ToolConfigHistory.tool_id == tool.id
            ).order_by(desc(ToolConfigHistory.created_at)).limit(limit).all()
            
            return [
                {
                    "id": str(h.id),
                    "change_type": h.change_type,
                    "old_values": h.old_values,
                    "new_values": h.new_values,
                    "changed_by": h.changed_by,
                    "change_reason": h.change_reason,
                    "created_at": h.created_at.isoformat() if h.created_at else None,
                }
                for h in history
            ]
        except Exception as e:
            logger.error(f"Failed to get tool history for {name}: {e}")
            return []
        finally:
            if not self.db_session:
                db.close()

    def sync_from_json(self, json_data: Dict[str, Any], changed_by: str = "system") -> Dict[str, Any]:
        """Sync tools from JSON configuration."""
        db = self._get_db_session()
        try:
            results = {
                "created": 0,
                "updated": 0,
                "errors": 0,
                "errors_list": []
            }
            
            tools_data = json_data.get("tools", {})
            
            for tool_name, tool_data in tools_data.items():
                try:
                    existing_tool = db.query(Tool).filter(Tool.name == tool_name).first()
                    
                    if existing_tool:
                        # Update existing tool
                        old_values = existing_tool.to_dict()
                        
                        # Update fields
                        existing_tool.description = tool_data.get("description", existing_tool.description)
                        existing_tool.dependencies = tool_data.get("dependencies", existing_tool.dependencies)
                        existing_tool.config = tool_data.get("config", existing_tool.config)
                        existing_tool.version = tool_data.get("version", existing_tool.version)
                        existing_tool.updated_at = datetime.utcnow()
                        
                        # Record history
                        new_values = existing_tool.to_dict()
                        self._record_change(db, existing_tool, "updated", old_values, new_values, changed_by)
                        
                        results["updated"] += 1
                    else:
                        # Create new tool
                        category = db.query(ToolCategory).filter(
                            ToolCategory.name == ToolCategoryEnum(tool_data["category"].upper())
                        ).first()
                        
                        if not category:
                            results["errors"] += 1
                            results["errors_list"].append(f"Category {tool_data['category']} not found for tool {tool_name}")
                            continue
                        
                        tool = Tool(
                            name=tool_name,
                            category_id=category.id,
                            enabled=tool_data.get("enabled", True),
                            description=tool_data.get("description", ""),
                            dependencies=tool_data.get("dependencies", []),
                            config=tool_data.get("config", {}),
                            version=tool_data.get("version", "1.0.0"),
                            is_system_tool=True,  # Tools from JSON are system tools
                            execution_type="sync",
                            timeout_seconds=30,
                            max_concurrent=1,
                        )
                        
                        db.add(tool)
                        db.flush()
                        
                        # Record history
                        self._record_change(db, tool, "created", None, tool.to_dict(), changed_by)
                        
                        results["created"] += 1
                        
                except Exception as e:
                    results["errors"] += 1
                    results["errors_list"].append(f"Error processing tool {tool_name}: {str(e)}")
                    logger.error(f"Error processing tool {tool_name}: {e}")
            
            db.commit()
            logger.info(f"Sync completed: {results}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to sync from JSON: {e}")
            db.rollback()
            return {"created": 0, "updated": 0, "errors": 1, "errors_list": [str(e)]}
        finally:
            if not self.db_session:
                db.close()

    def _record_change(self, db: Session, tool: Tool, change_type: str, old_values: Optional[Dict], new_values: Optional[Dict], changed_by: str) -> None:
        """Record a change in tool configuration history."""
        try:
            history = ToolConfigHistory(
                tool_id=tool.id,
                change_type=change_type,
                old_values=old_values,
                new_values=new_values,
                changed_by=changed_by,
                change_reason=f"Tool {change_type} via API"
            )
            db.add(history)
        except Exception as e:
            logger.error(f"Failed to record change history: {e}")

    def get_global_configuration(self) -> Dict[str, Any]:
        """Get global tool configuration."""
        db = self._get_db_session()
        try:
            config = db.query(ToolConfiguration).first()
            if not config:
                # Create default configuration
                config = ToolConfiguration()
                db.add(config)
                db.commit()
            
            return config.to_dict()
        except Exception as e:
            logger.error(f"Failed to get global configuration: {e}")
            return {}
        finally:
            if not self.db_session:
                db.close()

    def update_global_configuration(self, config_data: Dict[str, Any], changed_by: str = "system") -> bool:
        """Update global tool configuration."""
        db = self._get_db_session()
        try:
            config = db.query(ToolConfiguration).first()
            if not config:
                config = ToolConfiguration()
                db.add(config)
            
            # Update fields
            if "auto_sync_enabled" in config_data:
                config.auto_sync_enabled = config_data["auto_sync_enabled"]
            if "default_timeout" in config_data:
                config.default_timeout = config_data["default_timeout"]
            if "max_concurrent_tools" in config_data:
                config.max_concurrent_tools = config_data["max_concurrent_tools"]
            if "cache_ttl_seconds" in config_data:
                config.cache_ttl_seconds = config_data["cache_ttl_seconds"]
            if "settings" in config_data:
                config.settings = config_data["settings"]
            
            config.updated_at = datetime.utcnow()
            db.commit()
            
            logger.info(f"Updated global configuration by {changed_by}")
            return True
        except Exception as e:
            logger.error(f"Failed to update global configuration: {e}")
            db.rollback()
            return False
        finally:
            if not self.db_session:
                db.close()
