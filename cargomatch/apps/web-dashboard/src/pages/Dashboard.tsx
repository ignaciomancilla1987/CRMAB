export default function Dashboard() {
  const kpis = [
    { label: 'Camiones hoy', value: '—' },
    { label: 'Conformes', value: '—', color: 'text-conforme' },
    { label: 'Con observaciones', value: '—', color: 'text-observaciones' },
    { label: 'Rechazadas', value: '—', color: 'text-rechazada' },
  ]

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-xs uppercase tracking-wide text-slate-500">{k.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${k.color ?? ''}`}>{k.value}</div>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-2">Estado del sistema</h2>
        <p className="text-sm text-slate-600">
          Scaffold inicial. Próximos pasos: conectar con <code>/api/v1/eventos</code>,
          visualizar feed en vivo de cámara, semáforo de validación.
        </p>
      </section>
    </div>
  )
}
