"""Smoke tests: valida que el API arranca y expone los endpoints esperados.

No requieren base de datos real; sólo comprueban que las rutas están
registradas y los schemas se exponen.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_ok():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["name"] == "CargoMatch API"


def test_healthz():
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_openapi_expone_endpoints():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    paths = r.json()["paths"]
    esperados = [
        "/api/v1/dte/parse",
        "/api/v1/dte/ingest",
        "/api/v1/dte",
        "/api/v1/dte/{dte_id}",
        "/api/v1/eventos",
        "/api/v1/eventos/simular",
        "/api/v1/eventos/{evento_id}",
        "/api/v1/matching/run",
        "/api/v1/alertas",
    ]
    for path in esperados:
        assert path in paths, f"Endpoint faltante: {path}"


def test_dte_parse_fixture():
    """El endpoint /dte/parse debe parsear el fixture sin necesitar BD."""
    from pathlib import Path

    fixture = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "dte_52_sample.xml"
    xml = fixture.read_bytes()
    r = client.post(
        "/api/v1/dte/parse",
        content=xml,
        headers={"Content-Type": "application/xml"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["tipo_dte"] == 52
    assert data["folio"] == 123456
    assert data["patente_declarada"] == "JHPW21"
    assert len(data["items"]) == 2


def test_matching_run_endpoint():
    """El endpoint /matching/run debe ejecutar conciliación sin BD."""
    payload = {
        "declarados": [
            {"linea": 1, "sku_declarado": "CEM-25", "descripcion": "Saco cemento",
             "unidad_medida": "SACO", "cantidad": 40},
        ],
        "detectados": {"CEM-25": 40},
    }
    r = client.post("/api/v1/matching/run", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["resultado"] == "CONFORME"


def test_matching_run_detecta_faltante():
    payload = {
        "declarados": [
            {"linea": 1, "sku_declarado": "CEM-25", "descripcion": "Saco cemento",
             "unidad_medida": "SACO", "cantidad": 40},
        ],
        "detectados": {"CEM-25": 30},
    }
    r = client.post("/api/v1/matching/run", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["resultado"] == "RECHAZADA"
    assert any(a["tipo"] == "FALTANTE" for a in data["alertas"])
