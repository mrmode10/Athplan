
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { AthplanLogo, BotIcon, MessageCircleIcon, SmartphoneIcon, ZapIcon, CheckIcon, XIcon, ArrowRightIcon } from './icons/Icons';
import { User } from '../lib/mockBackend';
import GroupLinks from './GroupLinks';
import Settings from './Settings';
import KnowledgeUploader from './KnowledgeUploader';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onHome: () => void;
}

type Tab = 'overview' | 'inbox' | 'team' | 'settings';
type SetupMode = 'undecided' | 'demo' | 'blank';

interface ActivityLog {
  id: number;
  time: string;
  user: string;
  query: string;
  status: string;
}

// Initial Demo Data
const DEMO_LOGS: ActivityLog[] = [
  { id: 1, time: '2m ago', user: 'Mike J.', query: 'Bus departure time?', status: 'Answered' },
  { id: 2, time: '15m ago', user: 'Sarah T.', query: 'What is the dress code for dinner?', status: 'Answered' },
  { id: 3, time: '1h ago', user: 'Tom B.', query: 'Gym location', status: 'Answered' },
  { id: 4, time: '2h ago', user: 'System', query: 'Syncing Flight AA123...', status: 'Processed' },
];

const InfoTip: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3 mb-4 flex gap-3 items-start animate-fade-in">
    <div className="bg-indigo-500/20 p-1 rounded-full shrink-0 mt-0.5">
      <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <h4 className="text-indigo-200 font-semibold text-sm mb-1">{title}</h4>
      <p className="text-indigo-100/70 text-xs leading-relaxed">{children}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onHome }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [setupMode, setSetupMode] = useState<SetupMode>('undecided');

  // State
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState({ queries: 0, activePlayers: 0, timeSaved: 0 });

  // Admin & Files State
  const [adminNumbers, setAdminNumbers] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; created_at: string }[]>([]);

  useEffect(() => {
    const fetchAdminAndFiles = async () => {
      if (!user?.team) return;
      try {
        // Fetch admin phone numbers for this team
        const { data: admins } = await supabase
          .from('whatsapp_users')
          .select('phone_number')
          .eq('group_name', user.team)
          .eq('is_admin', true);
        if (admins) setAdminNumbers(admins.map(a => a.phone_number));
      } catch (e) { console.error(e); }

      try {
        // Fetch uploaded files from Supabase Storage
        const { data: files } = await supabase.storage
          .from('group_knowledge')
          .list(user.team, { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });
        if (files) {
          setUploadedFiles(files.map(f => ({
            name: f.name,
            created_at: f.created_at || ''
          })));
        }
      } catch (e) { console.error(e); }
    };
    fetchAdminAndFiles();
  }, [user?.team]);

  // WhatsApp Link State
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const MY_NUMBER = "18139454758"; // Configured business number

  useEffect(() => {
    const fetchJoinLink = async () => {
      if (!user?.team) return;
      try {
        const { data, error } = await supabase.from('teams').select('join_code').eq('name', user.team).single();
        if (data?.join_code) {
          const encodedMessage = encodeURIComponent(`Join ${data.join_code}`);
          setJoinLink(`https://wa.me/${MY_NUMBER}?text=${encodedMessage}`);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchJoinLink();
  }, [user?.team]);

  // File Upload State removed because KnowledgeUploader handles it now

  // Persistence Check
  useEffect(() => {
    // Check if user has a saved preference in metadata
    // We access raw metadata from the user object if available, or just trust the state passed down
    // Since 'user' prop maps from Supabase session, we might need to check the session again or rely on the prop if it includes metadata
    if ((user as any).setup_mode) {
      setSetupMode((user as any).setup_mode);
    }
  }, [user]);

  const handleSetSetupMode = async (mode: SetupMode) => {
    setSetupMode(mode);
    // Persist to Supabase
    await supabase.auth.updateUser({
      data: { setup_mode: mode }
    });
  };

  // Broadcast Message State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Initialize Data based on mode
  useEffect(() => {
    if (setupMode === 'demo') {
      setActivityLog(DEMO_LOGS);
      setStats({ queries: 24, activePlayers: 18, timeSaved: 1.5 });
    } else if (setupMode === 'blank') {
      // Mock stats for blank
      setStats({ queries: 0, activePlayers: 0, timeSaved: 0 });
      // Fetch real logs
      fetchActivityLogs();
    }
  }, [setupMode]);

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        // Map DB columns to UI shape if needed or ensure they match
        setActivityLog(data.map(log => ({
          id: log.id,
          time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: log.user_name || 'User',
          query: log.query,
          status: log.status
        })));
      }
    } catch (e) {
      console.error('Failed to fetch logs', e);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BotIcon },
    { id: 'inbox', label: 'Inbox', icon: MessageCircleIcon },
    { id: 'team', label: 'Team Roster', icon: SmartphoneIcon },
    { id: 'settings', label: 'Settings', icon: ZapIcon },
  ];

  // --- Handlers ---



  const handleBroadcastSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSendingBroadcast(true);

    setTimeout(() => {
      const newLog: ActivityLog = {
        id: Date.now(),
        time: 'Just now',
        user: 'Admin',
        query: `Broadcast sent to ${stats.activePlayers || '0'} players: "${broadcastMessage.substring(0, 20)}..."`,
        status: 'Sent'
      };
      setActivityLog(prev => [newLog, ...prev]);

      setIsSendingBroadcast(false);
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden transition-colors duration-300">

      {/* --- ONBOARDING MODAL --- */}
      {setupMode === 'undecided' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to your Trial! 🚀</h2>
              <p className="text-slate-400">How would you like to start exploring Athplan?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Demo */}
              <button
                onClick={() => handleSetSetupMode('demo')}
                className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all text-left"
              >
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <ZapIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Explore Demo Mode</h3>
                <p className="text-sm text-slate-400">
                  Pre-populated with example players and schedules. Best for understanding how the features work together.
                </p>
              </button>

              {/* Option 2: Blank */}
              <button
                onClick={() => handleSetSetupMode('blank')}
                className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-green-500 hover:bg-slate-800 transition-all text-left"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                  <BotIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Start From Scratch</h3>
                <p className="text-sm text-slate-400">
                  Empty dashboard. Ready for you to upload your real schedule and invite your actual team members.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal Overlay */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl transform scale-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Broadcast Message</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSend}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message to {stats.activePlayers > 0 ? stats.activePlayers : '0'} Active Players
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Bus is leaving in 15 minutes. Please meet in the lobby."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSendingBroadcast}>
                  {isSendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Suspension Modal */}
      {user.subscription_status && !['active', 'trialing'].includes(user.subscription_status) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl animate-fade-in-up text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <ZapIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Suspended</h2>
            <p className="text-slate-400 mb-6">
              Your trial has expired or payment information is missing. Please update your billing details to restore full access.
            </p>
            <Button onClick={() => setActiveTab('settings')} className="w-full">
              Update Payment Method
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={onHome}>
          <AthplanLogo className="w-8 h-8" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">Athplan</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {setupMode === 'demo' && (
          <div className="px-4 pb-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 mb-2">You are viewing Demo Data.</p>
              <button
                onClick={() => setSetupMode('blank')}
                className="w-full py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
              >
                Start Real Setup
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">@{user.username || user.firstName}</div>
              <div className="text-xs text-slate-500 truncate">{user.team}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 py-6 px-8 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeTab}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30">14 Days Left in Trial</span>
              {activeTab === 'overview' && joinLink && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(joinLink);
                    alert("WhatsApp Join Link Copied!");
                  }}
                  className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold border border-green-500/30 hover:bg-green-500/30 transition-colors flex items-center gap-1 shadow-sm"
                >
                  Copy WhatsApp Link
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Push Notification Button */}
            <button className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-full hover:bg-indigo-500/20 transition-colors" onClick={() => alert("Push Notification: All players would receive a notification now.")}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Push Notification
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-green-500">System Operational</span>
            </div>

            {/* Header Sign Out Button (Visible on mobile/all) */}
            <button
              onClick={onLogout}
              className="md:hidden text-slate-400 hover:text-white text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl transition-colors duration-300">
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Queries Today</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.queries}</div>
                  {setupMode === 'demo' && <div className="mt-2 text-xs text-green-500 dark:text-green-400">↑ 12% vs yesterday</div>}
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl transition-colors duration-300">
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Active Players</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activePlayers}</div>
                  {setupMode === 'demo' && <div className="mt-2 text-xs text-slate-500">Out of 23 rostered</div>}
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl transition-colors duration-300">
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Time Saved</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.timeSaved.toFixed(1)} hrs</div>
                  {setupMode === 'demo' && <div className="mt-2 text-xs text-indigo-500 dark:text-indigo-400">This week so far</div>}
                </div>
              </div>

              {/* Team Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Numbers */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl transition-colors duration-300">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <SmartphoneIcon className="w-5 h-5 text-indigo-400" /> Team Admins
                  </h3>
                  {adminNumbers.length === 0 ? (
                    <p className="text-sm text-slate-500">No admins registered yet. Add one in Settings.</p>
                  ) : (
                    <div className="space-y-2">
                      {adminNumbers.map((num, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">A{i + 1}</div>
                          <span className="text-sm text-slate-900 dark:text-white font-mono">{num}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Uploaded Files */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl transition-colors duration-300">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <ZapIcon className="w-5 h-5 text-indigo-400" /> Knowledge Base Files
                  </h3>
                  {uploadedFiles.length === 0 ? (
                    <p className="text-sm text-slate-500">No files uploaded yet. Upload your playbook or schedule above.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uploadedFiles.map((file, i) => {
                        const displayName = file.name.replace(/^\d+_/, '');
                        return (
                          <div key={i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-indigo-400 text-lg">📄</span>
                              <span className="text-sm text-slate-900 dark:text-white truncate" title={displayName}>{displayName}</span>
                            </div>
                            {file.created_at && <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(file.created_at).toLocaleDateString()}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Upload Action */}
                <KnowledgeUploader teamName={user.team} />

                {/* Broadcast Action */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col transition-colors duration-300">
                  {setupMode === 'demo' && (
                    <InfoTip title="Mass Alerts">
                      Send a message to everyone's WhatsApp at once. Great for last-minute changes.
                    </InfoTip>
                  )}
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Broadcast Message</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Send a push notification to all {stats.activePlayers > 0 ? stats.activePlayers : 'rostered'} active players on WhatsApp.</p>
                  <div className="mt-auto">
                    <Button variant="secondary" size="sm" className="w-full justify-between group" onClick={() => setShowBroadcastModal(true)}>
                      Draft Message <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Activity Feed Simulation */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 transition-colors duration-300">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Live Activity Log</h3>
                    <p className="text-xs text-slate-500 mt-1">Real-time interactions between players and the AI.</p>
                  </div>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 text-[10px] uppercase font-bold rounded tracking-wider">Live</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-950/30 transition-colors duration-300">
                  {activityLog.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <BotIcon className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-400 mb-2">No activity yet.</p>
                      <p className="text-xs text-slate-500">Upload a schedule to start the engine.</p>
                    </div>
                  ) : (
                    activityLog.map((log) => (
                      <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors animate-fade-in border-l-2 border-transparent hover:border-indigo-500">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.user === 'System' ? 'bg-indigo-500/20 text-indigo-400' :
                            log.user === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                            {log.user === 'System' ? <BotIcon className="w-4 h-4" /> :
                              log.user === 'Admin' ? <ZapIcon className="w-4 h-4" /> :
                                log.user.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{log.query}</div>
                            <div className="text-xs text-slate-500">{log.user} • {log.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${log.status === 'Sent' ? 'text-purple-500 dark:text-purple-400' :
                            log.status === 'Processed' ? 'text-blue-500 dark:text-blue-400' :
                              'text-green-500 dark:text-green-400'
                            }`}>{log.status}</span>
                          {log.status === 'Answered' && <CheckIcon className="w-3 h-3 text-green-400" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'team' && (
            <GroupLinks teamName={user.team} />
          )}

          {activeTab === 'settings' && (
            <Settings teamName={user.team} />
          )}

          {/* Placeholder for other tabs (Inbox) */}
          {activeTab === 'inbox' && (
            <div className="flex flex-col items-center justify-center h-96 bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageCircleIcon className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 capitalize">{activeTab} View</h3>
              <p className="text-slate-400 mb-6">This module is available in the full version.</p>
              <Button variant="outline" onClick={() => setActiveTab('overview')}>
                Return to Overview
              </Button>
            </div>
          )}

        </div>
      </main >
    </div >
  );
};

export default Dashboard;
