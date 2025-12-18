'use client';

import { useState } from 'react';
import { Plus, Users, Building2, Target, Zap, ChevronDown } from 'lucide-react';
import { DealModal } from './modals/deal-modal';
import { OrganizationModal } from './modals/organization-modal';
import { ContactModal } from './modals/contact-modal';
import { LeadModal } from './modals/lead-modal';

interface CRMHeaderActionsProps {
    organizations: any[];
}

export function CRMHeaderActions({ organizations }: CRMHeaderActionsProps) {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const closeModal = () => setActiveModal(null);

    return (
        <div className="relative flex gap-3">
            {/* Quick Action Button */}
            <button
                onClick={() => setActiveModal('deal')}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Plus size={18} /> New Deal
            </button>

            {/* Dropdown Toggle */}
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border font-bold transition-all shadow-sm ${showDropdown
                            ? 'bg-slate-800 border-indigo-500 text-white'
                            : 'bg-uhuru-card border-uhuru-border text-uhuru-text-dim hover:text-white hover:border-slate-700'
                        }`}
                >
                    <ChevronDown size={20} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 mt-3 w-56 bg-uhuru-card border border-uhuru-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                            <div className="px-4 py-2 mb-1">
                                <span className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Create New Record</span>
                            </div>

                            <button
                                onClick={() => { setActiveModal('lead'); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-uhuru-text-dim hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Zap size={14} />
                                </div>
                                <span className="font-bold">New Lead</span>
                            </button>

                            <button
                                onClick={() => { setActiveModal('contact'); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-uhuru-text-dim hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Users size={14} />
                                </div>
                                <span className="font-bold">New Contact</span>
                            </button>

                            <button
                                onClick={() => { setActiveModal('org'); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-uhuru-text-dim hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <Building2 size={14} />
                                </div>
                                <span className="font-bold">Organization</span>
                            </button>

                            <div className="mt-2 pt-2 border-t border-uhuru-border">
                                <button
                                    onClick={() => { setActiveModal('deal'); setShowDropdown(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-uhuru-text-dim hover:text-white hover:bg-slate-800/80 transition-colors"
                                >
                                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Target size={14} />
                                    </div>
                                    <span className="font-bold">Opportunity / Deal</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <DealModal
                isOpen={activeModal === 'deal'}
                onClose={closeModal}
                organizations={organizations}
            />
            <OrganizationModal
                isOpen={activeModal === 'org'}
                onClose={closeModal}
            />
            <ContactModal
                isOpen={activeModal === 'contact'}
                onClose={closeModal}
                organizations={organizations}
            />
            <LeadModal
                isOpen={activeModal === 'lead'}
                onClose={closeModal}
            />
        </div>
    );
}
