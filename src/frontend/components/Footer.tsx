import React from 'react';
import { Heart, Cloud, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a11] py-6 px-6 text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Stack */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloudflare Native</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">MIT License</span>
        </div>

        {/* Center/Right: Author Attribution with GitHub link */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
          <span>Designed & Built with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30 animate-pulse" />
          <span>by</span>
          <a
            href="https://github.com/mcontartesi"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 font-semibold text-white hover:text-emerald-400 underline decoration-slate-700 hover:decoration-emerald-400 transition-colors"
          >
            <span>Maximiliano Contartesi</span>
            <Github className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

      </div>
    </footer>
  );
};
