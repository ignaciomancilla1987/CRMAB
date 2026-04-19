# infra

Artefactos de infraestructura.

- `docker-compose.yml` (en la raíz del proyecto) — desarrollo local
- Futuro: `k3s/` con manifests para producción on-prem
- Futuro: `terraform/` para cloud (backup + dashboard corporativo)

## Layout productivo

- **Por sede**: 1 cluster k3s con backend, postgres (con réplica), minio, keycloak, grafana.
- **Por zona de carga**: 1 Jetson Orin NX standalone ejecutando DeepStream + un agente que publica a Redis/NATS del cluster de sede.
- **Cloud**: S3 para backup + Grafana Cloud para dashboard corporativo multisede.

## Red sugerida

```
VLAN 10 - Corporativa         10.10.0.0/24
VLAN 20 - Backend             10.20.0.0/24
VLAN 30 - CCTV dedicada       10.30.0.0/24  (cámaras, LPR, Jetson)
VLAN 40 - OT (báscula, PLC)   10.40.0.0/24
```

Firewall industrial con reglas:
- CCTV → Backend: solo RTSP, HTTPS outbound.
- Backend → CCTV: solo ONVIF management.
- OT → Backend: solo ModBus/TCP hacia servidor de báscula.
- Corporativa → Dashboard: HTTPS.
