
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { AthplanLogo } from './icons/Icons';
import { User } from '../lib/mockBackend';

interface NavbarProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'dashboard') => void;
  user: User | null;
  onLogout: () => void;
  onDashboard: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, user, onLogout, onDashboard }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate('home');
    
    setTimeout(() => {
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      
      if (element) {
        const navHeight = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  const goHome = () => {
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer z-50" 
          onClick={goHome}
        >
          <AthplanLogo className="w-9 h-9" />
          <span className="font-bold text-xl tracking-tight text-white">Athplan</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a 
            href="#features" 
            onClick={(e) => scrollToSection(e, '#features')}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, '#how-it-works')}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            How it Works
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => scrollToSection(e, '#pricing')}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Pricing
          </a>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
             <>
               <button 
                onClick={onDashboard}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Dashboard
              </button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onLogout}
              >
                Log Out
              </Button>
             </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('login')}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onNavigate('signup')}
              >
                Get Pilot Access
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden z-50 text-slate-300 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-8 z-40 md:hidden animate-fade-in">
             <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, '#features')}
              className="text-xl text-slate-300 hover:text-white"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => scrollToSection(e, '#how-it-works')}
              className="text-xl text-slate-300 hover:text-white"
            >
              How it Works
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, '#pricing')}
              className="text-xl text-slate-300 hover:text-white"
            >
              Pricing
            </a>
            <div className="w-16 h-px bg-slate-800 my-4"></div>
            {user ? (
              <>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onDashboard(); }}
                  className="text-xl text-indigo-400 font-medium"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="text-xl text-slate-400"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                 <button 
                  onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
                  className="text-xl text-slate-300"
                >
                  Login
                </button>
                <Button 
                  onClick={() => { setMobileMenuOpen(false); onNavigate('signup'); }}
                >
                  Get Pilot Access
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
