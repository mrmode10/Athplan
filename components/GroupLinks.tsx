import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Team {
    id: string;
    name: string;
    join_code: string;
}

interface WhatsAppUser {
    phone_number: string;
    group_name: string;
    is_admin: boolean;
    name: string | null;
}

const MY_NUMBER = "18139454758"; // Configured business number

const GroupLinks: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<WhatsAppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch the user's team
            const { data: teamData, error: teamErr } = await supabase
                .from('teams')
                .select('id, name, join_code');

            if (teamErr) throw teamErr;
            setTeams(teamData || []);

            // Fetch all whatsapp_users (members) linked to the team
            if (teamData && teamData.length > 0) {
                const teamNames = teamData.map(t => t.name).filter(Boolean);
                if (teamNames.length > 0) {
                    const { data: memberData } = await supabase
                        .from('whatsapp_users')
                        .select('phone_number, group_name, is_admin, name')
                        .in('group_name', teamNames);
                    setMembers(memberData || []);
                }
            }
        } catch (err: any) {
            console.error('Error loading team data:', err);
            setError('Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    const generateLink = (secretCode: string) => {
        const message = `Join ${secretCode}`;
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${MY_NUMBER}?text=${encodedMessage}`;
    };

    const copyToClipboard = (link: string, id: string) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) return <div className="text-slate-400 p-4">Loading teams...</div>;
    if (error) return <div className="text-red-400 p-4">{error}</div>;

    return (
        <div className="space-y-6">
            {teams.map((team) => {
                const link = generateLink(team.join_code);
                const teamMembers = members.filter(m => m.group_name === team.name);
                const adminMembers = teamMembers.filter(m => m.is_admin);
                const regularMembers = teamMembers.filter(m => !m.is_admin);

                return (
                    <div key={team.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Team Header */}
                        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/80">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                                        {team.name?.charAt(0)?.toUpperCase() || 'T'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{team.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Code:</span>
                                            <code className="text-xs bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{team.join_code}</code>
                                            <span className="text-xs text-slate-600">•</span>
                                            <span className="text-xs text-slate-400">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchData}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* WhatsApp Invite Link */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Invite Link</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={link}
                                        readOnly
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none"
                                        onClick={(e) => e.currentTarget.select()}
                                    />
                                    <button
                                        onClick={() => copyToClipboard(link, team.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${copiedId === team.id
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            }`}
                                    >
                                        {copiedId === team.id ? '✓ Copied!' : 'Copy Link'}
                                    </button>
                                </div>
                            </div>

                            {/* Admins Section */}
                            {adminMembers.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        Admins ({adminMembers.length})
                                    </h4>
                                    <div className="space-y-1.5">
                                        {adminMembers.map((admin) => (
                                            <div key={admin.phone_number} className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    ★
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm text-white font-mono block truncate">{admin.phone_number}</span>
                                                    {admin.name && <span className="text-xs text-slate-500">{admin.name}</span>}
                                                </div>
                                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 font-semibold flex-shrink-0">
                                                    Admin
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Members Section */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    {regularMembers.length > 0 ? `Members (${regularMembers.length})` : 'Members'}
                                </h4>
                                {regularMembers.length === 0 && adminMembers.length === 0 ? (
                                    <div className="py-6 text-center bg-slate-950 rounded-lg border border-dashed border-slate-800">
                                        <p className="text-sm text-slate-500">No members yet.</p>
                                        <p className="text-xs text-slate-600 mt-1">Share the invite link above to add players.</p>
                                    </div>
                                ) : regularMembers.length === 0 ? (
                                    <p className="text-sm text-slate-500 py-2">No non-admin members yet.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {regularMembers.map((member) => (
                                            <div key={member.phone_number} className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm text-white font-mono block truncate">{member.phone_number}</span>
                                                    {member.name && <span className="text-xs text-slate-500">{member.name}</span>}
                                                </div>
                                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 font-semibold flex-shrink-0">
                                                    Player
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {teams.length === 0 && (
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl py-12 text-center">
                    <p className="text-slate-500">No teams found. Please set up your team in Settings.</p>
                </div>
            )}
        </div>
    );
};

export default GroupLinks;
