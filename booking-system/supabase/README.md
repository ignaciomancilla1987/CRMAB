# Carpeta `supabase/`

Proyecto backend listo para el **Supabase CLI**. Estructura:

```
supabase/
├── config.toml                        # Configuración del CLI (puertos, functions, seed)
├── .gitignore                         # Ignora .temp, .branches, .env
├── seed.sql                           # Datos iniciales (sucursales, vendedores, horarios)
├── schema.sql                         # Esquema completo (para pegar en el SQL Editor)
│
├── migrations/
│   └── 20260717000000_init_reservas.sql   # Mismo esquema, versionado para `db push`
│
└── functions/
    ├── .env.example                   # Secretos de la función (Resend) — copiar a .env
    └── notify-reserva/
        ├── index.ts                   # Edge Function de correos
        └── deno.json                  # Imports de Deno
```

## Dos formas de subir la base de datos

### A) Con el CLI (recomendado — usa `migrations/`)
```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push                 # aplica migrations/ al proyecto remoto
# Los datos de ejemplo (seed.sql) NO se envían a remoto con db push;
# ejecútalos una vez desde el SQL Editor o con psql si los necesitas.
```

### B) Manual (sin CLI — usa `schema.sql`)
1. SQL Editor → pega y ejecuta `schema.sql`.
2. SQL Editor → pega y ejecuta `seed.sql`.

> `schema.sql` y `migrations/20260717000000_init_reservas.sql` tienen el
> **mismo contenido**. Usa una vía u otra, no ambas sobre la misma base.

## Desplegar la Edge Function
```bash
cp functions/.env.example functions/.env    # completa RESEND_API_KEY y FROM_EMAIL
supabase secrets set --env-file functions/.env
supabase functions deploy notify-reserva --no-verify-jwt
```

## Desarrollo local (opcional)
```bash
supabase start                              # levanta Postgres + Studio + Inbucket
supabase db reset                           # aplica migrations/ + seed.sql
supabase functions serve notify-reserva --env-file functions/.env
```
Studio: http://localhost:54323 · Correos de prueba (Inbucket): http://localhost:54324

## Nuevos cambios de esquema
```bash
supabase migration new <nombre>             # crea migrations/<timestamp>_<nombre>.sql
# edita el archivo con tus ALTER/CREATE y luego:
supabase db push
```
