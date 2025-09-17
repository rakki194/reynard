"""
Notes API routes for Prompt Note application
Handles CRUD operations for notes
"""

from datetime import datetime

from database import DatabaseService
from fastapi import APIRouter, Depends, HTTPException, status
from models import Note, Notebook, User
from pydantic import BaseModel
from sqlalchemy import select

router = APIRouter()


def get_database_service() -> DatabaseService:
    """Get database service dependency"""
    from main import get_database_service as main_get_db

    return main_get_db()


# Pydantic models for request/response
class NoteCreate(BaseModel):
    notebook_id: int
    title: str
    content: str = ""
    content_type: str = "markdown"


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    content_type: str | None = None
    is_favorite: bool | None = None


class NoteResponse(BaseModel):
    id: int
    notebook_id: int
    title: str
    content: str
    content_type: str
    is_favorite: bool
    created_at: datetime
    updated_at: datetime | None

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
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.get("/", response_model=list[NoteResponse])
async def get_notes(
    notebook_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service),
):
    """Get all notes for the current user, optionally filtered by notebook"""
    query = select(Note).where(Note.user_id == current_user.id)

    if notebook_id:
        # Verify notebook ownership
        notebook_result = await db.execute(
            select(Notebook).where(
                Notebook.id == notebook_id, Notebook.user_id == current_user.id
            )
        )
        notebook = notebook_result.scalar_one_or_none()

        if not notebook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found"
            )

        query = query.where(Note.notebook_id == notebook_id)

    query = query.order_by(Note.updated_at.desc())

    result = await db.execute(query)
    notes = result.scalars().all()

    return [
        NoteResponse(
            id=note.id,
            notebook_id=note.notebook_id,
            title=note.title,
            content=note.content,
            content_type=note.content_type,
            is_favorite=note.is_favorite,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
        for note in notes
    ]


@router.post("/", response_model=NoteResponse)
async def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service),
):
    """Create a new note"""
    # Verify notebook ownership
    notebook_result = await db.execute(
        select(Notebook).where(
            Notebook.id == note_data.notebook_id, Notebook.user_id == current_user.id
        )
    )
    notebook = notebook_result.scalar_one_or_none()

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found"
        )

    note = Note(
        notebook_id=note_data.notebook_id,
        user_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        content_type=note_data.content_type,
    )

    db.add(note)
    await db.commit()
    await db.refresh(note)

    return NoteResponse(
        id=note.id,
        notebook_id=note.notebook_id,
        title=note.title,
        content=note.content,
        content_type=note.content_type,
        is_favorite=note.is_favorite,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service),
):
    """Get a specific note by ID"""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    return NoteResponse(
        id=note.id,
        notebook_id=note.notebook_id,
        title=note.title,
        content=note.content,
        content_type=note.content_type,
        is_favorite=note.is_favorite,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service),
):
    """Update a note"""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    # Update fields if provided
    if note_data.title is not None:
        note.title = note_data.title
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.content_type is not None:
        note.content_type = note_data.content_type
    if note_data.is_favorite is not None:
        note.is_favorite = note_data.is_favorite

    note.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(note)

    return NoteResponse(
        id=note.id,
        notebook_id=note.notebook_id,
        title=note.title,
        content=note.content,
        content_type=note.content_type,
        is_favorite=note.is_favorite,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service),
):
    """Delete a note"""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    await db.delete(note)
    await db.commit()

    return {"message": "Note deleted successfully"}


@router.get("/favorites/", response_model=list[NoteResponse])
async def get_favorite_notes(
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service),
):
    """Get all favorite notes for the current user"""
    result = await db.execute(
        select(Note)
        .where(Note.user_id == current_user.id, Note.is_favorite == True)
        .order_by(Note.updated_at.desc())
    )
    notes = result.scalars().all()

    return [
        NoteResponse(
            id=note.id,
            notebook_id=note.notebook_id,
            title=note.title,
            content=note.content,
            content_type=note.content_type,
            is_favorite=note.is_favorite,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
        for note in notes
    ]


@router.post("/{note_id}/favorite")
async def toggle_favorite(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: DatabaseService = Depends(get_database_service),
):
    """Toggle favorite status of a note"""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    note.is_favorite = not note.is_favorite
    note.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(note)

    return {
        "message": f"Note {'favorited' if note.is_favorite else 'unfavorited'} successfully",
        "is_favorite": note.is_favorite,
    }
