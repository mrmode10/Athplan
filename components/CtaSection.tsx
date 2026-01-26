
import React from 'react';
import Button from './Button';

const CtaSection: React.FC = () => {
  return (
    <section className="py-32 px-6 w-full flex justify-center">
      <div className="relative w-full max-w-5xl rounded-3xl bg-indigo-600 overflow-hidden px-8 py-20 md:px-20 md:py-24 text-center">
        {/* Background decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready for a calmer season?
          </h2>
          <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join the high-performance teams already saving hours every week.
            Start your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-lg border-none">
              Get Pilot Access
            </Button>
            <Button variant="outline" size="lg" className="border-indigo-400 text-white hover:bg-indigo-700 hover:border-indigo-300">
              Talk to Sales
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CtaSection;
