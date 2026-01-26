import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './Button'; // Assuming Button is exported as default or named. Dashboard uses default import.
// Checking Dashboard.tsx: import Button from './Button'; -> It's default.

// Define the shape of a group based on our schema
interface Group {
    id: number;
    name: string;
    join_code: string;
}

const MY_NUMBER = "18139454758"; // Configured business number

const GroupLinks: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const { data, error } = await supabase
                .from('groups')
                .select('*');

            if (error) throw error;
            setGroups(data || []);
        } catch (err: any) {
            console.error('Error loading groups:', err);
            setError('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    const generateLink = (groupName: string, secretCode: string) => {
        const message = `Join-${groupName}-${secretCode}`;
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${MY_NUMBER}?text=${encodedMessage}`;
    };

    const copyToClipboard = (link: string, id: number) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) return <div className="text-slate-400 p-4">Loading groups...</div>;
    if (error) return <div className="text-red-400 p-4">{error}</div>;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">WhatsApp Groups</h3>
                    <p className="text-sm text-slate-400 mt-1">Share these links to invite players to your roster.</p>
                </div>
                <button
                    onClick={fetchGroups}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="group-links-container">
                {groups.map((group) => {
                    const link = generateLink(group.name, group.join_code);
                    return (
                        <div key={group.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col gap-4 hover:border-indigo-500/50 transition-colors">
                            <div>
                                <h4 className="font-bold text-white text-lg">{group.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Code:</span>
                                    <code className="text-xs bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{group.join_code}</code>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={link}
                                    readOnly
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-400 focus:outline-none"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                            </div>

                            <button
                                onClick={() => copyToClipboard(link, group.id)}
                                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${copiedId === group.id
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    }`}
                            >
                                {copiedId === group.id ? 'Copied Link!' : 'Copy WhatsApp Link'}
                            </button>
                        </div>
                    );
                })}

                {groups.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-500">
                        No groups found. Please ask admin to create groups.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupLinks;
