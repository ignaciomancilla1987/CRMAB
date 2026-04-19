"""Repositorio de DTE: upsert, búsqueda, listado."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.orm import DTE, DTEItem
from app.models.schemas import DTEParsed


def upsert_dte(db: Session, parsed: DTEParsed, xml_raw: str | None = None) -> DTE:
    """Inserta o actualiza un DTE por (tipo_dte, folio, rut_emisor)."""
    existing = db.execute(
        select(DTE).where(
            DTE.tipo_dte == parsed.tipo_dte,
            DTE.folio == parsed.folio,
            DTE.rut_emisor == parsed.rut_emisor,
        )
    ).scalar_one_or_none()

    if existing:
        existing.rut_receptor = parsed.rut_receptor
        existing.razon_social_receptor = parsed.razon_social_receptor
        existing.fecha_emision = parsed.fecha_emision
        existing.patente_declarada = parsed.patente_declarada
        existing.monto_total = parsed.monto_total
        existing.observaciones = parsed.observaciones
        if xml_raw:
            existing.xml_raw = xml_raw
        # Limpia items previos y recarga
        for item in list(existing.items):
            db.delete(item)
        db.flush()
        _add_items(db, existing, parsed)
        db.commit()
        db.refresh(existing)
        return existing

    dte = DTE(
        tipo_dte=parsed.tipo_dte,
        folio=parsed.folio,
        rut_emisor=parsed.rut_emisor,
        rut_receptor=parsed.rut_receptor,
        razon_social_receptor=parsed.razon_social_receptor,
        fecha_emision=parsed.fecha_emision,
        patente_declarada=parsed.patente_declarada,
        monto_total=parsed.monto_total,
        observaciones=parsed.observaciones,
        xml_raw=xml_raw,
        estado="PENDIENTE",
        origen_ingesta="api",
    )
    db.add(dte)
    db.flush()
    _add_items(db, dte, parsed)
    db.commit()
    db.refresh(dte)
    return dte


def _add_items(db: Session, dte: DTE, parsed: DTEParsed) -> None:
    for it in parsed.items:
        db.add(
            DTEItem(
                dte_id=dte.id,
                linea=it.linea,
                sku_declarado=it.sku_declarado,
                descripcion=it.descripcion,
                unidad_medida=it.unidad_medida,
                cantidad=it.cantidad,
                precio_unitario=it.precio_unitario,
                monto_linea=it.monto_linea,
            )
        )


def get_dte(db: Session, dte_id: UUID) -> DTE | None:
    return db.execute(
        select(DTE).options(selectinload(DTE.items)).where(DTE.id == dte_id)
    ).scalar_one_or_none()


def find_by_patente(db: Session, patente: str, solo_pendientes: bool = True) -> DTE | None:
    """Busca el DTE pendiente más reciente para una patente."""
    stmt = select(DTE).options(selectinload(DTE.items)).where(
        DTE.patente_declarada == patente.upper()
    )
    if solo_pendientes:
        stmt = stmt.where(DTE.estado == "PENDIENTE")
    stmt = stmt.order_by(DTE.creado_en.desc()).limit(1)
    return db.execute(stmt).scalar_one_or_none()


def list_dtes(db: Session, limit: int = 50, estado: str | None = None) -> list[DTE]:
    stmt = select(DTE).options(selectinload(DTE.items))
    if estado:
        stmt = stmt.where(DTE.estado == estado)
    stmt = stmt.order_by(DTE.creado_en.desc()).limit(limit)
    return list(db.execute(stmt).scalars().all())
