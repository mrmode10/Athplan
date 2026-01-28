
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BentoFeatures from './components/BentoFeatures';
import HowItWorks from './components/HowItWorks';
import ROICalculator from './components/ROICalculator';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AcceptableUsePolicy from './components/AcceptableUsePolicy';
import Legal from './components/Legal';
import { supabase } from './lib/supabase';
import { User } from './lib/mockBackend'; // We will gradually replace this type or keep it compatible

// Helper to map Supabase user to our App User type
const mapSupabaseUser = (user: any): User => ({
    id: user.id,
    email: user.email || '',
    firstName: user.user_metadata?.first_name || 'User',
    lastName: user.user_metadata?.last_name || '',
    team: user.user_metadata?.team || '',
    plan: user.user_metadata?.plan || 'starter',
    setup_mode: user.user_metadata?.setup_mode,
});

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'home' | 'login' | 'signup' | 'dashboard' | 'privacy' | 'terms' | 'aup' | 'legal'>('home');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<string>('starter');

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
            } else {
                setUser(null);
                if (currentView === 'dashboard') setCurrentView('home');
            }
        });

        return () => subscription.unsubscribe();
    }, [currentView]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setCurrentView('home');
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;

    return (
        <div className={`min-h-screen font-sans selection:bg-indigo-500/30 ${currentView !== 'dashboard' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>

            {/* Navbar is global, but behavior changes based on view */}
            {currentView !== 'dashboard' && (
                <Navbar
                    onNavigate={setCurrentView}
                    user={user}
                    onLogout={handleLogout}
                    onDashboard={() => setCurrentView('dashboard')}
                />
            )}

            {/* VIEW ROUTING */}
            {currentView === 'home' && (
                <main>
                    <Hero onSignup={() => { setSelectedPlan('starter'); setCurrentView('signup'); }} />
                    <div id="features"><BentoFeatures /></div>
                    <div id="how-it-works"><HowItWorks /></div>
                    <ROICalculator />
                    <div id="pricing"><Pricing onSignup={(plan) => { setSelectedPlan(plan); setCurrentView('signup'); }} /></div>
                    <Footer onNavigate={setCurrentView} />
                </main>
            )}

            {currentView === 'login' && (
                <Login
                    onBack={() => setCurrentView('home')}
                    onSignup={() => { setSelectedPlan('starter'); setCurrentView('signup'); }}
                    onSuccess={(u) => {
                        // Allow manual override for demo
                        setUser(u);
                        setCurrentView('dashboard');
                    }}
                />
            )}

            {currentView === 'signup' && (
                <Signup
                    selectedPlan={selectedPlan}
                    onBack={() => setCurrentView('home')}
                    onLogin={() => setCurrentView('login')}
                    onSuccess={(u) => {
                        setUser(u);
                        setCurrentView('dashboard');
                    }}
                />
            )}

            {currentView === 'privacy' && (
                <PrivacyPolicy
                    onBack={() => setCurrentView('home')}
                    onNavigate={setCurrentView}
                />
            )}

            {currentView === 'terms' && (
                <TermsOfService
                    onBack={() => setCurrentView('home')}
                    onNavigate={setCurrentView}
                />
            )}

            {currentView === 'dashboard' && user && (
                <Dashboard
                    user={user}
                    onLogout={handleLogout}
                />
            )}

            {/* Fallback: if dashboard requested but no user, go login */}
            {currentView === 'dashboard' && !user && (
                <Login
                    onBack={() => setCurrentView('home')}
                    onSignup={() => setCurrentView('signup')}
                    onSuccess={() => setCurrentView('dashboard')}
                />
            )}

            {currentView === 'legal' && (
                <Legal
                    onBack={() => setCurrentView('home')}
                    onNavigate={setCurrentView}
                />
            )}

        </div>
    );
};

export default App;
