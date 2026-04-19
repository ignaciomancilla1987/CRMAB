# backend-core

API principal de CargoMatch.

## Correr en dev

```bash
pip install -e .
uvicorn app.main:app --reload --port 8000
```

Docs interactivas en http://localhost:8000/docs

## Endpoints implementados

- `GET /healthz` / `GET /readyz`
- `POST /api/v1/dte/parse` — parsear XML DTE sin persistir (útil para testing)
- `POST /api/v1/dte/ingest` — parsear + persistir (persistencia TODO)
- `POST /api/v1/matching/run` — ejecutar matching con payload in-memory

## Endpoints stub (pendientes)

- `GET /api/v1/eventos`, `POST /api/v1/eventos/iniciar`
- `GET /api/v1/alertas`, `POST /api/v1/alertas/{id}/ack`

## Tests

```bash
pytest
```
