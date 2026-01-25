
import React from 'react';
import Footer from './Footer';

interface LegalProps {
    onBack: () => void;
    onNavigate: (view: any) => void;
}

const Legal: React.FC<LegalProps> = ({ onBack, onNavigate }) => {
    return (
        <div className="bg-slate-950 min-h-screen flex flex-col font-sans text-slate-300">
            <div className="max-w-4xl mx-auto px-6 py-12 flex-grow">
                <button
                    onClick={onBack}
                    className="mb-8 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                >
                    ← Back to Home
                </button>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-12">Legal Information</h1>

                {/* 1. Privacy Policy */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">1. Privacy Policy</h2>

                    <div className="space-y-6">
                        <div>
                            <p className="font-semibold text-white">Effective Date: {new Date().toLocaleDateString()}</p>
                            <p className="font-semibold text-white">Application Name: Antigravity (by Athplan)</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">1. Introduction</h3>
                            <p>Welcome to Antigravity ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our WhatsApp-based AI scheduling assistant.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">2. Information We Collect</h3>
                            <p className="mb-2">To provide our services, we collect the following types of data:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong className="text-indigo-200">Phone Numbers:</strong> collected automatically when you message our WhatsApp bot.</li>
                                <li><strong className="text-indigo-200">Conversation Data:</strong> the text of your messages to process your requests (e.g., schedule inquiries).</li>
                                <li><strong className="text-indigo-200">Usage Data:</strong> logs of interaction times and response status to improve system performance.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">3. How We Use Your Information</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>To provide the scheduling and information retrieval service.</li>
                                <li>To verify your identity via your WhatsApp phone number.</li>
                                <li>To maintain and improve the performance of our AI bot.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">4. Data Sharing and Third Parties</h3>
                            <p className="mb-2">We do not sell your personal data. However, our service relies on the following third-party providers to function:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong className="text-indigo-200">WhatsApp (Meta):</strong> To deliver messages.</li>
                                <li><strong className="text-indigo-200">Twilio:</strong> To facilitate the messaging infrastructure.</li>
                                <li><strong className="text-indigo-200">Voiceflow:</strong> To process AI logic and responses.</li>
                                <li><strong className="text-indigo-200">Supabase:</strong> To securely store database records.</li>
                                <li><strong className="text-indigo-200">Hostinger:</strong> To host our API connectivity.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">5. Data Retention</h3>
                            <p>We retain conversation logs and schedule data only as long as necessary to provide the service or as required by law.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">6. Contact Us</h3>
                            <p>For privacy concerns, please contact us at: info@athplan.com</p>
                        </div>
                    </div>
                </section>

                {/* 2. Terms and Conditions */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">2. Terms and Conditions</h2>

                    <div className="space-y-6">
                        <div>
                            <p className="font-semibold text-white">Last Updated: {new Date().toLocaleDateString()}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">1. Acceptance of Terms</h3>
                            <p>By accessing or using Antigravity via WhatsApp or our website, you agree to be bound by these Terms and Conditions.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">2. Description of Service</h3>
                            <p>Antigravity is an AI-powered assistant designed to retrieve schedule information and provide concise answers. The service is provided "as is" and is subject to availability.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">3. User Conduct</h3>
                            <p className="mb-2">You agree to use the service only for lawful purposes. You must not:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Send spam, abusive, or harmful messages to the bot.</li>
                                <li>Attempt to reverse-engineer or disrupt the API.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">4. Service Limitations</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong className="text-indigo-200">Accuracy:</strong> While we strive for accuracy, Antigravity is an AI system and may occasionally provide incorrect information. Always verify critical schedule details manually.</li>
                                <li><strong className="text-indigo-200">Response Style:</strong> The bot is programmed to be "blunt" and concise (under 25 words). This is a feature of the service, not a defect.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">5. Limitation of Liability</h3>
                            <p>Athplan/Antigravity shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service, including missed appointments or scheduling errors.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">6. Modifications</h3>
                            <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>
                        </div>
                    </div>
                </section>

                {/* 3. WhatsApp Disclaimer */}
                <section className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-4">3. WhatsApp Disclaimer</h2>
                    <p className="text-slate-400 italic">
                        This service is powered by Artificial Intelligence. Responses are generated automatically and may occasionally be inaccurate. Please verify important dates and times independently.
                    </p>
                </section>

            </div>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default Legal;
