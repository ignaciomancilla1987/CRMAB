#!/usr/bin/env bash
# Demo end-to-end: ingesta DTE → simular despacho → revisar evento.
#
# Requisito: backend corriendo en http://localhost:8000 con Postgres detrás.
#   cd cargomatch && docker compose up -d
#
# Uso:
#   ./scripts/demo.sh

set -euo pipefail

API="${API:-http://localhost:8000/api/v1}"
FIXTURES="$(dirname "$0")/../tests/fixtures"

echo "→ 1. Ingestando guía de despacho (DTE tipo 52)..."
DTE_JSON=$(curl -s -X POST "$API/dte/ingest" \
  -H "Content-Type: application/xml" \
  --data-binary "@$FIXTURES/dte_52_sample.xml")
echo "$DTE_JSON" | python3 -m json.tool | head -20
DTE_ID=$(echo "$DTE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "   DTE id: $DTE_ID"

echo
echo "→ 2. Listando DTEs..."
curl -s "$API/dte" | python3 -m json.tool | head -10

echo
echo "→ 3. Simulando despacho CONFORME (detectamos exactamente lo declarado)..."
curl -s -X POST "$API/eventos/simular" \
  -H "Content-Type: application/json" \
  -d "{
    \"dte_id\": \"$DTE_ID\",
    \"detectados\": {\"CEM-25\": 40, \"ZNC-07\": 10}
  }" | python3 -m json.tool | head -30

echo
echo "→ 4. Simulando despacho RECHAZADA (falta 5 sacos cemento)..."
curl -s -X POST "$API/eventos/simular" \
  -H "Content-Type: application/json" \
  -d "{
    \"dte_id\": \"$DTE_ID\",
    \"detectados\": {\"CEM-25\": 35, \"ZNC-07\": 10}
  }" | python3 -m json.tool | head -30

echo
echo "→ 5. Simulando despacho con material NO DOCUMENTADO (sacos extra + SKU ajeno)..."
curl -s -X POST "$API/eventos/simular" \
  -H "Content-Type: application/json" \
  -d "{
    \"dte_id\": \"$DTE_ID\",
    \"detectados\": {\"CEM-25\": 40, \"ZNC-07\": 10, \"PER-50\": 3},
    \"peso_neto_kg\": 1200
  }" | python3 -m json.tool | head -40

echo
echo "→ 6. Listando eventos generados..."
curl -s "$API/eventos" | python3 -m json.tool | head -30

echo
echo "→ 7. Listando alertas..."
curl -s "$API/alertas" | python3 -m json.tool | head -30

echo
echo "Demo completa. Abre http://localhost:5173 para ver el dashboard."
