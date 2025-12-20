'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { createDeal } from '@/app/actions/crm';
import { Target, DollarSign, Building2, LayoutGrid, Loader2 } from 'lucide-react';

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizations: any[];
    initialStage?: string;
}

export function DealModal({ isOpen, onClose, organizations, initialStage = 'PROSPECTING' }: DealModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createDeal(formData);
            if (result.error) {
                setError(result.error);
            } else {
                onClose();
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Deal" maxWidth="max-w-xl">
            <form action={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold">
                        {error}
                    </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Deal Title</label>
                    <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            name="title"
                            required
                            placeholder="e.g. Software License Expansion"
                            className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Amount (GBP)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Stage */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Initial Stage</label>
                        <div className="relative">
                            <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <select
                                name="stage"
                                defaultValue={initialStage}
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                            >
                                <option value="PROSPECTING">Prospecting</option>
                                <option value="PROPOSAL">Proposal</option>
                                <option value="NEGOTIATION">Negotiation</option>
                                <option value="WON">Won</option>
                                <option value="LOST">Lost</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Organization Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Associated Organization</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <select
                            name="organizationId"
                            required
                            className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-slate-900">Select an organization...</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id} className="bg-slate-900">{org.name}</option>
                            ))}
                        </select>
                    </div>
                    {organizations.length === 0 && (
                        <p className="text-[10px] text-amber-500 mt-1 font-bold italic">No organizations found. Create one first.</p>
                    )}
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Create Deal'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
