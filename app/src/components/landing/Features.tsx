
"use client";
import React from 'react';

const features = [
  {
    title: "Cumplimiento Nativo",
    description: "Validación automática contra la Res. 1799 y 1888. Evita rechazos del Ministerio.",
    icon: "⚖️"
  },
  {
    title: "Soporte HL7 FHIR R4",
    description: "Transformamos tus datos locales al estándar internacional de salud automáticamente.",
    icon: "🧬"
  },
  {
    title: "Ciclo Farmacéutico",
    description: "Gestión completa desde la prescripción hasta la dispensación efectiva.",
    icon: "💊"
  },
  {
    title: "DX Superior (MCP)",
    description: "Integra Nexo en tu IDE vía MCP Server. Deja que la IA escriba el código por ti.",
    icon: "🤖"
  }
];

export default function Features() {
  return (
    <section className="py-20 px-6 bg-[#0d0f12] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Infraestructura para el Futuro de la Salud</h2>
          <p className="text-gray-400">Todo lo que necesitas para cumplir la normativa sin complicaciones técnicas.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-[#1A1D24] rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
