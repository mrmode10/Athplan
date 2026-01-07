import React, { useEffect, useRef, useState } from 'react';
import { QuoteIcon } from './icons/Icons';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  team: string;
  delayClass: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "It used to take me 2 hours every Friday to answer parents and players about the bus schedule. Now Athplan does it instantly. I have my weekends back.",
    name: "Sarah Jenkins",
    title: "Director of Ops",
    team: "North State University",
    delayClass: "delay-100"
  },
  {
    quote: "The fact that it's on WhatsApp is a game changer. Players don't download new apps. But they all use WhatsApp. Adoption was instant.",
    name: "Marcus Thorne",
    title: "Head Coach",
    team: "Westside FC",
    delayClass: "delay-200"
  },
  {
    quote: "We manage 12 different academy squads. Athplan is the only way we keep the logistics organized without losing our minds. It's like hiring a full-time assistant.",
    name: "Elena Rodriguez",
    title: "Academy Director",
    team: "Elite Pro Academy",
    delayClass: "delay-300"
  }
];

const Testimonials: React.FC = () => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 w-full max-w-7xl mx-auto">
      <div className={`text-center mb-16 transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Champions</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Join the hundreds of managers who have stopped playing telephone with their teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, index) => (
          <div 
            key={index}
            className={`relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm transition-all duration-1000 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${t.delayClass}`}
          >
            <QuoteIcon className="absolute top-8 left-8 w-10 h-10 text-indigo-500/10" />
            
            <div className="relative z-10 h-full flex flex-col">
              <p className="text-slate-300 text-lg leading-relaxed mb-8 flex-grow">
                "{t.quote}"
              </p>
              
              <div className="flex items-center gap-3 pt-6 border-t border-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.title}, <span className="text-indigo-400">{t.team}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;