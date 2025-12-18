'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { createOrganization } from '@/app/actions/crm';
import {
    Building2, Globe, MapPin, Briefcase,
    ShieldCheck, Hash, Landmark, CreditCard,
    AlertCircle, Save, Loader2
} from 'lucide-react';

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OrganizationModal({ isOpen, onClose }: OrganizationModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBillable, setIsBillable] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createOrganization(formData);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to create organization');
        }
        setIsSubmitting(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New Organization" size="lg">
            <form onSubmit={handleSubmit} className="space-y-8 p-1">
                {/* Organization Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-uhuru-border/50">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                        <Building2 size={40} />
                    </div>
                    <div className="flex-1 space-y-3">
                        <input
                            name="name"
                            required
                            className="text-2xl font-bold bg-slate-900/40 border border-transparent focus:border-emerald-500/50 rounded-xl px-3 py-1 text-white focus:ring-0 w-full transition-all"
                            placeholder="Company Name *"
                        />
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest px-2 py-1 bg-slate-900/60 rounded-lg border border-uhuru-border">
                                <Briefcase size={14} className="text-slate-500" />
                                <input
                                    name="sector"
                                    className="bg-transparent border-none p-0 focus:ring-0 w-32 text-[11px]"
                                    placeholder="SECTOR / INDUSTRY"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest px-2 py-1 bg-slate-900/60 rounded-lg border border-uhuru-border">
                                <Globe size={14} className="text-slate-500" />
                                <input
                                    name="website"
                                    type="url"
                                    className="bg-transparent border-none p-0 focus:ring-0 w-40 text-[11px]"
                                    placeholder="CORP WEBSITE"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Localization & Basics */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Localization</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <textarea
                                    name="address"
                                    placeholder="Corporate Headquarters Address"
                                    rows={3}
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        {/* FACTURABLE TOGGLE */}
                        <div className="pt-4">
                            <label className="relative flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 cursor-pointer group hover:bg-emerald-500/10 transition-all">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white italic">Facturable</p>
                                    <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-tight">Enable legal & financial dossier</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isBillable"
                                        checked={isBillable}
                                        onChange={(e) => setIsBillable(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Legal & Financial (Visible if isBillable) */}
                    <div className={`space-y-6 transition-all duration-500 ${isBillable ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none grayscale'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Financial DNA</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                                <input
                                    name="taxId"
                                    placeholder="VAT / TAX ID / NIF"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <input
                                    name="legalName"
                                    placeholder="Registered Legal Name"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="relative group">
                                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                                    <input
                                        name="bankName"
                                        placeholder="Bank Entity Name"
                                        className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                                    <input
                                        name="bankIban"
                                        placeholder="IBAN / Account Number"
                                        className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower Actions */}
                <div className="flex items-center justify-between pt-8 border-t border-uhuru-border/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-uhuru-text-dim hover:text-white hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving Entity...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Organization
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
