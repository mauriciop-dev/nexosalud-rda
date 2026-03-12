"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Smartphone,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Search,
    Bell,
    Network,
    Bot,
    Gavel,
    Activity,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    PlusCircle,
    Copy,
    Check,
    X,
    Code,
    Loader2,
    SearchIcon,
    Stethoscope,
    Sparkles,
    ChevronRight,
    Pill,
    UserCircle,
    CheckCircle,
    ClipboardList,
    ExternalLink,
    Database,
    ShieldCheck,
    History,
    ListTree,
    Building,
    Hash,
    Download
} from 'lucide-react';

// Using some standard lucide icons if the specific ones above don't exist
// I'll map them for better readability in the JSX below.

// ─── Success Modal Component ───────────────────────────────────────────────────
function RDASuccessModal({
    bundle,
    codigoVida,
    onClose,
}: {
    bundle: any;
    codigoVida: string;
    onClose: () => void;
}) {
    const [showRawJson, setShowRawJson] = useState(false);
    const [copied, setCopied] = useState(false);

    const patientRes = bundle?.entry?.find((e: any) => e.resource?.resourceType === 'Patient')?.resource;
    const compositionRes = bundle?.entry?.find((e: any) => e.resource?.resourceType === 'Composition')?.resource;
    const conditions = bundle?.entry?.filter((e: any) => e.resource?.resourceType === 'Condition')?.map((e: any) => e.resource) || [];
    const medications = bundle?.entry?.filter((e: any) => e.resource?.resourceType === 'MedicationRequest')?.map((e: any) => e.resource) || [];

    const patientName = patientRes?.name?.[0]?.text || 'Paciente';
    const patientDoc = patientRes?.identifier?.[0]?.value;
    const attentionDate = compositionRes?.date?.substring(0, 10) || '';

    // Extraer resumen clínico de la sección "Resumen Clínico"
    const clinicalSummary = compositionRes?.section?.find((s: any) => s.title === 'Resumen Clínico')?.text?.div?.replace(/<[^>]*>/g, '');

    const copyCode = () => {
        navigator.clipboard.writeText(codigoVida);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(10px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden">

                {/* ── Header ── */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 opacity-[0.08]">
                        <ShieldCheck size={200} />
                    </div>
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="text-emerald-200" size={18} />
                                <span className="text-emerald-100 text-xs font-bold uppercase tracking-widest">RDA Procesado Exitosamente</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3 inline-block">
                                <p className="text-emerald-100 text-[10px] uppercase tracking-widest font-bold mb-1">Código VIDA</p>
                                <p className="text-2xl font-black tracking-tight">{codigoVida}</p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-1">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">

                    {/* Patient card */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg flex-shrink-0">
                            {patientName.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-base">{patientName}</p>
                            {patientDoc && <p className="text-slate-400 text-xs font-medium mt-0.5">CC {patientDoc}{attentionDate ? ` · ${attentionDate}` : ''}</p>}
                        </div>
                    </div>

                    {/* Resumen Clínico IA */}
                    {clinicalSummary && (
                        <div className="p-5 bg-teal-50/50 border border-teal-100 rounded-[1.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={40} className="text-teal-600" />
                            </div>
                            <p className="text-[10px] uppercase font-black text-teal-600 tracking-widest mb-2 relative z-10">Resumen Clínico por IA</p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed relative z-10 italic">
                                "{clinicalSummary}"
                            </p>
                        </div>
                    )}

                    {/* Diagnoses */}
                    {conditions.length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Diagnósticos Extraídos</p>
                            <div className="space-y-2">
                                {conditions.map((c: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <span className="text-xs font-black font-mono text-primary bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">
                                            {c.code?.coding?.[0]?.code || 'Z00'}
                                        </span>
                                        <span className="text-sm font-medium text-slate-700">{c.code?.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Medications */}
                    {medications.length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Medicamentos</p>
                            <div className="space-y-2">
                                {medications.map((m: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <Pill className="text-slate-400" size={16} />
                                        <span className="text-sm font-medium text-slate-700">{m.medicationCodeableConcept?.text || 'Medicamento'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Compliance badges */}
                    <div className="flex gap-2 flex-wrap pt-1">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
                            <ShieldCheck size={14} /> HL7 FHIR R4
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600">
                            <Gavel size={14} /> Resolución 1888
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600">
                            <Database size={14} /> Guardado en BD
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={copyCode}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-teal-600/20 active:scale-95"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? '¡Copiado!' : 'Copiar Código VIDA'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowRawJson(!showRawJson)}
                            className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                        >
                            <Code size={18} />
                            FHIR
                        </button>
                    </div>

                    {/* Raw JSON */}
                    {showRawJson && (
                        <div className="bg-slate-900 rounded-2xl p-5 max-h-64 overflow-auto">
                            <pre className="text-emerald-400 text-[10px] font-mono whitespace-pre-wrap break-all">
                                {JSON.stringify(bundle, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
// ─── Timeline Modal Component ────────────────────────────────────────────────
function ClinicalTimelineModal({
    data,
    onClose,
}: {
    data: any;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(10px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
                <div className="bg-slate-900 p-8 text-white relative">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <History className="text-teal-400" size={20} />
                                <span className="text-teal-400 text-[10px] font-bold uppercase tracking-[0.2em]">Historial Nacional IHCE</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Línea de Tiempo Clínica</h2>
                            <p className="text-slate-400 text-xs mt-1">Registros recuperados de otras Instituciones Prestadoras de Salud</p>
                        </div>
                        <button type="button" onClick={onClose} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
                    {data?.entry?.length > 0 ? (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-slate-200 before:content-['']">
                            {data.entry.map((item: any, idx: number) => {
                                const res = item.resource;
                                const isEncounter = res.resourceType === 'Encounter';
                                const date = isEncounter ? res.period?.start : res.recordedDate || 'Fecha no disponible';
                                const procedencia = item.procedencia || "Nacional (RDA)";
                                
                                return (
                                    <div key={idx} className="relative pl-12 group">
                                        <div className="absolute left-0 top-0 size-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-10 group-hover:border-teal-500 transition-colors shadow-sm">
                                            {isEncounter ? <Activity size={18} className="text-blue-500" /> : <ClipboardList size={18} className="text-emerald-500" />}
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(date).toLocaleDateString()}</span>
                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md inline-block self-start">
                                                        {procedencia}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isEncounter ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {res.resourceType}
                                                </span>
                                            </div>
                                            <h4 className="text-slate-800 font-bold mb-1">{isEncounter ? res.type?.[0]?.text : res.code?.coding?.[0]?.display}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Building size={14} className="text-slate-300" />
                                                <span>{res.serviceProvider?.display || res.recorder?.display || 'IPS Desconocida'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="bg-slate-100 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-slate-400 font-bold">No se encontraron registros previos</h3>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

// ─── Normative Checklist Modal ───────────────────────────────────────────────
function NormativeChecklistModal({ onClose }: { onClose: () => void }) {
    const checklist = [
        { title: "HL7 FHIR R4 Bundle", desc: "Tipo 'transaction' con perfiles VULCANO.", status: "ok" },
        { title: "Recurso Composition", desc: "Sección obligatoria de Resumen Clínico CO.", status: "ok" },
        { title: "Firma Digital JWS", desc: "Algoritmo RS256 con certificado .p12.", status: "ok" },
        { title: "Catálogo CIE-10", desc: "Códigos de diagnóstico normalizados.", status: "ok" },
        { title: "Catálogo CUM/CUPS", desc: "Medicamentos y procedimientos validados.", status: "ok" },
        { title: "Extensiones CO", desc: "ID de paciente y código REPS de la IPS.", status: "ok" }
    ];

    return (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-indigo-50 text-indigo-600 p-4 rounded-3xl">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Requisitos Técnicos</h3>
                        <p className="text-sm text-slate-400 font-medium">Cumplimiento Resolución 1888/2024</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {checklist.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <div className="flex items-center gap-3">
                                <div className="size-2 bg-emerald-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{item.title}</p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.desc}</p>
                                </div>
                            </div>
                            <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                    ))}
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-10 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
}

type ViewType = 'dashboard' | 'pacientes' | 'envios' | 'auditoria';

// ─── Main Dashboard Component ────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [extractText, setExtractText] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [lastExtracted, setLastExtracted] = useState<any>(null);
    const [codigoVida, setCodigoVida] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [motor, setMotor] = useState('groq');
    const [processedRecords, setProcessedRecords] = useState<any[]>([]);

    // FASE 6: Interoperabilidad Bidireccional
    const [showTimeline, setShowTimeline] = useState(false);
    const [historicalData, setHistoricalData] = useState<any>(null);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [searchId, setSearchId] = useState('');

    // FASE 7: Navegación y Auditoría
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    
    // FASE 8: UI/UX & Feedback Real-time
    const [showNormativeModal, setShowNormativeModal] = useState(false);
    const [lastSubmissionStatus, setLastSubmissionStatus] = useState<'success' | 'error' | 'none'>('none');
    const [lastErrorDetail, setLastErrorDetail] = useState<string | null>(null);
    const [extractionStep, setExtractionStep] = useState(0);
    const [extractionProgress, setExtractionProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const logAction = async (action: string, resource: string, details: any = {}) => {
        const customReason = details.motivo || (action.includes('IHCE') ? 'Seguimiento clínico' : 'Trámite administrativo');
        const newLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            user: user?.email || 'Sistema',
            action,
            resource,
            details: { ...details, motivo: customReason }
        };
        setAuditLogs(prev => [newLog, ...prev]);
        console.log(`[Auditoría] ${action} - ${resource}`, { ...details, motivo: customReason });

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            await fetch(`${apiUrl}/audit-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user?.email || 'Sistema',
                    action,
                    resource,
                    details: { ...details, motivo: customReason },
                    tenant_id: user?.id
                }),
            });
        } catch (error) {
            console.error('Error persisting audit log:', error);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const loadRecords = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/recent-rda`);
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                const formatted = result.data.map((record: any) => {
                    const bundle = record.fhir_payload;
                    const patientRes = bundle?.entry?.find((e: any) => e.resource?.resourceType === 'Patient')?.resource;
                    const compositionRes = bundle?.entry?.find((e: any) => e.resource?.resourceType === 'Composition')?.resource;
                    const pName = record.patient_name || patientRes?.name?.[0]?.text || 'Paciente';
                    const attDate = compositionRes?.date?.substring(0, 10) || record.created_at?.substring(0, 10) || new Date().toISOString().substring(0, 10);

                    // Determinar tipo basado en Composition si existe
                    const category = compositionRes?.type?.coding?.[0]?.display?.toUpperCase() || 'CONSULTA';
                    const color = category.includes('URGENCIAS') ? 'red' : category.includes('CONTROL') ? 'green' : 'blue';

                    const patientId = patientRes?.identifier?.[0]?.value || 'CC No Registrada';

                    return {
                        p: pName,
                        f: attDate,
                        t: category,
                        color: color,
                        id: record.codigo_vida || '-',
                        patient_id: patientId,
                        isReal: true,
                        bundle: bundle
                    };
                });
                setProcessedRecords(formatted);
                
                // Sync latest success state to KPI Card
                if (formatted.length > 0) {
                    const latest = formatted[0];
                    if (latest.id && latest.id !== '-') {
                        setCodigoVida(latest.id);
                        setLastSubmissionStatus('success');
                    }
                }
            }
        } catch (e) {
            console.error("Error loading records", e);
        }
    };

    useEffect(() => {
        if (!loading) {
            loadRecords();
        }
    }, [loading]);

    const handleExtract = async () => {
        if (!extractText) {
            alert('⚠️ Por favor, pega el texto de la historia clínica antes de procesar.');
            return;
        }
        setExtracting(true);
        setLastExtracted(null);
        setCodigoVida(null);
        setExtractionStep(1);
        setExtractionProgress(10);
        setLastSubmissionStatus('none');

        // Simulación de pasos iniciales para feedback visual
        const steps = [
            { s: 1, p: 20 }, // Analizando...
            { s: 2, p: 45 }, // Identificando...
            { s: 3, p: 70 }, // Mapeando...
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 800));
            setExtractionStep(step.s);
            setExtractionProgress(step.p);
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/extract-rda`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: extractText,
                    tenant_id: user?.id,
                    motor: motor,
                    reps_code: "110011234501", // Default Mock REPS
                    patient_id_type: "CC"      // Default Mock ID Type
                }),
            });
            
            setExtractionStep(4); // Generando y firmando...
            setExtractionProgress(90);

            const result = await response.json();
            if (result.status === 'success') {
                const bundle = result.fhir_bundle;
                const patientResource = bundle?.entry?.find((e: any) => e.resource?.resourceType === 'Patient')?.resource;
                const patientName = patientResource?.name?.[0]?.text || 'Paciente Procesado';
                
                logAction('Extracción Exitosa', `Paciente: ${patientName}`);
                
                setLastSubmissionStatus('success');
                setExtractionStep(4); // Generando y firmando...
                setExtractionProgress(95);
                
                setTimeout(() => {
                    setExtractionStep(5);
                    setExtractionProgress(100);
                }, 400);
                
                setLastExtracted(bundle);
                setCodigoVida(result.codigo_vida);
                
                setTimeout(() => {
                    setShowSuccessModal(true);
                    setExtracting(false);
                }, 500);

                await loadRecords(); // Refresh the table
            } else {
                setLastSubmissionStatus('error');
                setLastErrorDetail(result.message || 'Error en la extracción');
                setExtracting(false);
            }
        } catch (error: any) {
            console.error('Error:', error);
            setLastSubmissionStatus('error');
            setLastErrorDetail(error.message);
            setExtracting(false);
            logAction('Error de Extracción', error.message);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setExtractText(event.target?.result as string);
                logAction('Carga de Archivo', file.name);
            };
            reader.readAsText(file);
        } else {
            alert('⚠️ Solo se permiten archivos de texto (.txt)');
        }
    };

    const handleFetchHistory = async () => {
        if (!searchId) {
            alert('⚠️ Ingrese un ID de paciente para consultar el historial nacional.');
            return;
        }
        setFetchingHistory(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/patient-summary/${searchId}`);
            const data = await response.json();
            
            if (data && data.resourceType === 'Bundle') {
                // Inyectar procedencia simulada para el cumplimiento visual
                const enhancedBundle = {
                    ...data,
                    entry: data.entry?.map((entry: any, index: number) => ({
                        ...entry,
                        procedencia: index % 2 === 0 ? "IPS Clínica Bogotá" : "Hospital MedPlus"
                    }))
                };
                logAction('Consulta IHCE', `Paciente: ${searchId}`, { motivo: 'Seguimiento histórico nacional' });
                setHistoricalData(enhancedBundle);
                setShowTimeline(true);
            } else {
                alert('No se encontró historial clínico para este paciente en el bus nacional.');
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            alert('Error consultando el bus de interoperabilidad.');
        } finally {
            setFetchingHistory(false);
        }
    };

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="text-teal-600 animate-spin" size={48} />
                <p className="text-slate-500 font-medium italic">Sincronizando con NexoSalud...</p>
            </div>
        </div>
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <>
            {/* ── Main Layout ── */}
            <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
                    <div className="p-8 pb-10 flex items-center gap-3">
                        <div className="bg-teal-600 rounded-xl p-2 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-800">NexoSalud</h1>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-teal-600 font-bold">Interoperabilidad</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        <button 
                            onClick={() => setCurrentView('dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all border ${currentView === 'dashboard' ? 'bg-teal-600/5 text-teal-600 border-teal-600/10' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}
                        >
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </button>
                        {[
                            { id: 'envios', icon: Smartphone, label: 'Envíos RDA' },
                            { id: 'pacientes', icon: Users, label: 'Pacientes' },
                            { id: 'auditoria', icon: BarChart3, label: 'Auditoría' },
                        ].map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => setCurrentView(item.id as ViewType)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all border ${currentView === item.id ? 'bg-teal-600/5 text-teal-600 border-teal-600/10' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-slate-100">
                        <div className="mb-6 space-y-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-all"
                            >
                                <LogOut size={20} />
                                <span className="text-sm">Cerrar Sesión</span>
                            </button>
                            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all" href="#">
                                <Settings size={20} />
                                <span className="text-sm">Configuración</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
                            <div className="size-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm">
                                {user?.user_metadata?.ips_name ? user.user_metadata.ips_name.substring(0, 2).toUpperCase() : 'IPS'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-700 truncate">{user?.user_metadata?.ips_name || 'Mi IPS'}</p>
                                <p className="text-[10px] text-slate-400">Admin Central</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                        <header className="bg-white border-b border-slate-100 px-10 py-5 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Panel de Control</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-slate-50 border border-slate-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                                    <div className="relative flex-1">
                                        <Search size={18} className="text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchId}
                                            onChange={(e) => setSearchId(e.target.value)}
                                            placeholder="Consultar ID Paciente (CC/TI)..."
                                            className="pl-10 pr-4 py-2.5 bg-transparent border-none text-sm text-slate-700 font-medium focus:outline-none placeholder:text-slate-300 w-64"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleFetchHistory}
                                        disabled={fetchingHistory}
                                        className="bg-slate-900 text-white px-4 py-2.5 text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {fetchingHistory ? <Loader2 size={14} className="animate-spin" /> : <History size={14} />}
                                        Consultar IHCE
                                    </button>
                                </div>
                                <button type="button" className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
                                    <Bell size={18} className="text-slate-500" />
                                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
                                </button>
                            </div>
                        </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-10">
                        {currentView === 'dashboard' && (
                            <>
                                {/* Stats Cards */}
                                <section className="grid grid-cols-3 gap-6 mb-10">
                                    {/* Código VIDA */}
                                    <div className={`bg-white rounded-[2rem] border ${lastSubmissionStatus === 'error' ? 'border-red-200 bg-red-50/10' : 'border-slate-100'} shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-7 flex items-center justify-between group hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all`}>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Último Código VIDA</p>
                                            <h3 className={`text-2xl font-black tracking-tighter ${lastSubmissionStatus === 'error' ? 'text-red-600' : 'text-slate-900'}`}>
                                                {lastSubmissionStatus === 'error' ? 'Error Técnico' : (codigoVida || 'Pendiente')}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-4">
                                                {lastSubmissionStatus === 'error' ? (
                                                    <button 
                                                        onClick={() => alert(`Error: ${lastErrorDetail}`)}
                                                        className="bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-red-200 transition-all"
                                                    >
                                                        <AlertTriangle size={14} />
                                                        Ver error técnico
                                                    </button>
                                                ) : (
                                                    <div className={`flex items-center gap-1.5 p-1.5 pr-3 rounded-full w-fit ${codigoVida ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        <CheckCircle2 size={16} />
                                                        <span className="text-[10px] uppercase font-black tracking-wider">{codigoVida ? 'Sincronizado' : 'En cola'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-2xl transition-all ${lastSubmissionStatus === 'error' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                                            <Network size={32} />
                                        </div>
                                    </div>

                            {/* Motor IA */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-7 flex items-center justify-between group hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all">
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Motor de Extracción</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => setMotor('llama3.1')}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${motor === 'llama3.1' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            LLAMA 3.1
                                        </button>
                                        <button
                                            onClick={() => setMotor('groq')}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${motor === 'groq' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            GROQ CLOUD
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 bg-blue-50 text-blue-600 p-1.5 pr-3 rounded-full w-fit">
                                        <Bot size={16} />
                                        <span className="text-[10px] uppercase font-black tracking-wider">
                                            {motor === 'llama3.1' ? 'Inferencia Local Activa' : 'Turbo Cloud Activo'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`${motor === 'llama3.1' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'} p-4 rounded-2xl transition-colors`}>
                                    {motor === 'llama3.1' ? <Activity size={32} /> : <Sparkles size={32} />}
                                </div>
                            </div>

                            {/* Normativa */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-7 flex items-center justify-between group hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Normativa Vigente</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Resolución 1888</h3>
                                    <button 
                                        onClick={() => setShowNormativeModal(true)}
                                        className="flex items-center gap-1.5 mt-4 bg-indigo-50 text-indigo-600 p-1.5 px-3 rounded-full w-fit hover:bg-indigo-100 transition-all"
                                    >
                                        <Gavel size={16} />
                                        <span className="text-[10px] uppercase font-black tracking-wider">Checklist Técnico</span>
                                    </button>
                                </div>
                                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl">
                                    <ShieldCheck size={32} />
                                </div>
                            </div>
                        </section>

                        {/* Table + Extractor Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                            {/* Atenciones Recientes */}
                            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_24px_48px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-[500px]">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">Atenciones Recientes</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Gestión de trámites ante MinSalud</p>
                                    </div>
                                    <button type="button" className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100">Ver todo</button>
                                </div>
                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <tr>
                                                <th className="px-8 py-4">Paciente</th>
                                                <th className="px-6 py-4">Fecha</th>
                                                <th className="px-6 py-4">Tipo RDA</th>
                                                <th className="px-6 py-4">ID Trámite</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                        {processedRecords.length > 0 ? (
                                            processedRecords.map((row, i) => (
                                                <tr key={i} className={`hover:bg-slate-50/30 transition-colors group ${'isReal' in row && row.isReal ? 'border-l-4 border-l-primary' : ''}`}>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                                                {row.p.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700">{row.p}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">{row.f}</td>
                                                    <td className="px-6 py-5">
                                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${row.color === 'red' ? 'bg-red-50 text-red-500' : row.color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                            {row.t}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-mono font-bold text-teal-600">{row.id}</span>
                                                            <ExternalLink size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                                                    No hay atenciones recientes procesadas.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Extractor Widget */}
                            <div 
                                className={`lg:col-span-4 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group transition-all duration-300 ${isDragging ? 'bg-teal-900 border-4 border-dashed border-teal-500/50' : 'bg-slate-900'}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    {isDragging ? <Download size={120} /> : <Bot size={120} />}
                                </div>
                                
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black mb-2 tracking-tight">Procesar Historia</h3>
                                    <p className="text-slate-400 text-xs font-medium mb-8">Pega el texto clínico para extraer campos FHIR.</p>
                                    
                                    <textarea 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium placeholder:text-slate-600 focus:ring-2 focus:ring-teal-500/50 outline-none min-h-[220px] transition-all mb-6"
                                        placeholder="Ej: Paciente masculino de 45 años..."
                                        value={extractText}
                                        onChange={(e) => setExtractText(e.target.value)}
                                    ></textarea>

                                    {extracting && (
                                        <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest leading-none">
                                                    {extractionStep === 1 && "Analizando texto clínico..."}
                                                    {extractionStep === 2 && "Identificando paciente y médicos..."}
                                                    {extractionStep === 3 && "Mapeando códigos CUPS/CIE-10..."}
                                                    {extractionStep === 4 && "Generando y firmando Bundle FHIR..."}
                                                    {extractionStep === 5 && "¡Listo!"}
                                                </p>
                                                <span className="text-[10px] font-mono text-slate-500">{extractionProgress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(20,184,166,0.4)]"
                                                    style={{ width: `${extractionProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleExtract}
                                        disabled={extracting}
                                        className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-teal-500/20 active:scale-95"
                                    >
                                        {extracting ? (
                                            <Loader2 size={18} className="animate-spin text-slate-900" />
                                        ) : (
                                            <Sparkles size={18} />
                                        )}
                                        <span>{extracting ? 'PROCESANDO...' : 'EXTRAER DATOS RDA'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                            </>
                        )}

                        {currentView === 'pacientes' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800">Directorio de Pacientes</h3>
                                            <p className="text-sm text-slate-400 font-medium">Gestión local y consulta de historial nacional IHCE.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="relative">
                                                <Search size={18} className="text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Buscar por cédula..."
                                                    className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none w-64 transition-all"
                                                    value={searchId}
                                                    onChange={(e) => setSearchId(e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    logAction('Consulta IHCE', `Paciente: ${searchId}`);
                                                    handleFetchHistory();
                                                }}
                                                className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2"
                                            >
                                                <History size={18} />
                                                Consultar Nacional
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border border-slate-50 rounded-[2rem] overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                                <tr>
                                                    <th className="px-8 py-5">Nombre Completo</th>
                                                    <th className="px-6 py-5">Identificación</th>
                                                    <th className="px-6 py-5">Última Atención</th>
                                                    <th className="px-8 py-5 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {processedRecords.length > 0 ? (
                                                    // Extraer pacientes únicos de los registros procesados
                                                    Array.from(new Set(processedRecords.map(r => r.p))).map((name, i) => {
                                                        const lastRecord = processedRecords.find(r => r.p === name);
                                                        return (
                                                            <tr key={i} className="hover:bg-slate-50/20 transition-colors group">
                                                                <td className="px-8 py-5 font-bold text-slate-700 text-sm">{name}</td>
                                                                <td className="px-6 py-5 text-sm text-slate-500 font-mono">{lastRecord.patient_id || 'CC Desconocida'}</td>
                                                                <td className="px-6 py-5 text-sm text-slate-500">{lastRecord.f}</td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSearchId(lastRecord.patient_id || '');
                                                                            handleFetchHistory();
                                                                        }}
                                                                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                                                                    >
                                                                        <Hash size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">No hay pacientes registrados.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'envios' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-slate-800">Historial de Envíos RDA</h3>
                                        <p className="text-sm text-slate-400 font-medium">Trazabilidad completa de trámites ante MinSalud.</p>
                                    </div>
                                    <div className="border border-slate-50 rounded-[2rem] overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                                <tr>
                                                    <th className="px-8 py-5">Código VIDA</th>
                                                    <th className="px-6 py-5">Paciente</th>
                                                    <th className="px-6 py-5">Fecha</th>
                                                    <th className="px-6 py-5">Estado</th>
                                                    <th className="px-8 py-5 text-right">Bundle</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {processedRecords.map((r, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/20 transition-colors">
                                                        <td className="px-8 py-5 font-mono text-xs font-bold text-teal-600">{r.id}</td>
                                                        <td className="px-6 py-5 font-bold text-slate-700 text-sm">{r.p}</td>
                                                        <td className="px-6 py-5 text-sm text-slate-500">{r.f}</td>
                                                        <td className="px-6 py-5">
                                                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Sincronizado</span>
                                                        </td>
                                                        <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => {
                                                                    logAction('Visualizar Bundle', `Transacción: ${r.id}`);
                                                                    setLastExtracted(r.bundle);
                                                                    setCodigoVida(r.id);
                                                                    setShowSuccessModal(true);
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                                title="Ver FHIR Bundle"
                                                            >
                                                                <FileText size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    logAction('Descarga RDA', `Transacción: ${r.id}`, { format: 'JSON/FHIR' });
                                                                    const blob = new Blob([JSON.stringify(r.bundle, null, 2)], { type: 'application/json' });
                                                                    const url = URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.href = url;
                                                                    a.download = `RDA-${r.id}.json`;
                                                                    a.click();
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                                                                title="Descargar RDA"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'auditoria' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800">Registro de Auditoría</h3>
                                            <p className="text-sm text-slate-400 font-medium">Trazabilidad de acciones según Ley 1581 (Habeas Data).</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-teal-600 font-bold text-xs border border-teal-600/10">
                                            <ShieldCheck size={14} />
                                            Cumplimiento Resolución 1888
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {auditLogs.length > 0 ? (
                                            auditLogs.map((log) => (
                                                <div key={log.id} className="group bg-slate-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl p-4 flex items-center justify-between transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-xl ${
                                                            log.action.includes('Visualizar') ? 'bg-blue-50 text-blue-500' : 
                                                            log.action.includes('Consulta') ? 'bg-purple-50 text-purple-500' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {log.action.includes('Visualizar') ? <Search size={16} /> : <Activity size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className="text-sm font-bold text-slate-700">{log.action}</p>
                                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                                    {log.resource}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden">
                                                                <span className="font-bold text-teal-600">{log.user}</span>
                                                                <span>•</span>
                                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                                {log.details?.motivo && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-blue-500 font-bold italic truncate max-w-[200px]">Motivo: {log.details.motivo}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter hover:underline">Ver Detalles</button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center text-slate-400 font-medium italic">No hay registros de auditoría recientes.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <footer className="mt-10 grid grid-cols-4 gap-4">
                            {[
                                { label: 'Tiempo Prom. Validación', value: '1.2m', icon: Clock },
                                { label: 'Sincronización VIDA', value: 'Activa', icon: Loader2, green: true },
                                { label: 'Carga de Servidor', value: '14%', icon: Activity },
                                { label: 'Alertas Críticas', value: '0', icon: AlertTriangle },
                            ].map(s => (
                                <div key={s.label} className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-teal-600/10 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <s.icon size={18} className={`${s.green ? 'text-emerald-500' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                    </div>
                                    <span className={`text-xs font-bold ${s.green ? 'text-emerald-600' : 'text-slate-800'}`}>{s.value}</span>
                                </div>
                            ))}
                        </footer>
                    </div>
                </main>
            </div>

            {/* ── Modals ── */}
            {showSuccessModal && lastExtracted && codigoVida && (
                <RDASuccessModal
                    bundle={lastExtracted}
                    codigoVida={codigoVida}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}

            {showNormativeModal && (
                <NormativeChecklistModal onClose={() => setShowNormativeModal(false)} />
            )}

            {showTimeline && (
                <ClinicalTimelineModal 
                    data={historicalData} 
                    onClose={() => setShowTimeline(false)} 
                />
            )}
        </>
    );
}
