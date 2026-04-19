"""Motor de matching: conciliación entre ítems declarados (DTE) y detectados (visión).

Algoritmo:
1. Agrupa ítems declarados por SKU (o por descripción normalizada si no hay SKU).
2. Agrupa detecciones confirmadas por tracking (un track = un ítem físico).
3. Por cada SKU en la unión, calcula diferencia = detectado - declarado.
4. Aplica tolerancia (por SKU, por familia o global).
5. Clasifica cada línea: OK / EXCESO / FALTANTE / NO_DOCUMENTADO.
6. Si hay pesaje disponible, valida peso neto vs peso teórico.
7. Agrega severidades y decide resultado final.
"""

from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from typing import Iterable

from app.models.schemas import ConciliacionLinea, DTEItem, MatchingResult

ESTADO_OK = "OK"
ESTADO_EXCESO = "EXCESO"
ESTADO_FALTANTE = "FALTANTE"
ESTADO_NO_DOC = "NO_DOCUMENTADO"

RESULT_CONFORME = "CONFORME"
RESULT_OBSERVACIONES = "OBSERVACIONES"
RESULT_RECHAZADA = "RECHAZADA"


def _key(item_sku: str | None, descripcion: str) -> str:
    """Clave de agrupación: SKU si existe, si no descripción normalizada."""
    if item_sku:
        return item_sku.strip().upper()
    return descripcion.strip().upper()


def _tolerance_for(sku: str, tolerancias: dict[str, Decimal], default_pct: Decimal) -> Decimal:
    """Resuelve la tolerancia absoluta para un SKU.

    Si hay tolerancia específica la usa, si no usa el porcentaje por defecto
    aplicado sobre la cantidad declarada (calculado afuera)."""
    return tolerancias.get(sku, default_pct)


def conciliar(
    declarados: Iterable[DTEItem],
    detectados: dict[str, Decimal],
    *,
    tolerancias: dict[str, Decimal] | None = None,
    default_tol_pct: float = 2.0,
    peso_teorico_kg: Decimal | None = None,
    peso_neto_kg: Decimal | None = None,
    tol_peso_pct: float = 1.5,
) -> MatchingResult:
    """Ejecuta el matching y devuelve el resultado estructurado.

    Args:
        declarados: ítems del DTE.
        detectados: dict {sku_o_descripcion_upper: cantidad_detectada}.
        tolerancias: overrides por SKU (valor absoluto en unidades).
        default_tol_pct: % de tolerancia por defecto.
        peso_teorico_kg / peso_neto_kg: opcional, si hay báscula.
        tol_peso_pct: % de tolerancia en peso.
    """
    tolerancias = tolerancias or {}
    default_tol = Decimal(str(default_tol_pct)) / Decimal("100")

    agrupado_decl: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    descripciones: dict[str, str] = {}
    for item in declarados:
        k = _key(item.sku_declarado, item.descripcion)
        agrupado_decl[k] += item.cantidad
        descripciones.setdefault(k, item.descripcion)

    detectado_upper: dict[str, Decimal] = {
        k.upper(): Decimal(str(v)) for k, v in detectados.items()
    }

    all_keys = set(agrupado_decl.keys()) | set(detectado_upper.keys())

    lineas: list[ConciliacionLinea] = []
    alertas: list[dict] = []

    for k in sorted(all_keys):
        declarado = agrupado_decl.get(k, Decimal("0"))
        detectado = detectado_upper.get(k, Decimal("0"))
        diferencia = detectado - declarado

        tol_abs = _tolerance_for(k, tolerancias, (declarado * default_tol).quantize(Decimal("0.001")))

        if k not in agrupado_decl and detectado > 0:
            estado = ESTADO_NO_DOC
            alertas.append({
                "tipo": ESTADO_NO_DOC,
                "severidad": "ERROR",
                "sku": k,
                "detectado": float(detectado),
                "mensaje": f"Material no declarado en DTE: {k} (detectado {detectado})",
            })
        elif abs(diferencia) <= tol_abs:
            estado = ESTADO_OK
        elif diferencia > 0:
            estado = ESTADO_EXCESO
            alertas.append({
                "tipo": ESTADO_EXCESO,
                "severidad": "WARNING",
                "sku": k,
                "diferencia": float(diferencia),
                "mensaje": f"Exceso: {k} declarado {declarado}, detectado {detectado}",
            })
        else:
            estado = ESTADO_FALTANTE
            alertas.append({
                "tipo": ESTADO_FALTANTE,
                "severidad": "ERROR",
                "sku": k,
                "diferencia": float(diferencia),
                "mensaje": f"Faltante: {k} declarado {declarado}, detectado {detectado}",
            })

        lineas.append(
            ConciliacionLinea(
                sku=k,
                declarado=declarado,
                detectado=detectado,
                diferencia=diferencia,
                tolerancia=tol_abs,
                estado=estado,
            )
        )

    peso_ok: bool | None = None
    if peso_teorico_kg is not None and peso_neto_kg is not None:
        tol_peso = (peso_teorico_kg * Decimal(str(tol_peso_pct)) / Decimal("100")).quantize(
            Decimal("0.001")
        )
        peso_ok = abs(peso_neto_kg - peso_teorico_kg) <= tol_peso
        if not peso_ok:
            alertas.append({
                "tipo": "DIFERENCIA_PESO",
                "severidad": "ERROR",
                "teorico_kg": float(peso_teorico_kg),
                "neto_kg": float(peso_neto_kg),
                "tolerancia_kg": float(tol_peso),
                "mensaje": (
                    f"Peso fuera de tolerancia: teórico {peso_teorico_kg} kg, "
                    f"neto {peso_neto_kg} kg"
                ),
            })

    resultado = _decidir_resultado(alertas, peso_ok)

    return MatchingResult(
        resultado=resultado,
        lineas=lineas,
        alertas=alertas,
        peso_ok=peso_ok,
    )


def _decidir_resultado(alertas: list[dict], peso_ok: bool | None) -> str:
    """Agrega severidades y decide resultado final."""
    severidades = {a.get("severidad") for a in alertas}
    tipos = {a.get("tipo") for a in alertas}

    if "CRITICAL" in severidades or ESTADO_NO_DOC in tipos or "DIFERENCIA_PESO" in tipos:
        return RESULT_RECHAZADA
    if "ERROR" in severidades:
        return RESULT_RECHAZADA
    if "WARNING" in severidades:
        return RESULT_OBSERVACIONES
    return RESULT_CONFORME
