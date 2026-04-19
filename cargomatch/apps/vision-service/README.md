# vision-service

Orquestador de visión. Recibe eventos desde edge (Jetson) y los consolida.

## Responsabilidades

- Recibir stream de detecciones desde edge por Redis Streams / gRPC.
- Consolidar tracking multi-cámara (un ítem físico = 1 track global).
- Re-identificación cuando un ítem desaparece y reaparece.
- Filtrar detecciones de baja confianza.
- Publicar `evento.deteccion_confirmada` al backend-core.

## Stack

- FastAPI (endpoint de control)
- Redis Streams (consumo de eventos edge)
- NumPy / scipy para re-identificación por embedding
- Triton Inference Server (cliente) para inferencias pesadas en servidor

## Estado

Stub. Implementación fase 2 del MVP.
