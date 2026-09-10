import { Play } from "lucide-react";

export default function VideoDemo() {
    return (
        <section id="demo" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Así funciona NexoSalud RDA</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Olvídate de llenar formularios infinitos. Solo pega el texto clínico y nosotros generamos el Código VIDA.
                    </p>
                </div>

                <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 aspect-video group cursor-pointer">
                    {/* Mock Video Thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/40 to-slate-900/80 z-10 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-teal-600/90 hover:bg-teal-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-teal-500/30 transition-all duration-300 transform group-hover:scale-110">
                            <Play className="w-8 h-8 ml-1" />
                        </div>
                        <p className="text-white mt-6 font-medium tracking-wide">Ver Demostración de 2 Minutos</p>
                    </div>

                    {/* Faked UI Background for the video thumbnail */}
                    <div className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                        <div className="h-full w-full bg-slate-100 flex p-8">
                            <div className="w-1/3 space-y-4">
                                <div className="h-8 bg-slate-300 rounded w-3/4"></div>
                                <div className="h-32 bg-slate-200 rounded"></div>
                                <div className="h-10 bg-teal-500 rounded w-1/2"></div>
                            </div>
                            <div className="flex-1 ml-8 space-y-4">
                                <div className="h-64 bg-white rounded-xl shadow-sm border border-slate-200"></div>
                                <div className="h-64 bg-white rounded-xl shadow-sm border border-slate-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
