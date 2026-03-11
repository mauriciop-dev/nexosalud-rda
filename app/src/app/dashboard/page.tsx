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
    ShieldCheck
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
export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const [extractText, setExtractText] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [lastExtracted, setLastExtracted] = useState<any>(null);
    const [codigoVida, setCodigoVida] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [motor, setMotor] = useState<'llama3.1' | 'groq'>('groq');
    const [processedRecords, setProcessedRecords] = useState<Array<{
        p: string; f: string; t: string; color: string; id: string; isReal?: boolean;
    }>>([]);

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
                    const pName = patientRes?.name?.[0]?.text || 'Paciente';
                    const attDate = compositionRes?.date?.substring(0, 10) || record.created_at?.substring(0, 10) || new Date().toISOString().substring(0, 10);

                    return {
                        p: pName,
                        f: attDate,
                        t: 'CONSULTA',
                        color: 'blue',
                        id: record.codigo_vida || '-',
                        isReal: true
                    };
                });
                setProcessedRecords(formatted);
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

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/extract-rda`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: extractText,
                    tenant_id: user?.id,
                    motor: motor
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                const bundle = result.fhir_bundle;
                const patientResource = bundle?.entry?.find((e: any) => e.resource?.resourceType === 'Patient')?.resource;
                const compositionResource = bundle?.entry?.find((e: any) => e.resource?.resourceType === 'Composition')?.resource;
                const patientName = patientResource?.name?.[0]?.text || 'Paciente Procesado';
                const attentionDate = compositionResource?.date?.substring(0, 10) || new Date().toISOString().substring(0, 10);

                setLastExtracted(bundle);
                setCodigoVida(result.codigo_vida);
                setShowSuccessModal(true);
                await loadRecords(); // Refresh the table from Supabase!
            } else {
                alert('Error en Pipeline: ' + (result.detail || 'Fallo desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el Backend (Verifica que Docker esté corriendo)');
        } finally {
            setExtracting(false);
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
                        <a className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-teal-600/5 text-teal-600 font-bold transition-all border border-teal-600/10" href="#">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </a>
                        {[
                            { icon: Smartphone, label: 'Envíos RDA' },
                            { icon: Users, label: 'Pacientes' },
                            { icon: BarChart3, label: 'Auditoría' },
                        ].map((item) => (
                            <a key={item.label} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all border border-transparent" href="#">
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </a>
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
                            <div className="relative">
                                <Search size={18} className="text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="search"
                                    placeholder="Buscar paciente o ID..."
                                    className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all placeholder:text-slate-300 w-64"
                                />
                            </div>
                            <button type="button" className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
                                <Bell size={18} className="text-slate-500" />
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-10">
                        {/* Stats Cards */}
                        <section className="grid grid-cols-3 gap-6 mb-10">
                            {/* Código VIDA */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-7 flex items-center justify-between group hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Último Código VIDA</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{codigoVida || 'Pendiente'}</h3>
                                    <div className="flex items-center gap-1.5 mt-4 bg-emerald-50 text-emerald-600 p-1.5 pr-3 rounded-full w-fit">
                                        <CheckCircle2 size={16} />
                                        <span className="text-[10px] uppercase font-black tracking-wider">{codigoVida ? 'Sincronizado' : 'En cola'}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 text-slate-400 p-4 rounded-2xl group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
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
                                    <div className="flex items-center gap-1.5 mt-4 bg-indigo-50 text-indigo-600 p-1.5 pr-3 rounded-full w-fit">
                                        <Gavel size={16} />
                                        <span className="text-[10px] uppercase font-black tracking-wider">Cumplimiento HL7 FHIR</span>
                                    </div>
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
                                            {[
                                                ...processedRecords,
                                                { p: 'Juan Pérez', f: '2025-03-09', t: 'URGENCIAS', color: 'red', id: 'VIDA-8821' },
                                                { p: 'María García', f: '2025-03-09', t: 'CONSULTA', color: 'blue', id: 'VIDA-9012' },
                                                { p: 'Carlos Ruiz', f: '2025-03-08', t: 'CONTROL', color: 'green', id: 'VIDA-7734' },
                                            ].map((row, i) => (
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Extraction Widget */}
                            <div className="lg:col-span-4 flex flex-col gap-8">
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_24px_48px_rgba(0,0,0,0.02)] p-8 flex flex-col relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <FileText size={96} className="text-teal-600 transform rotate-12" />
                                    </div>
                                    <div className="mb-8 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <FileText className="text-teal-600" size={24} />
                                            <h3 className="font-black text-slate-800">Carga de Historia Clínica</h3>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
                                            El sistema AI extraerá automáticamente datos personales y clínicos cumpliendo con HL7 FHIR.
                                        </p>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div className="relative">
                                            <textarea
                                                value={extractText}
                                                onChange={(e) => setExtractText(e.target.value)}
                                                className="w-full h-56 bg-white border-2 border-slate-100 rounded-[2rem] p-6 text-sm font-medium resize-none focus:bg-white focus:border-primary/20 focus:ring-8 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 shadow-inner text-slate-900"
                                                placeholder="Pega aquí el texto de la historia clínica o resumen de atención..."
                                            />
                                            <div className="absolute bottom-6 right-6">
                                                <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Llama 3.1</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleExtract}
                                            disabled={extracting}
                                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-[1.5rem] font-black text-base shadow-xl shadow-teal-600/30 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none active:scale-[0.98] cursor-pointer"
                                        >
                                            {extracting ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    Procesando con IA...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={20} />
                                                    Procesar RDA con IA
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Last processed files */}
                                    {processedRecords.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 relative z-10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Últimos Procesados</p>
                                            {processedRecords.slice(0, 2).map((r, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="text-slate-400" size={14} />
                                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{r.p}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-teal-600">{r.id}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Status Bar */}
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

            {/* ── RDA Success Modal ── */}
            {showSuccessModal && lastExtracted && codigoVida && (
                <RDASuccessModal
                    bundle={lastExtracted}
                    codigoVida={codigoVida}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
        </>
    );
}
