
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PrivacyPolicy: React.FC<{ onBack: () => void; onNavigate?: (view: any) => void }> = ({ onBack, onNavigate }) => {
    return (
        <div className="bg-slate-950 min-h-screen flex flex-col font-sans text-slate-300">
            <div className="max-w-4xl mx-auto px-6 py-12 flex-grow">
                <button
                    onClick={onBack}
                    className="mb-8 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                >
                    ← Back to Home
                </button>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-8">Privacy Policy</h1>

                <section>
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">MB ATHPLAN LEGAL SHIELD: PRIVACY & AI POLICY (Version 2026.1.1)</h2>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-6">
                        <p className="text-sm text-slate-400 italic">
                            This text is designed for your website’s "Legal" section and your onboarding flow. As of January 2026, Lithuanian law and EU GDPR regulations have integrated with the EU AI Act.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">1. DATA CONTROLLER & PROCESSOR</h2>
                    <p className="leading-relaxed">
                        The Service Provider is <strong>Mažoji bendrija "Athplan"</strong> (Reg. No: [Insert], Vilnius, Lithuania). We act as a <strong>Data Processor</strong> for your sports organization, which remains the primary <strong>Data Controller</strong>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">2. AI TRANSPARENCY (Pursuant to the EU AI Act)</h2>
                    <p className="leading-relaxed mb-4">
                        Athplan utilizes Large Language Model (LLM) technology (Google Gemini 3.0).
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Risk Classification:</strong> Our system is classified as "Minimal Risk AI" used for operational information.</li>
                        <li><strong>Transparency:</strong> Users are hereby notified that they are interacting with an artificial intelligence. All AI-generated content is marked with machine-readable metadata to ensure detectability.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">3. DATA MINIMIZATION & GDPR</h2>
                    <p className="leading-relaxed mb-2">
                        We process player phone numbers and interaction logs solely for:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>Providing real-time logistics (Schedules, locations, gear).</li>
                        <li>Tracking usage tiers (400/500/600 messages per month).</li>
                    </ul>
                    <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                        <p className="font-semibold text-indigo-300">No Training</p>
                        <p className="text-sm text-indigo-100">MB Athplan does not use your private team data to train public AI models.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">4. THE "RIGHT TO ERASURE" (Instant Purge)</h2>
                    <p className="leading-relaxed">
                        In accordance with GDPR, any player may trigger the permanent deletion of their data by texting <strong>"DELETE MY DATA"</strong>. All personal identifiers and message history will be purged within 72 hours.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">5. LIMITATION OF LIABILITY</h2>
                    <p className="leading-relaxed">
                        Athplan is an automated assistant. <strong>MB Athplan is not liable for operational errors</strong> (e.g., missed transport) resulting from incorrect data provided by the organization or AI hallucinations. Human oversight by the Team Manager is required.
                    </p>
                </section>
            </div>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default PrivacyPolicy;
