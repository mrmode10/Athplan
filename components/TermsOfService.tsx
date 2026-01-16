
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const TermsOfService: React.FC<{ onBack: () => void; onNavigate?: (view: any) => void }> = ({ onBack, onNavigate }) => {
    return (
        <div className="bg-slate-950 min-h-screen flex flex-col font-sans text-slate-300">
            <div className="max-w-4xl mx-auto px-6 py-12 flex-grow">
                <button
                    onClick={onBack}
                    className="mb-8 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                >
                    ← Back to Home
                </button>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-8">Terms of Service</h1>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed">
                            By accessing or using the Athplan website and services ("Service"), you agree to be bound by these Terms of Service ("Terms").
                            If you disagree with any part of the terms, then you may not access the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">2. Description of Service</h2>
                        <p className="leading-relaxed">
                            Athplan provides an AI-powered Operations Assistant designed for sports teams and organizations to streamline logistics and scheduling.
                            We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">3. User Accounts & Responsibilities</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                            <li>You agree to provide accurate, current, and complete information during the registration process.</li>
                            <li>You are solely responsible for all activities that occur under your account.</li>
                            <li>You may not use the Service for any illegal or unauthorized purpose.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">4. Acceptable Use Policy</h2>
                        <p className="leading-relaxed mb-2">
                            You agree not to misuse the Service. Prohibited actions include:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Sending unsolicited messages, promotions, or spam.</li>
                            <li>Uploading or transmitting viruses, malware, or harmful code.</li>
                            <li>Harassing, abusing, or harming another person.</li>
                            <li>Violating any applicable laws or regulations, including Meta's Commerce Policies.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">5. Payment and Subscription</h2>
                        <p className="leading-relaxed">
                            Some parts of the Service are billed on a subscription basis. You agree to pay all fees associated with your chosen plan.
                            Payments are non-refundable except as required by law. We reserve the right to change our pricing at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">6. Limitation of Liability</h2>
                        <p className="leading-relaxed">
                            Athplan is an automated assistant. <strong>MB Athplan is not liable for operational errors</strong> (e.g., missed transport) resulting from incorrect data provided by the organization or AI hallucinations. Human oversight by the Team Manager is required.
                            In no event shall Athplan be liable for any indirect, incidental, special, consequential, or punitive damages.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">7. Termination</h2>
                        <p className="leading-relaxed">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-100 mb-4">8. Governing Law</h2>
                        <p className="leading-relaxed">
                            These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                        </p>
                    </section>
                </div>
            </div>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default TermsOfService;
