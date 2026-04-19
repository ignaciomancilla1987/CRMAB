"""Entrypoint FastAPI."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.routes import alertas, dte, eventos, health, matching
from app.core.config import get_settings
from app.core.logging import setup_logging

setup_logging()
settings = get_settings()

app = FastAPI(
    title="CargoMatch API",
    version=__version__,
    description=(
        "API para validación inteligente de despachos: ingesta de DTE del SII, "
        "conciliación con detecciones de visión artificial y pesaje, alertas y "
        "trazabilidad."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)

API_V1 = "/api/v1"
app.include_router(dte.router, prefix=API_V1)
app.include_router(matching.router, prefix=API_V1)
app.include_router(eventos.router, prefix=API_V1)
app.include_router(alertas.router, prefix=API_V1)


@app.get("/", tags=["system"])
def root() -> dict:
    return {
        "name": "CargoMatch API",
        "version": __version__,
        "docs": "/docs",
    }
