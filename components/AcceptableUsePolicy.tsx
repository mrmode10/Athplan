import React from 'react';
import { ArrowLeftIcon } from './icons/Icons';

interface AcceptableUsePolicyProps {
    onBack: () => void;
    onNavigate: (view: any) => void;
}

const AcceptableUsePolicy: React.FC<AcceptableUsePolicyProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Home
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Acceptable Use Policy (AUP)</h1>
                    <p className="text-slate-400 mb-8">Effective Date: January 13, 2026</p>

                    <div className="space-y-8 text-slate-300 leading-relaxed">

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. PROHIBITED ACTIVITIES</h2>
                            <p className="mb-4">
                                In accordance with the WhatsApp Business Messaging Policy, MB Athplan users (Managers and Players) may not use the Service for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Emergency Communications:</strong> Attempting to reach emergency services (police, fire, medical).</li>
                                <li><strong className="text-white">Unauthorized Marketing:</strong> Sending unsolicited bulk messages or "spam" to players.</li>
                                <li><strong className="text-white">Sensitive Data:</strong> Sharing health records, credit card numbers, or passwords.</li>
                                <li><strong className="text-white">Harassment:</strong> Using the AI to generate threatening, offensive, or predatory content.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. USER OPT-IN & OPT-OUT</h2>
                            <div className="space-y-4">
                                <div>
                                    <strong className="text-white block mb-1">Opt-In:</strong>
                                    No player shall receive automated messages without an explicit "YES" or "START" confirmation.
                                </div>
                                <div>
                                    <strong className="text-white block mb-1">Opt-Out:</strong>
                                    MB Athplan strictly honors "STOP" and "UNSUBSCRIBE" requests. Upon receipt of such a command, the system will immediately terminate communication with that user.
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. SERVICE LIMITATIONS</h2>
                            <p>
                                Athplan is a "Minimal Risk" AI tool. It is designed for logistical efficiency only. It is not intended for financial, legal, or medical advice. Users use the Service at their own risk regarding information accuracy.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptableUsePolicy;
