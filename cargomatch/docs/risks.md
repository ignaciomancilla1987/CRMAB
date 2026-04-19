# Riesgos y limitaciones

## Lo que sí funciona bien hoy

- OCR / parsing de DTE (XML del SII es gratis y limpio)
- LPR con cámara dedicada (>97% en condiciones razonables)
- Detección y conteo de objetos diferenciables visualmente en carga ordenada
- Matching determinístico con tolerancias
- Pesaje cruzado con báscula

## Lo difícil

- **Productos visualmente idénticos con SKU distinto**: sin código, la cámara sola no puede distinguir.
  **→ Solución obligatoria**: QR/BC en empaque o etiqueta de pallet.
- **Carga apilada y tapada**: lo que está al fondo no se ve.
  **→ Solución**: conteo en el momento de carga (ítem cruzando plano de cámara), no al final.
- **Granel embolsado**: variabilidad de tamaño confunde modelos.
  **→ Solución**: peso + conteo visual combinados.
- **Lluvia, polvo, vapor, contraluz**: degradan detección.
  **→ Solución**: carcasa IP67, limpieza programada, iluminación controlada, data del propio sitio.
- **Grúa horquilla tapando cámara**: inevitable parcial.
  **→ Solución**: múltiples ángulos + tracking tolerante a oclusión.
- **Camión mal posicionado**: sin magia.
  **→ Solución**: marcas en el suelo + semáforo de posicionamiento + PTZ respaldo.
- **Carga mixta con 20+ SKUs**: matching ambiguo.
  **→ Solución**: scan de guía por ítem o QR en cada pallet.

## Lo que NO debería resolverse solo con cámaras

1. Diferenciar dos productos químicos en envase idéntico → **etiqueta con QR obligatoria**
2. Pesar granel → **báscula**, sin discusión
3. Inventario final exacto con 200 cajas mezcladas → **RFID o picking con scanner**
4. Validar amarre/aseguramiento de planchada → **inspección humana**
5. Detectar contenido dentro de caja cerrada → **precinto numerado + foto precinto**

## Riesgos de proyecto

| Riesgo | Mitigación |
|---|---|
| Catálogo de SKUs cambia cada mes | Pipeline de reentrenamiento + few-shot learning |
| Operadores saboteando sistema (tapan cámara, cambian ángulo) | Cámaras a altura inaccesible + detección de "cámara obstruida" |
| Falsos positivos generan fricción → desactivan alertas | Tolerancias calibradas + modo observación antes de bloqueante |
| Cambio de empaque del proveedor rompe el modelo | Validación de deriva + dataset versionado |
| Red caída en planta | Edge autónomo + cola local + sync diferido |
| Uso de imágenes de trabajadores (Ley 19.628) | Aviso visible + anonimización + finalidad declarada |
| Rechazo sindical / gremial | Plan de gestión de cambio + comunicación + piloto con champions |
| Dependencia de un único ERP | Adapter pattern + pruebas de integración por ERP |
| Modelos degradan con el tiempo (data drift) | Monitor de drift + reentrenamiento trimestral |
