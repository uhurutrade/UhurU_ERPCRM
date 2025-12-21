'use client';

import { useState } from 'react';
import { deleteLead, convertLeadToDeal } from '@/app/actions/crm';
import { Target, Trash2, Loader2, ArrowRight, Users } from 'lucide-react';
import { LeadDetailModal } from './modals/lead-detail-modal';
import { useConfirm } from '@/components/providers/modal-provider';

interface LeadListProps {
    leads: any[];
    organizations: any[];
}

export function LeadList({ leads, organizations }: LeadListProps) {
    const [isConverting, setIsConverting] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const { confirm } = useConfirm();

    async function handleConvert(leadId: string) {
        // For simplicity, we'll just use the first organization or a default one
        // In a real app, this should open a modal to select the organization
        if (organizations.length === 0) {
            alert('Please create an organization first.');
            return;
        }

        setIsConverting(leadId);
        try {
            await convertLeadToDeal(leadId, organizations[0].id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsConverting(null);
        }
    }

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        const ok = await confirm({
            title: "Delete Lead",
            message: "Are you sure you want to delete this lead?",
            type: "danger"
        });

        if (ok) {
            await deleteLead(id);
        }
    }

    return (
        <div className="bg-uhuru-card border border-uhuru-border rounded-2xl overflow-hidden shadow-card animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-uhuru-border text-uhuru-text-muted text-[10px] font-bold uppercase tracking-widest bg-slate-900/30">
                        <th className="py-4 px-6">Source</th>
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-uhuru-border">
                    {leads.map((lead) => (
                        <tr
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        >
                            <td className="py-4 px-6">
                                <span className="px-2 py-1 rounded text-[9px] font-bold bg-slate-800 text-slate-400 uppercase border border-slate-700">
                                    {lead.source || 'General'}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="font-bold text-white text-sm">{lead.name}</div>
                                <div className="text-uhuru-text-dim text-xs">{lead.email}</div>
                            </td>
                            <td className="py-4 px-6">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                    lead.status === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                    }`}>
                                    {lead.status}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-uhuru-text-dim">
                                {new Date(lead.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {lead.status !== 'QUALIFIED' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleConvert(lead.id); }}
                                            disabled={isConverting === lead.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all border border-indigo-600/20"
                                        >
                                            {isConverting === lead.id ? <Loader2 size={12} className="animate-spin" /> : <Target size={12} />}
                                            Convert
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(e, lead.id)}
                                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-20 text-center">
                                <Users className="mx-auto mb-4 opacity-10 text-white" size={48} />
                                <p className="text-uhuru-text-dim text-sm ">No leads found in your pipeline.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
