"""PostgreSQL backend implementation for the Gatekeeper authentication library.

This module provides a PostgreSQL-based user storage backend using SQLAlchemy.
"""

import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

from ..models.user import User, UserCreate, UserPublic, UserRole, UserUpdate
from .base import BackendError, UserAlreadyExistsError, UserBackend, UserNotFoundError

logger = logging.getLogger(__name__)

# SQLAlchemy base class
Base = declarative_base()

# Type alias for the base class
BaseType = type[Base]


class UserModel(Base):
    """SQLAlchemy model for users table."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.REGULAR)
    email = Column(String(255), unique=True, nullable=True, index=True)
    profile_picture_url = Column(String(500), nullable=True)
    yapcoin_balance = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    user_metadata = Column(JSON, default=dict)

    # RBAC fields
    rbac_enabled = Column(Boolean, default=False, nullable=False, index=True)
    default_role = Column(String(50), nullable=True, index=True)
    last_rbac_sync = Column(DateTime, nullable=True)

    # RBAC relationships
    user_roles = relationship(
        "UserRoleModel", back_populates="user", cascade="all, delete-orphan"
    )


class RoleModel(Base):
    """SQLAlchemy model for roles table."""

    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    level = Column(Integer, default=0, nullable=False, index=True)
    parent_role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=True)
    is_system_role = Column(Boolean, default=False, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    role_metadata = Column(JSON, default=dict)

    # Relationships
    parent_role = relationship(
        "RoleModel", remote_side=[id], back_populates="child_roles"
    )
    child_roles = relationship("RoleModel", back_populates="parent_role")
    role_permissions = relationship(
        "RolePermissionModel", back_populates="role", cascade="all, delete-orphan"
    )
    user_roles = relationship(
        "UserRoleModel", back_populates="role", cascade="all, delete-orphan"
    )


class PermissionModel(Base):
    """SQLAlchemy model for permissions table."""

    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    resource_type = Column(String(50), nullable=False, index=True)
    operation = Column(String(50), nullable=False, index=True)
    scope = Column(String(50), default="own", nullable=False, index=True)
    conditions = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    permission_metadata = Column(JSON, default=dict)

    # Relationships
    role_permissions = relationship(
        "RolePermissionModel", back_populates="permission", cascade="all, delete-orphan"
    )


class RolePermissionModel(Base):
    """SQLAlchemy model for role-permission relationships."""

    __tablename__ = "role_permissions"

    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), primary_key=True)
    permission_id = Column(
        UUID(as_uuid=True), ForeignKey("permissions.id"), primary_key=True
    )
    granted_at = Column(DateTime, default=lambda: datetime.now(UTC))
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    conditions = Column(JSON, default=dict)
    expires_at = Column(DateTime, nullable=True, index=True)

    # Relationships
    role = relationship("RoleModel", back_populates="role_permissions")
    permission = relationship("PermissionModel", back_populates="role_permissions")
    granted_by_user = relationship("UserModel", foreign_keys=[granted_by])


class UserRoleModel(Base):
    """SQLAlchemy model for user-role assignments."""

    __tablename__ = "user_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    role_id = Column(
        UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False, index=True
    )
    context_type = Column(String(50), nullable=True, index=True)
    context_id = Column(String(255), nullable=True, index=True)
    assigned_at = Column(DateTime, default=lambda: datetime.now(UTC))
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    expires_at = Column(DateTime, nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    conditions = Column(JSON, default=dict)
    user_role_metadata = Column(JSON, default=dict)

    # Relationships
    user = relationship(
        "UserModel", foreign_keys=[user_id], back_populates="user_roles"
    )
    role = relationship("RoleModel", back_populates="user_roles")
    assigned_by_user = relationship("UserModel", foreign_keys=[assigned_by])


class ResourceAccessControlModel(Base):
    """SQLAlchemy model for resource-specific access control."""

    __tablename__ = "resource_access_control"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_type = Column(String(50), nullable=False, index=True)
    resource_id = Column(String(255), nullable=False, index=True)
    subject_type = Column(String(50), default="user", nullable=False, index=True)
    subject_id = Column(String(255), nullable=False, index=True)
    permission_level = Column(String(50), nullable=False, index=True)
    granted_at = Column(DateTime, default=lambda: datetime.now(UTC))
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    expires_at = Column(DateTime, nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    conditions = Column(JSON, default=dict)
    resource_metadata = Column(JSON, default=dict)

    # Relationships
    granted_by_user = relationship("UserModel", foreign_keys=[granted_by])


class PostgreSQLBackend(UserBackend):
    """PostgreSQL backend implementation for user storage.

    Uses SQLAlchemy ORM to interact with a PostgreSQL database for user management.
    """

    def __init__(self, database_url: str, echo: bool = False):
        """Initialize the PostgreSQL backend.

        Args:
            database_url: PostgreSQL connection URL
            echo: Whether to echo SQL statements (for debugging)

        """
        self.database_url = database_url
        self.engine = create_engine(database_url, echo=echo)
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )
        self._initialized = False

    def _get_session(self) -> Session:
        """Get a database session."""
        return self.SessionLocal()

    def _initialize_database(self) -> None:
        """Initialize the database by creating tables."""
        if not self._initialized:
            Base.metadata.create_all(bind=self.engine)
            self._initialized = True
            logger.info("PostgreSQL backend initialized")

    async def create_user(self, user: UserCreate) -> User:
        """Create a new user in the database."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                # Check if username already exists
                existing_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == user.username)
                    .first()
                )
                if existing_user:
                    raise UserAlreadyExistsError(
                        f"Username '{user.username}' already exists",
                    )

                # Check if email already exists (if provided)
                if user.email:
                    existing_email = (
                        session.query(UserModel)
                        .filter(UserModel.email == user.email)
                        .first()
                    )
                    if existing_email:
                        raise UserAlreadyExistsError(
                            f"Email '{user.email}' already exists",
                        )

                # Create new user
                db_user = UserModel(
                    username=user.username,
                    password_hash=user.password,  # This should be hashed by the auth manager
                    role=user.role,
                    email=user.email,
                    rbac_enabled=getattr(user, 'rbac_enabled', False),
                    default_role=getattr(user, 'default_role', None),
                    created_at=datetime.now(UTC),
                    updated_at=datetime.now(UTC),
                )

                session.add(db_user)
                session.commit()
                session.refresh(db_user)

                # Convert to User model
                return User(
                    id=str(db_user.id),  # type: ignore[arg-type]
                    username=db_user.username,  # type: ignore[arg-type]
                    password_hash=db_user.password_hash,  # type: ignore[arg-type]
                    role=UserRole(db_user.role),  # type: ignore[arg-type]
                    email=db_user.email,  # type: ignore[arg-type]
                    profile_picture_url=db_user.profile_picture_url,  # type: ignore[arg-type]
                    yapcoin_balance=db_user.yapcoin_balance,  # type: ignore[arg-type]
                    is_active=db_user.is_active,  # type: ignore[arg-type]
                    created_at=db_user.created_at,  # type: ignore[arg-type]
                    updated_at=db_user.updated_at,  # type: ignore[arg-type]
                    metadata=db_user.user_metadata or {},  # type: ignore[arg-type]
                    rbac_enabled=db_user.rbac_enabled,  # type: ignore[arg-type]
                    default_role=db_user.default_role,  # type: ignore[arg-type]
                    last_rbac_sync=db_user.last_rbac_sync,  # type: ignore[arg-type]
                )

            except IntegrityError as e:
                session.rollback()
                if "username" in str(e).lower():
                    raise UserAlreadyExistsError(
                        f"Username '{user.username}' already exists",
                    )
                if "email" in str(e).lower():
                    raise UserAlreadyExistsError(f"Email '{user.email}' already exists")
                raise BackendError(f"Database integrity error: {e}")
            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def get_user_by_username(self, username: str) -> User | None:
        """Retrieve a user by username."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return None

                return User(
                    id=str(db_user.id),  # type: ignore[arg-type]
                    username=db_user.username,  # type: ignore[arg-type]
                    password_hash=db_user.password_hash,  # type: ignore[arg-type]
                    role=UserRole(db_user.role),  # type: ignore[arg-type]
                    email=db_user.email,  # type: ignore[arg-type]
                    profile_picture_url=db_user.profile_picture_url,  # type: ignore[arg-type]
                    yapcoin_balance=db_user.yapcoin_balance,  # type: ignore[arg-type]
                    is_active=db_user.is_active,  # type: ignore[arg-type]
                    created_at=db_user.created_at,  # type: ignore[arg-type]
                    updated_at=db_user.updated_at,  # type: ignore[arg-type]
                    metadata=db_user.user_metadata or {},  # type: ignore[arg-type]
                    rbac_enabled=db_user.rbac_enabled,  # type: ignore[arg-type]
                    default_role=db_user.default_role,  # type: ignore[arg-type]
                    last_rbac_sync=db_user.last_rbac_sync,  # type: ignore[arg-type]
                )

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def get_user_by_id(self, user_id: str) -> User | None:
        """Retrieve a user by ID."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel).filter(UserModel.id == user_id).first()
                )

                if not db_user:
                    return None

                return User(
                    id=str(db_user.id),  # type: ignore[arg-type]
                    username=db_user.username,  # type: ignore[arg-type]
                    password_hash=db_user.password_hash,  # type: ignore[arg-type]
                    role=UserRole(db_user.role),  # type: ignore[arg-type]
                    email=db_user.email,  # type: ignore[arg-type]
                    profile_picture_url=db_user.profile_picture_url,  # type: ignore[arg-type]
                    yapcoin_balance=db_user.yapcoin_balance,  # type: ignore[arg-type]
                    is_active=db_user.is_active,  # type: ignore[arg-type]
                    created_at=db_user.created_at,  # type: ignore[arg-type]
                    updated_at=db_user.updated_at,  # type: ignore[arg-type]
                    metadata=db_user.user_metadata or {},  # type: ignore[arg-type]
                    rbac_enabled=db_user.rbac_enabled,  # type: ignore[arg-type]
                    default_role=db_user.default_role,  # type: ignore[arg-type]
                    last_rbac_sync=db_user.last_rbac_sync,  # type: ignore[arg-type]
                )

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def get_user_by_email(self, email: str) -> User | None:
        """Retrieve a user by email address."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel).filter(UserModel.email == email).first()
                )

                if not db_user:
                    return None

                return User(
                    id=str(db_user.id),  # type: ignore[arg-type]
                    username=db_user.username,  # type: ignore[arg-type]
                    password_hash=db_user.password_hash,  # type: ignore[arg-type]
                    role=UserRole(db_user.role),  # type: ignore[arg-type]
                    email=db_user.email,  # type: ignore[arg-type]
                    profile_picture_url=db_user.profile_picture_url,  # type: ignore[arg-type]
                    yapcoin_balance=db_user.yapcoin_balance,  # type: ignore[arg-type]
                    is_active=db_user.is_active,  # type: ignore[arg-type]
                    created_at=db_user.created_at,  # type: ignore[arg-type]
                    updated_at=db_user.updated_at,  # type: ignore[arg-type]
                    metadata=db_user.user_metadata or {},  # type: ignore[arg-type]
                    rbac_enabled=db_user.rbac_enabled,  # type: ignore[arg-type]
                    default_role=db_user.default_role,  # type: ignore[arg-type]
                    last_rbac_sync=db_user.last_rbac_sync,  # type: ignore[arg-type]
                )

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def update_user(self, username: str, user_update: UserUpdate) -> User:
        """Update an existing user."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    raise UserNotFoundError(f"User '{username}' not found")

                # Update fields if provided
                if user_update.username is not None:
                    # Check if new username is already taken
                    existing = (
                        session.query(UserModel)
                        .filter(
                            UserModel.username == user_update.username,
                            UserModel.id != db_user.id,
                        )
                        .first()
                    )
                    if existing:
                        raise UserAlreadyExistsError(
                            f"Username '{user_update.username}' already exists",
                        )
                    db_user.username = user_update.username  # type: ignore[assignment]

                if user_update.email is not None:
                    # Check if new email is already taken
                    if user_update.email:
                        existing = (
                            session.query(UserModel)
                            .filter(
                                UserModel.email == user_update.email,
                                UserModel.id != db_user.id,
                            )
                            .first()
                        )
                        if existing:
                            raise UserAlreadyExistsError(
                                f"Email '{user_update.email}' already exists",
                            )
                    db_user.email = user_update.email  # type: ignore[assignment]

                if user_update.role is not None:
                    db_user.role = user_update.role  # type: ignore[assignment]

                if user_update.is_active is not None:
                    db_user.is_active = user_update.is_active  # type: ignore[assignment]

                if user_update.profile_picture_url is not None:
                    db_user.profile_picture_url = user_update.profile_picture_url  # type: ignore[assignment]

                if user_update.metadata is not None:
                    db_user.user_metadata = user_update.metadata  # type: ignore[assignment]

                if user_update.rbac_enabled is not None:
                    db_user.rbac_enabled = user_update.rbac_enabled  # type: ignore[assignment]

                if user_update.default_role is not None:
                    db_user.default_role = user_update.default_role  # type: ignore[assignment]

                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]

                session.commit()
                session.refresh(db_user)

                return User(
                    id=str(db_user.id),  # type: ignore[arg-type]
                    username=db_user.username,  # type: ignore[arg-type]
                    password_hash=db_user.password_hash,  # type: ignore[arg-type]
                    role=UserRole(db_user.role),  # type: ignore[arg-type]
                    email=db_user.email,  # type: ignore[arg-type]
                    profile_picture_url=db_user.profile_picture_url,  # type: ignore[arg-type]
                    yapcoin_balance=db_user.yapcoin_balance,  # type: ignore[arg-type]
                    is_active=db_user.is_active,  # type: ignore[arg-type]
                    created_at=db_user.created_at,  # type: ignore[arg-type]
                    updated_at=db_user.updated_at,  # type: ignore[arg-type]
                    metadata=db_user.user_metadata or {},  # type: ignore[arg-type]
                    rbac_enabled=db_user.rbac_enabled,  # type: ignore[arg-type]
                    default_role=db_user.default_role,  # type: ignore[arg-type]
                    last_rbac_sync=db_user.last_rbac_sync,  # type: ignore[arg-type]
                )

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def delete_user(self, username: str) -> bool:
        """Delete a user from the database."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return False

                session.delete(db_user)
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def list_users(self, skip: int = 0, limit: int = 100) -> list[UserPublic]:
        """List users in the database."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_users = session.query(UserModel).offset(skip).limit(limit).all()

                return [
                    UserPublic.from_user(
                        User(
                            id=str(db_user.id),
                            username=db_user.username,
                            password_hash=db_user.password_hash,
                            role=UserRole(db_user.role),
                            email=db_user.email,
                            profile_picture_url=db_user.profile_picture_url,
                            yapcoin_balance=db_user.yapcoin_balance,
                            is_active=db_user.is_active,
                            created_at=db_user.created_at,
                            updated_at=db_user.updated_at,
                            metadata=db_user.user_metadata or {},
                        ),
                    )
                    for db_user in db_users
                ]

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def count_users(self) -> int:
        """Get the total number of users in the database."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                return session.query(UserModel).count()
            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def update_user_password(self, username: str, new_password_hash: str) -> bool:
        """Update a user's password hash."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return False

                db_user.password_hash = new_password_hash  # type: ignore[assignment]
                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def update_user_role(self, username: str, new_role: str) -> bool:
        """Update a user's role."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return False

                db_user.role = new_role  # type: ignore[assignment]
                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def update_user_profile_picture(
        self,
        username: str,
        profile_picture_url: str | None,
    ) -> bool:
        """Update a user's profile picture URL."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return False

                db_user.profile_picture_url = profile_picture_url  # type: ignore[assignment]
                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def update_user_metadata(
        self,
        username: str,
        metadata: dict[str, Any],
    ) -> bool:
        """Update a user's metadata."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return False

                db_user.user_metadata = metadata  # type: ignore[assignment]
                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> list[UserPublic]:
        """Search for users by username or email."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_users = (
                    session.query(UserModel)
                    .filter(
                        (UserModel.username.ilike(f"%{query}%"))
                        | (UserModel.email.ilike(f"%{query}%")),
                    )
                    .offset(skip)
                    .limit(limit)
                    .all()
                )

                return [
                    UserPublic.from_user(
                        User(
                            id=str(db_user.id),
                            username=db_user.username,
                            password_hash=db_user.password_hash,
                            role=UserRole(db_user.role),
                            email=db_user.email,
                            profile_picture_url=db_user.profile_picture_url,
                            yapcoin_balance=db_user.yapcoin_balance,
                            is_active=db_user.is_active,
                            created_at=db_user.created_at,
                            updated_at=db_user.updated_at,
                            metadata=db_user.user_metadata or {},
                        ),
                    )
                    for db_user in db_users
                ]

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def get_users_by_role(
        self,
        role: str,
        skip: int = 0,
        limit: int = 100,
    ) -> list[UserPublic]:
        """Get users by role."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_users = (
                    session.query(UserModel)
                    .filter(UserModel.role == role)
                    .offset(skip)
                    .limit(limit)
                    .all()
                )

                return [
                    UserPublic.from_user(
                        User(
                            id=str(db_user.id),
                            username=db_user.username,
                            password_hash=db_user.password_hash,
                            role=UserRole(db_user.role),
                            email=db_user.email,
                            profile_picture_url=db_user.profile_picture_url,
                            yapcoin_balance=db_user.yapcoin_balance,
                            is_active=db_user.is_active,
                            created_at=db_user.created_at,
                            updated_at=db_user.updated_at,
                            metadata=db_user.user_metadata or {},
                        ),
                    )
                    for db_user in db_users
                ]

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def is_username_taken(self, username: str) -> bool:
        """Check if a username is already taken."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                return (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                    is not None
                )
            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def is_email_taken(self, email: str) -> bool:
        """Check if an email is already taken."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                return (
                    session.query(UserModel).filter(UserModel.email == email).first()
                    is not None
                )
            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def get_user_settings(self, username: str) -> dict[str, Any]:
        """Get user settings."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    raise UserNotFoundError(f"User '{username}' not found")

                return db_user.user_metadata or {}  # type: ignore[return-value]

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def update_user_settings(
        self,
        username: str,
        settings: dict[str, Any],
    ) -> bool:
        """Update user settings."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return False

                db_user.user_metadata = settings  # type: ignore[assignment]
                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def update_user_username(self, old_username: str, new_username: str) -> bool:
        """Update a user's username."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                # Check if new username is already taken
                existing = (
                    session.query(UserModel)
                    .filter(UserModel.username == new_username)
                    .first()
                )
                if existing:
                    return False

                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == old_username)
                    .first()
                )

                if not db_user:
                    return False

                db_user.username = new_username  # type: ignore[assignment]
                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def get_all_users(self) -> list[UserPublic]:
        """Get all users in the database."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_users = session.query(UserModel).all()

                return [
                    UserPublic.from_user(
                        User(
                            id=str(db_user.id),
                            username=db_user.username,
                            password_hash=db_user.password_hash,
                            role=UserRole(db_user.role),
                            email=db_user.email,
                            profile_picture_url=db_user.profile_picture_url,
                            yapcoin_balance=db_user.yapcoin_balance,
                            is_active=db_user.is_active,
                            created_at=db_user.created_at,
                            updated_at=db_user.updated_at,
                            metadata=db_user.user_metadata or {},
                        ),
                    )
                    for db_user in db_users
                ]

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def update_user_yapcoin_balance(self, username: str, amount: int) -> bool:
        """Update a user's YapCoin balance."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_user = (
                    session.query(UserModel)
                    .filter(UserModel.username == username)
                    .first()
                )

                if not db_user:
                    return False

                db_user.yapcoin_balance = (db_user.yapcoin_balance or 0) + amount  # type: ignore[assignment]
                db_user.updated_at = datetime.now(UTC)  # type: ignore[assignment]
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def close(self) -> None:
        """Close the database connection."""
        if hasattr(self, "engine"):
            self.engine.dispose()
        logger.info("PostgreSQL backend closed")

    async def health_check(self) -> bool:
        """Perform a health check on the database."""
        try:
            self._initialize_database()
            with self._get_session() as session:
                session.execute(text("SELECT 1"))
                return True
        except Exception as e:
            logger.error(f"PostgreSQL health check failed: {e}")
            return False

    # RBAC Methods

    async def create_role(self, role_data: dict[str, Any]) -> dict[str, Any]:
        """Create a new role."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_role = RoleModel(
                    name=role_data["name"],
                    description=role_data.get("description"),
                    level=role_data.get("level", 0),
                    parent_role_id=role_data.get("parent_role_id"),
                    is_system_role=role_data.get("is_system_role", False),
                    role_metadata=role_data.get("metadata", {}),
                )

                session.add(db_role)
                session.commit()
                session.refresh(db_role)

                return {
                    "id": str(db_role.id),
                    "name": db_role.name,
                    "description": db_role.description,
                    "level": db_role.level,
                    "parent_role_id": (
                        str(db_role.parent_role_id) if db_role.parent_role_id else None
                    ),
                    "is_system_role": db_role.is_system_role,
                    "is_active": db_role.is_active,
                    "created_at": db_role.created_at,
                    "updated_at": db_role.updated_at,
                    "metadata": db_role.role_metadata or {},
                }

            except IntegrityError as e:
                session.rollback()
                if "name" in str(e).lower():
                    raise BackendError(
                        f"Role name '{role_data['name']}' already exists"
                    )
                raise BackendError(f"Database integrity error: {e}")
            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def get_role_by_name(self, name: str) -> dict[str, Any] | None:
        """Get a role by name."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_role = (
                    session.query(RoleModel).filter(RoleModel.name == name).first()
                )

                if not db_role:
                    return None

                return {
                    "id": str(db_role.id),
                    "name": db_role.name,
                    "description": db_role.description,
                    "level": db_role.level,
                    "parent_role_id": (
                        str(db_role.parent_role_id) if db_role.parent_role_id else None
                    ),
                    "is_system_role": db_role.is_system_role,
                    "is_active": db_role.is_active,
                    "created_at": db_role.created_at,
                    "updated_at": db_role.updated_at,
                    "metadata": db_role.role_metadata or {},
                }

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def get_role_by_id(self, role_id: str) -> dict[str, Any] | None:
        """Get a role by ID."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_role = (
                    session.query(RoleModel).filter(RoleModel.id == role_id).first()
                )

                if not db_role:
                    return None

                return {
                    "id": str(db_role.id),
                    "name": db_role.name,
                    "description": db_role.description,
                    "level": db_role.level,
                    "parent_role_id": (
                        str(db_role.parent_role_id) if db_role.parent_role_id else None
                    ),
                    "is_system_role": db_role.is_system_role,
                    "is_active": db_role.is_active,
                    "created_at": db_role.created_at,
                    "updated_at": db_role.updated_at,
                    "metadata": db_role.role_metadata or {},
                }

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def create_permission(
        self, permission_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a new permission."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_permission = PermissionModel(
                    name=permission_data["name"],
                    resource_type=permission_data["resource_type"],
                    operation=permission_data["operation"],
                    scope=permission_data.get("scope", "own"),
                    conditions=permission_data.get("conditions", {}),
                    permission_metadata=permission_data.get("metadata", {}),
                )

                session.add(db_permission)
                session.commit()
                session.refresh(db_permission)

                return {
                    "id": str(db_permission.id),
                    "name": db_permission.name,
                    "resource_type": db_permission.resource_type,
                    "operation": db_permission.operation,
                    "scope": db_permission.scope,
                    "conditions": db_permission.conditions or {},
                    "is_active": db_permission.is_active,
                    "created_at": db_permission.created_at,
                    "updated_at": db_permission.updated_at,
                    "metadata": db_permission.permission_metadata or {},
                }

            except IntegrityError as e:
                session.rollback()
                if "name" in str(e).lower():
                    raise BackendError(
                        f"Permission name '{permission_data['name']}' already exists"
                    )
                raise BackendError(f"Database integrity error: {e}")
            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def get_permission_by_id(self, permission_id: str) -> dict[str, Any] | None:
        """Get a permission by ID."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                db_permission = (
                    session.query(PermissionModel)
                    .filter(PermissionModel.id == permission_id)
                    .first()
                )

                if not db_permission:
                    return None

                return {
                    "id": str(db_permission.id),
                    "name": db_permission.name,
                    "resource_type": db_permission.resource_type,
                    "operation": db_permission.operation,
                    "scope": db_permission.scope,
                    "conditions": db_permission.conditions or {},
                    "is_active": db_permission.is_active,
                    "created_at": db_permission.created_at,
                    "updated_at": db_permission.updated_at,
                    "metadata": db_permission.permission_metadata or {},
                }

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def get_permissions_for_role(self, role_id: str) -> list[dict[str, Any]]:
        """Get all permissions for a role."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                # Get role-permission relationships
                role_permissions = (
                    session.query(RolePermissionModel, PermissionModel)
                    .join(
                        PermissionModel,
                        RolePermissionModel.permission_id == PermissionModel.id,
                    )
                    .filter(
                        RolePermissionModel.role_id == role_id,
                        RolePermissionModel.is_active == True,
                        PermissionModel.is_active == True,
                    )
                    .all()
                )

                return [
                    {
                        "id": str(permission.id),
                        "name": permission.name,
                        "resource_type": permission.resource_type,
                        "operation": permission.operation,
                        "scope": permission.scope,
                        "conditions": permission.conditions or {},
                        "is_active": permission.is_active,
                        "created_at": permission.created_at,
                        "updated_at": permission.updated_at,
                        "metadata": permission.permission_metadata or {},
                        "granted_at": role_permission.granted_at,
                        "granted_by": (
                            str(role_permission.granted_by)
                            if role_permission.granted_by
                            else None
                        ),
                        "expires_at": role_permission.expires_at,
                        "role_conditions": role_permission.conditions or {},
                    }
                    for role_permission, permission in role_permissions
                ]

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def assign_role_to_user(
        self, user_id: str, role_id: str, context: dict[str, Any] | None = None
    ) -> bool:
        """Assign a role to a user."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                # Check if assignment already exists
                existing = (
                    session.query(UserRoleModel)
                    .filter(
                        UserRoleModel.user_id == user_id,
                        UserRoleModel.role_id == role_id,
                        (
                            UserRoleModel.context_type == context.get("type")
                            if context
                            else None
                        ),
                        (
                            UserRoleModel.context_id == context.get("id")
                            if context
                            else None
                        ),
                    )
                    .first()
                )

                if existing:
                    # Reactivate if inactive
                    if not existing.is_active:
                        existing.is_active = True
                        existing.assigned_at = datetime.now(UTC)
                        session.commit()
                    return True

                # Create new assignment
                db_user_role = UserRoleModel(
                    user_id=user_id,
                    role_id=role_id,
                    context_type=context.get("type") if context else None,
                    context_id=context.get("id") if context else None,
                    expires_at=context.get("expires_at") if context else None,
                    conditions=context.get("conditions", {}) if context else {},
                    user_role_metadata=context.get("metadata", {}) if context else {},
                )

                session.add(db_user_role)
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def remove_role_from_user(
        self, user_id: str, role_id: str, context: dict[str, Any] | None = None
    ) -> bool:
        """Remove a role from a user."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                query = session.query(UserRoleModel).filter(
                    UserRoleModel.user_id == user_id,
                    UserRoleModel.role_id == role_id,
                )

                if context:
                    query = query.filter(
                        UserRoleModel.context_type == context.get("type"),
                        UserRoleModel.context_id == context.get("id"),
                    )

                db_user_role = query.first()

                if not db_user_role:
                    return False

                # Soft delete by setting is_active to False
                db_user_role.is_active = False
                session.commit()
                return True

            except SQLAlchemyError as e:
                session.rollback()
                raise BackendError(f"Database error: {e}")

    async def get_user_roles(
        self, user_id: str, context: dict[str, Any] | None = None
    ) -> list[dict[str, Any]]:
        """Get all roles for a user."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                query = (
                    session.query(UserRoleModel, RoleModel)
                    .join(RoleModel, UserRoleModel.role_id == RoleModel.id)
                    .filter(
                        UserRoleModel.user_id == user_id,
                        UserRoleModel.is_active == True,
                    )
                )

                if context:
                    query = query.filter(
                        UserRoleModel.context_type == context.get("type"),
                        UserRoleModel.context_id == context.get("id"),
                    )

                results = query.all()

                return [
                    {
                        "id": str(user_role.id),
                        "role_id": str(user_role.role_id),
                        "role_name": role.name,
                        "role_level": role.level,
                        "context_type": user_role.context_type,
                        "context_id": user_role.context_id,
                        "assigned_at": user_role.assigned_at,
                        "expires_at": user_role.expires_at,
                        "conditions": user_role.conditions or {},
                        "metadata": user_role.user_role_metadata or {},
                    }
                    for user_role, role in results
                ]

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")

    async def check_permission(
        self, user_id: str, resource_type: str, resource_id: str, operation: str
    ) -> dict[str, Any]:
        """Check if a user has permission for a resource/operation."""
        self._initialize_database()

        with self._get_session() as session:
            try:
                # Get user's roles
                user_roles = (
                    session.query(UserRoleModel, RoleModel)
                    .join(RoleModel, UserRoleModel.role_id == RoleModel.id)
                    .filter(
                        UserRoleModel.user_id == user_id,
                        UserRoleModel.is_active == True,
                    )
                    .all()
                )

                if not user_roles:
                    return {"granted": False, "reason": "No active roles assigned"}

                # Get permissions for user's roles
                role_ids = [str(user_role.role_id) for user_role, _ in user_roles]
                permissions = (
                    session.query(RolePermissionModel, PermissionModel)
                    .join(
                        PermissionModel,
                        RolePermissionModel.permission_id == PermissionModel.id,
                    )
                    .filter(
                        RolePermissionModel.role_id.in_(role_ids),
                        RolePermissionModel.is_active == True,
                        PermissionModel.is_active == True,
                    )
                    .all()
                )

                # Check for matching permission
                for role_permission, permission in permissions:
                    if (
                        permission.resource_type == resource_type
                        and permission.operation == operation
                    ):
                        return {
                            "granted": True,
                            "reason": f"Permission granted via role {permission.name}",
                            "permission_id": str(permission.id),
                            "role_id": str(role_permission.role_id),
                            "conditions": permission.conditions or {},
                        }

                return {"granted": False, "reason": "No matching permission found"}

            except SQLAlchemyError as e:
                raise BackendError(f"Database error: {e}")
