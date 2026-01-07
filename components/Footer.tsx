
import React, { useState } from 'react';
import Button from './Button';
import { AthplanLogo } from './icons/Icons';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !isLoading) {
      setIsLoading(true);
      
      // Simulate Backend API Call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock backend logging
      console.log(`[Newsletter API] Successfully subscribed: ${email}`);
      
      setStatus('success');
      setEmail('');
      setIsLoading(false);
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 items-start">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AthplanLogo className="w-7 h-7" />
              <span className="font-bold text-lg text-slate-200">Athplan</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
              The AI Operations Assistant for High-Performance Teams. 
              Stop acting as a dispatcher. Start managing.
            </p>
          </div>

          {/* Newsletter Column */}
          <div className="w-full md:max-w-md md:ml-auto">
            <h3 className="font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-sm text-slate-400 mb-4">
              Get the latest updates on new features and season openings.
            </p>
            
            {status === 'success' ? (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Thanks for subscribing! We'll keep you in the loop.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                  required
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="whitespace-nowrap min-w-[100px]"
                  disabled={isLoading}
                >
                  {isLoading ? ' joining...' : 'Subscribe'}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Athplan AI. All rights reserved.
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">LinkedIn</a>
            <a href="mailto:hello@athplan.com" className="text-slate-500 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
