"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "¡Hola! Soy el asistente de NexoSalud RDA. ¿Tienes dudas sobre cómo protegemos los datos de tus pacientes o sobre nuestros planes?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const newMessages = [...messages, { text: input, sender: "user" }];
        setMessages(newMessages);
        setInput("");

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: "Gracias por tu mensaje. Este es un chatbot de demostración para el MVP. En la versión final, estaré conectado a un agente IA experto en asesoría comercial.",
                sender: "bot"
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-teal-700 hover:scale-110 transition-all z-50 animate-bounce"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 shadow-teal-900/10">
                    {/* Header */}
                    <div className="bg-slate-900 text-white py-4 px-6 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                            <h4 className="font-semibold text-sm">Asesor Ventas IA</h4>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu pregunta..."
                                className="w-full bg-slate-100 border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                            <button type="submit" className="absolute right-2 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
