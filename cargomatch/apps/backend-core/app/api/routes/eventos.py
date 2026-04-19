"""Endpoints de eventos de despacho.

Incluye un endpoint de **simulación** que emula al edge Jetson:
dado un DTE y un dict de detecciones mock, ejecuta el matching completo,
persiste conciliación + alertas y devuelve el resultado.

Esto permite demostrar el flujo end-to-end sin hardware real.
"""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.schemas import DTEItem as DTEItemSchema
from app.repositories import dte as dte_repo
from app.repositories import eventos as ev_repo
from app.services.matching import conciliar

router = APIRouter(prefix="/eventos", tags=["eventos"])


class SimularRequest(BaseModel):
    dte_id: UUID | None = None
    patente: str | None = None
    detectados: dict[str, float] = Field(
        default_factory=dict,
        description="Mapa {sku_o_descripcion: cantidad_detectada} simulando al edge",
    )
    peso_neto_kg: float | None = None
    tolerancia_qty_pct: float = 2.0
    tolerancia_peso_pct: float = 1.5
    zona_carga: str | None = "zona-1"


def _serialize_evento(ev, conciliaciones=None, alertas=None) -> dict:
    return {
        "id": str(ev.id),
        "dte_id": str(ev.dte_id) if ev.dte_id else None,
        "patente_detectada": ev.patente_detectada,
        "zona_carga": ev.zona_carga,
        "estado": ev.estado,
        "resultado": ev.resultado,
        "peso_neto_kg": float(ev.peso_neto_kg) if ev.peso_neto_kg is not None else None,
        "peso_teorico_kg": float(ev.peso_teorico_kg) if ev.peso_teorico_kg is not None else None,
        "inicio": ev.inicio.isoformat() if ev.inicio else None,
        "fin": ev.fin.isoformat() if ev.fin else None,
        "resumen": ev.resumen,
        "conciliaciones": (
            [
                {
                    "sku": c.sku_texto,
                    "declarado": float(c.declarado),
                    "detectado": float(c.detectado),
                    "diferencia": float(c.diferencia),
                    "tolerancia": float(c.tolerancia) if c.tolerancia is not None else None,
                    "estado": c.estado,
                }
                for c in conciliaciones
            ]
            if conciliaciones is not None
            else None
        ),
        "alertas": (
            [
                {
                    "tipo": a.tipo,
                    "severidad": a.severidad,
                    "mensaje": a.mensaje,
                    "datos": a.datos,
                }
                for a in alertas
            ]
            if alertas is not None
            else None
        ),
    }


@router.get("", summary="Listar eventos de despacho")
def list_eventos(limit: int = 50, db: Session = Depends(get_db)) -> dict:
    eventos = ev_repo.listar_eventos(db, limit=limit)
    return {
        "total": len(eventos),
        "items": [_serialize_evento(e) for e in eventos],
    }


@router.get("/{evento_id}", summary="Detalle de evento con conciliación y alertas")
def get_evento(evento_id: UUID, db: Session = Depends(get_db)) -> dict:
    evento = ev_repo.get_evento(db, evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    conciliaciones = ev_repo.listar_conciliaciones(db, evento_id)
    alertas = ev_repo.listar_alertas(db, evento_id)
    return _serialize_evento(evento, conciliaciones, alertas)


@router.post(
    "/simular",
    summary="Simular despacho completo (mock del edge Jetson)",
    description=(
        "Ejecuta el flujo end-to-end sin cámaras reales: "
        "busca el DTE (por id o patente), crea evento_despacho, "
        "ejecuta matching contra las detecciones provistas, "
        "persiste conciliación + alertas y devuelve el resultado."
    ),
)
def simular_despacho(req: SimularRequest, db: Session = Depends(get_db)) -> dict:
    # 1. Resolver DTE
    if req.dte_id:
        dte = dte_repo.get_dte(db, req.dte_id)
    elif req.patente:
        dte = dte_repo.find_by_patente(db, req.patente)
    else:
        raise HTTPException(status_code=400, detail="Debe especificar dte_id o patente")

    if not dte:
        raise HTTPException(status_code=404, detail="DTE no encontrado")

    # 2. Crear evento de despacho
    evento = ev_repo.crear_evento(
        db,
        dte_id=dte.id,
        patente=req.patente or dte.patente_declarada,
        zona_carga=req.zona_carga,
    )

    # 3. Preparar declarados (desde DTE persistido) y detectados (del request)
    declarados = [
        DTEItemSchema(
            linea=it.linea,
            sku_declarado=it.sku_declarado,
            descripcion=it.descripcion,
            unidad_medida=it.unidad_medida,
            cantidad=it.cantidad,
            precio_unitario=it.precio_unitario,
            monto_linea=it.monto_linea,
        )
        for it in dte.items
    ]
    detectados = {k: Decimal(str(v)) for k, v in req.detectados.items()}

    # 4. Ejecutar matching
    resultado = conciliar(
        declarados=declarados,
        detectados=detectados,
        default_tol_pct=req.tolerancia_qty_pct,
        peso_neto_kg=Decimal(str(req.peso_neto_kg)) if req.peso_neto_kg else None,
        tol_peso_pct=req.tolerancia_peso_pct,
    )

    # 5. Finalizar evento y persistir conciliación + alertas
    evento = ev_repo.finalizar_evento(
        db,
        evento,
        resultado,
        peso_neto_kg=Decimal(str(req.peso_neto_kg)) if req.peso_neto_kg else None,
    )

    # 6. Marcar DTE como validado (o con observaciones)
    dte.estado = "VALIDADO" if resultado.resultado != "RECHAZADA" else "RECHAZADO"
    db.commit()

    conciliaciones = ev_repo.listar_conciliaciones(db, evento.id)
    alertas = ev_repo.listar_alertas(db, evento.id)
    return _serialize_evento(evento, conciliaciones, alertas)
