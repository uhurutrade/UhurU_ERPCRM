'use client';

import { Building2, Globe, MapPin } from 'lucide-react';

export function OrganizationList({ organizations }: { organizations: any[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
                <div key={org.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{org.name}</h3>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{org.sector || 'Unknown Sector'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        {org.website && (
                            <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                <Globe size={16} /> {org.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                        {org.address && (
                            <div className="flex items-center gap-2 text-slate-500">
                                <MapPin size={16} /> {org.address}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {organizations.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    No organizations found.
                </div>
            )}
        </div>
    );
}
