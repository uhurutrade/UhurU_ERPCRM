'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { updateOrganization } from '@/app/actions/crm';
import {
    Building2, Globe, MapPin, Hash, Briefcase,
    CreditCard, Landmark, ShieldCheck, Mail,
    Phone, Users, Plus, Target, Archive,
    CheckCircle2, AlertCircle, Save
} from 'lucide-react';

interface OrganizationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: any;
}

export function OrganizationDetailModal({ isOpen, onClose, organization }: OrganizationDetailModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBillable, setIsBillable] = useState(organization?.isBillable || false);
    const [error, setError] = useState<string | null>(null);

    if (!organization) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateOrganization(organization.id, formData);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to update');
        }
        setIsSubmitting(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Company Dossier" size="lg">
            <form onSubmit={handleSubmit} className="space-y-8 p-1">
                {/* Header Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-uhuru-border/50">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                        <Building2 size={40} />
                    </div>
                    <div className="flex-1">
                        <input
                            name="name"
                            defaultValue={organization.name}
                            className="text-2xl font-bold bg-transparent border-none text-white focus:ring-0 w-full p-0"
                            placeholder="Company Name"
                        />
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest">
                                <Briefcase size={14} className="text-slate-500" />
                                <input
                                    name="sector"
                                    defaultValue={organization.sector}
                                    className="bg-transparent border-none p-0 focus:ring-0 w-32"
                                    placeholder="Sector"
                                />
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-700" />
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest">
                                <span className={`px-2 py-0.5 rounded ${isBillable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                                    {isBillable ? 'Active Client' : 'Prospect'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Core Information</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    name="website"
                                    defaultValue={organization.website}
                                    placeholder="Website (e.g. https://example.com)"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <MapPin className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <textarea
                                    name="address"
                                    defaultValue={organization.address}
                                    placeholder="Registered Office Address"
                                    rows={3}
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        {/* FACTURABLE TOGGLE */}
                        <div className="pt-4">
                            <label className="relative flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 cursor-pointer group hover:bg-indigo-500/10 transition-all">
                                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">Billing Authorization</p>
                                    <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-tight">Enable legal & financial data for invoicing</p>
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

                    {/* Legal & Billing Section */}
                    <div className={`space-y-6 transition-all duration-500 ${isBillable ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none grayscale'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Financial DNA</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    name="taxId"
                                    defaultValue={organization.taxId}
                                    placeholder="VAT / Tax ID Number"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    name="legalName"
                                    defaultValue={organization.legalName}
                                    placeholder="Full Registered Business Name"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                                />
                            </div>

                            <div className="bg-slate-900/40 p-5 rounded-2xl border border-uhuru-border/50 space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest mb-1">
                                    <CreditCard size={12} />
                                    Default Bank Account
                                </div>
                                <input
                                    name="bankName"
                                    defaultValue={organization.bankName}
                                    placeholder="Bank Name"
                                    className="w-full bg-transparent border-b border-uhuru-border pb-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                                />
                                <input
                                    name="bankIban"
                                    defaultValue={organization.bankIban}
                                    placeholder="IBAN"
                                    className="w-full bg-transparent border-b border-uhuru-border pb-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                                />
                                <input
                                    name="bankSwift"
                                    defaultValue={organization.bankSwift}
                                    placeholder="SWIFT / BIC"
                                    className="w-full bg-transparent border-none pb-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
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
                                Save Profile
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
