'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { updateLead, deleteLead } from '@/app/actions/crm';
import { useConfirm } from '@/components/providers/modal-provider';
import {
    Zap, Mail, Globe, MapPin, Target,
    ArrowRight, MessageSquare, Calendar,
    User, AlertCircle, Save, Trash2
} from 'lucide-react';

interface LeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
    onConvert: (id: string) => void;
}

export function LeadDetailModal({ isOpen, onClose, lead, onConvert }: LeadDetailModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { confirm } = useConfirm();

    if (!lead) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateLead(lead.id, formData);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to update');
        }
        setIsSubmitting(false);
    }

    async function onDelete() {
        const ok = await confirm({
            title: 'Delete Lead',
            message: `Are you sure you want to delete this prospect: ${lead.name}?`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (ok) {
            setIsSubmitting(true);
            const result = await deleteLead(lead.id);
            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Failed to delete');
            }
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Lead Intelligence" size="lg">
            <form onSubmit={handleSubmit} className="space-y-8 p-1">
                {/* Lead Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-uhuru-border/50">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                        <Zap size={40} />
                    </div>
                    <div className="flex-1">
                        <input
                            name="name"
                            defaultValue={lead.name}
                            className="text-2xl font-bold text-white leading-tight bg-transparent border-none focus:ring-0 w-full p-0"
                            placeholder="Lead Name"
                        />
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden">
                                <Globe size={14} className="text-slate-500 shrink-0" />
                                <input
                                    name="source"
                                    defaultValue={lead.source}
                                    placeholder="Source"
                                    className="bg-transparent border-none p-0 focus:ring-0 w-full"
                                />
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-700 shrink-0" />
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest shrink-0">
                                <Calendar size={14} className="text-slate-500" />
                                {new Date(lead.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Identification */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">Prospect Details</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-uhuru-border">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">Electronic Mail</p>
                                    <input
                                        name="email"
                                        defaultValue={lead.email}
                                        placeholder="Email Address"
                                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-uhuru-border">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                    <MessageSquare size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">Strategic Notes</p>
                                    <textarea
                                        name="notes"
                                        defaultValue={lead.notes}
                                        rows={3}
                                        placeholder="Discovery notes..."
                                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-300 mt-1 italic leading-relaxed resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conversion Potential */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Conversion Status</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                        </div>

                        <div className="bg-uhuru-card border border-uhuru-border rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-uhuru-text-dim uppercase tracking-widest">Pipeline Phase</span>
                                <select
                                    name="status"
                                    defaultValue={lead.status}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-transparent focus:ring-0 cursor-pointer ${lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        lead.status === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}
                                >
                                    <option value="NEW" className="bg-slate-900">NEW</option>
                                    <option value="QUALIFIED" className="bg-slate-900">QUALIFIED</option>
                                    <option value="LOST" className="bg-slate-900">LOST</option>
                                </select>
                            </div>

                            {lead.status !== 'QUALIFIED' && (
                                <div className="pt-4 mt-4 border-t border-uhuru-border/50">
                                    <p className="text-xs text-uhuru-text-dim mb-4 italic">
                                        Ready to move this prospect into your active pipeline? This will create an Organization and a Deal.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { onConvert(lead.id); onClose(); }}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                                    >
                                        <Target size={18} />
                                        Promote to Opportunity
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            )}

                            {lead.status === 'QUALIFIED' && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-emerald-400">
                                    <Target size={20} />
                                    <p className="text-xs font-bold uppercase tracking-tight">This lead has been successfully qualified.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-uhuru-border/50">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onDelete}
                            className="p-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                            title="Delete Prospect"
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
                        className="flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Save size={18} className="animate-pulse" />
                                Synchronizing...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Prospect
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
