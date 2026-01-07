
import React, { useState } from 'react';
import Button from './Button';
import { ClockIcon, ZapIcon } from './icons/Icons';

const ROICalculator: React.FC = () => {
  const [users, setUsers] = useState<number>(15);
  const [messagesPerUser, setMessagesPerUser] = useState<number>(10);

  // Constants based on prompt
  const HOURLY_RATE = 40; // $40/hour
  const MINS_PER_MSG = 2; // 2 minutes per message

  // Calculations
  const totalMessagesPerWeek = users * messagesPerUser;
  const minutesSavedPerWeek = totalMessagesPerWeek * MINS_PER_MSG;
  const hoursSavedPerWeek = minutesSavedPerWeek / 60;
  const hoursSavedPerMonth = hoursSavedPerWeek * 4;
  const grossValueSaved = hoursSavedPerMonth * HOURLY_RATE;

  // Plan Logic
  let planName = 'Starter Pack';
  let planCost = 99;

  if (users > 8 && users <= 20) {
    planName = 'All Star';
    planCost = 199;
  } else if (users > 20 && users <= 30) {
    planName = 'Hall of Fame';
    planCost = 249;
  } else if (users > 30) {
    planName = 'Enterprise';
    planCost = 0; // Custom pricing
  }

  const netSavings = planCost > 0 ? grossValueSaved - planCost : grossValueSaved;

  return (
    <section className="py-20 px-6 w-full max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Controls */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Calculate your ROI</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              See how much time and money you save by automating logistics. 
              Based on an average manager rate of <span className="text-white font-semibold">$40/hr</span> and <span className="text-white font-semibold">2 minutes</span> per message.
            </p>

            <div className="space-y-8">
              {/* Slider 1: Users */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label htmlFor="users-range" className="font-medium text-white">Team Size</label>
                  <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 px-3 py-1 rounded-lg">
                    {users} Users
                  </span>
                </div>
                <input
                  id="users-range"
                  type="range"
                  min="2"
                  max="50"
                  value={users}
                  onChange={(e) => setUsers(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>2</span>
                  <span>50</span>
                </div>
              </div>

              {/* Slider 2: Messages */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label htmlFor="msg-range" className="font-medium text-white">Avg. Messages / User / Week</label>
                  <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 px-3 py-1 rounded-lg">
                    {messagesPerUser} msgs
                  </span>
                </div>
                <input
                  id="msg-range"
                  type="range"
                  min="5"
                  max="50"
                  value={messagesPerUser}
                  onChange={(e) => setMessagesPerUser(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>5 (Light)</span>
                  <span>50 (Heavy)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
             
             <div className="mb-6 pb-6 border-b border-slate-800">
               <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Recommended Plan</span>
               <div className="flex justify-between items-end mt-2">
                 <h3 className="text-2xl font-bold text-white">{planName}</h3>
                 <div className="text-right">
                    {planCost > 0 ? (
                        <>
                           <span className="text-3xl font-bold text-white">${planCost}</span>
                           <span className="text-slate-500 text-sm">/mo</span>
                        </>
                    ) : (
                        <span className="text-xl font-bold text-white">Contact Sales</span>
                    )}
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                 <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                   <ClockIcon className="w-4 h-4" /> Time Saved
                 </div>
                 <div className="text-2xl font-bold text-white">{hoursSavedPerMonth.toFixed(1)} <span className="text-sm font-normal text-slate-500">hrs/mo</span></div>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                 <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                   <ZapIcon className="w-4 h-4" /> Value
                 </div>
                 <div className="text-2xl font-bold text-green-400">${Math.floor(grossValueSaved).toLocaleString()} <span className="text-sm font-normal text-slate-500">/mo</span></div>
               </div>
             </div>

             <div className="bg-indigo-600 rounded-xl p-6 text-center">
               <p className="text-indigo-100 text-sm mb-1 font-medium">Net Monthly Benefit</p>
               <div className="text-4xl font-extrabold text-white">
                 ${Math.floor(netSavings).toLocaleString()}
               </div>
               <p className="text-xs text-indigo-200 mt-2 opacity-80">
                 (Value Saved - Subscription Cost)
               </p>
             </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
