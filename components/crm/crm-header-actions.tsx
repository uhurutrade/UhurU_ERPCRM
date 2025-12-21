'use client';

import { useState } from 'react';
import { Plus, Users, Building2, Target, Zap, MoreVertical } from 'lucide-react';
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
        <div className="relative flex flex-wrap lg:flex-nowrap justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Quick Action: New Deal */}
            <button
                onClick={() => setActiveModal('deal')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[11px] sm:text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Plus size={16} className="sm:w-[18px]" /> New Deal
            </button>

            {/* Quick Action: New Contact */}
            <button
                onClick={() => setActiveModal('contact')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px] sm:text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Users size={16} className="sm:w-[18px]" /> New Contact
            </button>

            {/* Quick Action: New Organization */}
            <button
                onClick={() => setActiveModal('org')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] sm:text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Building2 size={16} className="sm:w-[18px]" /> Org
            </button>

            {/* Dropdown for other actions */}
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border font-bold transition-all shadow-sm ${showDropdown
                        ? 'bg-slate-800 border-indigo-500 text-white'
                        : 'bg-uhuru-card border-uhuru-border text-uhuru-text-dim hover:text-white hover:border-slate-700'
                        }`}
                >
                    <MoreVertical size={20} className={`transition-transform duration-300 ${showDropdown ? 'rotate-90' : ''}`} />
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
                                <span className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">More Actions</span>
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

                            <div className="mt-2 pt-2 border-t border-uhuru-border">
                                <div className="px-4 py-2">
                                    <p className="text-[10px] text-uhuru-text-muted ">Capture new opportunities quickly.</p>
                                </div>
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
