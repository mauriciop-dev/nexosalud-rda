import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Zap } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
            {/* Background Gradients */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-200 to-teal-500 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }} />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-8">
                        <ShieldCheck className="w-4 h-4" />
                        <span>100% Compatible con Resolución 1888 del MinSalud</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                        Extrae y Estructura Historias Clínicas con <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">Inteligencia Artificial</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Convierte cualquier texto clínico libre en un paquete HL7 FHIR R4 estructurado automáticamente. Listo para enviar al Bus de Interoperabilidad.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-teal-600/30 flex items-center justify-center gap-2">
                            Probar en la Nube <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/aliados" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-semibold text-lg transition-all shadow-sm flex items-center justify-center gap-2">
                            Probar Simulador Res. 1888
                        </Link>
                    </div>
                </div>

                {/* Feature highlights below Hero */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4">
                            <Bot className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Motor IAS de Extracción</h3>
                        <p className="text-slate-600">Modelos avanzados (Llama 3.1, Gemini, Grok) que leen diagnósticos, medicamentos y procedimientos sin configuración.</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Estándar HL7 FHIR R4</h3>
                        <p className="text-slate-600">Mapeo automático a recursos FHIR (Patient, Condition, MedicationRequest, Procedure, Composition).</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Privacidad Total</h3>
                        <p className="text-slate-600">Alternativas SaaS con RLS estricto (Supabase) o contenedores On-Premise para aislamiento offline.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
