"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, Upload, FileText, RefreshCw } from "lucide-react";

type Record = {
    date: string;
    title: string;
    desc: string;
    code: string;
    doctor: string;
    isNew?: boolean;
};

export default function DemoPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileSelected, setFileSelected] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialRecords: Record[] = [
        { date: "15 Feb 2025", title: "Consulta Externa - Hipertensión Arterial", desc: "Control de presión arterial. Paciente estable con medicamentos. PA: 130/85 mmHg.", code: "VIDA-2025-CP-FEB01", doctor: "Dr. Gómez" },
        { date: "10 Oct 2025", title: "Odontología - Limpieza Profunda", desc: "Profilaxis dental. Remoción de cálculo supragingival. Encías saludables.", code: "VIDA-2025-CP-OCT02", doctor: "Dra. Ruiz" },
        { date: "05 Ene 2026", title: "Laboratorio Clínico - Perfil Lipídico", desc: "Colesterol total: 195 mg/dL. LDL: 120 mg/dL. HDL: 45 mg/dL. Triglicéridos: 150 mg/dL.", code: "VIDA-2026-CP-ENE03", doctor: "Lab. Central" }
    ];

    const newRecord: Record = { date: "14 Mar 2026", title: "Urgencias - Apendicitis Aguda", desc: "Paciente consulta por dolor abdominal fosa iliaca derecha. AP: Apendicitis. CX: Apendicectomía laparoscópica. Evoluciona favorablemente.", code: "VIDA-2026-CP-MAR04", doctor: "Dr. Hernández", isNew: true };

    const [records, setRecords] = useState<Record[]>(initialRecords);

    const getRecords = (): Record[] => {
        const stored = sessionStorage.getItem("nexosalud_records");
        if (stored) return JSON.parse(stored);
        return [...initialRecords];
    };

    const saveRecords = (recs: Record[]) => {
        sessionStorage.setItem("nexosalud_records", JSON.stringify(recs));
    };

    const renderTimeline = (animateNew = false) => {
        const recs = getRecords();
        setRecords(recs);
    };

    useEffect(() => {
        renderTimeline();
    }, []);

    const generateAndDownloadPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("HISTORIA CLÍNICA ELECTRÓNICA - MODELO IHCE", 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Resolución 1888 - Ministerio de Salud y Protección Social", 105, 28, { align: "center" });
        
        doc.setLineWidth(0.5);
        doc.line(20, 32, 190, 32);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DATOS DEL PACIENTE", 20, 45);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const patientData = [
            ["Nombre:", "Carlos Pérez González"],
            ["Tipo ID:", "Cédula de Ciudadanía (CC)"],
            ["Número ID:", "1035845210"],
            ["Fecha de Nacimiento:", "15/03/1974"],
            ["Género:", "Masculino"],
            ["EPS:", "Sura EPS"]
        ];
        
        let y = 55;
        patientData.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(label, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 60, y);
            y += 8;
        });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DATOS DE LA ATENCIÓN", 20, y + 10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const attentionData = [
            ["Fecha:", "14 de Marzo de 2026"],
            ["Tipo de Atención:", "Consulta Externa"],
            ["Servicio:", "Cardiología"],
            ["Profesional:", "Dr. Juan Martínez - RM 12345"]
        ];
        
        y += 20;
        attentionData.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(label, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 60, y);
            y += 8;
        });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("ANTECEDENTES", 20, y + 10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const background = [
            "- Hipertensión arterial: Diagnóstico hace 8 años, en tratamiento con Losartán 50mg/día",
            "- Diabetes Mellitus Tipo 2: Diagnóstico hace 5 años, en Metformina 500mg c/12h",
            "- IAMEST (Enero 2025): Angioplastia Primary PCI con stent DES en LAD"
        ];
        
        y += 20;
        background.forEach(line => {
            doc.text(line, 20, y);
            y += 7;
        });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("ENFERMEDAD ACTUAL", 20, y + 10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const illness = "Paciente de 52 años consulta de control cardiológico post-IAMEST. Asintomático. Niega dolor torácico, disnea o palpitaciones. Funcionalidad: NYHA I. Adherencia al tratamiento: Regular.";
        const lines = doc.splitTextToSize(illness, 170);
        y += 20;
        doc.text(lines, 20, y);
        y += lines.length * 5;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EXAMEN FÍSICO", 20, y + 10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const exam = "FC: 72 lpm, regular | PA: 130/80 mmHg | Peso: 78 kg, Talla: 172 cm | Cardiopulmonar: RCR, sin soplos | Extremidades: Pulsos periféricos presentes, sin edema";
        const examLines = doc.splitTextToSize(exam, 170);
        y += 20;
        doc.text(examLines, 20, y);
        y += examLines.length * 5;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DIAGNÓSTICOS", 20, y + 10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const diagnoses = [
            "1. Cardiopatía isquémica - Código CIE-10: I25.10",
            "2. Hipertensión arterial esencial - Código CIE-10: I10",
            "3. Diabetes mellitus tipo 2 - Código CIE-10: E11.9"
        ];
        
        y += 20;
        diagnoses.forEach(d => {
            doc.text(d, 20, y);
            y += 7;
        });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("TRATAMIENTO", 20, y + 10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const treatment = [
            "1. Losartán 50mg - Cada 24 horas",
            "2. Metformina 500mg - Cada 12 horas",
            "3. Atorvastatina 40mg - Cada 24 horas (noche)",
            "4. Ácido acetilsalicílico 100mg - Cada 24 horas",
            "5. Clopidogrel 75mg - Cada 24 horas"
        ];
        
        y += 20;
        treatment.forEach(t => {
            doc.text(t, 20, y);
            y += 7;
        });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PLAN", 20, y + 10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const plan = "Continuar tratamiento actual. Control en 3 meses. Ecos transtorácico de control. Perfil lipídico y HbA1c.";
        const planLines = doc.splitTextToSize(plan, 170);
        y += 20;
        doc.text(planLines, 20, y);
        
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text("Documento generado según estándares de la Resolución 1888 de 2025 - Ministerio de Salud", 105, 285, { align: "center" });
        doc.text("Este es un documento de PRUEBA. No contiene información real de pacientes.", 105, 290, { align: "center" });
        
        doc.save("historia_modelo_nexo.pdf");
        
        setTimeout(() => {
            goToStep(2);
        }, 1000);
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
            alert("Por favor selecciona un archivo PDF o TXT");
            return;
        }
        
        setFileSelected(true);
        
        setProcessingStep(1);
        setTimeout(() => setProcessingStep(2), 1000);
        setTimeout(() => setProcessingStep(3), 2000);
        
        setTimeout(() => {
            const currentRecords = getRecords();
            const updatedRecords = [newRecord, ...currentRecords];
            saveRecords(updatedRecords);
            sessionStorage.setItem("nexosalud_new_record", "true");
            setRecords(updatedRecords);
            goToStep(3);
            
            setTimeout(() => {
                window.location.href = "/visor";
            }, 3000);
        }, 3000);
    };

    const restartDemo = () => {
        sessionStorage.removeItem("nexosalud_records");
        sessionStorage.removeItem("nexosalud_new_record");
        setRecords(initialRecords);
        setFileSelected(false);
        setProcessingStep(0);
        goToStep(1);
    };

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
                            <Link href="/demo" className="text-cyan-400 text-sm font-medium transition-colors">Demo</Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold mb-2">Simulador de Interoperabilidad</h1>
                    <p className="text-white/60">Prueba el flujo completo de envío de RDA al Ministerio de Salud</p>
                </div>

                <div className="flex justify-center gap-2 mb-12">
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                currentStep === step
                                    ? "bg-teal-500/20 text-teal-400"
                                    : currentStep > step
                                    ? "bg-teal-500/10 text-teal-400"
                                    : "bg-white/5 text-white/50"
                            }`}
                        >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                currentStep === step || currentStep > step ? "bg-teal-500 text-white" : "bg-white/10"
                            }`}>
                                {currentStep > step ? "✓" : step}
                            </span>
                            <span>{step === 1 ? "Preparación" : step === 2 ? "Acción" : "Resultados"}</span>
                        </div>
                    ))}
                </div>

                {currentStep === 1 && (
                    <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                        <h2 className="text-2xl font-bold mb-3">Historia Clínica de Prueba</h2>
                        <p className="text-white/60 mb-8">Descargue el modelo de historia clínica basado en estándares del Ministerio de Salud</p>
                        
                        <button
                            onClick={generateAndDownloadPDF}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-teal-500/40 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all"
                        >
                            <FileText className="w-5 h-5" />
                            Descargar Historia Clínica de Prueba (PDF)
                        </button>
                        
                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left text-sm text-white/70">
                            <strong className="text-amber-400">Nota Legal - Ley 1581 de 2012:</strong> Este documento es un modelo basado en los estándares del Ministerio de Salud (Resolución 1888). 
                            No contiene información real de pacientes. Uso exclusivo para demostración y pruebas de interoperabilidad.
                        </div>
                        
                        <button
                            onClick={() => goToStep(2)}
                            className="mt-6 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Ya tengo el archivo PDF
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="max-w-xl mx-auto">
                        {!fileSelected ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                                    isDragOver
                                        ? "border-teal-400 bg-teal-500/5"
                                        : "border-white/20 bg-white/5 hover:border-teal-400/50"
                                }`}
                            >
                                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                                    📄
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Suba aquí el modelo descargado</h3>
                                <p className="text-white/50 text-sm">Arrastre el archivo PDF o haga clic para seleccionar</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                {[
                                    { label: "Validando firma digital", sublabel: "Verificando integridad del documento", done: processingStep >= 1 },
                                    { label: "Extrayendo códigos CUPS/CUM", sublabel: "Mapeando procedimientos y medicamentos", done: processingStep >= 2 },
                                    { label: "Mapeando a FHIR v1.3", sublabel: "Generando Bundle según perfil Vulcano", done: processingStep >= 3 }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                            item.done ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/50"
                                        }`}>
                                            {item.done ? "✓" : "⏳"}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium">{item.label}</div>
                                            <div className="text-xs text-white/50">{item.sublabel}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="max-w-xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm font-semibold mb-6">
                            <Check className="w-4 h-4" />
                            RDA Enviado Exitosamente
                        </div>
                        
                        <div className="flex items-center gap-4 p-5 bg-teal-500/10 rounded-xl mb-8">
                            <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center text-2xl font-bold">CP</div>
                            <div>
                                <h3 className="text-lg font-semibold">Carlos Pérez González</h3>
                                <p className="text-sm text-white/60">CC: 1035845210 • Masculino • 52 años</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            {records.slice(0, 4).map((record, index) => (
                                <div
                                    key={index}
                                    className={`bg-white/5 border rounded-xl p-5 ${
                                        record.isNew ? "border-green-500/50 bg-green-500/5" : "border-white/10"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-white/50">{record.date}</span>
                                        {record.isNew && (
                                            <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                                <Check className="w-3 h-3" /> Reportado a MinSalud
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold mb-1">{record.title}</h4>
                                    <p className="text-sm text-white/60 mb-2">{record.desc}</p>
                                    <span className="text-xs text-white/40 font-mono">{record.code}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="text-center">
                            <button
                                onClick={restartDemo}
                                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Nueva Simulación
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="py-8 border-t border-white/10 text-center text-white/40 text-xs">
                <div className="max-w-6xl mx-auto px-6">
                    <p>NexoSalud - Simulador de Interoperabilidad IHCE | Resolución 1888</p>
                </div>
            </footer>
        </div>
    );
}
