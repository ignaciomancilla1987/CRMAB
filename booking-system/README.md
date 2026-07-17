# Panel SIP Met Corp — Sistema de Agendamiento de Visitas

Sistema digital de reservas para **www.panelsipmetcorp.cl**, inspirado en el
flujo de reservas de Tecnofast. Permite a un prospecto agendar una visita a una
de las ubicaciones de la empresa; el sistema asigna automáticamente un vendedor
de la sucursal y dispara correos transaccionales (al vendedor y al cliente).

- **Frontend:** React + Vite + Tailwind CSS (formulario por pasos + calendario).
- **Backend:** Supabase (PostgreSQL) con lógica de disponibilidad y asignación.
- **Correos:** Supabase Edge Function (Deno) + Resend.

---

## 1. Estructura del proyecto

```
booking-system/
├── index.html                         # Punto de entrada Vite
├── package.json
├── vite.config.js                     # Alias '@' → ./src
├── tailwind.config.js
├── postcss.config.js
├── .env.example                       # Variables del frontend
├── vercel.json                        # Rewrites SPA (deploy en Vercel)
│
├── supabase/
│   ├── schema.sql                     # Tablas, RLS, RPCs, trigger de aviso
│   ├── seed.sql                       # Sucursales + vendedores + horarios
│   └── functions/
│       └── notify-reserva/
│           └── index.ts               # Edge Function de correos (Resend)
│
└── src/
    ├── main.jsx                       # Bootstrap React
    ├── App.jsx                        # Layout + hero + asistente
    ├── index.css                      # Directivas Tailwind
    ├── lib/
    │   └── supabase.js                # Cliente Supabase (anon)
    ├── services/
    │   └── bookingService.js          # Acceso a datos (RPC + selects)
    ├── hooks/
    │   └── useBookingFlow.js          # Máquina de estados del asistente
    ├── utils/
    │   ├── date.js                    # Calendario, formato es-CL
    │   └── validators.js              # Email, teléfono, RUT chileno
    ├── data/
    │   └── constants.js               # Pasos, íconos, límites
    └── components/
        ├── BookingWizard.jsx          # Orquestador de pasos
        ├── Stepper.jsx                # Barra de progreso
        ├── steps/
        │   ├── StepSucursal.jsx       # 1) Selector de ubicación
        │   ├── StepFecha.jsx          # 2) Calendario
        │   ├── StepHora.jsx           # 3) Selector de horario
        │   ├── StepDatos.jsx          # 4) Formulario del prospecto
        │   └── StepConfirmacion.jsx   # 5) Resumen final
        └── ui/
            ├── Button.jsx
            ├── Spinner.jsx
            └── Calendar.jsx           # Calendario mensual accesible
```

---

## 2. Modelo de datos (resumen)

| Tabla                | Rol |
|----------------------|-----|
| `sucursales`         | Las 3 ubicaciones (Fábrica Santiago, Fábrica Puerto Montt, Oficina Concepción). |
| `vendedores`         | Equipo de ventas; cada vendedor pertenece a una sucursal (`sucursal_id`). |
| `horarios_atencion`  | Plantilla semanal de disponibilidad por sucursal (día + franja + duración). |
| `bloqueos`           | Feriados / ventanas no disponibles (global o por sucursal). |
| `reservas`           | Citas agendadas + datos del prospecto + vendedor asignado. |

**Funciones clave (PostgreSQL):**
- `slots_disponibles(sucursal, fecha)` → horas libres (plantilla − reservas − bloqueos).
- `crear_reserva(...)` → valida el bloque, **asigna el vendedor menos cargado**
  de la sucursal e inserta la reserva de forma atómica. Es la única vía de
  escritura pública (RLS bloquea el `INSERT` directo).
- Trigger `AFTER INSERT` → invoca la Edge Function `notify-reserva`.

---

## 3. Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Resend](https://resend.com) con un **dominio verificado**
  (idealmente `panelsipmetcorp.cl` para enviar desde `reservas@panelsipmetcorp.cl`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (para desplegar la Edge Function)

---

## 4. Despliegue paso a paso

### Paso 1 — Crear el proyecto Supabase
1. En [app.supabase.com](https://app.supabase.com) crea un proyecto nuevo.
2. Anota el **Project Ref** (parte de la URL: `https://<PROJECT_REF>.supabase.co`).
3. En **Settings → API** copia:
   - `Project URL`
   - `anon public` key
   - `service_role` key (¡secreta! solo para backend).

### Paso 2 — Crear el esquema y los datos
1. Abre **SQL Editor → New query**.
2. Pega y ejecuta **todo** `supabase/schema.sql`.
3. Abre otra query, pega y ejecuta `supabase/seed.sql`.
   - Edita antes los **emails de los vendedores** por los reales.
4. Verifica en **Table Editor** que existan `sucursales`, `vendedores`,
   `horarios_atencion` y `reservas`.

### Paso 3 — Desplegar la Edge Function `notify-reserva`
```bash
# Autenticar y enlazar el proyecto
supabase login
supabase link --project-ref <PROJECT_REF>

# Configurar los secretos de la función
supabase secrets set RESEND_API_KEY="re_xxxxxxxxxxxx"
supabase secrets set FROM_EMAIL="Panel SIP Met Corp <reservas@panelsipmetcorp.cl>"

# Desplegar la función (verify_jwt off: la invoca el trigger con service key)
supabase functions deploy notify-reserva --no-verify-jwt
```
La URL resultante será:
`https://<PROJECT_REF>.functions.supabase.co/notify-reserva`

### Paso 4 — Conectar el trigger de la base de datos con la función
En el **SQL Editor**, ejecuta (una sola vez) configurando los parámetros que lee
el trigger `on_reserva_creada`:

```sql
alter database postgres
  set app.settings.edge_url = 'https://<PROJECT_REF>.functions.supabase.co/notify-reserva';
alter database postgres
  set app.settings.service_key = '<SERVICE_ROLE_KEY>';
```
> Estos valores quedan disponibles para nuevas conexiones. Para aplicarlos de
> inmediato en tu sesión actual puedes además usar `select set_config(...)`.

**Alternativa sin `pg_net`:** en lugar del trigger puedes crear un
**Database Webhook** (Dashboard → Database → Webhooks): tabla `reservas`,
evento `INSERT`, tipo `Supabase Edge Functions` → `notify-reserva`. La función
ya soporta ambos formatos de payload.

### Paso 5 — Configurar y probar el frontend en local
```bash
cd booking-system
cp .env.example .env.local          # completa URL y ANON KEY
npm install
npm run dev                         # http://localhost:5173
```
Agenda una reserva de prueba y verifica que lleguen los dos correos.

### Paso 6 — Build de producción y deploy del frontend

**Opción A — Vercel (recomendado):**
```bash
npm i -g vercel
vercel                              # primer deploy (sigue el asistente)
# En el dashboard de Vercel → Project → Settings → Environment Variables:
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
vercel --prod
```
Luego, en **Settings → Domains**, agrega `www.panelsipmetcorp.cl` y sigue las
instrucciones DNS (registro CNAME hacia Vercel).

**Opción B — Netlify:**
```bash
npm run build            # genera ./dist
# Sube ./dist con: netlify deploy --prod --dir=dist
# Build command: npm run build   ·   Publish directory: dist
```

**Opción C — Hosting propio (cPanel / Apache / Nginx):**
```bash
npm run build            # genera ./dist
```
Sube el contenido de `dist/` a la carpeta pública del dominio y agrega una
regla de reescritura SPA (todo a `index.html`). Para Apache, crea `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 5. Administración

- **Ver reservas:** Supabase → Table Editor → `reservas`.
- **Agregar/editar vendedores:** tabla `vendedores` (respeta `sucursal_id`).
- **Cambiar horarios:** tabla `horarios_atencion`.
- **Bloquear feriados:** inserta filas en `bloqueos` (`sucursal_id = null` = todas).

---

## 6. Scripts

```bash
npm run dev       # Desarrollo (Vite)
npm run build     # Build de producción → ./dist
npm run preview   # Previsualizar el build
```

---

## 7. Seguridad

- El cliente web usa solo la **anon key**; RLS impide leer vendedores o
  escribir reservas directamente.
- Toda escritura pasa por `crear_reserva()` (`SECURITY DEFINER`), que valida
  disponibilidad y asigna vendedor.
- La `service_role` key vive **solo** en los secretos de la Edge Function y en
  el parámetro del trigger. Nunca se expone al navegador.
