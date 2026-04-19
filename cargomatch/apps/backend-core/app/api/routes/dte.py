"""Endpoints de ingesta y consulta de DTEs."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.schemas import DTEParsed
from app.repositories import dte as dte_repo
from app.services.dte_parser import DTEParseError, parse_dte_xml

router = APIRouter(prefix="/dte", tags=["dte"])


def _to_response(dte) -> dict:
    return {
        "id": str(dte.id),
        "tipo_dte": dte.tipo_dte,
        "folio": dte.folio,
        "rut_emisor": dte.rut_emisor,
        "rut_receptor": dte.rut_receptor,
        "razon_social_receptor": dte.razon_social_receptor,
        "fecha_emision": dte.fecha_emision.isoformat(),
        "patente_declarada": dte.patente_declarada,
        "monto_total": float(dte.monto_total) if dte.monto_total is not None else None,
        "estado": dte.estado,
        "total_items": len(dte.items),
        "creado_en": dte.creado_en.isoformat(),
        "items": [
            {
                "linea": it.linea,
                "sku": it.sku_declarado,
                "descripcion": it.descripcion,
                "unidad_medida": it.unidad_medida,
                "cantidad": float(it.cantidad),
            }
            for it in dte.items
        ],
    }


@router.post(
    "/parse",
    response_model=DTEParsed,
    summary="Parsear XML DTE sin persistir",
)
async def parse_dte(request: Request) -> DTEParsed:
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Se esperaba XML en el body")
    try:
        return parse_dte_xml(body)
    except DTEParseError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post(
    "/ingest",
    status_code=status.HTTP_201_CREATED,
    summary="Ingresar y persistir un DTE",
)
async def ingest_dte(request: Request, db: Session = Depends(get_db)) -> dict:
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Se esperaba XML en el body")
    try:
        parsed = parse_dte_xml(body)
    except DTEParseError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    try:
        xml_text = body.decode("utf-8", errors="replace")
    except Exception:
        xml_text = None

    dte = dte_repo.upsert_dte(db, parsed, xml_raw=xml_text)
    return _to_response(dte)


@router.get("", summary="Listar DTEs ingestados")
def list_dtes(
    limit: int = 50,
    estado: str | None = None,
    db: Session = Depends(get_db),
) -> dict:
    items = dte_repo.list_dtes(db, limit=limit, estado=estado)
    return {
        "total": len(items),
        "items": [_to_response(d) for d in items],
    }


@router.get("/{dte_id}", summary="Obtener DTE por id")
def get_dte_by_id(dte_id: UUID, db: Session = Depends(get_db)) -> dict:
    dte = dte_repo.get_dte(db, dte_id)
    if not dte:
        raise HTTPException(status_code=404, detail="DTE no encontrado")
    return _to_response(dte)
