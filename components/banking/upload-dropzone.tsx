'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadBankStatement } from '@/app/actions/banking';

export function UploadDropzone({ bankAccountId }: { bankAccountId: string }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                setMessage(null);
            } else {
                setMessage({ type: 'error', text: 'Please upload a valid CSV file.' });
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadBankStatement(formData, bankAccountId);

            if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Upload successful!' });
                setFile(null);
            } else {
                setMessage({ type: 'error', text: result.error || 'Upload failed.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          backdrop-blur-sm
          ${isDragOver
                        ? 'border-uhuru-blue bg-uhuru-blue/10 shadow-uhuru'
                        : 'border-slate-700/50 hover:border-uhuru-blue/50 bg-gradient-card'
                    }
          ${file ? 'bg-uhuru-blue/5 border-uhuru-blue/70 shadow-uhuru-sm' : ''}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className={`p-6 rounded-2xl transition-all duration-300 ${file
                            ? 'bg-uhuru-blue/20 text-uhuru-blue shadow-uhuru-sm'
                            : 'bg-slate-800/50 text-slate-400'
                        }`}>
                        {file ? <FileText size={48} /> : <Upload size={48} />}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white">
                            {file ? file.name : 'Drop your bank statement here'}
                        </h3>
                        <p className="text-sm text-slate-400">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse (CSV files only)'}
                        </p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-sm backdrop-blur-sm border ${message.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-6 w-full py-4 px-6 bg-uhuru-blue hover:bg-uhuru-blue-light text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-uhuru hover:shadow-uhuru-sm transform hover:scale-[1.02]"
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        'Upload Statement'
                    )}
                </button>
            )}
        </div>
    );
}
