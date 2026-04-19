# Hardware recomendado

Principio: **no una sola cámara, sino una parrilla de sensores por punto crítico.**

## Zona 1 - Lectura de documento (garita / oficina)

| Elemento | Modelo | Por qué |
|---|---|---|
| Escáner documental | Fujitsu fi-8040 / Brother ADS-4700W | Backup físico o documento de tercero |
| Cámara cenital de mesa | Logitech Brio 4K / Basler ace 2 R 5MP | Foto rápida sin pasar por scanner |
| Lector 2D fijo | Zebra DS9908 / Honeywell Xenon XP 1952g | Lee PDF417 del timbre SII |

## Zona 2 - Acceso y patente (LPR/ANPR)

| Elemento | Modelo | Spec |
|---|---|---|
| Cámara LPR | Hikvision iDS-TCM403-AI/0832 / Dahua ITC437-PW6M-IZ | 2-4 MP, óptica motorizada 8-32 mm, IR integrado |
| Gatillo | Loop inductivo o radar piso | Evita capturar sin vehículo |
| Iluminación | IR 850 nm integrado | Matrícula chilena reflectiva bajo IR |
| Resolución mínima | 2 MP @ 25-30 FPS, shutter 1/500-1/2000 | Evita motion blur |

## Zona 3 - Carga/descarga (núcleo del sistema)

| Elemento | Modelo | Cantidad |
|---|---|---|
| Cámara fija lateral | Axis P1468-LE / Hikvision DS-2CD2T87G2-L 8MP IP67 | 2 (ambos lados) |
| Cámara cenital | Axis P1377-LE 5MP (montada a 6-8 m) | 1 |
| Cámara PTZ respaldo | Axis Q6318-LE / Hikvision DS-2DE4A425IW-DE | 1 |
| Cámara profundidad | Intel RealSense D455 / Luxonis OAK-D Pro | 1 |
| Cámara lectura pallet | Basler ace 2 Pro 12 MP con lente fijo | 1 (opcional) |
| Lector RFID | Impinj R700 + antenas Threshold | opcional premium |
| Báscula camionera | Mettler Toledo VTS / Siemens Siwarex (ModBus/TCP) | 1 |
| Iluminación | Raytec Vario2 IR/WL + LED blanco ≥500 lux | según dimensión |

**FPS**: 15-25 FPS para detección/tracking. 30+ sólo en LPR.

## Zona 4 - Salida y validación final

| Elemento | Modelo |
|---|---|
| Cámaras laterales en pórtico | Hanwha Vision XNO-C8083R 5 MP (×2) |
| Cámara cenital pórtico | Axis P1468-LE en techo |
| Barrera automática | Nice M-Bar (o similar) |
| Semáforo RGY | controlado por backend |

## Edge vs servidor central

| Decisión | Recomendación |
|---|---|
| Inferencia en vivo | NVIDIA Jetson Orin NX 16 GB (uno por zona de carga) |
| LPR | Algoritmo embebido en cámara ANPR |
| Servidor central | Dell PowerEdge R760 + 1× NVIDIA L4 24GB (o 2× RTX 4000 Ada) |
| Storage | Synology RS1221+ / QNAP TS-873A con 4×8TB RAID5 + réplica |
| Red | Switch Cisco Catalyst 1300 PoE+ + CAT6 industrial |
| UPS | APC Smart-UPS 3000VA mínimo |

## Marcas - cuándo usar cada una

- **Axis**: primera opción si presupuesto permite. Estabilidad firmware, ONVIF limpio, 5 años warranty.
- **Hikvision / Dahua**: mejor relación precio/rendimiento, excelentes para LPR. Validar restricciones geopolíticas del cliente (mineras/estatales las evitan).
- **Hanwha Vision**: alternativa coreana sólida para exteriores.
- **Basler**: cuando se necesita cámara industrial dedicada (lectura de código, detección fina).
- **Luxonis OAK / Intel RealSense**: cuando se necesita profundidad.

## Cuándo NO usar solo cámaras

| Caso | Solución recomendada |
|---|---|
| Productos visualmente idénticos con SKU distinto | **QR/BC obligatorio en empaque** |
| Granel embolsado con variabilidad | **Báscula + conteo visual combinados** |
| Catálogo cerrado con 200+ SKUs mezclados | **RFID en pallet/caja** |
| Contenido dentro de caja cerrada | **Precinto numerado + foto precinto** |
| Amarre/aseguramiento de planchada | **Inspección humana** |

## Costos referenciales por andén (CLP)

| Ítem | Rango |
|---|---|
| 3-4 cámaras 8MP + PoE | $4.000.000 – $7.000.000 |
| Cámara LPR dedicada | $1.500.000 – $3.000.000 |
| Jetson Orin NX + accesorios | $1.800.000 – $2.500.000 |
| Cámara profundidad | $700.000 – $1.500.000 |
| Iluminación industrial | $500.000 – $1.500.000 |
| Switch PoE+ + UPS + rack | $1.200.000 – $2.500.000 |
| Scanner doc + lector 2D | $400.000 – $900.000 |
| Báscula (si no existe) | $25.000.000 – $60.000.000 |
| Barrera + semáforo | $1.500.000 – $3.500.000 |
| Instalación y obra | $3.000.000 – $8.000.000 |
| **Subtotal sin báscula** | **$14.6M – $30.4M** |
