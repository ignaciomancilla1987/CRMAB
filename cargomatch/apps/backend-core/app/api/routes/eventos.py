"""Endpoints de eventos de despacho (stubs)."""

from fastapi import APIRouter

router = APIRouter(prefix="/eventos", tags=["eventos"])


@router.get("", summary="Listar eventos de despacho")
def list_eventos(limit: int = 50) -> dict:
    # TODO: query real
    return {"items": [], "total": 0, "limit": limit}


@router.post("/iniciar", summary="Iniciar evento de despacho a partir de patente")
def iniciar_evento(patente: str) -> dict:
    # TODO: buscar DTE pendiente por patente, crear evento en BD
    return {
        "patente": patente.upper(),
        "evento_id": None,
        "estado": "STUB - implementación pendiente",
    }
