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
                            <Link href="/dashboard" className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md flex items-center gap-1">
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
        </div>
    );
}
