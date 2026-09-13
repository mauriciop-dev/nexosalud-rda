
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import MCPSection from '@/components/landing/MCPSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0d0f12]">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-[#0d0f12]/80 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">N</div>
          <span className="text-white font-bold text-xl tracking-tight">Nexo Salud</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Características</a>
          <a href="#mcp" className="hover:text-white transition-colors">MCP Server</a>
          <a href="/dashboard/metrics" className="hover:text-white transition-colors">Dashboard</a>
          <a href="/dashboard/sandbox" className="px-4 py-2 bg-[#3E3CFF] text-white rounded-full hover:bg-[#271F8F] transition-all">Probar Sandbox</a>
        </div>
      </nav>
      
      <div className="pt-16">
        <Hero />
        <section id="features">
          <Features />
        </section>
        <section id="mcp">
          <MCPSection />
        </section>
        
        <footer className="py-12 px-6 text-center border-t border-white/5 bg-[#0d0f12] text-gray-500 text-sm">
          <p>© 2026 Nexo Salud. Cumplimiento normativo IHCE Colombia.</p>
        </footer>
      </div>
    </main>
  );
}
