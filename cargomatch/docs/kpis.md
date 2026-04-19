# KPIs - CargoMatch

## KPIs técnicos

| Indicador | Meta MVP | Meta fase 2 |
|---|---|---|
| Precisión parsing DTE (XML) | ≥99,5% | ≥99,9% |
| Precisión parsing DTE (PDF/foto) | ≥90% | ≥95% |
| Precisión LPR | ≥95% | ≥98% |
| Precisión detección objeto (familias piloto) | ≥92% mAP@0.5 | ≥96% |
| Precisión clasificación fina SKU | ≥85% | ≥93% |
| Precisión conteo por visión | ≥90% | ≥97% |
| Matching correcto doc vs visión | ≥85% | ≥95% |
| Falsos positivos (alertas infundadas) | ≤10% | ≤3% |
| Falsos negativos (carga mala aprobada) | ≤5% | ≤1% |
| Tiempo validación por camión | ≤ tiempo manual | -30% |
| Latencia edge → dashboard | ≤2 s | ≤1 s |

## KPIs de negocio

- Reducción de diferencias reportadas por clientes (mes a mes)
- Reducción de mermas documentadas
- Reducción de tiempo de despacho por camión
- Reducción de reclamos post-venta
- Horas-hombre liberadas en control manual
- ROI acumulado (12, 18, 24 meses)

## Método de medición

- Dataset etiquetado manualmente para validación (golden set).
- Comparación continua sistema vs inspección manual durante modo sombra.
- Panel ejecutivo con tendencia semanal y mensual.
- Dashboard técnico con métricas en tiempo real (Prometheus + Grafana).
