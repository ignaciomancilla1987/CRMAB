# Roadmap - CargoMatch

## MVP (meses 0-6)

**Objetivo**: probar la tesis en 1 andén / 1 centro con 2-3 familias de productos de alto volumen.

### In-scope
- 1 zona de carga instrumentada (2 cámaras 8MP + 1 cenital + 1 Jetson Orin NX)
- 1 cámara LPR en acceso
- Integración con báscula existente (si la hay) vía ModBus/TCP
- Ingesta DTE por XML del SII (1 ERP integrado)
- 2-3 familias de SKU piloto (ej: sacos cemento, planchas zinc, perfiles)
- Dashboard web básico (estado en vivo, historial, evidencias)
- Motor de matching con tolerancias configurables
- Alertas: falta, sobra, no documentado
- **Modo asistido**: IA sugiere, humano aprueba. Recolecta dataset.

### Out-of-scope MVP
- RFID
- Multi-ERP
- Clasificación fina de 1000+ SKUs
- Detección de anomalías de comportamiento
- App móvil (solo tablet con dashboard)
- Redundancia de hardware

### Criterio de éxito
- ≥95% lectura correcta de patente
- ≥98% parseo correcto de DTE
- ≥90% conteo correcto de ítems (familias piloto)
- ≥85% matching correcto doc vs visión
- Reducción >30% de diferencias reportadas en la zona piloto
- Tiempo validación automatizado ≤ tiempo manual actual

## Fase 2 (meses 7-12)

- 2º y 3º andenes instrumentados
- +5 familias de productos
- Báscula totalmente automatizada
- App móvil operador
- Alertas WhatsApp/Teams
- Semáforo + barrera controlados por sistema
- Modelos específicos por familia entrenados con data del MVP

## Fase 3 (meses 13-18)

- Multisede (3-5 centros)
- RFID en pallets críticos
- Modelo de detección de anomalías de comportamiento
- Integración bidireccional ERP (sello DTE + bloqueo automático)
- Analytics histórico (patrones por cliente, operador, turno)
- Re-identificación de vehículos/operadores sospechosos (con resguardos legales)
- Modo desasistido para confianza >99%

## Fase 4 (mes 18+)

- API comercial B2B (auditoría de despacho como servicio)
- Modelos federados por sede
- Integración con seguros / peritajes automáticos

## Cronograma detallado

```
Mes 0    Descubrimiento, relevamiento, supuestos firmados
Mes 1    Compra HW, recolección dataset inicial, diseño detallado
Mes 2    Instalación HW, integración DTE, primer modelo entrenado
Mes 3    Integración matching + dashboard, pruebas internas
Mes 4    Piloto en producción modo sombra (observa, no bloquea)
Mes 5    Calibración tolerancias, retraining con data real
Mes 6    Go-live MVP modo asistido, publicación KPIs
Mes 7-9  Fase 2: más andenes, más SKUs, alertas activas
Mes 10-12  Escalamiento a 2º centro, optimización modelos
Mes 13-18  Multisede, integraciones avanzadas, analytics
```

## Hitos críticos

1. Firma de supuestos (mes 0)
2. Primer modelo entrenado con data real (mes 2)
3. Modo sombra (mes 4)
4. Go-live MVP (mes 6)
5. Segundo andén operativo (mes 8)
6. Segundo centro operativo (mes 12)
