"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AliadosPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <header className="border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            NexoSalud
                        </div>
                        <nav className="flex gap-8">
                            <Link href="/aliados" className="text-white/70 hover:text-cyan-400 font-medium text-sm transition-colors">
                                Programa
                            </Link>
                            <Link href="/demo" className="text-white/70 hover:text-cyan-400 font-medium text-sm transition-colors">
                                Demo
                            </Link>
                            <a href="#contacto" className="text-white/70 hover:text-cyan-400 font-medium text-sm transition-colors">
                                Contacto
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            <section className="py-20 text-center">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="inline-block bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6">
                        Programa de Pioneros 2026
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                        Lidere la Interoperabilidad<br />
                        en su <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">IPS</span>
                    </h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
                        Únete al programa de adopción temprana del Ministerio de Salud. Cumplimiento legal, ahorro de costos y posicionamiento como líder en transformación digital.
                    </p>
                    <Link href="/demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-teal-500/40 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all">
                        Ir al Simulador de Interoperabilidad
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <section className="py-16 bg-white/5 border-y border-white/10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-black text-teal-400">31 Dic</div>
                            <div className="text-sm text-white/60 mt-2">Fecha límite IPS</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-teal-400">1888</div>
                            <div className="text-sm text-white/60 mt-2">Resolución MinSalud</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-teal-400">100%</div>
                            <div className="text-sm text-white/60 mt-2">Cumplimiento</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-teal-400">Gratis</div>
                            <div className="text-sm text-white/60 mt-2">Para Pioneros</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-extrabold text-center mb-12">¿Por qué ser Pionero?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-teal-500/30 transition-all">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">⚖️</div>
                            <h3 className="text-lg font-bold mb-3">Cumplimiento Legal</h3>
                            <p className="text-sm text-white/60 leading-relaxed">Resolución 1888 de 2025 establece la interoperabilidad obligatoria. Sé de los primeros en adaptarte y evita sanciones.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-teal-500/30 transition-all">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">💰</div>
                            <h3 className="text-lg font-bold mb-3">Ahorro de Costos</h3>
                            <p className="text-sm text-white/60 leading-relaxed">Los pioneros reciben acceso gratuito al software y soporte prioritario. No esperes a multas mayores.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-teal-500/30 transition-all">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">🏆</div>
                            <h3 className="text-lg font-bold mb-3">Posicionamiento</h3>
                            <p className="text-sm text-white/60 leading-relaxed">Aparece como IPS pionera en el directorio nacional. Atrae pacientes que buscan atención con estándares modernos.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-teal-500/30 transition-all">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">🔒</div>
                            <h3 className="text-lg font-bold mb-3">Seguridad de Datos</h3>
                            <p className="text-sm text-white/60 leading-relaxed">Cumplimiento total con Ley 1581 de Habeas Data. Cifrado, auditoría y privacidad garantizados.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-teal-500/30 transition-all">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">🤝</div>
                            <h3 className="text-lg font-bold mb-3">Red de Pioneros</h3>
                            <p className="text-sm text-white/60 leading-relaxed">Acceso a comunidad exclusiva de IPS aliadas. Comparte mejores prácticas y resuelve dudas.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-teal-500/30 transition-all">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">📊</div>
                            <h3 className="text-lg font-bold mb-3">Analítica Avanzada</h3>
                            <p className="text-sm text-white/60 leading-relaxed">Dashboard con indicadores de salud poblacional. Toma decisiones basadas en datos reales de tus pacientes.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 text-center">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold mb-4">¿Listo para transformar tu IPS?</h2>
                    <p className="text-white/70 mb-8">Prueba nuestro simulador gratuito y descubre cómo funciona la interoperabilidad.</p>
                    <Link href="/demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-teal-500/40 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all">
                        Comenzar Simulación
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <footer className="py-8 border-t border-white/10 text-center text-white/50 text-sm">
                <div className="max-w-6xl mx-auto px-6">
                    <p>© 2026 NexoSalud - Programa de Pioneros. Cumplimiento Resolución 1888.</p>
                </div>
            </footer>

            <a
                href="https://wa.me/573144897092?text=Hola%20Mauricio,%20vi%20el%20simulador%20de%20NexoSalud%20y%20estoy%20interesado%20en%20el%20Programa%20de%20Pioneros%20para%20mi%20IPS."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg shadow-green-500/40 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Hablar con un consultor experto
            </a>
        </div>
    );
}
