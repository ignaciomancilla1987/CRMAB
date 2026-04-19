"""Endpoint para ejecutar conciliación doc vs visión (útil en dev/testing)."""

from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.models.schemas import DTEItem, MatchingResult
from app.services.matching import conciliar

router = APIRouter(prefix="/matching", tags=["matching"])


class MatchRequest(BaseModel):
    declarados: list[DTEItem]
    detectados: dict[str, float] = Field(
        default_factory=dict,
        description="Mapa {sku_o_descripcion: cantidad_detectada}",
    )
    tolerancias: dict[str, float] = Field(default_factory=dict)
    default_tol_pct: float = 2.0
    peso_teorico_kg: float | None = None
    peso_neto_kg: float | None = None
    tol_peso_pct: float = 1.5


@router.post(
    "/run",
    response_model=MatchingResult,
    summary="Ejecutar matching declarado vs detectado",
)
def run_matching(req: MatchRequest) -> MatchingResult:
    return conciliar(
        declarados=req.declarados,
        detectados={k: Decimal(str(v)) for k, v in req.detectados.items()},
        tolerancias={k: Decimal(str(v)) for k, v in req.tolerancias.items()},
        default_tol_pct=req.default_tol_pct,
        peso_teorico_kg=Decimal(str(req.peso_teorico_kg)) if req.peso_teorico_kg else None,
        peso_neto_kg=Decimal(str(req.peso_neto_kg)) if req.peso_neto_kg else None,
        tol_peso_pct=req.tol_peso_pct,
    )
