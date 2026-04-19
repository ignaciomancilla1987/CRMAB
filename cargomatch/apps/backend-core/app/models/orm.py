"""Modelos SQLAlchemy ORM.

Los nombres y tipos reflejan `database/schema.sql` 1:1.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    TypeDecorator,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY as PgARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# JSON portable: usa JSONB si es Postgres, JSON si es SQLite u otro.
JSONType = JSON().with_variant(JSONB(), "postgresql")

# ARRAY(Text) portable: en SQLite guardamos como JSON; en Postgres usamos ARRAY nativo.
class StringArray(TypeDecorator):
    """Array de texto portable."""

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PgARRAY(Text))
        return dialect.type_descriptor(JSON())

    def process_bind_param(self, value, dialect):
        return value

    def process_result_value(self, value, dialect):
        return value


class Base(DeclarativeBase):
    pass


class SKUMaster(Base):
    __tablename__ = "sku_master"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    familia: Mapped[str | None] = mapped_column(String(64))
    unidad_medida: Mapped[str] = mapped_column(String(16), nullable=False)
    peso_unitario: Mapped[Decimal | None] = mapped_column(Numeric(12, 3))
    codigo_barras: Mapped[str | None] = mapped_column(String(64))
    aspecto_visual: Mapped[dict[str, Any] | None] = mapped_column(JSONType)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DTE(Base):
    __tablename__ = "dte"
    __table_args__ = (UniqueConstraint("tipo_dte", "folio", "rut_emisor"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    tipo_dte: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    folio: Mapped[int] = mapped_column(Integer, nullable=False)
    rut_emisor: Mapped[str] = mapped_column(String(16), nullable=False)
    rut_receptor: Mapped[str] = mapped_column(String(16), nullable=False)
    razon_social_receptor: Mapped[str | None] = mapped_column(String(255))
    fecha_emision: Mapped[date] = mapped_column(Date, nullable=False)
    patente_declarada: Mapped[str | None] = mapped_column(String(16))
    monto_total: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    observaciones: Mapped[str | None] = mapped_column(Text)
    xml_raw: Mapped[str | None] = mapped_column(Text)
    pdf_path: Mapped[str | None] = mapped_column(String(512))
    xml_path: Mapped[str | None] = mapped_column(String(512))
    estado: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDIENTE")
    origen_ingesta: Mapped[str | None] = mapped_column(String(32))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    items: Mapped[list["DTEItem"]] = relationship(
        back_populates="dte", cascade="all, delete-orphan", order_by="DTEItem.linea"
    )


class DTEItem(Base):
    __tablename__ = "dte_item"
    __table_args__ = (UniqueConstraint("dte_id", "linea"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    dte_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("dte.id", ondelete="CASCADE"), nullable=False
    )
    linea: Mapped[int] = mapped_column(Integer, nullable=False)
    sku_declarado: Mapped[str | None] = mapped_column(String(64))
    sku_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("sku_master.id")
    )
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    unidad_medida: Mapped[str | None] = mapped_column(String(16))
    cantidad: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    peso_teorico: Mapped[Decimal | None] = mapped_column(Numeric(14, 3))
    precio_unitario: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    monto_linea: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    dte: Mapped[DTE] = relationship(back_populates="items")


class EventoDespacho(Base):
    __tablename__ = "evento_despacho"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    dte_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("dte.id"))
    patente_detectada: Mapped[str | None] = mapped_column(String(16))
    camion_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    operador_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    zona_carga: Mapped[str | None] = mapped_column(String(64))
    estado: Mapped[str] = mapped_column(String(32), nullable=False, default="INICIADO")
    resultado: Mapped[str | None] = mapped_column(String(32))
    peso_entrada_kg: Mapped[Decimal | None] = mapped_column(Numeric(14, 3))
    peso_salida_kg: Mapped[Decimal | None] = mapped_column(Numeric(14, 3))
    peso_neto_kg: Mapped[Decimal | None] = mapped_column(Numeric(14, 3))
    peso_teorico_kg: Mapped[Decimal | None] = mapped_column(Numeric(14, 3))
    inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    fin: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resumen: Mapped[dict[str, Any] | None] = mapped_column(JSONType)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Conciliacion(Base):
    __tablename__ = "conciliacion"
    __table_args__ = (UniqueConstraint("evento_id", "sku_texto"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    evento_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("evento_despacho.id", ondelete="CASCADE"),
        nullable=False,
    )
    sku_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("sku_master.id")
    )
    sku_texto: Mapped[str | None] = mapped_column(String(64))
    declarado: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False, default=0)
    detectado: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False, default=0)
    diferencia: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False, default=0)
    tolerancia: Mapped[Decimal | None] = mapped_column(Numeric(6, 3))
    estado: Mapped[str] = mapped_column(String(32), nullable=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Alerta(Base):
    __tablename__ = "alerta"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    evento_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("evento_despacho.id", ondelete="CASCADE"),
        nullable=False,
    )
    tipo: Mapped[str] = mapped_column(String(32), nullable=False)
    severidad: Mapped[str] = mapped_column(String(16), nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    datos: Mapped[dict[str, Any] | None] = mapped_column(JSONType)
    canales: Mapped[list[str] | None] = mapped_column(StringArray)
    ack_user: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    ack_ts: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
