import BookingWizard from '@/components/BookingWizard'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/60 to-slate-50">
      {/* Encabezado corporativo */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
              🏠
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-800">Panel SIP Met Corp</p>
              <p className="text-[11px] text-slate-500">Paneles SIP · Construcción modular</p>
            </div>
          </div>
          <a
            href="https://www.panelsipmetcorp.cl"
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            ← Volver al sitio
          </a>
        </div>
      </header>

      {/* Hero + asistente */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Agenda tu visita
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Conoce nuestras fábricas de Paneles SIP y conversa con un asesor.
            Reserva en menos de un minuto.
          </p>
        </div>

        <BookingWizard />
      </main>

      <footer className="py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Panel SIP Met Corp — www.panelsipmetcorp.cl
      </footer>
    </div>
  )
}
