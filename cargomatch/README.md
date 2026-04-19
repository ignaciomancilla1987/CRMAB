# CargoMatch

Sistema de validación inteligente de despachos que contrasta guías de despacho
y facturas electrónicas (DTE del SII) contra lo que realmente sube al camión,
usando cámaras, visión artificial, OCR y pesaje.

> Objetivo: reducir errores operativos, robos internos, diferencias de carga y
> reclamos posteriores en centros de distribución, bodegas y patios industriales.

## Estado

**Fase actual**: scaffold inicial de arquitectura y MVP de parsing DTE.

- [x] Documentación de arquitectura completa (ver `docs/`)
- [x] Backend FastAPI con parser DTE tipo 33 (factura) y 52 (guía de despacho)
- [x] Schema PostgreSQL inicial
- [x] docker-compose con Postgres + Redis + MinIO
- [x] Stub dashboard React + Vite
- [ ] Servicio de visión (edge Jetson)
- [ ] Motor de matching doc vs visión
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

```bash
cd cargomatch
cp .env.example .env
docker compose up -d postgres redis minio
```

Backend:

```bash
cd apps/backend-core
pip install -e .
uvicorn app.main:app --reload --port 8000
```

Probar el parser DTE con un XML de ejemplo:

```bash
curl -X POST http://localhost:8000/api/v1/dte/ingest \
  -H "Content-Type: application/xml" \
  --data-binary @../../tests/fixtures/dte_52_sample.xml
```

Dashboard:

```bash
cd apps/web-dashboard
npm install
npm run dev
```

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
