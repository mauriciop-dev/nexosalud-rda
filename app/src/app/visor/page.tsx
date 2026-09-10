"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function VisorPage() {
    const [records, setRecords] = useState<any[]>([]);

    const historicalRecords = [
        { id: 1, date: "15 Feb 2025", title: "Consulta Externa - Hipertensión Arterial", description: "Control de presión arterial. Paciente estable con medicamentos. PA: 130/85 mmHg.", code: "VIDA-2025-CP-FEB01", doctor: "Dr. Gómez", type: "consulta" },
        { id: 2, date: "10 Oct 2025", title: "Odontología - Limpieza Profunda", description: "Profilaxis dental. Remoción de cálculo supragingival. Encías saludables.", code: "VIDA-2025-CP-OCT02", doctor: "Dra. Ruiz", type: "odontologia" },
        { id: 3, date: "05 Ene 2026", title: "Laboratorio Clínico - Perfil Lipídico", description: "Colesterol total: 195 mg/dL. LDL: 120 mg/dL. HDL: 45 mg/dL. Triglicéridos: 150 mg/dL.", code: "VIDA-2026-CP-ENE03", doctor: "Lab. Central", type: "laboratorio" }
    ];

    const getNewRecord = () => {
        const today = new Date();
        const day = today.getDate();
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const dateStr = `${day} ${months[today.getMonth()]} ${today.getFullYear()}`;
        
        return {
            id: 4,
            date: dateStr,
            title: "Urgencias - Apendicitis Aguda",
            description: "Paciente consulta por dolor en fosa iliaca derecha. AP: Apendicitis. CX: Apendicectomía laparoscópica. Evoluciona favorablemente.",
            code: "VIDA-2026-CP-MAR04",
            doctor: "Dr. Hernández",
            type: "urgencia",
            isNew: true
        };
    };

    const checkForNewRecords = () => {
        const hasNewRecord = sessionStorage.getItem("nexosalud_new_record");
        if (hasNewRecord) {
            sessionStorage.removeItem("nexosalud_new_record");
            return true;
        }
        return false;
    };

    useEffect(() => {
        const hasNew = checkForNewRecords();
        let recs = [...historicalRecords];
        
        if (hasNew) {
            recs.unshift(getNewRecord());
        }
        
        setRecords(recs);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <header className="border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex justify-between items-center">
                        <Link href="/aliados" className="text-xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            NexoSalud
                        </Link>
                        <div className="flex gap-6">
                            <Link href="/aliados" className="text-white/60 hover:text-cyan-400 text-sm font-medium transition-colors">Programa Pioneros</Link>
                            <Link href="/demo" className="text-white/60 hover:text-cyan-400 text-sm font-medium transition-colors">Demo</Link>
                            <Link href="/visor" className="text-cyan-400 text-sm font-medium transition-colors">Visor</Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-gradient-to-r from-teal-500/15 to-cyan-500/10 border border-teal-500/30 rounded-2xl p-8 mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-18 h-18 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-3xl font-bold w-[72px] h-[72px]">
                            CP
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Carlos Pérez González</h1>
                            <p className="text-white/60 text-sm mb-3">Cédula: 1035845210 | Masculino | 52 años | EPS: Sura EPS</p>
                            <div className="flex gap-3">
                                <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-400 text-xs px-3 py-1.5 rounded-md font-medium">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                    </svg>
                                    Activo
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-xs px-3 py-1.5 rounded-md font-medium">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    Titular
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Historial de Atenciones</h2>
                    <span className="text-white/50 text-sm">{records.length} registro{records.length !== 1 ? "s" : ""}</span>
                </div>

                {records.length === 0 ? (
                    <div className="text-center py-16 text-white/50">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p>No hay registros de salud disponibles</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                className={`bg-white/5 border rounded-xl p-6 transition-all ${
                                    record.isNew
                                        ? "border-green-500/50 bg-gradient-to-r from-green-500/10 to-teal-500/5"
                                        : "border-white/10 hover:border-teal-500/30"
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs text-white/50 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        {record.date}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded font-medium ${
                                        record.type === "urgencia"
                                            ? "bg-red-500/15 text-red-400"
                                            : "bg-teal-500/15 text-teal-400"
                                    }`}>
                                        {record.type}
                                    </span>
                                </div>
                                <h3 className="font-semibold mb-2">{record.title}</h3>
                                <p className="text-sm text-white/70 leading-relaxed mb-4">{record.description}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-xs text-white/40 font-mono">{record.code}</span>
                                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        {record.doctor}
                                    </span>
                                </div>
                                {record.isNew && (
                                    <div className="mt-3 inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        Reportado a MinSalud
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="py-8 border-t border-white/10 text-center text-white/40 text-xs">
                <div className="max-w-6xl mx-auto px-6">
                    <p>NexoSalud - Visor de Registros de Salud | Resolución 1888</p>
                </div>
            </footer>
        </div>
    );
}
