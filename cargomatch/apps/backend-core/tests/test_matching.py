"""Tests del motor de matching."""

from decimal import Decimal

from app.models.schemas import DTEItem
from app.services.matching import (
    RESULT_CONFORME,
    RESULT_OBSERVACIONES,
    RESULT_RECHAZADA,
    conciliar,
)


def _item(sku: str, cant: str, desc: str = "", um: str = "UN") -> DTEItem:
    return DTEItem(
        linea=1,
        sku_declarado=sku,
        descripcion=desc or sku,
        unidad_medida=um,
        cantidad=Decimal(cant),
    )


def test_conforme_cuando_detectado_igual_declarado():
    declarados = [_item("CEM-25", "40"), _item("ZNC-07", "10")]
    detectados = {"CEM-25": Decimal("40"), "ZNC-07": Decimal("10")}
    res = conciliar(declarados, detectados)
    assert res.resultado == RESULT_CONFORME
    assert all(l.estado == "OK" for l in res.lineas)
    assert len(res.alertas) == 0


def test_observaciones_cuando_exceso_dentro_de_tolerancia_falla():
    declarados = [_item("CEM-25", "40")]
    detectados = {"CEM-25": Decimal("42")}
    res = conciliar(declarados, detectados, default_tol_pct=2.0)
    assert res.resultado in (RESULT_OBSERVACIONES, RESULT_RECHAZADA)
    # 2 unidades extra > 2% de 40 (=0.8) → alerta
    assert any(a["tipo"] == "EXCESO" for a in res.alertas)


def test_rechazada_cuando_hay_faltante():
    declarados = [_item("CEM-25", "40")]
    detectados = {"CEM-25": Decimal("35")}
    res = conciliar(declarados, detectados)
    assert res.resultado == RESULT_RECHAZADA
    assert any(a["tipo"] == "FALTANTE" for a in res.alertas)


def test_rechazada_cuando_material_no_documentado():
    declarados = [_item("CEM-25", "40")]
    detectados = {"CEM-25": Decimal("40"), "ZNC-07": Decimal("5")}
    res = conciliar(declarados, detectados)
    assert res.resultado == RESULT_RECHAZADA
    assert any(a["tipo"] == "NO_DOCUMENTADO" for a in res.alertas)


def test_peso_fuera_de_tolerancia_rechaza():
    declarados = [_item("CEM-25", "40")]
    detectados = {"CEM-25": Decimal("40")}
    res = conciliar(
        declarados,
        detectados,
        peso_teorico_kg=Decimal("1000"),
        peso_neto_kg=Decimal("900"),
        tol_peso_pct=1.5,
    )
    assert res.peso_ok is False
    assert res.resultado == RESULT_RECHAZADA
