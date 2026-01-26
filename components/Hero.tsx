
import React from 'react';
import Button from './Button';
import { ArrowRightIcon } from './icons/Icons';

interface HeroProps {
  onSignup: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSignup }) => {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -z-10 opacity-60 animate-fade-in" />

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center z-10 relative">
        {/* Badge */}
        <div className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300">Now accepting pilot teams for 2026 Season</span>
        </div>

        {/* Headline */}
        <h1 className="opacity-0 animate-fade-in-up delay-100 text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Stop acting as a dispatcher. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300">
            Start managing.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="opacity-0 animate-fade-in-up delay-200 text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          The AI Operations Assistant for High-Performance Teams.
          Zero apps to download. 100% WhatsApp.
        </p>

        {/* Buttons */}
        <div className="opacity-0 animate-fade-in-up delay-300 flex flex-col items-center w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto group" onClick={onSignup}>
              Start Free Pilot
              <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={scrollToHowItWorks}>
              See How It Works
            </Button>
          </div>
          Includes 14-day free trial.
        </p>
      </div>

      {/* Social Proof / Trust */}
      <div className="opacity-0 animate-fade-in-up delay-500 mt-16 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-4">
        <p className="text-sm text-slate-500">Trusted by operations managers in</p>
        <div className="flex items-center gap-8 grayscale opacity-50">
          {/* Placeholder logos using text for simplicity as strictly no external images allowed unless placeholder service */}
          <span className="font-bold text-slate-400 text-lg">LEAGUE</span>
          <span className="font-bold text-slate-400 text-lg">DIVISION 1</span>
          <span className="font-bold text-slate-400 text-lg">ACADEMY</span>
        </div>
      </div>
    </div>

      {/* Grid Background Overlay */ }
  <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)] -z-20 opacity-20 animate-fade-in" />
    </section >
  );
};

export default Hero;
