'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { updateDeal, deleteDeal, updateDealStage } from '@/app/actions/crm';
import { useConfirm } from '@/components/providers/modal-provider';
import {
    Target, Building2, Calendar, DollarSign,
    ShieldCheck, Hash, Landmark, CreditCard,
    AlertCircle, Save, ArrowRight, CheckCircle2,
    Archive, Trash2
} from 'lucide-react';

interface DealDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: any;
    organizations: any[];
}

export function DealDetailModal({ isOpen, onClose, deal, organizations }: DealDetailModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFacturable, setIsFacturable] = useState(false); // UI toggle for billing info visibility
    const [error, setError] = useState<string | null>(null);
    const { confirm } = useConfirm();

    if (!deal) return null;

    const organization = organizations.find(o => o.id === deal.organizationId) || deal.organization;

    async function handleStageChange(newStage: string) {
        setIsSubmitting(true);
        const result = await updateDealStage(deal.id, newStage);
        if (result.success) {
            // Updated via revalidate
        } else {
            setError(result.error || 'Failed to update stage');
        }
        setIsSubmitting(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateDeal(deal.id, formData);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to update');
        }
        setIsSubmitting(false);
    }

    async function onDelete() {
        const ok = await confirm({
            title: 'Delete Deal',
            message: `Are you sure you want to delete this opportunity: ${deal.title}?`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (ok) {
            setIsSubmitting(true);
            const result = await deleteDeal(deal.id);
            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Failed to delete');
            }
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Opportunity Intelligence" size="lg">
            <form onSubmit={handleSubmit} className="space-y-8 p-1">
                {/* Deal Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-uhuru-border/50">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                        <Target size={40} />
                    </div>
                    <div className="flex-1">
                        <input
                            name="title"
                            defaultValue={deal.title}
                            className="text-2xl font-bold text-white leading-tight bg-transparent border-none focus:ring-0 w-full p-0"
                            placeholder="Deal Title"
                        />
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest">
                                <Building2 size={14} className="text-slate-500" />
                                <select
                                    name="organizationId"
                                    defaultValue={deal.organizationId}
                                    className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
                                >
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id} className="bg-slate-900 text-white">{org.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-700" />
                            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                <DollarSign size={14} />
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    defaultValue={deal.amount}
                                    className="bg-transparent border-none p-0 focus:ring-0 w-24 font-bold"
                                />
                                <input type="hidden" name="stage" value={deal.stage} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pipeline Controls */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Sales Pipeline</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {['PROSPECTING', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleStageChange(s)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${deal.stage === s
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-slate-900/50 border-uhuru-border text-uhuru-text-dim hover:border-slate-700 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">{s}</span>
                                    {deal.stage === s && <CheckCircle2 size={18} />}
                                </button>
                            ))}
                        </div>

                        <div className="pt-4">
                            <label className="relative flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 cursor-pointer group hover:bg-emerald-500/10 transition-all">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white italic">Facturable</p>
                                    <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-tight">Show client billing details</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isFacturable}
                                        onChange={(e) => setIsFacturable(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Linked Entity Billing Info */}
                    <div className={`space-y-6 transition-all duration-500 ${isFacturable ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none grayscale'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Billing Profile</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                        </div>

                        {organization?.isBillable ? (
                            <div className="bg-slate-900/40 p-6 rounded-2xl border border-uhuru-border/50 space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest mb-1">Company legal details</p>
                                    <p className="text-lg font-bold text-white">{organization.legalName || organization.name}</p>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-emerald-400 font-mono">
                                        <Hash size={14} />
                                        {organization.taxId || 'NO VAT DEFINED'}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                            <Landmark size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">Bank Entity</p>
                                            <p className="text-sm font-bold text-white">{organization.bankName || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                            <CreditCard size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">Payment Rails (IBAN)</p>
                                            <p className="text-sm font-bold text-white truncate font-mono">{organization.bankIban || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-uhuru-border/30">
                                    <p className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Archive size={12} />
                                        Billing Address
                                    </p>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        {organization.address || 'No address provided in master record.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-uhuru-card/30 rounded-2xl border border-dashed border-uhuru-border">
                                <AlertCircle className="mx-auto mb-4 text-amber-500 opacity-50" size={32} />
                                <p className="text-sm text-uhuru-text-dim italic">
                                    The associated organization is not marked as billable.
                                    Enable billing in Organization details first.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Footer */}
                <div className="flex items-center justify-between pt-8 border-t border-uhuru-border/50">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onDelete}
                            className="p-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                            title="Delete Opportunity"
                        >
                            <Trash2 size={24} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-2xl text-sm font-bold text-uhuru-text-dim hover:text-white hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Save size={18} className="animate-pulse" />
                                Synchronizing...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Opportunity
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold animate-in fade-in zoom-in duration-300">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
            </form>
        </Modal>
    );
}
