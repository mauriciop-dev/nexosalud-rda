import Link from "next/link";
import { ArrowRight, FileText, Lock, Cloud, Server, ChevronRight } from "lucide-react";
import HeroSection from "../components/landing/HeroSection";
import VideoDemo from "../components/landing/VideoDemo";
import PricingTable from "../components/landing/PricingTable";
import Chatbot from "../components/landing/Chatbot";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-200">

            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <FileText className="h-8 w-8 text-teal-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
                                NexoSalud RDA
                            </span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Características</a>
                            <a href="#demo" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Demostración</a>
                            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Planes</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                                Ingresar
                            </Link>
                            <Link href="/demo" className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md flex items-center gap-1">
                                Probar Gratis <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Placeholder components, will be implemented next */}
                <HeroSection />
                <VideoDemo />
                <PricingTable />
                <Chatbot />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-6 w-6 text-teal-400" />
                            <span className="text-lg font-bold text-white">NexoSalud RDA</span>
                        </div>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Simplificando el cumplimiento de la Resolución 1888 del MinSalud de Colombia con Inteligencia Artificial.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Producto</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-teal-400">Características</a></li>
                            <li><a href="#pricing" className="hover:text-teal-400">Precios</a></li>
                            <li><a href="/dashboard" className="hover:text-teal-400">Portal SaaS</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal & Soporte</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-teal-400">Política de Habeas Data</a></li>
                            <li><a href="#" className="hover:text-teal-400">Términos de Servicio</a></li>
                            <li><a href="#" className="hover:text-teal-400">Contacto</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 flex justify-between items-center">
                    <p>© 2026 NexoSalud. Todos los derechos reservados.</p>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/573144897092?text=Hola%20Mauricio,%20estoy%20en%20la%20p%C3%A1gina%20de%20NexoSalud%20y%20quiero%20conocer%20m%C3%A1s%20sobre%20el%20Programa%20de%20Pioneros%20para%20mi%20IPS."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
                aria-label="Contactar por WhatsApp"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
            </a>
        </div>
    );
}
