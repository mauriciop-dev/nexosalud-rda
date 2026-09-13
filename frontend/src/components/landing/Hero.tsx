
"use client";
import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative py-20 px-6 overflow-hidden bg-[#0d0f12] text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3E3CFF]/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Ambiente de Pruebas Activo • Res. 1799/2026
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Interoperabilidad de Salud <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            Sin Fricciones.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Nexo Salud es el API-First Gateway que abstrae la complejidad regulatoria del Ministerio de Salud. 
          Conecta tu HIS al Bus de Interoperabilidad nacional en minutos, no en meses.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard/sandbox" className="px-8 py-4 bg-[#3E3CFF] hover:bg-[#271F8F] text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(62,60,255,0.4)]">
            Probar Sandbox Gratis
          </Link>
          <Link href="/dashboard/metrics" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold border border-white/10 transition-all">
            Ver mi Consumo
          </Link>
        </div>
      </div>
    </section>
  );
}
