import React from 'react';
import { AthplanLogo } from './icons/Icons';

interface FooterProps {
  onNavigate?: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {

  const handleNav = (view: 'privacy' | 'terms' | 'aup') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(view);
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-slate-950 py-12 px-6 border-t border-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <AthplanLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-white tracking-tight">Athplan</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The AI Operations Assistant for modern sports teams.
              Automating logistics, scheduling, and player communications.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</a></li>
              <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Legal/Contact Column */}
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={handleNav('privacy')} className="hover:text-indigo-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={handleNav('terms')} className="hover:text-indigo-400 transition-colors text-left">Terms of Service</button></li>
              <li><button onClick={handleNav('aup')} className="hover:text-indigo-400 transition-colors text-left">Acceptable Use</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm flex gap-4">
            <span>© {new Date().getFullYear()} Athplan AI. All rights reserved.</span>
          </div>

          <div className="flex gap-6">
            <a href="https://x.com/athplan" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors text-sm">X</a>
            <a href="https://www.linkedin.com/company/109755743/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors text-sm">LinkedIn</a>
            <a href="https://www.facebook.com/share/198JNouD4t/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors text-sm">Facebook</a>
            <a href="mailto:info@athplan.com" className="text-slate-500 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
