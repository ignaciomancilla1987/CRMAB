"""Schemas Pydantic compartidos por API."""

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class DTEItem(BaseModel):
    linea: int
    sku_declarado: str | None = None
    descripcion: str
    unidad_medida: str | None = None
    cantidad: Decimal
    peso_teorico: Decimal | None = None
    precio_unitario: Decimal | None = None
    monto_linea: Decimal | None = None


class DTEParsed(BaseModel):
    """Resultado de parsear un XML DTE del SII."""

    tipo_dte: int = Field(..., description="33=factura, 52=guía despacho, ...")
    folio: int
    rut_emisor: str
    rut_receptor: str
    razon_social_receptor: str | None = None
    fecha_emision: date
    patente_declarada: str | None = None
    monto_total: Decimal | None = None
    observaciones: str | None = None
    items: list[DTEItem]


class DTEResponse(BaseModel):
    id: UUID
    tipo_dte: int
    folio: int
    rut_emisor: str
    rut_receptor: str
    fecha_emision: date
    patente_declarada: str | None
    estado: str
    total_items: int
    creado_en: datetime


class ConciliacionLinea(BaseModel):
    sku: str
    declarado: Decimal
    detectado: Decimal
    diferencia: Decimal
    tolerancia: Decimal | None = None
    estado: str  # OK, EXCESO, FALTANTE, NO_DOCUMENTADO


class MatchingResult(BaseModel):
    evento_id: UUID | None = None
    dte_id: UUID | None = None
    resultado: str  # CONFORME, OBSERVACIONES, RECHAZADA
    lineas: list[ConciliacionLinea]
    alertas: list[dict]
    peso_ok: bool | None = None
