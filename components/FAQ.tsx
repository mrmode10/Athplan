import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/Icons';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Does every player need to download an app?",
    answer: "No. That's the best part. Athplan works entirely within WhatsApp, an app your players likely already use every day. There is zero onboarding friction for the team."
  },
  {
    question: "How does the bot know our schedule?",
    answer: "You can upload your itinerary in almost any format—PDF, Excel, CSV, or even a screenshot. Our AI parses the document and builds the schedule database instantly."
  },
  {
    question: "What happens if the bot doesn't know the answer?",
    answer: "If a player asks a question that isn't covered by your schedule or knowledge base, the bot will politely inform them it doesn't know and can optionally forward the query to a manager via email or notification."
  },
  {
    question: "Can I broadcast messages to the whole team?",
    answer: "Yes. You can use the admin dashboard to send push notifications (e.g., \"Bus leaving in 15 mins\") directly to everyone's WhatsApp individual chat at once."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, the Pilot Program includes a 14-day free trial so you can test the system with your team before committing to a subscription."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 w-full max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <p className="text-slate-400">Everything you need to know about the product.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-slate-800 rounded-2xl bg-slate-900/30 overflow-hidden transition-all duration-200 hover:border-slate-700"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className="font-medium text-white text-lg pr-8">{faq.question}</span>
              <ChevronDownIcon 
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50 mt-2">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;