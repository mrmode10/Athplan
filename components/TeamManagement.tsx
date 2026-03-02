import React, { useState, useEffect } from 'react';
import Button from './Button';
import { supabase } from '../lib/supabase';

interface TeamManagementProps {
    teamName: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ teamName }) => {
    const [joinLink, setJoinLink] = useState<string | null>(null);
    const [hasCopiedLink, setHasCopiedLink] = useState(false);
    const MY_NUMBER = "18139454758"; // Configured business number

    useEffect(() => {
        fetchJoinLink();
    }, [teamName]);

    const fetchJoinLink = async () => {
        if (!teamName) return;
        try {
            const { data, error } = await supabase
                .from('teams')
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

    return (
        <div className="space-y-6 animate-fade-in pb-10">
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

                                    let currentTeam = teamName;
                                    if (!currentTeam) {
                                        const { data: { user } } = await supabase.auth.getUser();
                                        currentTeam = user?.user_metadata?.team || '';
                                    }
                                    if (!currentTeam) return alert("Please set your team name first in the 'Team Name' section below.");

                                    try {
                                        const { error } = await supabase.rpc('add_team_admin', {
                                            p_phone_number: phone,
                                            p_group_name: currentTeam
                                        });

                                        if (error) throw error;
                                        alert(`Successfully added ${phone} as an admin for ${currentTeam}!`);
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

                {/* Add Team Member */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mt-6">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Add Team Member</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Add a player by phone number. They'll appear in your Team Roster and can chat with the AI bot.
                    </p>

                    <div className="flex gap-3 mb-4">
                        <input
                            type="tel"
                            placeholder="+1234567890"
                            className="flex-1 min-w-0 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            id="addMemberPhone"
                        />
                        <Button
                            onClick={async () => {
                                const input = document.getElementById('addMemberPhone') as HTMLInputElement;
                                const phone = input.value.trim();
                                if (!phone) return alert("Please enter a phone number");

                                let currentTeam = teamName;
                                if (!currentTeam) {
                                    const { data: { user } } = await supabase.auth.getUser();
                                    currentTeam = user?.user_metadata?.team || '';
                                }
                                if (!currentTeam) return alert("Please set your team name first.");

                                try {
                                    const { error } = await supabase
                                        .from('bot_users')
                                        .upsert({
                                            phone_number: phone,
                                            group_name: currentTeam,
                                            is_admin: false
                                        }, { onConflict: 'phone_number' });

                                    if (error) throw error;
                                    alert(`✅ ${phone} added to ${currentTeam}!`);
                                    input.value = '';
                                } catch (e: any) {
                                    console.error(e);
                                    alert("Failed to add member: " + e.message);
                                }
                            }}
                            className="whitespace-nowrap flex-shrink-0 px-4"
                        >
                            Add Member
                        </Button>
                    </div>

                    {joinLink && (
                        <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                            <p className="text-xs text-slate-500 mb-1.5">Or share this link so players can join themselves:</p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs text-indigo-400 truncate flex-1">{joinLink}</code>
                                <button
                                    onClick={() => {
                                        if (joinLink) {
                                            navigator.clipboard.writeText(joinLink);
                                            alert('Join link copied!');
                                        }
                                    }}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
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
                                    if (!teamName || teamName.trim() === '') {
                                        const teamSlug = newName.replace(/\s+/g, '').slice(0, 10);
                                        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                                        const joinCode = `${teamSlug}-${randomSuffix}`;
                                        const { error: insertError } = await supabase.from('teams').insert({
                                            name: newName,
                                            join_code: joinCode
                                        });
                                        if (insertError) {
                                            console.warn("Could not insert group:", insertError);
                                        }
                                    } else {
                                        const { error: rpcError } = await supabase.rpc('update_team_name', {
                                            p_old_name: teamName,
                                            p_new_name: newName
                                        });
                                        if (rpcError) throw rpcError;
                                    }

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

export default TeamManagement;
