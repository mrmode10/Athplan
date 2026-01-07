
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { XIcon, MailIcon } from './icons/Icons';

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStatus('success');
      // Simulate success and close after delay
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail('');
      }, 2000);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <MailIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
            <p className="text-slate-400">Thanks for subscribing to our newsletter.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                <MailIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Join the Inner Circle</h3>
                <p className="text-sm text-slate-400">Get pro tips on team management.</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6 leading-relaxed">
              Join 2,000+ coaches and GMs receiving weekly strategies to optimize team operations.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="sr-only">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  required
                />
              </div>
              <Button type="submit" className="w-full justify-center">
                Subscribe to Newsletter
              </Button>
              <p className="text-xs text-center text-slate-500">
                No spam. Unsubscribe at any time.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterPopup;
