# doc-service

Servicio de ingesta documental.

## Responsabilidades

- Recibir DTE por múltiples canales:
  - Webhook desde ERP
  - Watcher de carpeta (integración archivo plano)
  - Email parser (adjunto XML/PDF)
  - Upload manual desde dashboard
- OCR en PDFs o fotos de guías físicas (PaddleOCR).
- LLM structurador (Claude / GPT) para convertir texto OCR a JSON con schema.
- Validación contra schema del SII.
- Publicación de `dte.created` en Redis/NATS.

## Stack

- FastAPI
- PaddleOCR 2.9+
- Anthropic SDK (Claude) o OpenAI SDK
- lxml / xmltodict

## Estado

Stub inicial. El parser XML del SII está implementado en `backend-core`
(`app/services/dte_parser.py`). La parte de OCR + LLM se construye aquí
en fase 2.

## Pseudocódigo

```python
@app.post("/ingest/pdf")
async def ingest_pdf(file: UploadFile):
    pdf_bytes = await file.read()
    text = paddle_ocr(pdf_bytes)
    dte_json = llm_structure(text, schema=DTE_SCHEMA)
    validate(dte_json)
    publish("dte.created", dte_json)
    return dte_json
```
