import React from 'react';
import { Rocket, ExternalLink, Info, Sparkles, ShieldCheck } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-emerald-950/40 p-6 md:p-8 mb-8 shadow-2xl backdrop-blur-xl">
      {/* Background Decorative Glow Effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Side: Notice & Description */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider animate-pulse">
              <Info className="w-3.5 h-3.5" />
              <span>Demostración Interactiva • Interactive Demo</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Datos de Muestra Incluidos</span>
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight">
            Esta web es solo una <span className="bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">muestra / versión demo</span> de Health Monitor
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Los monitores y registros que ves abajo son <strong className="text-white">datos de prueba interactivos</strong> para explorar el panel en vivo. 
            Para monitorear tus propios cron jobs, servicios y webhooks en producción de forma 100% gratuita, despliega tu propia instancia privada con 1 solo clic.
          </p>
        </div>

        {/* Right Side: Large 1-Click Deployment Button */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <a
            href="https://deploy.workers.cloudflare.com/?url=https://github.com/mcontartesi/health-monitor"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center space-x-3 px-8 py-4 text-sm font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 rounded-2xl shadow-xl shadow-emerald-950/80 border border-emerald-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] text-center"
          >
            <Rocket className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            <div className="text-left">
              <span className="block text-[10px] text-emerald-100 uppercase tracking-widest font-extrabold">Despliegue Inmediato</span>
              <span className="block text-sm font-black tracking-wide">1-Click Deploy to Cloudflare</span>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="https://github.com/mcontartesi/health-monitor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 rounded-xl border border-slate-700/80 transition duration-150 text-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver código fuente en GitHub</span>
          </a>
        </div>

      </div>
    </div>
  );
};
