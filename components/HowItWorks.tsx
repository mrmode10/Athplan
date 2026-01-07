import React, { useEffect, useRef, useState } from 'react';
import { CalendarIcon, BotIcon, MessageCircleIcon } from './icons/Icons';

const StepCard: React.FC<{ 
    number: string; 
    title: string; 
    desc: string; 
    icon: React.ReactNode;
    delayClass: string;
    isVisible: boolean;
}> = ({ number, title, desc, icon, delayClass, isVisible }) => (
  <div 
    className={`flex flex-col items-center text-center p-6 relative transition-all duration-1000 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    } ${delayClass}`}
  >
    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 text-slate-300 relative z-10 shadow-xl">
      {icon}
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white">
        {number}
      </div>
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{desc}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 px-6 border-t border-slate-900 bg-slate-950/50">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
            <span className="text-indigo-400 font-medium text-sm tracking-wider uppercase mb-2 block">Simple Setup</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Up and running in 5 minutes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop only) */}
          <div className={`hidden md:block absolute top-14 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800 z-0 transition-opacity duration-1000 delay-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
          }`} />
          
          <StepCard 
            number="1"
            title="Send Schedule"
            desc="Email us your PDF, Excel, or Screenshot of the team itinerary. That's it."
            icon={<CalendarIcon className="w-8 h-8" />}
            delayClass="delay-100"
            isVisible={isVisible}
          />
          
          <StepCard 
            number="2"
            title="We Activate Pilot"
            desc="Our system parses the data and creates a private WhatsApp number for your team."
            icon={<BotIcon className="w-8 h-8" />}
            delayClass="delay-300"
            isVisible={isVisible}
          />
          
          <StepCard 
            number="3"
            title="Team Asks"
            desc="Share the contact card. Players ask questions, Athplan answers immediately."
            icon={<MessageCircleIcon className="w-8 h-8" />}
            delayClass="delay-500"
            isVisible={isVisible}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;