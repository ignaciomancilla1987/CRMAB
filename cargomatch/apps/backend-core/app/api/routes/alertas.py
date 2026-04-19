"""Endpoints de alertas (stubs)."""

from fastapi import APIRouter

router = APIRouter(prefix="/alertas", tags=["alertas"])


@router.get("", summary="Listar alertas activas")
def list_alertas() -> dict:
    return {"items": [], "total": 0}


@router.post("/{alerta_id}/ack", summary="Reconocer alerta")
def ack_alerta(alerta_id: str) -> dict:
    return {"id": alerta_id, "acknowledged": True}
