-- =====================================================================
-- Panel SIP Met Corp — Datos iniciales (seed)
-- Ejecutar DESPUÉS de schema.sql en el SQL Editor.
-- Idempotente por slug/email.
-- =====================================================================

-- 1) Sucursales (opciones estrictas del negocio) ------------------------
insert into public.sucursales (nombre, slug, tipo, direccion, ciudad, orden)
values
  ('Fábrica Santiago (Paneles SIP)',    'fabrica-santiago',    'fabrica',
     'Camino a Melipilla 1234, Maipú',  'Santiago',    1),
  ('Fábrica Puerto Montt (Paneles SIP)','fabrica-puerto-montt','fabrica',
     'Ruta 5 Sur Km 1020, Puerto Montt','Puerto Montt', 2),
  ('Oficina Concepción',                'oficina-concepcion',  'oficina',
     'Av. O''Higgins 456, Concepción',  'Concepción',   3)
on conflict (slug) do update
  set nombre = excluded.nombre,
      direccion = excluded.direccion,
      ciudad = excluded.ciudad,
      orden = excluded.orden;

-- 2) Vendedores por sucursal -------------------------------------------
-- ⚠️ Reemplaza los emails por los reales del equipo de ventas.
with s as (select id, slug from public.sucursales)
insert into public.vendedores (sucursal_id, nombre, email, telefono)
select s.id, v.nombre, v.email, v.telefono
from (values
  ('fabrica-santiago',     'María González',   'maria.gonzalez@panelsipmetcorp.cl',   '+56 9 1111 1111'),
  ('fabrica-santiago',     'Cristóbal Rojas',  'cristobal.rojas@panelsipmetcorp.cl',  '+56 9 2222 2222'),
  ('fabrica-puerto-montt', 'Paula Muñoz',      'paula.munoz@panelsipmetcorp.cl',      '+56 9 3333 3333'),
  ('fabrica-puerto-montt', 'Diego Alarcón',    'diego.alarcon@panelsipmetcorp.cl',    '+56 9 4444 4444'),
  ('oficina-concepcion',   'Javiera Torres',   'javiera.torres@panelsipmetcorp.cl',   '+56 9 5555 5555')
) as v(slug, nombre, email, telefono)
join s on s.slug = v.slug
on conflict do nothing;

-- 3) Horarios de atención (Lunes a Viernes, bloques de 60 min) ----------
-- dia_semana: 1=Lunes .. 5=Viernes. Mañana 09:00–13:00, Tarde 14:00–18:00.
with s as (select id, slug from public.sucursales)
insert into public.horarios_atencion (sucursal_id, dia_semana, hora_inicio, hora_fin, duracion_min)
select s.id, d.dia, t.hi, t.hf, 60
from s
cross join (values (1),(2),(3),(4),(5)) as d(dia)
cross join (values ('09:00'::time,'13:00'::time), ('14:00'::time,'18:00'::time)) as t(hi, hf)
on conflict do nothing;

-- Fábrica Puerto Montt también agenda sábados por la mañana (ejemplo):
with s as (select id from public.sucursales where slug = 'fabrica-puerto-montt')
insert into public.horarios_atencion (sucursal_id, dia_semana, hora_inicio, hora_fin, duracion_min)
select s.id, 6, '10:00'::time, '13:00'::time, 60 from s
on conflict do nothing;

-- 4) Ejemplo de feriado nacional bloqueado -----------------------------
insert into public.bloqueos (sucursal_id, fecha, motivo)
values (null, '2026-09-18', 'Fiestas Patrias')
on conflict do nothing;
