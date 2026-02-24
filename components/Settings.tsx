
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { supabase } from '../lib/supabase';
import PaymentModal from './PaymentModal';
import CancellationSurvey from './CancellationSurvey';
import { PLAN_CONFIG } from '../supabase/functions/_shared/plans';
import { ShareIcon, CheckIcon } from './icons/Icons';
import { ShareIcon, CheckIcon } from './icons/Icons';

type Plan = 'Starter' | 'All Star' | 'Hall of Fame';

interface SubscriptionDetails {
    plan: Plan;
    status: string;
    current_period_end?: number;
    payment_method?: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
    } | null;
}

interface SettingsProps {
    teamName: string;
}

const Settings: React.FC<SettingsProps> = ({ teamName }) => {
    // Subscription state
    const [loading, setLoading] = useState(true);
    const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentModalMode, setPaymentModalMode] = useState<'payment' | 'setup'>('payment');
    const [showCancelSurvey, setShowCancelSurvey] = useState(false);

    // Group Link state
    const [joinLink, setJoinLink] = useState<string | null>(null);
    const [hasCopiedLink, setHasCopiedLink] = useState(false);
    const MY_NUMBER = "18139454758"; // Configured business number

    // Load subscription on mount
    useEffect(() => {
        fetchSubscription();
    }, []);

    useEffect(() => {
        fetchJoinLink();
    }, [teamName]);

    const fetchJoinLink = async () => {
        if (!teamName) return;
        try {
            const { data, error } = await supabase
                .from('groups')
                .select('join_code')
                .eq('name', teamName)
                .single();

            if (error) {
                console.error("Error fetching join code:", error);
                return;
            }
            if (data?.join_code) {
                const message = `Join ${data.join_code}`;
                const encodedMessage = encodeURIComponent(message);
                setJoinLink(`https://wa.me/${MY_NUMBER}?text=${encodedMessage}`);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchSubscription = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('manage-subscription', {
                method: 'GET'
            });
            if (error) {
                console.error('Error fetching subscription:', error);
                // Fallback mock for demo if function not deployed/fails
                // setSubDetails({ plan: 'Starter', status: 'mock-active' }); 
            }
            if (data) setSubDetails(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };



    const handleUpdatePaymentMethod = async () => {
        // Use Hostinger Customer Portal
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const email = user?.email;

            const res = await fetch("https://api.athplan.com/portal-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    returnUrl: window.location.href
                })
            });
            const json = await res.json();
            if (json.url) window.location.href = json.url;
            else alert("Could not create portal session.");
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    const handleChangePlan = async (newPlan: Plan) => {
        if (!confirm(`Are you sure you want to change your plan to ${newPlan}?`)) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const email = user?.email;
            const phone = user?.phone || user?.user_metadata?.phone_number;

            const res = await fetch("https://api.athplan.com/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    phoneNumber: phone,
                    plan: newPlan
                })
            });

            const json = await res.json();
            if (json.url) {
                window.location.href = json.url;
            } else {
                throw new Error(json.error || 'No checkout URL returned');
            }
        } catch (e: any) {
            alert(`Failed to upgrade: ${e.message}`);
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Subscription Section */}
            {/* Note: Subscription UI usually looks good with dark usage even in light mode for contrast, but let's adapt it somewhat */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Subscription & Billing</h3>

                {loading ? (
                    <div className="text-slate-500 dark:text-slate-400">Loading subscription details...</div>
                ) : (
                    <>
                        <div className="bg-gradient-to-r from-indigo-900/90 to-slate-800 dark:from-indigo-900/50 dark:to-slate-800 border border-indigo-500/30 rounded-xl p-6 mb-8 text-white shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="text-indigo-300 font-bold text-sm uppercase tracking-wider mb-1">Current Plan</div>
                                    <h2 className="text-3xl font-extrabold text-white">{subDetails?.plan || 'Starter'}</h2>
                                    <p className="text-slate-300 mt-2 text-sm">
                                        Status: <span className={`capitalize font-bold ${subDetails?.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{subDetails?.status || 'Active'}</span>
                                        {subDetails?.current_period_end && ` • Renews: ${formatDate(subDetails.current_period_end)}`}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-right mb-2">
                                        <p className="text-sm text-slate-300">Payment Method</p>
                                        {subDetails?.payment_method ? (
                                            <div className="flex items-center gap-2 text-white font-mono">
                                                <span className="capitalize">{subDetails.payment_method.brand}</span>
                                                <span>•••• {subDetails.payment_method.last4}</span>
                                                <span className="text-xs text-slate-300 ml-1">
                                                    (Expires {subDetails.payment_method.exp_month}/{subDetails.payment_method.exp_year})
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-white text-sm">Manage in Portal</p>
                                        )}
                                    </div>
                                    <Button onClick={handleUpdatePaymentMethod} variant="secondary" className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 border-white/20 text-white">
                                        Update Card
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Options */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {(Object.keys(PLAN_CONFIG) as Plan[]).map((planName) => {
                                const isCurrent = subDetails?.plan === planName;
                                return (
                                    <div key={planName} className={`p-4 rounded-xl border transition-colors duration-300 ${isCurrent ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{planName}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">€{(PLAN_CONFIG[planName].amount / 100).toFixed(0)}/mo</p>

                                        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 mb-6">
                                            {(PLAN_CONFIG[planName] as any).features?.map((feature: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-indigo-500 mt-0.5">•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {isCurrent ? (
                                            <button disabled className="w-full py-2 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-bold cursor-default">Current Plan</button>
                                        ) : (
                                            <Button
                                                onClick={() => handleChangePlan(planName)}
                                                variant="primary"
                                                className="w-full text-sm"
                                            >
                                                {PLAN_CONFIG[planName].amount > (subDetails?.plan ? PLAN_CONFIG[subDetails.plan]?.amount || 0 : 0) ? 'Upgrade' : 'Switch'}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Cancel Survey Modal */}
            <CancellationSurvey
                isOpen={showCancelSurvey}
                onClose={() => setShowCancelSurvey(false)}
                onSuccess={() => {
                    setShowCancelSurvey(false);
                    fetchSubscription(); // Refresh status
                    alert("Subscription cancelled successfully.");
                }}
            />

            {subDetails?.status === 'active' && (
                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center">
                    <button
                        onClick={() => setShowCancelSurvey(true)}
                        className="text-sm text-slate-500 hover:text-red-400 transition-colors"
                    >
                        Cancel Subscription
                    </button>
                </div>
            )}
            {/* Team Management Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Team Management</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Admin */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Manage Admins</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10">
                            Add other team members as admins. They will be able to manage the team and settings.
                        </p>

                        <div className="flex gap-3">
                            <input
                                type="tel"
                                placeholder="+1234567890"
                                className="flex-1 min-w-0 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                id="newAdminPhone"
                            />
                            <Button
                                onClick={async () => {
                                    const input = document.getElementById('newAdminPhone') as HTMLInputElement;
                                    const phone = input.value.trim();
                                    if (!phone) return alert("Please enter a phone number");
                                    if (!teamName) return alert("Team name is missing. Please contact support.");

                                    try {
                                        const { error } = await supabase.rpc('add_team_admin', {
                                            p_phone_number: phone,
                                            p_group_name: teamName
                                        });

                                        if (error) throw error;
                                        alert(`Successfully added ${phone} as an admin!`);
                                        input.value = '';
                                    } catch (e: any) {
                                        console.error(e);
                                        alert("Failed to add admin: " + e.message);
                                    }
                                }}
                                className="whitespace-nowrap flex-shrink-0 px-4"
                            >
                                Add Admin
                            </Button>
                        </div>
                    </div>

                    {/* Group Join Link */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">WhatsApp Join Link</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10">
                            Share this link with your players so they can chat with the Athplan AI.
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={joinLink || 'Loading link...'}
                                className="flex-1 min-w-0 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-500 dark:text-slate-400 focus:outline-none text-sm select-all"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <Button
                                disabled={!joinLink}
                                onClick={() => {
                                    if (joinLink) {
                                        navigator.clipboard.writeText(joinLink);
                                        setHasCopiedLink(true);
                                        setTimeout(() => setHasCopiedLink(false), 3000);
                                    }
                                }}
                                variant="secondary"
                                className={`whitespace-nowrap flex-shrink-0 transition-colors ${hasCopiedLink ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' : ''}`}
                            >
                                {hasCopiedLink ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Update Team Name */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mt-6">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Team Name</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10">
                        Update your team's display name.
                    </p>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            defaultValue={teamName}
                            className="flex-1 min-w-0 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            id="updateTeamNameInput"
                        />
                        <Button
                            onClick={async () => {
                                const input = document.getElementById('updateTeamNameInput') as HTMLInputElement;
                                const newName = input.value.trim();
                                if (!newName) return alert("Please enter a team name");
                                if (newName === teamName) return alert("Please enter a new team name");

                                try {
                                    // Call the RPC to update team name across all tables
                                    const { error: rpcError } = await supabase.rpc('update_team_name', {
                                        p_old_name: teamName,
                                        p_new_name: newName
                                    });
                                    if (rpcError) throw rpcError;

                                    // Update user metadata so the UI globally refreshes
                                    const { error: authError } = await supabase.auth.updateUser({
                                        data: { team: newName }
                                    });
                                    if (authError) throw authError;

                                    alert(`Successfully updated team name to ${newName}!`);
                                } catch (e: any) {
                                    console.error(e);
                                    alert("Failed to update team name. " + e.message);
                                }
                            }}
                            className="whitespace-nowrap flex-shrink-0 px-4"
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
