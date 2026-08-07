-- =====================================================================
-- Panel SIP Met Corp — Sistema de Agendamiento de Visitas
-- Esquema de base de datos para Supabase (PostgreSQL)
-- =====================================================================
-- Ejecutar COMPLETO en:  Supabase Dashboard → SQL Editor → New query
-- Idempotente: puede re-ejecutarse sin romper datos existentes.
-- =====================================================================

-- Extensiones necesarias -------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pg_net;      -- para invocar Edge Functions vía HTTP

-- =====================================================================
-- 1. TABLA: sucursales
-- =====================================================================
create table if not exists public.sucursales (
  id           uuid primary key default uuid_generate_v4(),
  nombre       varchar(160) not null,
  slug         varchar(80)  unique not null,
  tipo         varchar(40)  not null default 'fabrica',   -- 'fabrica' | 'oficina'
  direccion    text,
  ciudad       varchar(120),
  timezone     varchar(60)  not null default 'America/Santiago',
  activo       boolean      not null default true,
  orden        int          not null default 0,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

comment on table public.sucursales is 'Ubicaciones donde el cliente puede agendar una visita.';

-- =====================================================================
-- 2. TABLA: vendedores  (equipo de ventas por sucursal)
-- =====================================================================
create table if not exists public.vendedores (
  id            uuid primary key default uuid_generate_v4(),
  sucursal_id   uuid not null references public.sucursales(id) on delete cascade,
  nombre        varchar(160) not null,
  email         varchar(255) not null,
  telefono      varchar(50),
  activo        boolean      not null default true,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

create index if not exists idx_vendedores_sucursal on public.vendedores(sucursal_id);
comment on table public.vendedores is 'Vendedores asignables; cada uno pertenece a una sucursal.';

-- =====================================================================
-- 3. TABLA: horarios_atencion  (plantilla semanal de disponibilidad)
-- =====================================================================
-- dia_semana: 0=Domingo ... 6=Sábado (compatible con JS Date.getDay()).
-- Cada fila define una franja horaria que se subdivide en bloques
-- de `duracion_min` minutos.
create table if not exists public.horarios_atencion (
  id            uuid primary key default uuid_generate_v4(),
  sucursal_id   uuid not null references public.sucursales(id) on delete cascade,
  dia_semana    smallint not null check (dia_semana between 0 and 6),
  hora_inicio   time not null,
  hora_fin      time not null,
  duracion_min  int  not null default 60 check (duracion_min > 0),
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  check (hora_fin > hora_inicio)
);

create index if not exists idx_horarios_sucursal_dia
  on public.horarios_atencion(sucursal_id, dia_semana);
comment on table public.horarios_atencion is 'Franjas horarias base por día de la semana y sucursal.';

-- =====================================================================
-- 4. TABLA: bloqueos  (feriados / fechas u horas no disponibles)
-- =====================================================================
create table if not exists public.bloqueos (
  id            uuid primary key default uuid_generate_v4(),
  sucursal_id   uuid references public.sucursales(id) on delete cascade, -- null = aplica a todas
  fecha         date not null,
  hora_inicio   time,   -- null = bloquea el día completo
  hora_fin      time,
  motivo        varchar(200),
  created_at    timestamptz not null default now()
);

create index if not exists idx_bloqueos_fecha on public.bloqueos(fecha);
comment on table public.bloqueos is 'Feriados o ventanas bloqueadas; sucursal_id null = global.';

-- =====================================================================
-- 5. TABLA: reservas
-- =====================================================================
create table if not exists public.reservas (
  id                uuid primary key default uuid_generate_v4(),
  sucursal_id       uuid not null references public.sucursales(id),
  vendedor_id       uuid references public.vendedores(id),
  fecha             date not null,
  hora              time not null,
  -- datos del prospecto
  cliente_nombre    varchar(200) not null,
  cliente_email     varchar(255) not null,
  cliente_telefono  varchar(50)  not null,
  cliente_rut       varchar(20),
  proyecto          varchar(200),          -- interés / tipo de proyecto
  mensaje           text,
  -- control
  estado            varchar(30) not null default 'confirmada', -- confirmada|cancelada|realizada|no_show
  origen            varchar(40) not null default 'web',
  notificado_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Evita doble reserva del mismo bloque en la misma sucursal
  constraint uq_reserva_slot unique (sucursal_id, fecha, hora)
);

create index if not exists idx_reservas_sucursal_fecha
  on public.reservas(sucursal_id, fecha);
create index if not exists idx_reservas_vendedor on public.reservas(vendedor_id);
comment on table public.reservas is 'Citas agendadas por los clientes desde el sitio público.';

-- =====================================================================
-- 6. TRIGGER genérico: updated_at
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_sucursales_updated on public.sucursales;
create trigger trg_sucursales_updated before update on public.sucursales
  for each row execute function public.set_updated_at();

drop trigger if exists trg_vendedores_updated on public.vendedores;
create trigger trg_vendedores_updated before update on public.vendedores
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reservas_updated on public.reservas;
create trigger trg_reservas_updated before update on public.reservas
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 7. FUNCIÓN: slots_disponibles(sucursal, fecha)
-- =====================================================================
-- Devuelve la lista de horas libres para una sucursal en una fecha:
--   plantilla horaria del día  −  reservas existentes  −  bloqueos.
create or replace function public.slots_disponibles(
  p_sucursal_id uuid,
  p_fecha       date
)
returns table (hora time)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_dow smallint := extract(dow from p_fecha);  -- 0=Dom..6=Sab
begin
  -- Día completo bloqueado → sin slots
  if exists (
    select 1 from bloqueos b
    where b.fecha = p_fecha
      and (b.sucursal_id = p_sucursal_id or b.sucursal_id is null)
      and b.hora_inicio is null
  ) then
    return;
  end if;

  return query
  with base as (
    -- genera cada bloque de la plantilla del día
    select gs::time as hora
    from horarios_atencion h
    cross join lateral generate_series(
      (p_fecha + h.hora_inicio),
      (p_fecha + h.hora_fin) - make_interval(mins => h.duracion_min),
      make_interval(mins => h.duracion_min)
    ) as gs
    where h.sucursal_id = p_sucursal_id
      and h.dia_semana = v_dow
      and h.activo = true
  )
  select b.hora
  from base b
  where not exists (           -- descarta bloques ya reservados
      select 1 from reservas r
      where r.sucursal_id = p_sucursal_id
        and r.fecha = p_fecha
        and r.hora = b.hora
        and r.estado <> 'cancelada'
    )
    and not exists (           -- descarta bloques dentro de un bloqueo horario
      select 1 from bloqueos bk
      where bk.fecha = p_fecha
        and (bk.sucursal_id = p_sucursal_id or bk.sucursal_id is null)
        and bk.hora_inicio is not null
        and b.hora >= bk.hora_inicio
        and b.hora <  bk.hora_fin
    )
  order by b.hora;
end $$;

-- =====================================================================
-- 8. FUNCIÓN: crear_reserva(...)  — API pública transaccional
-- =====================================================================
-- Valida el bloque, asigna el vendedor MENOS cargado de la sucursal
-- (balanceo por carga del día) e inserta la reserva de forma atómica.
create or replace function public.crear_reserva(
  p_sucursal_id      uuid,
  p_fecha            date,
  p_hora             time,
  p_cliente_nombre   text,
  p_cliente_email    text,
  p_cliente_telefono text,
  p_cliente_rut      text default null,
  p_proyecto         text default null,
  p_mensaje          text default null
)
returns public.reservas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vendedor_id uuid;
  v_reserva     public.reservas;
begin
  -- 1) Validar que el bloque siga disponible (bloquea condiciones de carrera)
  if not exists (
    select 1 from slots_disponibles(p_sucursal_id, p_fecha) s
    where s.hora = p_hora
  ) then
    raise exception 'SLOT_NO_DISPONIBLE'
      using hint = 'El horario seleccionado ya no está disponible.';
  end if;

  -- 2) Asignar vendedor activo con menos reservas para esa fecha (round-robin por carga)
  select v.id
    into v_vendedor_id
  from vendedores v
  left join reservas r
    on r.vendedor_id = v.id
   and r.fecha = p_fecha
   and r.estado <> 'cancelada'
  where v.sucursal_id = p_sucursal_id
    and v.activo = true
  group by v.id
  order by count(r.id) asc, random()
  limit 1;

  -- 3) Insertar reserva (uq_reserva_slot protege ante doble submit)
  insert into reservas (
    sucursal_id, vendedor_id, fecha, hora,
    cliente_nombre, cliente_email, cliente_telefono, cliente_rut,
    proyecto, mensaje
  ) values (
    p_sucursal_id, v_vendedor_id, p_fecha, p_hora,
    trim(p_cliente_nombre), lower(trim(p_cliente_email)), p_cliente_telefono, p_cliente_rut,
    p_proyecto, p_mensaje
  )
  returning * into v_reserva;

  return v_reserva;
exception
  when unique_violation then
    raise exception 'SLOT_NO_DISPONIBLE'
      using hint = 'El horario seleccionado acaba de ser tomado.';
end $$;

-- =====================================================================
-- 9. TRIGGER de notificación → invoca la Edge Function notify-reserva
-- =====================================================================
-- Requiere configurar dos parámetros a nivel de base de datos:
--   select set_config('app.settings.edge_url',   'https://<PROJECT_REF>.functions.supabase.co/notify-reserva', false);
--   select set_config('app.settings.service_key','<SERVICE_ROLE_KEY>', false);
-- (o definirlos con ALTER DATABASE ... SET, ver README §4).
create or replace function public.on_reserva_creada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text := current_setting('app.settings.edge_url', true);
  v_key text := current_setting('app.settings.service_key', true);
begin
  if v_url is null or v_key is null then
    -- Sin configuración → no bloquea la reserva, solo omite el aviso.
    raise notice 'notify-reserva no configurado (app.settings.edge_url/service_key).';
    return new;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || v_key
               ),
    body    := jsonb_build_object('reserva_id', new.id)
  );
  return new;
end $$;

drop trigger if exists trg_reserva_notificar on public.reservas;
create trigger trg_reserva_notificar
  after insert on public.reservas
  for each row execute function public.on_reserva_creada();

-- =====================================================================
-- 10. ROW LEVEL SECURITY
-- =====================================================================
alter table public.sucursales        enable row level security;
alter table public.vendedores        enable row level security;
alter table public.horarios_atencion enable row level security;
alter table public.bloqueos          enable row level security;
alter table public.reservas          enable row level security;

-- Lectura pública (sitio web anónimo) de catálogo -----------------------
drop policy if exists p_sucursales_read on public.sucursales;
create policy p_sucursales_read on public.sucursales
  for select using (activo = true);

-- Vendedores NO se exponen al público (los emails son sensibles).
-- El flujo público solo necesita saber que existen, cosa que resuelve
-- crear_reserva() con SECURITY DEFINER. No creamos policy de SELECT anon.

-- Reservas: el público NO puede leer ni escribir directamente.
-- Todo pasa por la función crear_reserva() (SECURITY DEFINER).
-- No se crean policies permisivas; solo service_role/admin acceden.

-- Nota: las funciones slots_disponibles() y crear_reserva() son
-- SECURITY DEFINER, por lo que operan por sobre RLS de forma controlada.
-- Concede ejecución al rol anónimo:
grant execute on function public.slots_disponibles(uuid, date) to anon, authenticated;
grant execute on function public.crear_reserva(uuid, date, time, text, text, text, text, text, text) to anon, authenticated;
grant select on public.sucursales to anon, authenticated;

-- =====================================================================
-- FIN DEL ESQUEMA
-- =====================================================================
