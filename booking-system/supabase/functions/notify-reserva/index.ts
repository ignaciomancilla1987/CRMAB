// =====================================================================
// Edge Function: notify-reserva
// ---------------------------------------------------------------------
// Se dispara al insertar una reserva (vía trigger pg_net o Database
// Webhook). Envía:
//   1) Correo al VENDEDOR asignado con los datos del prospecto.
//   2) Correo de CONFIRMACIÓN al cliente.
// Proveedor de correo: Resend (https://resend.com).
//
// Secrets requeridos (supabase secrets set ...):
//   RESEND_API_KEY        API key de Resend
//   FROM_EMAIL            Remitente verificado (ej: reservas@panelsipmetcorp.cl)
//   SUPABASE_URL          (inyectado automáticamente)
//   SUPABASE_SERVICE_ROLE_KEY (inyectado automáticamente)
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Configuración ---------------------------------------------------
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Panel SIP Met Corp <reservas@panelsipmetcorp.cl>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const BRAND = {
  name: "Panel SIP Met Corp",
  color: "#0f766e",
  site: "https://www.panelsipmetcorp.cl",
};

// ---- Utilidades ------------------------------------------------------
function fmtFecha(fecha: string): string {
  // fecha: 'YYYY-MM-DD' → 'lunes 20 de julio de 2026'
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

function fmtHora(hora: string): string {
  return (hora ?? "").slice(0, 5); // 'HH:MM:SS' → 'HH:MM'
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error (${res.status}): ${body}`);
  }
  return await res.json();
}

// ---- Plantillas HTML -------------------------------------------------
function wrap(inner: string): string {
  return `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
    <div style="background:${BRAND.color};padding:20px 24px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:18px">${BRAND.name}</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      ${inner}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="font-size:12px;color:#6b7280;margin:0">
        Este es un mensaje automático de ${BRAND.name}.
        <a href="${BRAND.site}" style="color:${BRAND.color}">${BRAND.site}</a>
      </p>
    </div>
  </div>`;
}

function detalle(r: any): string {
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#6b7280">Sucursal</td><td style="padding:6px 0;text-align:right"><b>${r.sucursal_nombre}</b></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Fecha</td><td style="padding:6px 0;text-align:right"><b>${fmtFecha(r.fecha)}</b></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Hora</td><td style="padding:6px 0;text-align:right"><b>${fmtHora(r.hora)} hrs</b></td></tr>
      ${r.sucursal_direccion ? `<tr><td style="padding:6px 0;color:#6b7280">Dirección</td><td style="padding:6px 0;text-align:right">${r.sucursal_direccion}</td></tr>` : ""}
    </table>`;
}

function emailVendedor(r: any): string {
  return wrap(`
    <h2 style="font-size:16px;margin:0 0 8px">Nueva visita agendada 📅</h2>
    <p style="font-size:14px;margin:0 0 16px">Hola ${r.vendedor_nombre ?? ""}, tienes una nueva reserva asignada:</p>
    ${detalle(r)}
    <h3 style="font-size:14px;margin:20px 0 8px">Datos del prospecto</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#6b7280">Nombre</td><td style="padding:6px 0;text-align:right"><b>${r.cliente_nombre}</b></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;text-align:right"><a href="mailto:${r.cliente_email}">${r.cliente_email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Teléfono</td><td style="padding:6px 0;text-align:right">${r.cliente_telefono}</td></tr>
      ${r.cliente_rut ? `<tr><td style="padding:6px 0;color:#6b7280">RUT</td><td style="padding:6px 0;text-align:right">${r.cliente_rut}</td></tr>` : ""}
      ${r.proyecto ? `<tr><td style="padding:6px 0;color:#6b7280">Proyecto</td><td style="padding:6px 0;text-align:right">${r.proyecto}</td></tr>` : ""}
    </table>
    ${r.mensaje ? `<p style="font-size:14px;margin:16px 0 0"><b>Mensaje:</b><br/>${r.mensaje}</p>` : ""}
  `);
}

function emailCliente(r: any): string {
  return wrap(`
    <h2 style="font-size:16px;margin:0 0 8px">¡Tu visita está confirmada! ✅</h2>
    <p style="font-size:14px;margin:0 0 16px">Hola ${r.cliente_nombre}, agendamos tu visita con éxito. Aquí están los detalles:</p>
    ${detalle(r)}
    ${r.vendedor_nombre ? `<p style="font-size:14px;margin:16px 0 0">Te atenderá <b>${r.vendedor_nombre}</b>. Si necesitas reprogramar, responde a este correo.</p>` : ""}
    <p style="font-size:14px;margin:16px 0 0">¡Te esperamos!</p>
  `);
}

// ---- Handler ---------------------------------------------------------
Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // Soporta dos orígenes de disparo:
    //   a) trigger pg_net → { reserva_id: "..." }
    //   b) Database Webhook → { type, record: {...} }
    const reservaId: string | undefined =
      payload.reserva_id ?? payload.record?.id;

    if (!reservaId) {
      return new Response(JSON.stringify({ error: "reserva_id ausente" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    // Trae la reserva con datos de sucursal y vendedor (join)
    const { data: r, error } = await admin
      .from("reservas")
      .select(`
        id, fecha, hora, cliente_nombre, cliente_email, cliente_telefono,
        cliente_rut, proyecto, mensaje,
        sucursales:sucursal_id ( nombre, direccion ),
        vendedores:vendedor_id ( nombre, email )
      `)
      .eq("id", reservaId)
      .single();

    if (error || !r) {
      throw new Error(`No se encontró la reserva ${reservaId}: ${error?.message}`);
    }

    // Aplana la estructura para las plantillas
    const view = {
      ...r,
      sucursal_nombre: (r as any).sucursales?.nombre ?? "",
      sucursal_direccion: (r as any).sucursales?.direccion ?? "",
      vendedor_nombre: (r as any).vendedores?.nombre ?? "",
      vendedor_email: (r as any).vendedores?.email ?? "",
    };

    const results: Record<string, unknown> = {};

    // 1) Correo al vendedor asignado
    if (view.vendedor_email) {
      results.vendedor = await sendEmail(
        view.vendedor_email,
        `Nueva visita — ${view.cliente_nombre} · ${fmtFecha(view.fecha)}`,
        emailVendedor(view),
      );
    }

    // 2) Correo de confirmación al cliente
    if (view.cliente_email) {
      results.cliente = await sendEmail(
        view.cliente_email,
        `Confirmación de tu visita — ${BRAND.name}`,
        emailCliente(view),
      );
    }

    // Marca la reserva como notificada
    await admin
      .from("reservas")
      .update({ notificado_at: new Date().toISOString() })
      .eq("id", reservaId);

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-reserva error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
