import React, { useEffect, useRef, useState } from 'react';
import { MessageCircleIcon, ZapIcon, ClockIcon, SmartphoneIcon } from './icons/Icons';

const BentoFeatures: React.FC = () => {
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

  const getTransitionClass = (delayClass: string) => 
    `transition-all duration-1000 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    } ${delayClass}`;

  return (
    <section id="features" ref={sectionRef} className="py-24 px-6 w-full max-w-7xl mx-auto">
      <div className={`mb-16 text-center ${getTransitionClass('delay-0')}`}>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for the modern Manager</h2>
        <p className="text-slate-400 max-w-xl mx-auto">We handle the repetitive logistics questions so you can focus on strategy and player development.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: WhatsApp Native (Large focus) */}
        <div className={`md:col-span-2 relative group overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 ${getTransitionClass('delay-100')}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-400">
                <SmartphoneIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Zero-Friction WhatsApp Interface</h3>
              <p className="text-slate-400 text-lg">
                No new apps to download. No logins to remember. Your players already live on WhatsApp—Athplan lives there too.
              </p>
            </div>
            
            {/* Visual simulation of chat */}
            <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3 backdrop-blur-sm max-w-md">
                <div className="flex justify-end">
                    <div className="bg-green-600 text-white text-sm py-2 px-4 rounded-2xl rounded-tr-none max-w-[80%]">
                        What time is the bus to the stadium?
                    </div>
                </div>
                <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-200 text-sm py-2 px-4 rounded-2xl rounded-tl-none max-w-[80%]">
                        Bus leaves at <strong>14:30 sharp</strong> from the main lobby. Don't be late! 🚌
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Card 2: Instant Answers */}
        <div className={`relative group overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 ${getTransitionClass('delay-200')}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-8 h-full flex flex-col relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
              <ZapIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Answers</h3>
            <p className="text-slate-400 mb-6">
              Bus times, hotel addresses, dress codes, wifi passwords. Athplan answers instantly, 24/7.
            </p>
            <div className="mt-auto pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Avg response time: 0.8s</span>
                </div>
            </div>
          </div>
        </div>

        {/* Card 3: Manager Peace of Mind */}
        <div className={`relative group overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 ${getTransitionClass('delay-300')}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-8 h-full flex flex-col relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
              <ClockIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Reclaim Your Day</h3>
            <p className="text-slate-400">
              Managers waste ~30% of their day acting as information dispatchers. Save 10+ hours/week immediately.
            </p>
            <div className="mt-auto pt-6">
               <div className="text-3xl font-bold text-white">30%</div>
               <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Time Saved</div>
            </div>
          </div>
        </div>

         {/* Card 4: Context Aware (Wide bottom) */}
         <div className={`md:col-span-2 relative group overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 ${getTransitionClass('delay-500')}`}>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
             <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                 <div>
                     <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                        <MessageCircleIcon className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">It knows the schedule better than you</h3>
                     <p className="text-slate-400 max-w-md">
                         Upload your PDF or Excel itinerary. Athplan ingests it, understands it, and serves it. Changes? Just text the bot to update everyone.
                     </p>
                 </div>
                 <div className="shrink-0 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-400">
                    Uploading "Week_4_Itinerary.pdf"... <span className="text-green-400">Done</span>
                 </div>
             </div>
         </div>

      </div>
    </section>
  );
};

export default BentoFeatures;