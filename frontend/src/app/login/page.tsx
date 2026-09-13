'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FileText, LogIn, Mail, Lock, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans border-t-4 border-teal-600">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 relative overflow-hidden">
                {/* Decorative backgrounds */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50"></div>

                <div className="flex flex-col items-center mb-10 relative z-10">
                    <Link href="/" className="bg-teal-600/10 rounded-2xl p-4 mb-6 text-teal-600 flex items-center justify-center hover:scale-105 transition-transform">
                        <FileText size={40} />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">NexoSalud RDA</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">IPS Central de Interoperabilidad</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-400"
                                placeholder="usuario@clinica.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-semibold flex items-center gap-2 animate-shake">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Ingresar al Sistema</span>
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <Link href="/register" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                            ¿Aún no tienes cuenta? Regístrate aquí
                        </Link>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Cumplimiento Resolución 1888 de 2025
                    </p>
                </div>
            </div>
        </div>
    );
}

