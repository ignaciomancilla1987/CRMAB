"""Test de integración del flujo end-to-end.

1. Ingesta un DTE (XML del SII).
2. Lo lista.
3. Simula despacho con detección conforme → evento CONFORME.
4. Simula despacho con detección con faltante → evento RECHAZADA.
5. Verifica que las alertas quedaron persistidas.
"""

from __future__ import annotations

from pathlib import Path

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures"


def test_flujo_completo_ingesta_y_simulacion(client):
    # 1. Ingestar DTE
    xml = (FIXTURES / "dte_52_sample.xml").read_bytes()
    r = client.post("/api/v1/dte/ingest", content=xml, headers={"Content-Type": "application/xml"})
    assert r.status_code == 201, r.text
    dte = r.json()
    assert dte["tipo_dte"] == 52
    assert dte["folio"] == 123456
    assert dte["patente_declarada"] == "JHPW21"
    assert dte["total_items"] == 2
    dte_id = dte["id"]

    # 2. Listarlo
    r = client.get("/api/v1/dte")
    assert r.status_code == 200
    lista = r.json()
    assert lista["total"] == 1
    assert lista["items"][0]["id"] == dte_id

    # 3. Obtener por id
    r = client.get(f"/api/v1/dte/{dte_id}")
    assert r.status_code == 200
    assert len(r.json()["items"]) == 2

    # 4. Simular despacho CONFORME
    r = client.post(
        "/api/v1/eventos/simular",
        json={
            "dte_id": dte_id,
            "detectados": {"CEM-25": 40, "ZNC-07": 10},
        },
    )
    assert r.status_code == 200, r.text
    evento_ok = r.json()
    assert evento_ok["resultado"] == "CONFORME"
    assert evento_ok["estado"] == "FINALIZADO"
    assert all(c["estado"] == "OK" for c in evento_ok["conciliaciones"])
    assert len(evento_ok["alertas"]) == 0

    # 5. Simular despacho RECHAZADA (falta cemento)
    r = client.post(
        "/api/v1/eventos/simular",
        json={
            "dte_id": dte_id,
            "detectados": {"CEM-25": 35, "ZNC-07": 10},
        },
    )
    assert r.status_code == 200
    evento_bad = r.json()
    assert evento_bad["resultado"] == "RECHAZADA"
    assert any(c["estado"] == "FALTANTE" for c in evento_bad["conciliaciones"])
    assert any(a["tipo"] == "FALTANTE" for a in evento_bad["alertas"])

    # 6. Simular despacho con material no documentado + peso discrepante
    r = client.post(
        "/api/v1/eventos/simular",
        json={
            "dte_id": dte_id,
            "detectados": {"CEM-25": 40, "ZNC-07": 10, "PER-50": 3},
            "peso_neto_kg": 500,
        },
    )
    assert r.status_code == 200
    evento_nodoc = r.json()
    assert evento_nodoc["resultado"] == "RECHAZADA"
    tipos = {a["tipo"] for a in evento_nodoc["alertas"]}
    assert "NO_DOCUMENTADO" in tipos

    # 7. Listar eventos
    r = client.get("/api/v1/eventos")
    assert r.status_code == 200
    eventos = r.json()
    assert eventos["total"] == 3

    # 8. Detalle de evento con conciliación y alertas
    r = client.get(f"/api/v1/eventos/{evento_bad['id']}")
    assert r.status_code == 200
    det = r.json()
    assert det["resultado"] == "RECHAZADA"
    assert len(det["conciliaciones"]) == 2

    # 9. Listar alertas globalmente
    r = client.get("/api/v1/alertas")
    assert r.status_code == 200
    alertas = r.json()
    assert alertas["total"] >= 2


def test_simular_sin_dte_falla(client):
    r = client.post("/api/v1/eventos/simular", json={"detectados": {"X": 1}})
    assert r.status_code == 400


def test_simular_con_dte_inexistente_404(client):
    r = client.post(
        "/api/v1/eventos/simular",
        json={
            "dte_id": "00000000-0000-0000-0000-000000000000",
            "detectados": {"X": 1},
        },
    )
    assert r.status_code == 404


def test_ingesta_duplicada_actualiza_en_lugar_de_fallar(client):
    xml = (FIXTURES / "dte_52_sample.xml").read_bytes()
    r1 = client.post("/api/v1/dte/ingest", content=xml, headers={"Content-Type": "application/xml"})
    assert r1.status_code == 201
    r2 = client.post("/api/v1/dte/ingest", content=xml, headers={"Content-Type": "application/xml"})
    assert r2.status_code == 201
    # Mismo id (upsert por tipo+folio+rut_emisor)
    assert r1.json()["id"] == r2.json()["id"]
