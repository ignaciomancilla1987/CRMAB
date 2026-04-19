# CargoMatch

Sistema de validación inteligente de despachos que contrasta guías de despacho
y facturas electrónicas (DTE del SII) contra lo que realmente sube al camión,
usando cámaras, visión artificial, OCR y pesaje.

> Objetivo: reducir errores operativos, robos internos, diferencias de carga y
> reclamos posteriores en centros de distribución, bodegas y patios industriales.

## Estado

**Fase actual**: MVP demostrable sin hardware (mock del edge Jetson).

- [x] Documentación de arquitectura completa (ver `docs/`)
- [x] Backend FastAPI con parser DTE tipo 33 (factura) y 52 (guía de despacho)
- [x] Persistencia real PostgreSQL (modelos ORM + repositorios)
- [x] Motor de matching doc vs visión (con tolerancias y pesaje)
- [x] Endpoint `/eventos/simular` que emula al edge Jetson
- [x] Dashboard conectado: listar DTEs, simular despacho, ver conciliación/alertas
- [x] docker-compose con Postgres + Redis + MinIO
- [x] 20 tests (unitarios + integración end-to-end con SQLite in-memory)
- [ ] Servicio de visión real (edge Jetson)
- [ ] Integración báscula / LPR / RFID
- [ ] MLOps y entrenamiento de modelos

## Estructura

```
cargomatch/
├── docs/                        Documentación técnica y de negocio
│   ├── architecture.md          Arquitectura general
│   ├── hardware.md              Recomendación detallada de hardware
│   ├── roadmap.md               MVP, fase 2, fase 3
│   ├── kpis.md                  Indicadores técnicos y de negocio
│   ├── risks.md                 Riesgos y limitaciones
│   └── critical-questions.md    Preguntas a resolver antes de construir
│
├── apps/
│   ├── backend-core/            API principal (FastAPI + Postgres)
│   ├── doc-service/             OCR + estructurado de PDFs
│   ├── vision-service/          Orquesta inferencia de visión
│   └── web-dashboard/           Dashboard operativo (React + Vite)
│
├── database/
│   ├── schema.sql               Schema PostgreSQL
│   └── seed.sql                 Datos de ejemplo para desarrollo
│
├── edge/
│   └── jetson-runtime/          Runtime para NVIDIA Jetson
│
├── ml/
│   ├── datasets/                Gestión de datasets
│   ├── training/                Pipelines de entrenamiento
│   └── serving/                 Configuración Triton Inference Server
│
├── infra/                       Docker, k3s, terraform
└── tests/                       Tests de integración y fixtures
```

## Quickstart (desarrollo local)

Requisitos: Docker 24+, Docker Compose v2, Python 3.11+, Node 20+.

### Opción A — docker compose (recomendado)

```bash
cd cargomatch
cp .env.example .env
docker compose up --build
```

Esto levanta Postgres (con schema + seed), Redis, MinIO y backend en :8000.
Luego corre el dashboard:

```bash
cd apps/web-dashboard
npm install && npm run dev
```

Abre http://localhost:5173.

### Opción B — sin Docker (dev solo backend + tests)

```bash
cd apps/backend-core
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest                                 # 20 tests pasan (SQLite in-memory)
```

## Demo end-to-end

Con el stack arriba (docker compose o Postgres a mano):

```bash
./scripts/demo.sh
```

Esto:
1. Ingesta una guía de despacho (`POST /api/v1/dte/ingest` con XML DTE).
2. Simula tres despachos: uno CONFORME, uno RECHAZADA por faltante y uno
   con material NO DOCUMENTADO + peso discrepante.
3. Lista eventos y alertas persistidos.

O directamente desde el dashboard: abre http://localhost:5173, elige un DTE,
click en "Simular despacho", ajusta cantidades detectadas y peso, ejecuta.

## Arquitectura en una imagen

Ver `docs/architecture.md` para el diagrama completo.

```
 Documento (DTE XML)        Cámaras + LPR + Báscula + BC/QR
        │                             │
        ▼                             ▼
  doc-service                   vision-service (edge Jetson)
        │                             │
        └──────────┬──────────────────┘
                   ▼
            matching-engine
                   │
                   ▼
            backend-core (API)
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
      Postgres  MinIO    Dashboard
```

## Stack

| Capa | Tecnología |
|---|---|
| API | Python 3.11 + FastAPI |
| DB | PostgreSQL 16 (+ TimescaleDB fase 2) |
| Cache/cola | Redis + RabbitMQ |
| Object storage | MinIO (on-prem) / S3 |
| Frontend | React 18 + Vite + TypeScript + Tailwind |
| Inferencia | NVIDIA Triton + DeepStream (Jetson Orin) |
| OCR | PaddleOCR + LLM structurador |
| MLOps | MLflow + DVC |
| Orquestación | Docker Compose (dev) / k3s (prod) |
| Observabilidad | Grafana + Loki + Prometheus |

## Licencia

Propietario / privado. Ver `LICENSE` si existe.
