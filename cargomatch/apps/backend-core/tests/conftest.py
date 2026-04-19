"""Fixtures de pytest.

Para tests de integración usamos SQLite in-memory. Los modelos ORM fueron
diseñados con tipos portables (Uuid, JSON con variante JSONB, StringArray)
para que esto funcione igual que con Postgres en producción.
"""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.main import app
from app.models.orm import Base


@pytest.fixture
def db_session() -> Iterator[Session]:
    # check_same_thread=False + StaticPool para compartir la misma conexión
    # entre el thread del test y el thread que usa FastAPI/TestClient.
    engine = create_engine(
        "sqlite:///:memory:",
        future=True,
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    """TestClient con la sesión de BD mockeada."""

    def _override_get_db() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
