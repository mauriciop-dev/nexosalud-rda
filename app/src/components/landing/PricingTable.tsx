import { Check, Cloud, Server, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingTable() {
    return (
        <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Adopción Sencilla, Dos Caminos</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Elige el modelo que mejor se adapte a tu infraestructura y políticas de seguridad (Habeas Data).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* SaaS Cloud Plan */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-teal-300 transition-all flex flex-col relative">
                        <div className="absolute top-0 right-8 -translate-y-1/2">
                            <span className="bg-gradient-to-r from-teal-500 to-emerald-400 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-sm">El más popular</span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                                <Cloud className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Plan SaaS Cloud</h3>
                                <p className="text-sm text-slate-500">Para consultorios e independientes</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-extrabold text-slate-900">Contactar</span>
                            <span className="text-slate-500"> /suscripción mensual</span>
                        </div>

                        <p className="text-slate-600 mb-8 border-b border-slate-100 pb-8 flex-1">
                            Solución "llave en mano". Crea tu cuenta, suscríbete y empieza a enviar historias clínicas hoy mismo. Nosotros gestionamos los servidores y modelos de IA externos.
                        </p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                <span className="text-slate-700">Alojamiento en nube altamente segura</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                <span className="text-slate-700">Actualizaciones automáticas del estándar 1888</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                <span className="text-slate-700">Soporte por IA (Claude/GPT/Gemini) integrado</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                <span className="text-slate-700">Aislamiento de datos con RLS estricto</span>
                            </li>
                        </ul>

                        <Link href="/login" className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-center transition-all flex items-center justify-center gap-2">
                            Iniciar Prueba Gratuita <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* On-Premise Enterprise Plan */}
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl flex flex-col cursor-default transform md:scale-105 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-slate-800 text-teal-400 rounded-xl border border-slate-700">
                                <Server className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Plan Local Enterprise</h3>
                                <p className="text-sm text-slate-400">Para clínicas y grandes redes</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-extrabold text-white">Licencia Anual</span>
                        </div>

                        <p className="text-slate-300 mb-8 border-b border-slate-700 pb-8 flex-1">
                            Máximo control. Instala nuestra plataforma comprimida en un contendor Docker directamente en los servidores internos de tu clínica. Los datos nunca salen de tu intranet.
                        </p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                <span className="text-slate-300">Empaquetado Docker Compose listo para usar</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                <span className="text-slate-300">Modelo Ollama de Inteligencia Artificial OFF-LINE</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                <span className="text-slate-300">Cumplimiento total de políticas Habeas Data estrictas</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                <span className="text-slate-300">Soporte Técnico Premium de Implementación</span>
                            </li>
                        </ul>

                        <button className="w-full py-4 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-center transition-all">
                            Contactar Ventas
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
