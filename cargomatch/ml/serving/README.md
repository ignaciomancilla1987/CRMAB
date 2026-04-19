# ml/serving

Configuración de NVIDIA Triton Inference Server.

## Layout de modelos

```
model_repository/
├── det_familias/
│   ├── 1/model.plan      # TensorRT engine
│   └── config.pbtxt
├── cls_cemento/
│   ├── 1/model.onnx
│   └── config.pbtxt
└── lpr_anpr/
    ├── 1/model.plan
    └── config.pbtxt
```

## Dónde corre Triton

- En servidor central (GPU L4) para inferencias pesadas consolidadas.
- En edge Jetson, DeepStream ejecuta los engines directamente (no Triton).

## Promoción de modelos

`mlflow` + webhook → job que copia modelos al repositorio de Triton
y hace reload sin downtime (Triton soporta model polling).
