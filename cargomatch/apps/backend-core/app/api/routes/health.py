"""Health y readiness."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz", tags=["system"])
def healthz() -> dict:
    return {"status": "ok"}


@router.get("/readyz", tags=["system"])
def readyz() -> dict:
    # TODO: check DB, Redis, MinIO
    return {"status": "ready"}
