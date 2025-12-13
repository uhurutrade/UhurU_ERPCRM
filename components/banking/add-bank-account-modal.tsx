'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createBankAccount } from '@/app/actions/banking';

interface AddBankAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddBankAccountModal({ isOpen, onClose }: AddBankAccountModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await createBankAccount(formData);

            if (result.success) {
                onClose();
                window.location.reload(); // Refresh to show the new account
            } else {
                setError(result.error || 'Failed to create account');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gradient-card backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl max-w-md w-full p-8 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Add Bank Account</h2>
                    <p className="text-slate-400">Enter your bank account details</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Bank Name */}
                    <div>
                        <label htmlFor="bankName" className="block text-sm font-semibold text-slate-300 mb-2">
                            Bank Name *
                        </label>
                        <input
                            type="text"
                            id="bankName"
                            name="bankName"
                            required
                            placeholder="e.g., Revolut, Wise, HSBC"
                            className="w-full p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-uhuru-blue focus:border-uhuru-blue transition-all backdrop-blur-sm"
                        />
                    </div>

                    {/* Account Name */}
                    <div>
                        <label htmlFor="accountName" className="block text-sm font-semibold text-slate-300 mb-2">
                            Account Name
                        </label>
                        <input
                            type="text"
                            id="accountName"
                            name="accountName"
                            placeholder="e.g., Business Account"
                            className="w-full p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-uhuru-blue focus:border-uhuru-blue transition-all backdrop-blur-sm"
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label htmlFor="currency" className="block text-sm font-semibold text-slate-300 mb-2">
                            Currency *
                        </label>
                        <select
                            id="currency"
                            name="currency"
                            required
                            className="w-full p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white focus:ring-2 focus:ring-uhuru-blue focus:border-uhuru-blue transition-all backdrop-blur-sm"
                        >
                            <option value="">Select currency</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="USD">USD - US Dollar</option>
                        </select>
                    </div>

                    {/* Account Number */}
                    <div>
                        <label htmlFor="accountNumber" className="block text-sm font-semibold text-slate-300 mb-2">
                            Account Number
                        </label>
                        <input
                            type="text"
                            id="accountNumber"
                            name="accountNumber"
                            placeholder="Optional"
                            className="w-full p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-uhuru-blue focus:border-uhuru-blue transition-all backdrop-blur-sm"
                        />
                    </div>

                    {/* IBAN */}
                    <div>
                        <label htmlFor="iban" className="block text-sm font-semibold text-slate-300 mb-2">
                            IBAN
                        </label>
                        <input
                            type="text"
                            id="iban"
                            name="iban"
                            placeholder="Optional"
                            className="w-full p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-uhuru-blue focus:border-uhuru-blue transition-all backdrop-blur-sm"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-6 bg-uhuru-blue hover:bg-uhuru-blue-light text-white rounded-xl font-semibold transition-all shadow-uhuru hover:shadow-uhuru-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                Add Account
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
