import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface TableConfig {
  name: string;
  label: string;
  primaryKey: string;
  columns: ColumnDef[];
}

interface ColumnDef {
  key: string;
  label: string;
  editable: boolean;
  type?: 'text' | 'boolean' | 'date' | 'json';
  width?: string;
}

const TABLE_CONFIGS: TableConfig[] = [
  {
    name: 'users',
    label: 'Users',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', editable: false, width: '80px' },
      { key: 'email', label: 'Email', editable: false },
      { key: 'full_name', label: 'Full Name', editable: true },
      { key: 'username', label: 'Username', editable: true },
      { key: 'subscription_status', label: 'Subscription', editable: true },
      { key: 'team_id', label: 'Team ID', editable: false, width: '80px' },
    ],
  },
  {
    name: 'teams',
    label: 'Teams',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', editable: false, width: '80px' },
      { key: 'name', label: 'Name', editable: true },
      { key: 'plan', label: 'Plan', editable: true },
      { key: 'join_code', label: 'Join Code', editable: false },
      { key: 'subscription_status', label: 'Subscription', editable: true },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
  },
  {
    name: 'bot_users',
    label: 'Bot Users',
    primaryKey: 'phone_number',
    columns: [
      { key: 'phone_number', label: 'Phone', editable: false },
      { key: 'group_name', label: 'Group', editable: true },
      { key: 'is_admin', label: 'Admin', editable: true, type: 'boolean' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
  },
  {
    name: 'whatsapp_users',
    label: 'WhatsApp Users',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', editable: false, width: '60px' },
      { key: 'phone_number', label: 'Phone', editable: false },
      { key: 'group_name', label: 'Group', editable: true },
      { key: 'name', label: 'Name', editable: true },
      { key: 'is_admin', label: 'Admin', editable: true, type: 'boolean' },
    ],
  },
  {
    name: 'schedule_updates',
    label: 'Schedule Updates',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', editable: false, width: '80px' },
      { key: 'group_name', label: 'Group', editable: false },
      { key: 'content', label: 'Content', editable: true },
      { key: 'created_by', label: 'Created By', editable: false },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
  },
  {
    name: 'activity_logs',
    label: 'Activity Logs',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', editable: false, width: '80px' },
      { key: 'action', label: 'Action', editable: false },
      { key: 'details', label: 'Details', editable: false, type: 'json' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
  },
];

interface EditingCell {
  rowKey: string;
  colKey: string;
}

const AdminDataTable: React.FC = () => {
  const [activeTable, setActiveTable] = useState(TABLE_CONFIGS[0]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(activeTable.name)
        .select('*')
        .order(activeTable.columns.find(c => c.type === 'date')?.key || activeTable.primaryKey, { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      console.error('Fetch error:', e);
      setSaveStatus(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [activeTable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`admin-table-${activeTable.name}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: activeTable.name }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTable, fetchData]);

  // Focus input on edit
  useEffect(() => {
    if (editing && editRef.current) editRef.current.focus();
  }, [editing]);

  // Filter rows
  const filtered = rows.filter(row => {
    if (!search) return true;
    const q = search.toLowerCase();
    return activeTable.columns.some(col => {
      const val = row[col.key];
      if (val == null) return false;
      return String(val).toLowerCase().includes(q);
    });
  });

  // Save edit
  const handleSave = async (row: any, col: ColumnDef) => {
    if (!editing) return;
    const pkVal = row[activeTable.primaryKey];
    let newVal: any = editValue;
    if (col.type === 'boolean') newVal = editValue === 'true';

    try {
      const { error } = await supabase
        .from(activeTable.name)
        .update({ [col.key]: newVal })
        .eq(activeTable.primaryKey, pkVal);
      if (error) throw error;
      setSaveStatus('Saved ✓');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e: any) {
      setSaveStatus(`Error: ${e.message}`);
    }
    setEditing(null);
  };

  // Delete row
  const handleDelete = async (row: any) => {
    const pkVal = row[activeTable.primaryKey];
    if (!confirm(`Delete row with ${activeTable.primaryKey} = ${String(pkVal).substring(0, 20)}?`)) return;
    try {
      const { error } = await supabase
        .from(activeTable.name)
        .delete()
        .eq(activeTable.primaryKey, pkVal);
      if (error) throw error;
      setSaveStatus('Deleted ✓');
      setTimeout(() => setSaveStatus(null), 2000);
      fetchData();
    } catch (e: any) {
      setSaveStatus(`Error: ${e.message}`);
    }
  };

  // Format cell display
  const formatCell = (val: any, col: ColumnDef) => {
    if (val == null) return <span className="text-slate-500 italic">null</span>;
    if (col.type === 'boolean') return val ? '✅ Yes' : '❌ No';
    if (col.type === 'date') return new Date(val).toLocaleString();
    if (col.type === 'json') return <span className="font-mono text-xs">{JSON.stringify(val).substring(0, 60)}</span>;
    const s = String(val);
    if (col.key === 'id' || col.key === 'team_id') return <span className="font-mono text-xs">{s.substring(0, 8)}…</span>;
    return s;
  };

  return (
    <div className="space-y-6">
      {/* Table Selector */}
      <div className="flex flex-wrap items-center gap-3">
        {TABLE_CONFIGS.map(tc => (
          <button
            key={tc.name}
            onClick={() => { setActiveTable(tc); setSearch(''); setEditing(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTable.name === tc.name
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-500'
            }`}
          >
            {tc.label}
          </button>
        ))}
      </div>

      {/* Search + Status */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeTable.label}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} rows</span>
        {saveStatus && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full animate-fade-in ${
            saveStatus.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
          }`}>
            {saveStatus}
          </span>
        )}
        <button onClick={fetchData} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors" title="Refresh">
          <svg className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Spreadsheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                {activeTable.columns.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.label}
                    {col.editable && <span className="ml-1 text-indigo-400 text-[9px]">✎</span>}
                  </th>
                ))}
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading && rows.length === 0 ? (
                <tr><td colSpan={activeTable.columns.length + 1} className="p-12 text-center text-slate-400">
                  <svg className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Loading…
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={activeTable.columns.length + 1} className="p-12 text-center text-slate-400">
                  {search ? 'No matching rows' : 'No data in this table'}
                </td></tr>
              ) : (
                filtered.map((row, ri) => {
                  const rowKey = String(row[activeTable.primaryKey]);
                  return (
                    <tr key={rowKey} className={`transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 ${ri % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-950/30'}`}>
                      {activeTable.columns.map(col => {
                        const isEditing = editing?.rowKey === rowKey && editing?.colKey === col.key;
                        return (
                          <td
                            key={col.key}
                            className={`px-4 py-2.5 text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-[250px] truncate ${col.editable ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors' : ''}`}
                            onDoubleClick={() => {
                              if (!col.editable) return;
                              setEditing({ rowKey, colKey: col.key });
                              setEditValue(row[col.key] != null ? String(row[col.key]) : '');
                            }}
                            title={col.editable ? 'Double-click to edit' : String(row[col.key] ?? '')}
                          >
                            {isEditing ? (
                              col.type === 'boolean' ? (
                                <select
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={() => handleSave(row, col)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleSave(row, col); if (e.key === 'Escape') setEditing(null); }}
                                  className="w-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none"
                                  autoFocus
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              ) : (
                                <input
                                  ref={editRef}
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={() => handleSave(row, col)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleSave(row, col); if (e.key === 'Escape') setEditing(null); }}
                                  className="w-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              )
                            ) : (
                              formatCell(row[col.key], col)
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => handleDelete(row)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete row"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="text-indigo-400">✎</span> Editable — double-click to edit</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
          Real-time updates enabled
        </span>
      </div>
    </div>
  );
};

export default AdminDataTable;
