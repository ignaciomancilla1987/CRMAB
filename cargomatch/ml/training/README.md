# ml/training

Pipelines de entrenamiento.

## Estructura sugerida

```
training/
├── configs/            # YAML por experimento
├── scripts/
│   ├── train_det.py    # Ultralytics YOLO / MMDetection
│   ├── train_cls.py    # fine-tune EfficientNet / CLIP
│   └── export_trt.py   # ONNX → TensorRT para edge
├── notebooks/
└── pyproject.toml
```

## Stack

- Ultralytics (YOLOv11)
- MMDetection / MMSegmentation
- PyTorch 2.4+
- MLflow para tracking
- DVC para dataset versioning
- Weights & Biases (opcional)

## Flujo

1. Anotar dataset → `ml/datasets/`
2. Entrenar: `python scripts/train_det.py --config configs/det_familias.yaml`
3. Log automático a MLflow.
4. Evaluar contra golden set.
5. Si pasa umbral → export ONNX → TensorRT → registro en MLflow.
6. Deploy al edge vía `ansible`/`ssh` o pull del Jetson.

## Umbrales de promoción

- Detección: mAP@0.5 ≥ 0.92 en golden set.
- Clasificación: F1 macro ≥ 0.88.
- Sin regresión >2 pp contra modelo en producción.
