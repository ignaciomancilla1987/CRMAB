# ml/datasets

Gestión de datasets de imágenes y anotaciones.

## Estructura

```
datasets/
├── raw/                  # imágenes crudas desde cámaras en sitio
├── processed/            # imágenes post-procesamiento (resize, crop)
├── annotations/          # YOLO / COCO
├── golden_set/           # validación manual, no entrenamiento
└── splits/
    ├── train.txt
    ├── val.txt
    └── test.txt
```

Los directorios `raw/` y `processed/` están gitignoreados — las imágenes
se versionan con **DVC** (ver `dvc.yaml`).

## Herramientas de etiquetado

- **Label Studio** (recomendado para MVP)
- **CVAT** (para volúmenes grandes con equipo dedicado)
- **Segment Anything (SAM 2)** para pre-anotado y aceleración 3-5×

## Mínimos por clase (regla empírica)

| Escenario | Imágenes por clase |
|---|---|
| Detección de familia (cemento, plancha, perfil) | 500-1500 |
| Clasificación fina de SKU | 300-800 |
| Re-identificación de ítems similares | 1500+ |
| Edge cases (lluvia, contraluz, oclusión) | 10-15% del total |

## Medición

- Golden set curado manualmente (≥200 imágenes por familia).
- Validación continua durante modo sombra.
