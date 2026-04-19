"""Parser de XML DTE del SII (Chile).

Soporta documentos tipo 33 (Factura electrónica) y 52 (Guía de despacho).

El SII publica el XSD oficial en:
https://www.sii.cl/factura_electronica/formato_dte.pdf

Estructura relevante del XML:

<DTE version="1.0" xmlns="http://www.sii.cl/SiiDte">
  <Documento ID="...">
    <Encabezado>
      <IdDoc>
        <TipoDTE>52</TipoDTE>
        <Folio>123456</Folio>
        <FchEmis>2026-04-19</FchEmis>
        ...
      </IdDoc>
      <Emisor><RUTEmisor>76123456-7</RUTEmisor> ...</Emisor>
      <Receptor><RUTRecep>77987654-3</RUTRecep><RznSocRecep>...</RznSocRecep></Receptor>
      <Totales><MntTotal>1234567</MntTotal></Totales>
      <Transporte><Patente>AABB12</Patente></Transporte>
    </Encabezado>
    <Detalle>
      <NroLinDet>1</NroLinDet>
      <CdgItem><TpoCodigo>INT1</TpoCodigo><VlrCodigo>SKU001</VlrCodigo></CdgItem>
      <NmbItem>Saco cemento 25kg</NmbItem>
      <QtyItem>40</QtyItem>
      <UnmdItem>SACO</UnmdItem>
      <PrcItem>3500</PrcItem>
      <MontoItem>140000</MontoItem>
    </Detalle>
  </Documento>
  <Signature>...</Signature>
</DTE>
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal, InvalidOperation

from lxml import etree

from app.models.schemas import DTEItem, DTEParsed

NS = {"s": "http://www.sii.cl/SiiDte"}


class DTEParseError(Exception):
    """Error parseando un XML DTE."""


def _text(node: etree._Element | None, xpath: str) -> str | None:
    if node is None:
        return None
    found = node.xpath(xpath, namespaces=NS)
    if not found:
        # Fallback sin namespace para XMLs sin xmlns
        local = xpath.replace("s:", "")
        found = node.xpath(local)
    if not found:
        return None
    val = found[0]
    if hasattr(val, "text"):
        val = val.text
    return val.strip() if isinstance(val, str) else None


def _dec(value: str | None) -> Decimal | None:
    if value is None or value == "":
        return None
    try:
        return Decimal(value.replace(",", "."))
    except (InvalidOperation, AttributeError):
        return None


def parse_dte_xml(xml_bytes: bytes) -> DTEParsed:
    """Parsea un XML DTE del SII y devuelve un DTEParsed normalizado.

    Acepta XMLs con o sin el namespace `http://www.sii.cl/SiiDte`.
    Soporta sobres `EnvioDTE` (toma el primer documento) y `DTE` individuales.
    """
    if not xml_bytes:
        raise DTEParseError("XML vacío")

    try:
        root = etree.fromstring(xml_bytes)
    except etree.XMLSyntaxError as e:
        raise DTEParseError(f"XML inválido: {e}") from e

    # Localizar nodo <Documento>
    docs = root.xpath("//s:Documento", namespaces=NS) or root.xpath("//Documento")
    if not docs:
        raise DTEParseError("No se encontró <Documento> en el XML")
    documento = docs[0]

    encabezado = documento.xpath("./s:Encabezado", namespaces=NS) or documento.xpath(
        "./Encabezado"
    )
    if not encabezado:
        raise DTEParseError("No se encontró <Encabezado>")
    encabezado = encabezado[0]

    tipo_dte_str = _text(encabezado, "./s:IdDoc/s:TipoDTE")
    folio_str = _text(encabezado, "./s:IdDoc/s:Folio")
    fch_str = _text(encabezado, "./s:IdDoc/s:FchEmis")

    if not tipo_dte_str or not folio_str or not fch_str:
        raise DTEParseError("Encabezado incompleto: faltan TipoDTE, Folio o FchEmis")

    try:
        tipo_dte = int(tipo_dte_str)
        folio = int(folio_str)
        fecha_emision = date.fromisoformat(fch_str)
    except (ValueError, TypeError) as e:
        raise DTEParseError(f"Encabezado inválido: {e}") from e

    rut_emisor = _text(encabezado, "./s:Emisor/s:RUTEmisor") or _text(
        encabezado, "./s:Emisor/s:RutEmisor"
    )
    rut_receptor = _text(encabezado, "./s:Receptor/s:RUTRecep")
    razon_social_receptor = _text(encabezado, "./s:Receptor/s:RznSocRecep")

    if not rut_emisor or not rut_receptor:
        raise DTEParseError("Faltan RUT emisor o receptor")

    monto_total = _dec(_text(encabezado, "./s:Totales/s:MntTotal"))
    patente = _text(encabezado, "./s:Transporte/s:Patente")
    observaciones = _text(documento, "./s:Referencia/s:RazonRef")

    # Detalles
    items: list[DTEItem] = []
    detalle_nodes = documento.xpath("./s:Detalle", namespaces=NS) or documento.xpath(
        "./Detalle"
    )

    for det in detalle_nodes:
        linea_str = _text(det, "./s:NroLinDet")
        try:
            linea = int(linea_str) if linea_str else len(items) + 1
        except ValueError:
            linea = len(items) + 1

        sku = _text(det, "./s:CdgItem/s:VlrCodigo")
        descripcion = _text(det, "./s:NmbItem") or ""
        cantidad = _dec(_text(det, "./s:QtyItem")) or Decimal("0")
        unidad = _text(det, "./s:UnmdItem")
        precio = _dec(_text(det, "./s:PrcItem"))
        monto = _dec(_text(det, "./s:MontoItem"))

        if not descripcion and not sku:
            continue

        items.append(
            DTEItem(
                linea=linea,
                sku_declarado=sku,
                descripcion=descripcion,
                unidad_medida=unidad,
                cantidad=cantidad,
                precio_unitario=precio,
                monto_linea=monto,
            )
        )

    if not items:
        raise DTEParseError("DTE sin líneas de detalle")

    return DTEParsed(
        tipo_dte=tipo_dte,
        folio=folio,
        rut_emisor=rut_emisor,
        rut_receptor=rut_receptor,
        razon_social_receptor=razon_social_receptor,
        fecha_emision=fecha_emision,
        patente_declarada=patente,
        monto_total=monto_total,
        observaciones=observaciones,
        items=items,
    )
