'use client';

import { useState, useEffect } from 'react';
import { UploadDropzone } from '@/components/banking/upload-dropzone';
import { AddBankAccountModal } from '@/components/banking/add-bank-account-modal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BankingUploadPage() {
    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Fetch bank account on client side
        fetch('/api/banking/accounts')
            .then(res => res.json())
            .then(data => {
                setAccount(data.account);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/banking"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-uhuru-blue transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Banking</span>
                    </Link>

                    <h1 className="text-4xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-uhuru-blue to-uhuru-purple">
                        Upload Bank Statement
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Import your transactions from a CSV file. We'll automatically detect duplicates.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-gradient-card backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                    {account ? (
                        <div>
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-300 mb-3">
                                    Select Bank Account
                                </label>
                                <select className="w-full p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white focus:ring-2 focus:ring-uhuru-blue focus:border-uhuru-blue transition-all backdrop-blur-sm">
                                    <option value={account.id}>
                                        {account.bankName} - {account.currency} ({account.accountNumber || '****'})
                                    </option>
                                </select>
                            </div>

                            <UploadDropzone bankAccountId={account.id} />
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 text-slate-400 mb-6">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-3">No Bank Accounts Found</h3>
                            <p className="text-slate-400 mb-6 max-w-md mx-auto">You need to add a bank account before you can upload statements.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-uhuru-blue hover:bg-uhuru-blue-light text-white rounded-xl font-semibold transition-all shadow-uhuru hover:shadow-uhuru-sm transform hover:scale-105"
                            >
                                Add Bank Account
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AddBankAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
