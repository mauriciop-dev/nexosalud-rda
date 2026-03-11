'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FileText, UserPlus, Mail, Lock, AlertCircle, Loader2, ChevronRight, Building } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ipsName, setIpsName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    ips_name: ipsName,
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            setSuccess(true);
            setLoading(false);
            // Optional: redirect to login after a delay
            setTimeout(() => router.push('/login'), 3000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserPlus size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Registro Exitoso!</h2>
                    <p className="text-slate-600 mb-8">Hemos enviado un correo de confirmación. Por favor verifica tu cuenta para comenzar.</p>
                    <Link href="/login" className="text-teal-600 font-bold hover:underline">Ir al inicio de sesión</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans border-t-4 border-teal-600">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50"></div>

                <div className="flex flex-col items-center mb-8 relative z-10">
                    <Link href="/" className="bg-teal-600/10 rounded-2xl p-4 mb-4 text-teal-600 flex items-center justify-center">
                        <FileText size={32} />
                    </Link>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registro de Nueva IPS</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Únete a la red NexoSalud RDA</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5 relative z-10">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Nombre de la Institución (IPS)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Building size={18} />
                            </div>
                            <input
                                type="text"
                                value={ipsName}
                                onChange={(e) => setIpsName(e.target.value)}
                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Clínica Santa María"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-400"
                                placeholder="contacto@clinica.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
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
                                <span>Crear Cuenta</span>
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <Link href="/login" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                            ¿Ya tienes cuenta? Inicia sesión
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
