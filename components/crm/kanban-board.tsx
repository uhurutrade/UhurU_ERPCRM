'use client';

import { useState } from 'react';
import { updateDealStage } from '@/app/actions/crm';
import { MoreHorizontal, Plus, Building2 } from 'lucide-react';
import { DealModal } from './modals/deal-modal';

const STAGES = [
    { id: 'PROSPECTING', label: 'Prospecting', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    { id: 'PROPOSAL', label: 'Proposal', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'WON', label: 'Won', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'LOST', label: 'Lost', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

export function KanbanBoard({ deals, organizations }: { deals: any[], organizations: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState('PROSPECTING');

    const openAddModal = (stageId: string) => {
        setSelectedStage(stageId);
        setIsModalOpen(true);
    };

    const handleDragStart = (e: React.DragEvent, dealId: string) => {
        e.dataTransfer.setData('dealId', dealId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData('dealId');
        await updateDealStage(dealId, stageId);
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {STAGES.map((stage) => {
                const stageDeals = deals.filter((d) => d.stage === stage.id);
                const totalAmount = stageDeals.reduce((sum, d) => sum + Number(d.amount), 0);

                return (
                    <div
                        key={stage.id}
                        className="flex-shrink-0 w-80 flex flex-col bg-slate-900/40 rounded-2xl border border-uhuru-border"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="p-4 border-b border-uhuru-border bg-slate-900/20">
                            <div className="flex justify-between items-center mb-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${stage.color}`}>
                                    {stage.label}
                                </span>
                                <span className="text-xs text-uhuru-text-dim">{stageDeals.length}</span>
                            </div>
                            <div className="text-lg font-bold text-white tracking-tight">
                                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totalAmount)}
                            </div>
                        </div>

                        <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                            {stageDeals.map((deal) => (
                                <div
                                    key={deal.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, deal.id)}
                                    className="bg-uhuru-card p-4 rounded-xl border border-uhuru-border cursor-move group hover:border-indigo-500/30 transition-all shadow-sm"
                                >
                                    <div className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                        {deal.title}
                                    </div>
                                    <div className="text-[11px] text-uhuru-text-dim mb-3 flex items-center gap-1">
                                        <Building2 size={12} />
                                        {deal.organization.name}
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-uhuru-border/50">
                                        <span className="font-bold text-indigo-400">
                                            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: deal.currency }).format(Number(deal.amount))}
                                        </span>
                                        <button className="text-slate-500 hover:text-white transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => openAddModal(stage.id)}
                                className="w-full py-3 border-2 border-dashed border-uhuru-border rounded-xl text-uhuru-text-dim hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                            >
                                <Plus size={14} /> Add Deal
                            </button>
                        </div>
                    </div>
                );
            })}

            <DealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                organizations={organizations}
                initialStage={selectedStage}
            />
        </div>
    );
}
