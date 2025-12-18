'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { createLead } from '@/app/actions/crm';
import { User, Mail, Link2, FileText, Loader2 } from 'lucide-react';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LeadModal({ isOpen, onClose }: LeadModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createLead(formData);
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
        <Modal isOpen={isOpen} onClose={onClose} title="Capture New Lead" maxWidth="max-w-xl">
            <form action={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Lead Name / Prospect</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="name"
                                required
                                placeholder="e.g. Potential Client X"
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
                                    placeholder="contact@prospect.com"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Source */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Lead Source</label>
                            <div className="relative">
                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <select
                                    name="source"
                                    className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                                >
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="X/Twitter">X / Twitter</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Website">Website</option>
                                    <option value="Outbound">Outbound</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-uhuru-text-muted uppercase tracking-widest px-1">Discovery Notes</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
                            <textarea
                                name="notes"
                                rows={4}
                                placeholder="Details about the opportunity, pain points, etc."
                                className="w-full bg-slate-900/50 border border-uhuru-border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium resize-none"
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
                        className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Capturing...
                            </>
                        ) : (
                            'Save Lead'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
