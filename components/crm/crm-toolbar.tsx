'use client';

import { Search, Filter, LayoutGrid, Users, ClipboardList, Building2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export function CRMToolbar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const currentView = searchParams.get('view') || 'pipeline';

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const views = [
        { id: 'pipeline', label: 'Pipeline', icon: LayoutGrid },
        { id: 'leads', label: 'Leads', icon: Users },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'organizations', label: 'Organizations', icon: Building2 },
        { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    ];

    return (
        <div className="bg-slate-900/40 p-1.5 rounded-2xl border border-uhuru-border flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500 overflow-hidden">
            {/* View Switcher */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1 w-full md:w-auto">
                {views.map((view) => (
                    <Link
                        key={view.id}
                        href={`/dashboard/crm?view=${view.id}`}
                        className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${currentView === view.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <view.icon size={16} />
                        <span className={view.id === 'organizations' ? 'hidden sm:inline' : 'inline'}>
                            {view.id === 'organizations' ? 'Orgs' : view.label}
                        </span>
                        <span className={view.id === 'organizations' ? 'sm:hidden' : 'hidden'}>Orgs</span>
                    </Link>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 px-3 md:border-l md:border-slate-800 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('q') || ''}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors w-full md:w-64"
                    />
                </div>
                <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all hover:border-slate-600 shrink-0">
                    <Filter size={18} />
                </button>
            </div>
        </div>
    );
}
