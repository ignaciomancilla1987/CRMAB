"""Tests del parser DTE."""

from decimal import Decimal
from pathlib import Path

import pytest

from app.services.dte_parser import DTEParseError, parse_dte_xml

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures"


def _read(name: str) -> bytes:
    return (FIXTURES / name).read_bytes()


def test_parse_guia_despacho_tipo_52():
    parsed = parse_dte_xml(_read("dte_52_sample.xml"))
    assert parsed.tipo_dte == 52
    assert parsed.folio == 123456
    assert parsed.rut_emisor == "76123456-7"
    assert parsed.rut_receptor == "77987654-3"
    assert parsed.patente_declarada == "JHPW21"
    assert parsed.monto_total == Decimal("279650")
    assert len(parsed.items) == 2

    item1 = parsed.items[0]
    assert item1.sku_declarado == "CEM-25"
    assert item1.descripcion.startswith("Saco cemento")
    assert item1.cantidad == Decimal("40")
    assert item1.unidad_medida == "SACO"


def test_parse_factura_tipo_33():
    parsed = parse_dte_xml(_read("dte_33_sample.xml"))
    assert parsed.tipo_dte == 33
    assert parsed.folio == 987654
    assert parsed.patente_declarada == "LKDR88"
    assert len(parsed.items) == 2
    assert parsed.items[1].sku_declarado == "TUB-110"


def test_parse_xml_vacio_falla():
    with pytest.raises(DTEParseError):
        parse_dte_xml(b"")


def test_parse_xml_invalido_falla():
    with pytest.raises(DTEParseError):
        parse_dte_xml(b"<root><broken>")


def test_parse_xml_sin_documento_falla():
    with pytest.raises(DTEParseError):
        parse_dte_xml(b"<?xml version='1.0'?><root/>")
