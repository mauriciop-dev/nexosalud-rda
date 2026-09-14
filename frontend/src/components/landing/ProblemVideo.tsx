
export default function ProblemVideo() {
  return (
    <section id="problema" className="py-24 px-6 bg-[#0d0f12] text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#3E3CFF]/20 border border-white/10 bg-black">
          <video
            className="w-full aspect-video"
            src="/videos/el-viaje-de-pedro.mp4"
            controls
            preload="metadata"
          >
            Tu navegador no soporta video HTML5.
          </video>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-6">
            El problema que resolvemos
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
            Cada atención clínica debe llegar al IHCE en HL7 FHIR R4.
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600"> Tu HIS no habla FHIR. Nexo Salud sí.</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed mb-8">
            La Resolución 1799 de 2026 obliga a las IPS a reportar cada atención al Registro
            Documental de Atención. Nexo Salud es el API-First Gateway que lo hace por ti:
            recibe los datos de tu software, los convierte al estándar, valida contra la
            norma, firma el documento y obtiene el código VIDA de transmisión.
          </p>

          <ol className="space-y-4">
            {[
              { n: "1", t: "Conecta", d: "Tu HIS envía los datos clínicos a la API REST o al MCP Server." },
              { n: "2", t: "Convertimos y validamos", d: "Generamos el Bundle FHIR R4 y lo validamos contra la Res. 1799." },
              { n: "3", t: "Transmitimos", d: "Firma digital, código VIDA y envío al IHCE con trazabilidad completa." },
            ].map((step) => (
              <li key={step.n} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3E3CFF]/20 border border-[#3E3CFF]/40 text-blue-400 text-sm font-bold flex items-center justify-center">
                  {step.n}
                </span>
                <div>
                  <p className="font-semibold text-white">{step.t}</p>
                  <p className="text-sm text-gray-400">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </section>
  );
}
