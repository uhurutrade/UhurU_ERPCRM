'use client';

import { Building2, Globe, MapPin, Trash2 } from 'lucide-react';
import { deleteOrganization } from '@/app/actions/crm';
import { useState } from 'react';
import { OrganizationDetailModal } from './modals/organization-detail-modal';
import { useConfirm } from '@/components/providers/modal-provider';

export function OrganizationList({ organizations }: { organizations: any[] }) {
    const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
    const { confirm } = useConfirm();

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        const ok = await confirm({
            title: "Delete Organization",
            message: "Are you sure you want to delete this organization? This may fail if there are associated records.",
            type: "danger"
        });

        if (ok) {
            const res = await deleteOrganization(id);
            if (res.error) alert(res.error);
        }
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
                <div
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className="bg-uhuru-card backdrop-blur-md rounded-2xl border border-uhuru-border p-6 group hover:border-emerald-500/30 transition-all duration-300 shadow-card cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{org.name}</h3>
                                <span className="text-[10px] text-uhuru-text-dim font-bold uppercase tracking-[0.1em]">{org.sector || 'General Business'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {org.website && (
                            <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                <Globe size={14} /> {org.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                        {org.address && (
                            <div className="flex items-center gap-2 text-xs text-uhuru-text-muted">
                                <MapPin size={14} /> {org.address}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-uhuru-border flex justify-between items-center">
                        <span className="text-[10px] text-uhuru-text-dim font-bold uppercase">Actions</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-white border border-slate-700 hover:bg-slate-700 transition-colors">Details</button>
                            <button
                                onClick={(e) => handleDelete(e, org.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {organizations.length === 0 && (
                <div className="col-span-full py-20 text-center text-uhuru-text-dim bg-uhuru-card/50 rounded-2xl border border-dashed border-uhuru-border">
                    <Building2 className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="font-medium ">Your organization directory is currently empty.</p>
                </div>
            )}

            <OrganizationDetailModal
                isOpen={!!selectedOrg}
                onClose={() => setSelectedOrg(null)}
                organization={selectedOrg}
            />
        </div>
    );
}
