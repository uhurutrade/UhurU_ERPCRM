'use client';

import { useState } from 'react';
import { updateDealStage } from '@/app/actions/crm';
import { MoreHorizontal, Plus } from 'lucide-react';

const STAGES = [
    { id: 'PROSPECTING', label: 'Prospecting', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    { id: 'PROPOSAL', label: 'Proposal', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { id: 'WON', label: 'Won', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { id: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
];

export function KanbanBoard({ deals, organizations }: { deals: any[], organizations: any[] }) {
    // Simple local optimistic UI could be added here, but for now we rely on server revalidation

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
                        className="flex-shrink-0 w-80 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${stage.color}`}>
                                    {stage.label}
                                </span>
                                <span className="text-xs text-slate-500">{stageDeals.length}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totalAmount)}
                            </div>
                        </div>

                        <div className="p-3 flex-1 overflow-y-auto space-y-3">
                            {stageDeals.map((deal) => (
                                <div
                                    key={deal.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, deal.id)}
                                    className="bg-gradient-card backdrop-blur-xl p-4 rounded-lg border border-slate-700 cursor-move group"
                                >
                                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                        {deal.title}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2">
                                        {deal.organization.name}
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: deal.currency }).format(Number(deal.amount))}
                                        </span>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center justify-center gap-1 text-sm font-medium">
                                <Plus size={14} /> Add Deal
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
