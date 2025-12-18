'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { createOrganization } from '@/app/actions/crm';
import { Building2, Globe, MapPin, Briefcase, Loader2 } from 'lucide-react';

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OrganizationModal({ isOpen, onClose }: OrganizationModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createOrganization(formData);
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
        <Modal isOpen={isOpen} onClose={onClose} title="Register Organization" maxWidth="max-w-xl">
            <form action={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Organization Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="name"
                                required
                                placeholder="e.g. Acme Corp Industries"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Sector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Business Sector</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="sector"
                                placeholder="e.g. Technology, Finance, Health"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Website URL</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="website"
                                type="url"
                                placeholder="https://example.com"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Full Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="address"
                                placeholder="Street, City, Country"
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
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
                        className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Organization'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
