import React, { useState, useRef } from 'react';
import Button from './Button';

interface KnowledgeUploaderProps {
    teamName: string;
}

const KnowledgeUploader: React.FC<KnowledgeUploaderProps> = ({ teamName }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Check file type if necessary, currently broad acceptance
            setFile(e.dataTransfer.files[0]);
            setMessage(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ text: 'Please select a file to upload.', type: 'error' });
            return;
        }

        if (!teamName) {
            setMessage({ text: 'Team name is missing. Cannot upload.', type: 'error' });
            return;
        }

        setUploading(true);
        setMessage({ text: 'Uploading document and training AI...', type: 'info' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupName', teamName);

        try {
            const res = await fetch('https://api.athplan.com/upload-knowledge', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ text: 'Document uploaded successfully! The AI is now training on it.', type: 'success' });
                setFile(null); // Clear selected file
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setMessage({ text: `Upload failed: ${data.error || 'Unknown error'}`, type: 'error' });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setMessage({ text: `Upload failed: Network or server error.`, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mt-6 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl"></div>

            <h4 className="font-bold text-slate-900 dark:text-white mb-2 relative z-10">AI Knowledge Base</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 relative z-10 max-w-xl">
                Upload your team's playbook, rules, schedules, or any document. The Athplan AI will read it and use it to answer questions from your players on WhatsApp.
            </p>

            <div
                className={`border-2 border-dashed rounded-xl p-6 mb-4 text-center transition-colors relative z-10 ${file ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !file && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.csv,.md"
                />

                {file ? (
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; setMessage(null); }}
                            className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT, CSV up to 10MB</p>
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                        message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                            'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'
                    }`}>
                    <div className="flex items-center gap-2">
                        {uploading && (
                            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>{message.text}</span>
                    </div>
                </div>
            )}

            <div className="flex justify-end relative z-10">
                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`min-w-[120px] ${(!file || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? 'Uploading...' : 'Upload to AI'}
                </Button>
            </div>
        </div>
    );
};

export default KnowledgeUploader;
