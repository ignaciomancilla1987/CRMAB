# edge / jetson-runtime

Runtime para NVIDIA Jetson Orin NX 16GB instalado en cada zona de carga.

## Funciones

1. Conectarse vía RTSP a las cámaras de su zona (3-4 cámaras típicamente).
2. Correr pipeline DeepStream con modelos optimizados (TensorRT FP16/INT8):
   - Detección (YOLOv11 o RT-DETR)
   - Tracking (ByteTrack / BoT-SORT)
   - Clasificación fina por familia (si aplica)
   - Lectura de códigos de barras / QR en pallets
3. Publicar detecciones consolidadas a Redis Streams del servidor central.
4. Almacenar clips de video locales y subirlos a MinIO cuando hay evento.
5. Funcionar autónomamente con cola local si la red se cae.

## Bundle

```
/opt/cargomatch-edge/
├── deepstream-app/
│   └── config_infer_*.txt
├── models/
│   ├── det_familias.onnx → det_familias.engine
│   ├── cls_cemento.onnx  → cls_cemento.engine
│   └── bc_reader.onnx    → bc_reader.engine
├── bin/
│   └── cargomatch-edge (Python agent)
└── systemd/
    └── cargomatch-edge.service
```

## Estado

Placeholder. Implementación real requiere:
- Jetson físico con JetPack 6+.
- Datasets etiquetados (fase 1 del MVP).
- Modelos entrenados exportados a TensorRT.

## Arquitectura de datos

```
Camera RTSP ──► DeepStream ──► nvinfer (detección) ──► nvtracker ──►
  ──► sgie1 (clasificación fina) ──► sgie2 (lectura código) ──►
  ──► sink (Redis Stream publisher + local video buffer)
```
