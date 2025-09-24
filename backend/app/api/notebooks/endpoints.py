"""🦊 Reynard Notebooks API Endpoints
==================================

Comprehensive FastAPI endpoints for notebook management within the Reynard ecosystem,
providing sophisticated organization capabilities including hierarchical structure,
sharing, and collaboration features. This module implements enterprise-grade notebook
management with advanced features and comprehensive error handling.

The Notebooks API provides:
- Notebook CRUD operations with rich metadata
- Hierarchical organization and color coding
- Public/private sharing capabilities
- Archive and restore functionality
- Note count and statistics
- Performance monitoring and metrics collection
- Comprehensive error handling and validation
- Security integration with authentication and authorization

Key Features:
- Notebook Management: Full CRUD operations with rich metadata
- Organization: Color coding and description support
- Sharing: Public/private visibility controls
- Archive System: Archive and restore functionality
- Statistics: Note count and usage analytics
- Performance Monitoring: Response time tracking and usage analytics
- Error Handling: Comprehensive error recovery and user feedback
- Security: Authentication and authorization for protected endpoints

API Endpoints:
- POST /notebooks: Create new notebook
- GET /notebooks: List notebooks with filtering and pagination
- GET /notebooks/{id}: Get specific notebook with full details
- PUT /notebooks/{id}: Update notebook metadata
- DELETE /notebooks/{id}: Delete notebook and all notes
- POST /notebooks/{id}/archive: Archive notebook
- POST /notebooks/{id}/restore: Restore archived notebook
- GET /notebooks/{id}/notes: Get notes in notebook
- GET /notebooks/{id}/stats: Get notebook statistics

The Notebooks API integrates seamlessly with the Reynard backend's service architecture,
providing sophisticated organization capabilities while maintaining security and
performance standards.

Author: Reynard Development Team
Version: 1.0.0 - Notes & Todos Restoration Quest
"""

import logging
import time
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ecs.database import SessionLocal
from app.models.notes_todos import Note, Notebook
from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/notebooks", tags=["notebooks"])


# Pydantic models for request/response
class NotebookCreateRequest(BaseModel):
    """Request model for creating a new notebook."""

    title: str = Field(..., min_length=1, max_length=255, description="Notebook title")
    description: str | None = Field(None, description="Notebook description")
    color: str = Field(default="#3b82f6", description="Hex color code")
    is_public: bool = Field(default=False, description="Public visibility")


class NotebookUpdateRequest(BaseModel):
    """Request model for updating a notebook."""

    title: str | None = Field(
        None, min_length=1, max_length=255, description="Notebook title",
    )
    description: str | None = Field(None, description="Notebook description")
    color: str | None = Field(None, description="Hex color code")
    is_public: bool | None = Field(None, description="Public visibility")
    is_archived: bool | None = Field(None, description="Archive status")


class NotebookResponse(BaseModel):
    """Response model for notebook data."""

    id: str
    title: str
    description: str | None
    color: str
    is_public: bool
    is_archived: bool
    created_at: str
    updated_at: str
    agent_id: str
    note_count: int


class NotebookListResponse(BaseModel):
    """Response model for notebook list."""

    notebooks: list[NotebookResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool


class NotebookStatsResponse(BaseModel):
    """Response model for notebook statistics."""

    total_notes: int
    archived_notes: int
    favorite_notes: int
    content_type_distribution: dict[str, int]
    recent_activity: list[dict[str, Any]]
    storage_usage: dict[str, Any]


# Database dependency
def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Helper functions
def get_agent_id_from_user(user: User) -> UUID:
    """Get agent ID from user. For now, we'll use the user ID as agent ID."""
    # TODO: Implement proper user-to-agent mapping
    return UUID(user.id)


def validate_color(color: str) -> bool:
    """Validate hex color code."""
    if not color.startswith("#"):
        return False
    if len(color) != 7:
        return False
    try:
        int(color[1:], 16)
        return True
    except ValueError:
        return False


# API Endpoints
@router.post("/", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED)
async def create_notebook(
    request: NotebookCreateRequest,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Create a new notebook."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        # Validate color
        if not validate_color(request.color):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid color format. Must be a valid hex color code (e.g., #3b82f6)",
            )

        # Create notebook
        notebook = Notebook(
            title=request.title,
            description=request.description,
            color=request.color,
            is_public=request.is_public,
            agent_id=agent_id,
        )

        db.add(notebook)
        db.commit()

        # Log performance
        processing_time = time.time() - start_time
        logger.info(
            f"Notebook created successfully in {processing_time:.3f}s: {notebook.id}",
        )

        return NotebookResponse(**notebook.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create notebook: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notebook",
        )


@router.get("/", response_model=NotebookListResponse)
async def list_notebooks(
    is_public: bool | None = Query(None, description="Filter by public status"),
    is_archived: bool | None = Query(None, description="Filter by archive status"),
    search: str | None = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """List notebooks with filtering and pagination."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        # Build query
        query = db.query(Notebook).filter(Notebook.agent_id == agent_id)

        # Apply filters
        if is_public is not None:
            query = query.filter(Notebook.is_public == is_public)
        if is_archived is not None:
            query = query.filter(Notebook.is_archived == is_archived)
        if search:
            query = query.filter(
                (Notebook.title.ilike(f"%{search}%"))
                | (Notebook.description.ilike(f"%{search}%")),
            )

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        notebooks = (
            query.order_by(Notebook.updated_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        # Convert to response format
        notebook_responses = [
            NotebookResponse(**notebook.to_dict()) for notebook in notebooks
        ]

        # Log performance
        processing_time = time.time() - start_time
        logger.info(f"Listed {len(notebooks)} notebooks in {processing_time:.3f}s")

        return NotebookListResponse(
            notebooks=notebook_responses,
            total=total,
            page=page,
            page_size=page_size,
            has_next=(offset + page_size) < total,
            has_prev=page > 1,
        )

    except Exception as e:
        logger.error(f"Failed to list notebooks: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list notebooks",
        )


@router.get("/{notebook_id}", response_model=NotebookResponse)
async def get_notebook(
    notebook_id: UUID,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific notebook by ID."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        notebook = (
            db.query(Notebook)
            .filter(Notebook.id == notebook_id, Notebook.agent_id == agent_id)
            .first()
        )

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found",
            )

        # Log performance
        processing_time = time.time() - start_time
        logger.info(f"Retrieved notebook {notebook_id} in {processing_time:.3f}s")

        return NotebookResponse(**notebook.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get notebook {notebook_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notebook",
        )


@router.put("/{notebook_id}", response_model=NotebookResponse)
async def update_notebook(
    notebook_id: UUID,
    request: NotebookUpdateRequest,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Update a notebook."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        notebook = (
            db.query(Notebook)
            .filter(Notebook.id == notebook_id, Notebook.agent_id == agent_id)
            .first()
        )

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found",
            )

        # Validate color if provided
        if request.color and not validate_color(request.color):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid color format. Must be a valid hex color code",
            )

        # Update notebook fields
        if request.title is not None:
            notebook.title = request.title
        if request.description is not None:
            notebook.description = request.description
        if request.color is not None:
            notebook.color = request.color
        if request.is_public is not None:
            notebook.is_public = request.is_public
        if request.is_archived is not None:
            notebook.is_archived = request.is_archived

        db.commit()

        # Log performance
        processing_time = time.time() - start_time
        logger.info(f"Updated notebook {notebook_id} in {processing_time:.3f}s")

        return NotebookResponse(**notebook.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update notebook {notebook_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notebook",
        )


@router.delete("/{notebook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notebook(
    notebook_id: UUID,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Delete a notebook and all its notes."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        notebook = (
            db.query(Notebook)
            .filter(Notebook.id == notebook_id, Notebook.agent_id == agent_id)
            .first()
        )

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found",
            )

        # Delete notebook (cascade will delete notes)
        db.delete(notebook)
        db.commit()

        # Log performance
        processing_time = time.time() - start_time
        logger.info(f"Deleted notebook {notebook_id} in {processing_time:.3f}s")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete notebook {notebook_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notebook",
        )


@router.post("/{notebook_id}/archive", response_model=NotebookResponse)
async def archive_notebook(
    notebook_id: UUID,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Archive a notebook."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        notebook = (
            db.query(Notebook)
            .filter(Notebook.id == notebook_id, Notebook.agent_id == agent_id)
            .first()
        )

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found",
            )

        notebook.is_archived = True
        db.commit()

        # Log performance
        processing_time = time.time() - start_time
        logger.info(f"Archived notebook {notebook_id} in {processing_time:.3f}s")

        return NotebookResponse(**notebook.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to archive notebook {notebook_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to archive notebook",
        )


@router.post("/{notebook_id}/restore", response_model=NotebookResponse)
async def restore_notebook(
    notebook_id: UUID,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Restore an archived notebook."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        notebook = (
            db.query(Notebook)
            .filter(Notebook.id == notebook_id, Notebook.agent_id == agent_id)
            .first()
        )

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found",
            )

        notebook.is_archived = False
        db.commit()

        # Log performance
        processing_time = time.time() - start_time
        logger.info(f"Restored notebook {notebook_id} in {processing_time:.3f}s")

        return NotebookResponse(**notebook.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to restore notebook {notebook_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore notebook",
        )


@router.get("/{notebook_id}/notes")
async def get_notebook_notes(
    notebook_id: UUID,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Get notes in a notebook."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        # Verify notebook exists and belongs to user
        notebook = (
            db.query(Notebook)
            .filter(Notebook.id == notebook_id, Notebook.agent_id == agent_id)
            .first()
        )

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found",
            )

        # Get notes
        query = db.query(Note).filter(Note.notebook_id == notebook_id)
        total = query.count()

        offset = (page - 1) * page_size
        notes = (
            query.order_by(Note.updated_at.desc()).offset(offset).limit(page_size).all()
        )

        # Log performance
        processing_time = time.time() - start_time
        logger.info(
            f"Retrieved {len(notes)} notes from notebook {notebook_id} in {processing_time:.3f}s",
        )

        return {
            "notebook_id": str(notebook_id),
            "notes": [note.to_dict() for note in notes],
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (offset + page_size) < total,
            "has_prev": page > 1,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to get notes for notebook {notebook_id}: {e}", exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notebook notes",
        )


@router.get("/{notebook_id}/stats", response_model=NotebookStatsResponse)
async def get_notebook_stats(
    notebook_id: UUID,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Get statistics for a notebook."""
    start_time = time.time()
    agent_id = get_agent_id_from_user(current_user)

    try:
        # Verify notebook exists and belongs to user
        notebook = (
            db.query(Notebook)
            .filter(Notebook.id == notebook_id, Notebook.agent_id == agent_id)
            .first()
        )

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found",
            )

        # Get notes in notebook
        notes = db.query(Note).filter(Note.notebook_id == notebook_id).all()

        # Calculate statistics
        total_notes = len(notes)
        archived_notes = len([n for n in notes if n.is_archived])
        favorite_notes = len([n for n in notes if n.is_favorite])

        # Content type distribution
        content_type_distribution = {}
        for note in notes:
            content_type = note.content_type
            content_type_distribution[content_type] = (
                content_type_distribution.get(content_type, 0) + 1
            )

        # Recent activity (last 5 notes)
        recent_notes = sorted(notes, key=lambda n: n.updated_at, reverse=True)[:5]
        recent_activity = [
            {
                "note_id": str(note.id),
                "title": note.title,
                "updated_at": note.updated_at.isoformat(),
                "action": "updated",
            }
            for note in recent_notes
        ]

        # Storage usage (estimate)
        total_content_length = sum(len(note.content) for note in notes)
        storage_usage = {
            "total_characters": total_content_length,
            "estimated_size_kb": total_content_length / 1024,
            "average_note_size": (
                total_content_length / total_notes if total_notes > 0 else 0
            ),
        }

        # Log performance
        processing_time = time.time() - start_time
        logger.info(
            f"Generated stats for notebook {notebook_id} in {processing_time:.3f}s",
        )

        return NotebookStatsResponse(
            total_notes=total_notes,
            archived_notes=archived_notes,
            favorite_notes=favorite_notes,
            content_type_distribution=content_type_distribution,
            recent_activity=recent_activity,
            storage_usage=storage_usage,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to get stats for notebook {notebook_id}: {e}", exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notebook statistics",
        )
