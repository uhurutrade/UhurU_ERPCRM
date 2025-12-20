'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { updateContact, deleteContact } from '@/app/actions/crm';
import { useConfirm } from '@/components/providers/modal-provider';
import {
    User, Mail, Phone, Briefcase, Building2,
    ShieldCheck, CreditCard, Hash, Landmark,
    AlertCircle, Save, Trash2, Linkedin, Globe,
    ExternalLink, MapPin, MessageSquare, Plus, Loader2,
    Activity as ActivityIcon
} from 'lucide-react';

interface ContactDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: any;
    organizations: any[];
}

export function ContactDetailModal({ isOpen, onClose, contact, organizations }: ContactDetailModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBillable, setIsBillable] = useState(contact?.isBillable || false);
    const [error, setError] = useState<string | null>(null);
    const { confirm } = useConfirm();

    if (!contact) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateContact(contact.id, formData);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to update');
        }
        setIsSubmitting(false);
    }

    async function onDelete() {
        const ok = await confirm({
            title: 'Delete Contact',
            message: `Are you sure you want to permanently delete ${contact.name}? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (ok) {
            setIsSubmitting(true);
            const result = await deleteContact(contact.id);
            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Failed to delete');
            }
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Professional Profile" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header: Identity Card */}
                <div className="flex items-center gap-5 p-1">
                    <div className="relative group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                            {contact.name.charAt(0)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <input
                            name="name"
                            defaultValue={contact.name}
                            className="bg-transparent border-none p-0 text-xl font-bold text-white focus:ring-0 w-full placeholder:text-slate-600"
                            placeholder="Full Name"
                        />
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-[11px] font-bold uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded-md border border-white/5">
                                <Briefcase size={12} className="text-blue-400" />
                                <input
                                    name="role"
                                    defaultValue={contact.role}
                                    className="bg-transparent border-none p-0 focus:ring-0 w-24"
                                    placeholder="Position"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-[11px] font-bold uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded-md border border-white/5">
                                <Building2 size={12} className="text-emerald-400" />
                                <select
                                    name="organizationId"
                                    defaultValue={contact.organizationId || ''}
                                    className="bg-transparent border-none p-0 focus:ring-0 text-[11px] font-bold text-white cursor-pointer"
                                >
                                    <option value="" className="bg-slate-900">Independent</option>
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id} className="bg-slate-900">{org.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Communication Channels */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Connect</h4>
                            <div className="h-px flex-1 bg-blue-500/10" />
                        </div>

                        <div className="space-y-3">
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={contact.email}
                                    placeholder="Email Address"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Phone size={16} />
                                </div>
                                <input
                                    name="phone"
                                    defaultValue={contact.phone}
                                    placeholder="Phone Number"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-1 pt-2">
                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Digital Presence</h4>
                            <div className="h-px flex-1 bg-indigo-500/10" />
                        </div>

                        <div className="space-y-3">
                            <div className="relative group text-indigo-100 italic">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Linkedin size={16} />
                                </div>
                                <input
                                    name="linkedin"
                                    defaultValue={contact.linkedin}
                                    placeholder="LinkedIn Profile URL"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                                {contact.linkedin && (
                                    <a href={contact.linkedin} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>

                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Globe size={16} />
                                </div>
                                <input
                                    name="website"
                                    defaultValue={contact.website}
                                    placeholder="Personal/Portfolio Website"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                                {contact.website && (
                                    <a href={contact.website} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Postal Location</h4>
                                    <div className="h-px flex-1 bg-slate-500/10" />
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <MapPin size={16} />
                                    </div>
                                    <textarea
                                        name="address"
                                        defaultValue={contact.address}
                                        placeholder="Street Address"
                                        rows={2}
                                        className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        name="city"
                                        defaultValue={contact.city}
                                        placeholder="City"
                                        className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                    />
                                    <input
                                        name="country"
                                        defaultValue={contact.country}
                                        placeholder="Country"
                                        className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                    />
                                    <input
                                        name="postcode"
                                        defaultValue={contact.postcode}
                                        placeholder="Postcode"
                                        className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Operations & Billing */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Dossier Fiscal</h4>
                            <div className="h-px flex-1 bg-emerald-500/10" />
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5 cursor-pointer hover:bg-slate-800/50 transition-all border-dashed" onClick={() => setIsBillable(!isBillable)}>
                            <input
                                type="checkbox"
                                name="isBillable"
                                checked={isBillable}
                                onChange={(e) => setIsBillable(e.target.checked)}
                                className="hidden"
                            />
                            <div className={`p-1.5 rounded-lg border ${isBillable ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-600 border-white/5'}`}>
                                <ShieldCheck size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white">Direct Billing</p>
                                <p className="text-[10px] text-uhuru-text-dim">Enable individual invoicing data</p>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${isBillable ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isBillable ? 'left-4.5' : 'left-0.5'}`} style={{ left: isBillable ? '18px' : '2px' }} />
                            </div>
                        </div>

                        <div className={`space-y-3 transition-all duration-300 ${isBillable ? 'opacity-100 translate-y-0' : 'opacity-20 pointer-events-none -translate-y-1'}`}>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Hash size={16} />
                                </div>
                                <input
                                    name="taxId"
                                    defaultValue={contact.taxId}
                                    placeholder="VAT / Tax ID Number"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Landmark size={16} />
                                </div>
                                <input
                                    name="legalName"
                                    defaultValue={contact.legalName}
                                    placeholder="Legal Name for Invoices"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <CreditCard size={16} />
                                </div>
                                <input
                                    name="bankIban"
                                    defaultValue={contact.bankIban}
                                    placeholder="Bank Account (IBAN)"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        {!isBillable && (
                            <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5 text-center">
                                <p className="text-[10px] text-uhuru-text-dim italic">Billing data is currently disabled for this professional profile.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lower Toolbar: Quick Metadata */}
                <div className="flex items-center gap-4 py-3 px-4 bg-slate-900/30 rounded-2xl border border-white/5">
                    <div className="flex-1 flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Engagement</span>
                            <div className="flex items-center gap-1 text-blue-400">
                                <ActivityIcon size={12} />
                                <span className="text-xs font-bold font-mono">High</span>
                            </div>
                        </div>
                        <div className="flex flex-col border-l border-white/5 pl-6">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Member Since</span>
                            <span className="text-xs font-bold text-slate-300 font-mono">{new Date(contact.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors" title="Log Activity">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Footer Footer */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onDelete}
                            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                            title="Delete contact"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-uhuru-text-dim hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-white/5"
                        >
                            Discard
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Save size={14} className="animate-pulse" />
                                Synchronizing...
                            </>
                        ) : (
                            <>
                                <Save size={14} />
                                Save Profile
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-[11px] font-bold animate-in fade-in zoom-in duration-300">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
            </form>
        </Modal>
    );
}
