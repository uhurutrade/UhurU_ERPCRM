'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { createContact } from '@/app/actions/crm';
import { User, Mail, Phone, Building2, Tag, Loader2 } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizations: any[];
}

export function ContactModal({ isOpen, onClose, organizations }: ContactModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createContact(formData);
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
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Contact" maxWidth="max-w-xl">
            <form action={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="name"
                                required
                                placeholder="e.g. John Doe"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="+44 7700 900000"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Job Title / Role</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="role"
                                placeholder="e.g. CTO, Operations Manager"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Organization Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Associated Organization</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <select
                                name="organizationId"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                            >
                                <option value="">No Organization (Independent)</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
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
                        className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Adding...
                            </>
                        ) : (
                            'Add Contact'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
