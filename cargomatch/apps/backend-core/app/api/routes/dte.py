"""Endpoints de ingesta y consulta de DTEs."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from app.models.schemas import DTEParsed
from app.services.dte_parser import DTEParseError, parse_dte_xml

router = APIRouter(prefix="/dte", tags=["dte"])


@router.post(
    "/parse",
    response_model=DTEParsed,
    summary="Parsear XML DTE sin persistir",
    description=(
        "Parsea un XML de DTE del SII (tipo 33 factura o 52 guía de despacho) "
        "y devuelve la estructura normalizada. No persiste en BD."
    ),
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
    response_model=DTEParsed,
    status_code=status.HTTP_201_CREATED,
    summary="Ingresar y persistir un DTE",
    description=(
        "Parsea el XML, persiste el DTE y sus ítems en BD, y publica el evento "
        "`dte.created` en la cola para que el matching-engine lo tome cuando "
        "inicie el evento de despacho."
    ),
)
async def ingest_dte(request: Request) -> DTEParsed:
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Se esperaba XML en el body")
    try:
        parsed = parse_dte_xml(body)
    except DTEParseError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    # TODO: persistencia real con SQLAlchemy + publicación a Redis
    # - upsert DTE por (tipo_dte, folio, rut_emisor)
    # - normalizar sku contra sku_master (fuzzy + embeddings en fase 2)
    # - publicar evento `dte.created`
    return parsed
