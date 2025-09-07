"""
Notebooks API routes for Prompt Note application
Handles CRUD operations for notebooks
"""

import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import DatabaseService
from models import Notebook, Note, User

router = APIRouter()


def get_database_service() -> DatabaseService:
    """Get database service dependency"""
    from main import get_database_service as main_get_db
    return main_get_db()


# Pydantic models for request/response
class NotebookCreate(BaseModel):
    title: str
    description: Optional[str] = None
    color: str = "#0078D4"
    is_public: bool = False


class NotebookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_public: Optional[bool] = None


class NotebookResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    color: str
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime]
    page_count: int

    class Config:
        from_attributes = True


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    content_type: str
    is_favorite: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Helper function to get current user (placeholder - integrate with auth)
async def get_current_user(db: DatabaseService = Depends(get_database_service)) -> User:
    # TODO: Integrate with actual authentication
    # For now, return a mock user
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/", response_model=List[NotebookResponse])
async def get_notebooks(
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service)
):
    """Get all notebooks for the current user"""
    # Get notebooks with note counts
    query = select(
        Notebook,
        func.count(Note.id).label('page_count')
    ).outerjoin(
        Note, Notebook.id == Note.notebook_id
    ).where(
        Notebook.user_id == current_user.id
    ).group_by(Notebook.id).order_by(Notebook.updated_at.desc())
    
    result = await db.execute(query)
    notebooks_with_counts = result.all()
    
    return [
        NotebookResponse(
            id=notebook.id,
            title=notebook.title,
            description=notebook.description,
            color=notebook.color,
            is_public=notebook.is_public,
            created_at=notebook.created_at,
            updated_at=notebook.updated_at,
            page_count=page_count
        )
        for notebook, page_count in notebooks_with_counts
    ]


@router.post("/", response_model=NotebookResponse)
async def create_notebook(
    notebook_data: NotebookCreate,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service)
):
    """Create a new notebook"""
    notebook = Notebook(
        user_id=current_user.id,
        title=notebook_data.title,
        description=notebook_data.description,
        color=notebook_data.color,
        is_public=notebook_data.is_public
    )
    
    db.add(notebook)
    await db.commit()
    await db.refresh(notebook)
    
    return NotebookResponse(
        id=notebook.id,
        title=notebook.title,
        description=notebook.description,
        color=notebook.color,
        is_public=notebook.is_public,
        created_at=notebook.created_at,
        updated_at=notebook.updated_at,
        page_count=0
    )


@router.get("/{notebook_id}", response_model=NotebookResponse)
async def get_notebook(
    notebook_id: int,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service)
):
    """Get a specific notebook by ID"""
    # Get notebook with note count
    query = select(
        Notebook,
        func.count(Note.id).label('page_count')
    ).outerjoin(
        Note, Notebook.id == Note.notebook_id
    ).where(
        Notebook.id == notebook_id,
        Notebook.user_id == current_user.id
    ).group_by(Notebook.id)
    
    result = await db.execute(query)
    notebook_with_count = result.first()
    
    if not notebook_with_count:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    notebook, page_count = notebook_with_count
    
    return NotebookResponse(
        id=notebook.id,
        title=notebook.title,
        description=notebook.description,
        color=notebook.color,
        is_public=notebook.is_public,
        created_at=notebook.created_at,
        updated_at=notebook.updated_at,
        page_count=page_count
    )


@router.put("/{notebook_id}", response_model=NotebookResponse)
async def update_notebook(
    notebook_id: int,
    notebook_data: NotebookUpdate,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service)
):
    """Update a notebook"""
    result = await db.execute(
        select(Notebook).where(
            Notebook.id == notebook_id,
            Notebook.user_id == current_user.id
        )
    )
    notebook = result.scalar_one_or_none()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    # Update fields if provided
    if notebook_data.title is not None:
        notebook.title = notebook_data.title
    if notebook_data.description is not None:
        notebook.description = notebook_data.description
    if notebook_data.color is not None:
        notebook.color = notebook_data.color
    if notebook_data.is_public is not None:
        notebook.is_public = notebook_data.is_public
    
    notebook.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(notebook)
    
    # Get updated note count
    count_result = await db.execute(
        select(func.count(Note.id)).where(Note.notebook_id == notebook.id)
    )
    page_count = count_result.scalar()
    
    return NotebookResponse(
        id=notebook.id,
        title=notebook.title,
        description=notebook.description,
        color=notebook.color,
        is_public=notebook.is_public,
        created_at=notebook.created_at,
        updated_at=notebook.updated_at,
        page_count=page_count
    )


@router.delete("/{notebook_id}")
async def delete_notebook(
    notebook_id: int,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service)
):
    """Delete a notebook and all its notes"""
    result = await db.execute(
        select(Notebook).where(
            Notebook.id == notebook_id,
            Notebook.user_id == current_user.id
        )
    )
    notebook = result.scalar_one_or_none()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    # Delete all notes in the notebook first
    await db.execute(
        select(Note).where(Note.notebook_id == notebook_id).delete()
    )
    
    # Delete the notebook
    await db.delete(notebook)
    await db.commit()
    
    return {"message": "Notebook deleted successfully"}


@router.get("/{notebook_id}/notes", response_model=List[NoteResponse])
async def get_notebook_notes(
    notebook_id: int,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service)
):
    """Get all notes in a specific notebook"""
    # Verify notebook ownership
    notebook_result = await db.execute(
        select(Notebook).where(
            Notebook.id == notebook_id,
            Notebook.user_id == current_user.id
        )
    )
    notebook = notebook_result.scalar_one_or_none()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    # Get notes
    result = await db.execute(
        select(Note).where(
            Note.notebook_id == notebook_id
        ).order_by(Note.updated_at.desc())
    )
    notes = result.scalars().all()
    
    return [
        NoteResponse(
            id=note.id,
            title=note.title,
            content=note.content,
            content_type=note.content_type,
            is_favorite=note.is_favorite,
            created_at=note.created_at,
            updated_at=note.updated_at
        )
        for note in notes
    ]
