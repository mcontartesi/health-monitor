import React from 'react';
import { Linkedin, Mail, Heart, Code2, Cloud, ShieldCheck } from 'lucide-react';

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

        {/* Center: Author Attribution */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
          <span>Designed & Built with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30 animate-pulse" />
          <span>by</span>
          <span className="font-semibold text-white tracking-wide">Maximiliano Contartesi</span>
        </div>

        {/* Right: Contact & Social Links */}
        <div className="flex items-center space-x-3 text-xs">
          <a
            href="https://www.linkedin.com/in/maxiconta/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 group"
          >
            <Linkedin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium">LinkedIn</span>
          </a>

          <a
            href="mailto:maxiconta@gmail.com"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 transition-all duration-200 group"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium">maxiconta@gmail.com</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
