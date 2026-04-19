"""Repositorio de eventos de despacho, conciliación y alertas."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.orm import Alerta, Conciliacion, EventoDespacho
from app.models.schemas import MatchingResult


def crear_evento(
    db: Session,
    *,
    dte_id: UUID | None,
    patente: str | None,
    zona_carga: str | None = None,
) -> EventoDespacho:
    evento = EventoDespacho(
        dte_id=dte_id,
        patente_detectada=(patente.upper() if patente else None),
        zona_carga=zona_carga,
        estado="INICIADO",
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


def finalizar_evento(
    db: Session,
    evento: EventoDespacho,
    resultado: MatchingResult,
    *,
    peso_neto_kg: Decimal | None = None,
    peso_teorico_kg: Decimal | None = None,
) -> EventoDespacho:
    # Persistir conciliaciones
    for linea in resultado.lineas:
        db.add(
            Conciliacion(
                evento_id=evento.id,
                sku_texto=linea.sku,
                declarado=linea.declarado,
                detectado=linea.detectado,
                diferencia=linea.diferencia,
                tolerancia=linea.tolerancia,
                estado=linea.estado,
            )
        )

    # Persistir alertas
    for a in resultado.alertas:
        db.add(
            Alerta(
                evento_id=evento.id,
                tipo=a.get("tipo", "GENERICA"),
                severidad=a.get("severidad", "WARNING"),
                mensaje=a.get("mensaje", ""),
                datos=a,
                canales=["dashboard"],
            )
        )

    evento.estado = "FINALIZADO"
    evento.resultado = resultado.resultado
    evento.fin = datetime.now(timezone.utc)
    evento.peso_neto_kg = peso_neto_kg
    evento.peso_teorico_kg = peso_teorico_kg
    evento.resumen = {
        "total_lineas": len(resultado.lineas),
        "total_alertas": len(resultado.alertas),
        "peso_ok": resultado.peso_ok,
    }

    db.commit()
    db.refresh(evento)
    return evento


def listar_eventos(db: Session, limit: int = 50) -> list[EventoDespacho]:
    return list(
        db.execute(
            select(EventoDespacho).order_by(EventoDespacho.inicio.desc()).limit(limit)
        ).scalars().all()
    )


def get_evento(db: Session, evento_id: UUID) -> EventoDespacho | None:
    return db.execute(
        select(EventoDespacho).where(EventoDespacho.id == evento_id)
    ).scalar_one_or_none()


def listar_conciliaciones(db: Session, evento_id: UUID) -> list[Conciliacion]:
    return list(
        db.execute(
            select(Conciliacion).where(Conciliacion.evento_id == evento_id)
        ).scalars().all()
    )


def listar_alertas(db: Session, evento_id: UUID | None = None) -> list[Alerta]:
    stmt = select(Alerta).order_by(Alerta.creado_en.desc())
    if evento_id:
        stmt = stmt.where(Alerta.evento_id == evento_id)
    return list(db.execute(stmt).scalars().all())
