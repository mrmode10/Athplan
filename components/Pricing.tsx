
import React from 'react';
import Button from './Button';
import { CheckIcon, ShieldIcon, ZapIcon } from './icons/Icons';

interface PricingProps {
  onSignup: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onSignup }) => {
  const tiers = [
    {
      name: 'Starter Pack',
      price: '$99',
      period: '/month',
      description: 'Perfect for small coaching staffs and leadership groups.',
      features: [
        'Up to 8 Users',
        'WhatsApp Native Interface',
        'Instant Schedule Answers',
        'Standard Email Support',
        'Basic Itinerary Parsing'
      ],
      highlight: false,
    },
    {
      name: 'All Star',
      price: '$199',
      period: '/month',
      description: 'The standard for competitive high school and college teams.',
      features: [
        'Up to 20 Users',
        'Everything in Starter',
        'Priority Support',
        'Travel Logistics Module',
        'Multi-admin access'
      ],
      highlight: false,
    },
    {
      name: 'Hall of Fame',
      price: '$249',
      period: '/month',
      description: 'Maximum power for large squads requiring constant uptime.',
      features: [
        'Up to 30 Users',
        'Everything in All Star',
        '24/7 AI Troubleshoot Support',
        'Advanced Analytics Dashboard',
        'Custom Hotel & Bus Integrations'
      ],
      highlight: true, // Highlight this tier
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 w-full max-w-7xl mx-auto relative">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Choose the plan that fits your team size. No hidden fees. Pause anytime in the off-season.
        </p>
      </div>

      <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-full py-2 px-6 mb-16 max-w-max mx-auto flex items-center gap-2 animate-fade-in">
        <span className="text-lg">🎁</span>
        <p className="text-indigo-200 text-sm font-medium">
          All plans include a <span className="text-white font-bold">14-day free trial</span>. No credit card required to start.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-8 flex flex-col border transition-all duration-300 ${tier.highlight
              ? 'bg-slate-900/80 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.15)] transform md:-translate-y-4'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
          >
            {tier.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-slate-500">{tier.period}</span>
              </div>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">{tier.description}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckIcon className={`w-5 h-5 shrink-0 ${tier.highlight ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={tier.highlight ? 'primary' : 'outline'}
              className="w-full"
              onClick={() => onSignup(tier.name)}
            >
              Start 14-Day Free Trial
            </Button>
          </div>
        ))}
      </div>

      {/* Enterprise Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <ShieldIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-2xl font-bold text-white">Enterprise & Academies</h3>
          </div>
          <p className="text-slate-400 max-w-xl">
            Need to manage multiple teams, an entire academy, or more than 30 users?
            Get custom reporting, SLA guarantees, and dedicated account management.
          </p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="shrink-0"
          onClick={() => window.location.href = 'mailto:info@athplan.com'}
        >
          Contact Sales
        </Button>
      </div>
    </section>
  );
};

export default Pricing;
