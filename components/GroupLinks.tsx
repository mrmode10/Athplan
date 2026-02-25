import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface WhatsAppUser {
    phone_number: string;
    group_name: string;
    is_admin: boolean;
    name: string | null;
}

interface GroupLinksProps {
    teamName: string;
}

const MY_NUMBER = "18139454758";

const GroupLinks: React.FC<GroupLinksProps> = ({ teamName }) => {
    const [members, setMembers] = useState<WhatsAppUser[]>([]);
    const [joinCode, setJoinCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [removingPhone, setRemovingPhone] = useState<string | null>(null);

    useEffect(() => {
        if (teamName) fetchData();
    }, [teamName]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch join code from teams table
            const { data: teamData } = await supabase
                .from('teams')
                .select('join_code')
                .eq('name', teamName)
                .single();

            if (teamData?.join_code) {
                setJoinCode(teamData.join_code);
            }

            // Fetch all whatsapp_users for this team
            const { data: memberData, error: memberErr } = await supabase
                .from('whatsapp_users')
                .select('phone_number, group_name, is_admin, name')
                .eq('group_name', teamName);

            if (memberErr) throw memberErr;
            setMembers(memberData || []);
        } catch (err: any) {
            console.error('Error loading team data:', err);
            setError('Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (phone: string) => {
        if (!confirm(`Remove ${phone} from the team?`)) return;
        setRemovingPhone(phone);
        try {
            const { error } = await supabase
                .from('whatsapp_users')
                .delete()
                .eq('phone_number', phone)
                .eq('group_name', teamName);

            if (error) throw error;
            setMembers(prev => prev.filter(m => m.phone_number !== phone));
        } catch (e: any) {
            console.error(e);
            alert('Failed to remove member: ' + e.message);
        } finally {
            setRemovingPhone(null);
        }
    };

    const joinLink = joinCode
        ? `https://wa.me/${MY_NUMBER}?text=${encodeURIComponent(`Join ${joinCode}`)}`
        : null;

    const copyToClipboard = () => {
        if (joinLink) {
            navigator.clipboard.writeText(joinLink);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    if (!teamName) {
        return (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl py-12 text-center">
                <p className="text-slate-500">No team name set. Please set up your team in Settings.</p>
            </div>
        );
    }

    if (loading) return <div className="text-slate-400 p-4">Loading team roster...</div>;
    if (error) return <div className="text-red-400 p-4">{error}</div>;

    const adminMembers = members.filter(m => m.is_admin);
    const regularMembers = members.filter(m => !m.is_admin);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Team Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/80">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                            {teamName?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{teamName}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                {joinCode && (
                                    <>
                                        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Code:</span>
                                        <code className="text-xs bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{joinCode}</code>
                                        <span className="text-xs text-slate-600">•</span>
                                    </>
                                )}
                                <span className="text-xs text-slate-400">{members.length} member{members.length !== 1 ? 's' : ''}</span>
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
                {joinLink && (
                    <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Invite Link</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={joinLink}
                                readOnly
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${copiedLink
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    }`}
                            >
                                {copiedLink ? '✓ Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Admins Section */}
                {adminMembers.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Admins ({adminMembers.length})
                        </h4>
                        <div className="space-y-1.5">
                            {adminMembers.map((admin) => (
                                <div key={admin.phone_number} className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 group">
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
                                    <button
                                        onClick={() => removeMember(admin.phone_number)}
                                        disabled={removingPhone === admin.phone_number}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity flex-shrink-0"
                                        title="Remove from team"
                                    >
                                        {removingPhone === admin.phone_number ? '...' : '✕'}
                                    </button>
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
                    {members.length === 0 ? (
                        <div className="py-6 text-center bg-slate-950 rounded-lg border border-dashed border-slate-800">
                            <p className="text-sm text-slate-500">No members yet.</p>
                            <p className="text-xs text-slate-600 mt-1">Add members via Settings or share the invite link.</p>
                        </div>
                    ) : regularMembers.length === 0 ? (
                        <p className="text-sm text-slate-500 py-2">No non-admin members yet.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {regularMembers.map((member) => (
                                <div key={member.phone_number} className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 group">
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
                                    <button
                                        onClick={() => removeMember(member.phone_number)}
                                        disabled={removingPhone === member.phone_number}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity flex-shrink-0"
                                        title="Remove from team"
                                    >
                                        {removingPhone === member.phone_number ? '...' : '✕'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupLinks;
