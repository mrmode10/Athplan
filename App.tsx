
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
});

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'home' | 'login' | 'signup' | 'dashboard'>('home');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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
        <div className="bg-slate-950 min-h-screen text-slate-50 font-sans selection:bg-indigo-500/30">

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
                    <Hero />
                    <div id="features"><BentoFeatures /></div>
                    <div id="how-it-works"><HowItWorks /></div>
                    <ROICalculator />
                    <div id="pricing"><Pricing onSignup={() => setCurrentView('signup')} /></div>
                    <Footer />
                </main>
            )}

            {currentView === 'login' && (
                <Login
                    onBack={() => setCurrentView('home')}
                    onSignup={() => setCurrentView('signup')}
                    onSuccess={(u) => {
                        // Auth state listener will handle user set, we just nav
                        setCurrentView('dashboard');
                    }}
                />
            )}

            {currentView === 'signup' && (
                <Signup
                    onBack={() => setCurrentView('home')}
                    onLogin={() => setCurrentView('login')}
                    onSuccess={(u) => {
                        setCurrentView('dashboard');
                    }}
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

        </div>
    );
};

export default App;
