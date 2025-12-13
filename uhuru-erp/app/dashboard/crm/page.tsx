import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { KanbanBoard } from '@/components/crm/kanban-board';
import { ContactList } from '@/components/crm/contact-list';
import { OrganizationList } from '@/components/crm/organization-list';
import { Plus } from 'lucide-react';

export default async function CRMPage({ searchParams }: { searchParams: { view?: string } }) {
    const view = searchParams.view || 'pipeline';

    const deals = await prisma.deal.findMany({
        include: { organization: true }
    });

    const organizations = await prisma.organization.findMany();
    const contacts = await prisma.contact.findMany({
        include: { organization: true }
    });

    return (
        <div className="p-8 max-w-[1920px] mx-auto h-screen flex flex-col">
            <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">CRM</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your deals, contacts, and organizations.</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/dashboard/crm?view=pipeline"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'pipeline' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Pipeline
                    </Link>
                    <Link
                        href="/dashboard/crm?view=contacts"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'contacts' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Contacts ({contacts.length})
                    </Link>
                    <Link
                        href="/dashboard/crm?view=organizations"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'organizations' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Organizations ({organizations.length})
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-hidden overflow-y-auto">
                {view === 'pipeline' && <KanbanBoard deals={deals} organizations={organizations} />}
                {view === 'contacts' && <ContactList contacts={contacts} />}
                {view === 'organizations' && <OrganizationList organizations={organizations} />}
            </div>
        </div>
    );
}
