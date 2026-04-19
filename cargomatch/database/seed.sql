-- CargoMatch - datos de ejemplo para desarrollo

INSERT INTO sku_master (sku, descripcion, familia, unidad_medida, peso_unitario, codigo_barras)
VALUES
    ('CEM-25', 'Saco cemento Polpaico 25 kg', 'cemento', 'SACO', 25.000, '7801234500001'),
    ('CEM-42', 'Saco cemento Melon 42.5 kg', 'cemento', 'SACO', 42.500, '7801234500002'),
    ('ZNC-07', 'Plancha zinc 0.7 mm 2.0 x 0.9 m', 'cubiertas', 'UN', 8.400, '7801234500003'),
    ('ZNC-05', 'Plancha zinc 0.5 mm 2.0 x 0.9 m', 'cubiertas', 'UN', 6.000, '7801234500004'),
    ('PER-40', 'Perfil metalico 40x40x2 mm x 6 m', 'perfiles', 'UN', 14.200, '7801234500005'),
    ('PER-50', 'Perfil metalico 50x50x2 mm x 6 m', 'perfiles', 'UN', 18.000, '7801234500006'),
    ('TUB-110', 'Tubo PVC sanitario 110 mm x 6 m', 'tuberias', 'UN', 6.500, '7801234500007'),
    ('AREN-M3', 'Arena fina (despacho embolsado)', 'aridos', 'M3', 1500.000, NULL)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO clientes (rut, razon_social, giro, vip) VALUES
    ('76123456-7', 'Constructora Andina SpA', 'Construccion', TRUE),
    ('77987654-3', 'Ferreteria El Roble Ltda', 'Comercio', FALSE),
    ('96543210-K', 'Obras Civiles del Sur SA', 'Construccion', FALSE)
ON CONFLICT (rut) DO NOTHING;

INSERT INTO operadores (rut, nombre, email, rol) VALUES
    ('11111111-1', 'Jefe de Patio Demo', 'jefe@cargomatch.local', 'supervisor'),
    ('22222222-2', 'Operador Demo', 'operador@cargomatch.local', 'operador')
ON CONFLICT (rut) DO NOTHING;

INSERT INTO camiones (patente, tipo, transportista) VALUES
    ('JHPW21', 'rampla', 'Transportes Andino'),
    ('LKDR88', 'plataforma', 'Transportes del Sur'),
    ('SGBF45', 'furgon', 'Logistica Central')
ON CONFLICT (patente) DO NOTHING;

INSERT INTO tolerancia (scope, scope_ref, tipo, valor) VALUES
    ('GLOBAL', NULL, 'CANTIDAD_PCT', 2.0),
    ('GLOBAL', NULL, 'PESO_PCT', 1.5),
    ('FAMILIA', 'cemento', 'CANTIDAD_ABS', 1),
    ('FAMILIA', 'aridos', 'PESO_PCT', 3.0);
