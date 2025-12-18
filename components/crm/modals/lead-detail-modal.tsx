'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import {
    Zap, Mail, Globe, MapPin, Target,
    ArrowRight, MessageSquare, Calendar,
    User, AlertCircle, Save
} from 'lucide-react';

interface LeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
    onConvert: (id: string) => void;
}

export function LeadDetailModal({ isOpen, onClose, lead, onConvert }: LeadDetailModalProps) {
    if (!lead) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Lead Intelligence" size="lg">
            <div className="space-y-8 p-1">
                {/* Lead Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-uhuru-border/50">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                        <Zap size={40} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white leading-tight">{lead.name}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest">
                                <Globe size={14} className="text-slate-500" />
                                {lead.source || 'Direct Acquisition'}
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-700" />
                            <div className="flex items-center gap-1.5 text-uhuru-text-dim text-xs font-bold uppercase tracking-widest">
                                <Calendar size={14} className="text-slate-500" />
                                Created {new Date(lead.createdAt).toLocaleDateString()}
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
                                    <p className="text-sm font-bold text-white truncate">{lead.email || 'No email provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-uhuru-border">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                    <MessageSquare size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">Strategic Notes</p>
                                    <p className="text-sm text-slate-300 mt-1 italic leading-relaxed">
                                        {lead.notes || 'No discovery notes recorded yet for this prospect.'}
                                    </p>
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
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    lead.status === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                    {lead.status}
                                </span>
                            </div>

                            {lead.status !== 'QUALIFIED' && (
                                <div className="pt-4 mt-4 border-t border-uhuru-border/50">
                                    <p className="text-xs text-uhuru-text-dim mb-4 italic">
                                        Ready to move this prospect into your active pipeline? This will create an Organization and a Deal.
                                    </p>
                                    <button
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
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-uhuru-text-dim hover:text-white hover:bg-slate-800 transition-all"
                    >
                        Close Registry
                    </button>
                </div>
            </div>
        </Modal>
    );
}
