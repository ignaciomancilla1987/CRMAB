"""Endpoints de alertas."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.orm import Alerta
from app.repositories import eventos as ev_repo

router = APIRouter(prefix="/alertas", tags=["alertas"])


def _serialize(a: Alerta) -> dict:
    return {
        "id": str(a.id),
        "evento_id": str(a.evento_id),
        "tipo": a.tipo,
        "severidad": a.severidad,
        "mensaje": a.mensaje,
        "datos": a.datos,
        "acknowledged": a.ack_ts is not None,
        "ack_ts": a.ack_ts.isoformat() if a.ack_ts else None,
        "creado_en": a.creado_en.isoformat(),
    }


@router.get("", summary="Listar alertas")
def list_alertas(
    evento_id: UUID | None = None,
    db: Session = Depends(get_db),
) -> dict:
    alertas = ev_repo.listar_alertas(db, evento_id)
    return {"total": len(alertas), "items": [_serialize(a) for a in alertas]}


@router.post("/{alerta_id}/ack", summary="Reconocer alerta")
def ack_alerta(alerta_id: UUID, db: Session = Depends(get_db)) -> dict:
    a = db.get(Alerta, alerta_id)
    if not a:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    a.ack_ts = datetime.now(timezone.utc)
    db.commit()
    return _serialize(a)
