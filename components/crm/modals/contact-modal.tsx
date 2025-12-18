'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { createContact } from '@/app/actions/crm';
import {
    User, Mail, Phone, Briefcase, Building2,
    ShieldCheck, CreditCard, Hash, Landmark,
    AlertCircle, Save, Loader2, Linkedin, Globe
} from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizations: any[];
}

export function ContactModal({ isOpen, onClose, organizations }: ContactModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBillable, setIsBillable] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createContact(formData);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to create contact');
        }
        setIsSubmitting(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Professional Profile" size="lg">
            <form onSubmit={handleSubmit} className="space-y-8 p-1">
                {/* Profile Header Block */}
                <div className="flex items-center gap-6 pb-6 border-b border-uhuru-border/50">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                        <User size={40} />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="relative group">
                            <input
                                name="name"
                                required
                                className="text-2xl font-bold bg-slate-900/40 border border-transparent focus:border-blue-500/50 rounded-xl px-3 py-1 text-white focus:ring-0 w-full transition-all"
                                placeholder="Contact Full Name *"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest px-2 py-1 bg-slate-900/60 rounded-lg border border-uhuru-border">
                                <Building2 size={14} className="text-slate-500" />
                                <select
                                    name="organizationId"
                                    className="bg-transparent border-none p-0 focus:ring-0 text-white font-bold text-[11px]"
                                >
                                    <option value="" className="bg-slate-900">Independent</option>
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id} className="bg-slate-900">{org.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest px-2 py-1 bg-slate-900/60 rounded-lg border border-uhuru-border">
                                <Briefcase size={14} className="text-slate-500" />
                                <input
                                    name="role"
                                    className="bg-transparent border-none p-0 focus:ring-0 w-32 text-[11px]"
                                    placeholder="POSITION / ROLE"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Channels */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Communication</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Work Email"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    name="phone"
                                    placeholder="Phone Contact"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    name="linkedin"
                                    placeholder="LinkedIn URL"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    name="website"
                                    placeholder="Website / Portfolio"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* FACTURABLE TOGGLE */}
                        <div className="pt-4">
                            <label className="relative flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 cursor-pointer group hover:bg-blue-500/10 transition-all">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">Direct Billing</p>
                                    <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-tight">Enable personal billing details</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isBillable"
                                        checked={isBillable}
                                        onChange={(e) => setIsBillable(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Legal Data (Visible if isBillable) */}
                    <div className={`space-y-6 transition-all duration-500 ${isBillable ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none grayscale'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Billing Dossier</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    name="taxId"
                                    placeholder="NIF / VAT / SSN"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    name="legalName"
                                    placeholder="Full Legal Name for Invoicing"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                                />
                            </div>

                            <div className="relative group">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    name="bankIban"
                                    placeholder="Bank IBAN (Optional)"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                                />
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
                        Discard
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating Profile...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Create Contact
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
