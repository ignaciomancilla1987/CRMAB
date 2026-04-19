# Arquitectura - CargoMatch

> Validación inteligente de despachos: contrastar DTE (guía/factura) vs carga
> real observada por cámaras + báscula + códigos, con trazabilidad completa.

## 1. Principios rectores

1. **Determinismo donde se pueda, IA donde haga falta.** El SII entrega XML estructurado: no se usa OCR para algo que viene limpio.
2. **Degradación elegante.** Si un modelo tiene baja confianza, se escala a humano. No se fuerza decisión.
3. **Humano en el loop por diseño.** La UI del operador muestra la sugerencia de IA con botón de corrección, y esa corrección alimenta el dataset.
4. **Edge + servidor central on-prem.** Inferencia crítica cerca de las cámaras. Cloud sólo para dashboard corporativo y backup cifrado.
5. **Trazabilidad como feature de primer nivel.** Evidencia firmada, hash encadenado, retención auditable.
6. **Un modelo por familia de productos**, no un único modelo universal.

## 2. Vista lógica (capas)

```
┌──────────────────────────────────────────────────────────────────────┐
│  PRESENTACIÓN                                                        │
│  Dashboard Web · App móvil operador · Panel evidencias · Alertas     │
└──────────────────────────────────────────────────────────────────────┘
           ▲                                              ▲
┌──────────┴──────────────────────────────────────────────┴───────────┐
│  APLICACIÓN / BACKEND                                               │
│  API Gateway · Orquestador · Motor de Reglas · Alertas · Auditoría  │
└──────────────────────────────────────────────────────────────────────┘
    ▲            ▲            ▲              ▲              ▲
┌───┴────┐ ┌─────┴─────┐ ┌────┴─────┐ ┌──────┴─────┐ ┌──────┴─────┐
│Doc Svc │ │Vision Svc │ │Match Svc │ │ERP Adapter │ │HW Adapters │
│OCR+LLM │ │det+count  │ │doc vs cv │ │SAP/Bsale/..│ │cam/LPR/bcl │
└────────┘ └───────────┘ └──────────┘ └────────────┘ └────────────┘
    ▲            ▲                                          ▲
┌───┴──────┐ ┌───┴──────────────────────────┐    ┌──────────┴──────┐
│Scanner+  │ │EDGE AI (NVIDIA Jetson Orin)  │    │Cam IP, LPR,     │
│cam doc   │ │Triton/DeepStream, tracking   │    │báscula ModBus,  │
│          │ │                              │    │BC/QR/RFID       │
└──────────┘ └──────────────────────────────┘    └─────────────────┘
```

## 3. Componentes

| Componente | Responsabilidad | Tech |
|---|---|---|
| `backend-core` | API principal, orquestación, reglas, auditoría | FastAPI + Postgres |
| `doc-service` | Ingesta DTE (XML SII), OCR (PDF/foto), estructurado | FastAPI + PaddleOCR + LLM |
| `vision-service` | Recibe eventos de detección desde edge, consolida tracking | FastAPI + Redis streams |
| `matching-engine` | Conciliación ítem-a-ítem doc vs detecciones | Módulo dentro de backend-core |
| `rules-engine` | Reglas de negocio y tolerancias | Motor declarativo JSON |
| `alert-service` | Alertas multicanal (dashboard, WhatsApp, email, sirena) | Celery + adapters |
| `erp-adapter` | Integración con ERP (SAP, Softland, Defontana, Bsale, etc.) | Adaptadores por ERP |
| `edge-runtime` | Inferencia on-device en Jetson Orin | DeepStream + Triton |
| `web-dashboard` | UI operativa en tiempo real | React + Vite + Tailwind |

## 4. Vista de datos (modelo principal)

```
dte (1) ──< dte_item
 │
 │ 1
 │
evento_despacho ──< deteccion
 │                    │
 │ 1                  │
 │                    │
 └──< conciliacion ◄──┘
 │
 └──< alerta
 └──< evidencia
```

Entidades principales:

- `dte` (folio, tipo, fecha, emisor, receptor, patente_declarada, xml_raw, pdf_path, estado)
- `dte_item` (dte_id, linea, sku, descripcion, um, cantidad, peso_teorico, precio)
- `sku_master` (sku, descripcion, familia, um, peso, codigo_barras, aspecto_visual_ref)
- `evento_despacho` (id, dte_id, patente_detectada, operador_id, inicio, fin, resultado)
- `deteccion` (evento_id, cam_id, timestamp, track_id, sku_predicho, confianza, bbox_json)
- `conciliacion` (evento_id, sku, declarado, detectado, diferencia, estado)
- `alerta` (evento_id, tipo, severidad, canal, ack_user, ack_ts)
- `evidencia` (evento_id, tipo, path, sha256, firmada)
- `audit_log` (tabla append-only con hash encadenado)

Ver `database/schema.sql` para el DDL completo.

## 5. Flujos críticos

### 5.1 Ingesta de DTE

```
ERP emite DTE → SII firma → webhook / folder watcher → doc-service.parse()
  → valida schema → normaliza SKU contra sku_master → persiste dte + dte_item
  → publica evento `dte.created` en Redis
```

### 5.2 Ciclo de vida de evento de despacho

```
LPR lee patente → matching con DTE pendiente
  → crea evento_despacho (estado=INICIADO)
  → operador confirma → estado=EN_CURSO
  → edge publica detecciones → vision-service consolida tracks
  → operador marca fin → matching-engine ejecuta conciliación
  → báscula valida peso neto
  → rules-engine decide resultado (CONFORME / OBSERVACIONES / RECHAZADA)
  → alert-service notifica + semáforo + barrera
  → evidencia archivada con hash
```

### 5.3 Matching (núcleo)

```python
# Pseudocódigo ver apps/backend-core/app/services/matching.py
declarado = group_by(dte_items, sku)
detectado = group_by(tracks_confirmados, sku)

for sku in declarado.keys() ∪ detectado.keys():
    dif = detectado.get(sku, 0) - declarado.get(sku, 0)
    if abs(dif) <= tolerancia(sku): conciliacion.OK
    elif dif > 0:  alerta(EXCESO, sku, dif)
    elif dif < 0:  alerta(FALTANTE, sku, -dif)
    if sku not in declarado and detectado[sku] > 0:
        alerta(NO_DOCUMENTADO, sku)

peso_ok = abs(peso_bascula - peso_teorico) <= tol_peso
if not peso_ok: alerta(DIFERENCIA_PESO)

resultado = agregar(alertas)
```

## 6. Vista de despliegue

### 6.1 Desarrollo local

`docker-compose` levanta Postgres, Redis, MinIO. Backend y dashboard corren
en host. Edge se mockea con generador de eventos sintéticos.

### 6.2 Planta (producción)

- **Por zona de carga**: 1 Jetson Orin NX + 3-4 cámaras PoE + iluminación.
- **Por sede**: 1 servidor central (Dell R760 + GPU L4) + NAS + UPS + switch PoE.
- **Orquestación**: k3s on-prem, un cluster por sede.
- **Multisede**: réplica asincrónica a cloud (backup + dashboard corporativo).
- **Red**: VLAN dedicada para CCTV. TLS mutuo edge ↔ servidor.

### 6.3 Cloud opcional

Sólo para: dashboard corporativo consolidado, backup de evidencias, MLOps
(reentrenamiento), observabilidad multi-sede.

## 7. Seguridad

- **Auth**: Keycloak (OIDC) con RBAC (roles: viewer, operador, supervisor, admin, auditor).
- **Red**: firewall industrial, VLAN CCTV segregada, allowlist de IPs edge.
- **Cifrado**: TLS 1.3 en tránsito, LUKS/disk encryption en reposo.
- **Audit log**: append-only con hash SHA-256 encadenado (estilo blockchain interno).
- **Evidencias**: firmadas con HMAC o llave privada del servidor.
- **Ley 19.628 (Chile)**: aviso visible de grabación, finalidad declarada, retención definida.
- **Secretos**: Vault o SOPS, no en variables de entorno en prod.

## 8. Observabilidad

- Métricas: Prometheus + Grafana (FPS edge, latencia inferencia, throughput API, colas Redis).
- Logs: Loki + labels por servicio.
- Trazas: OpenTelemetry → Tempo.
- Alertas de sistema: Alertmanager → PagerDuty / WhatsApp.

## 9. Extensibilidad

- **ERP adapters**: cada ERP se implementa como plugin en `apps/backend-core/app/services/erp/`.
- **Modelos de visión**: Triton permite cargar modelos por familia sin redeploy.
- **Reglas**: JSON/YAML declarativos, recarga en caliente.
- **Hardware**: abstracción `HardwareAdapter` permite sumar LPR, básculas, RFID sin tocar el core.

## 10. Referencias

- Formato DTE SII Chile: https://www.sii.cl/factura_electronica/formato_dte.pdf
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- NVIDIA DeepStream SDK
- Frigate (VMS open source)
