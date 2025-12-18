import { prisma } from '@/lib/prisma';
import { KanbanBoard } from '@/components/crm/kanban-board';
import { ContactList } from '@/components/crm/contact-list';
import { OrganizationList } from '@/components/crm/organization-list';
import { LeadList } from '@/components/crm/lead-list';
import { TaskList } from '@/components/crm/task-list';
import { CRMHeaderActions } from '@/components/crm/crm-header-actions';
import { CRMToolbar } from '@/components/crm/crm-toolbar';
import { Users, Wallet, ClipboardList, Target, TrendingUp, MoreVertical, Phone, Mail, Video, MessageSquare } from 'lucide-react';

export default async function CRMPage({
    searchParams
}: {
    searchParams: { view?: string, q?: string }
}) {
    const view = searchParams.view || 'pipeline';
    const query = searchParams.q || '';

    // Data Fetching with Search Support
    const searchFilter = query ? {
        OR: [
            { name: { contains: query, mode: 'insensitive' } as any },
            { email: { contains: query, mode: 'insensitive' } as any }
        ]
    } : {};

    const leadsCount = await prisma.lead.count({ where: { status: 'NEW' } });
    const pendingTasksCount = await prisma.task.count({ where: { completed: false } });

    const deals = await prisma.deal.findMany({
        where: query ? { title: { contains: query, mode: 'insensitive' } } : {},
        include: { organization: true }
    });

    const organizations = await prisma.organization.findMany({
        where: query ? { name: { contains: query, mode: 'insensitive' } } : {},
    });

    const contacts = await prisma.contact.findMany({
        where: query ? { name: { contains: query, mode: 'insensitive' } } : {},
        include: { organization: true }
    });

    const leads = await prisma.lead.findMany({
        where: query ? { name: { contains: query, mode: 'insensitive' } } : {},
        orderBy: { createdAt: 'desc' }
    });

    const tasks = await prisma.task.findMany({
        where: {
            completed: false,
            ...(query ? { title: { contains: query, mode: 'insensitive' } } : {})
        },
        include: { assignedTo: true },
        orderBy: { dueDate: 'asc' }
    });

    const activities = await prisma.activity.findMany({
        include: { contact: true },
        orderBy: { date: 'desc' },
        take: 5
    });

    // Calculate Pipeline Total Value
    const pipelineValue = deals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const wonDealsValue = deals.filter(d => d.stage === 'WON').reduce((sum, d) => sum + Number(d.amount || 0), 0);

    return (
        <div className="p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">CRM Command Center</h1>
                    <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Operational Excellence & Relationship Management</p>
                </div>
                <CRMHeaderActions organizations={organizations} />
            </header>

            {/* DARK SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Pipeline Value */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Target size={22} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white"><MoreVertical size={18} /></button>
                    </div>
                    <label className="text-uhuru-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Total Pipeline</label>
                    <p className="text-3xl font-bold text-white tracking-tight">£{pipelineValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <div className="mt-4 flex items-center text-[10px] text-indigo-400 font-bold bg-indigo-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <span>{deals.length} active deals</span>
                    </div>
                </div>

                {/* 2. New Leads */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Users size={22} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white"><MoreVertical size={18} /></button>
                    </div>
                    <label className="text-uhuru-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">New Leads</label>
                    <p className="text-3xl font-bold text-white tracking-tight">{leadsCount}</p>
                    <div className="mt-4 flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <TrendingUp size={10} className="mr-1" />
                        <span>Ready for contact</span>
                    </div>
                </div>

                {/* 3. Pending Tasks */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-amber-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                            <ClipboardList size={22} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white"><MoreVertical size={18} /></button>
                    </div>
                    <label className="text-uhuru-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">CRM Tasks</label>
                    <p className="text-3xl font-bold text-white tracking-tight">{pendingTasksCount}</p>
                    <div className="mt-4 flex items-center text-[10px] text-amber-400 font-bold bg-amber-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <span>Items to review</span>
                    </div>
                </div>

                {/* 4. Conversion */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                            <Wallet size={22} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white"><MoreVertical size={18} /></button>
                    </div>
                    <label className="text-uhuru-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Value Won</label>
                    <p className="text-3xl font-bold text-white tracking-tight">£{wonDealsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <div className="mt-4 flex items-center text-[10px] text-purple-400 font-bold bg-purple-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <span>Closed successful</span>
                    </div>
                </div>
            </div>

            {/* Toolbar Area */}
            <CRMToolbar />

            {/* CONTENT AREA */}
            <div className="flex-1 min-h-[500px]">
                {view === 'pipeline' && <KanbanBoard deals={deals} organizations={organizations} />}
                {view === 'leads' && <LeadList leads={leads} organizations={organizations} />}
                {view === 'contacts' && <ContactList contacts={contacts} />}
                {view === 'organizations' && <OrganizationList organizations={organizations} />}
                {view === 'tasks' && <TaskList tasks={tasks} />}
            </div>

            {/* LOWER FEED SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-uhuru-border">
                {/* Recent Activities Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <TrendingUp size={20} />
                            </div>
                            Recent Interactions
                        </h3>
                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">View All Activity</button>
                    </div>

                    <div className="space-y-4">
                        {activities.map((act) => (
                            <div key={act.id} className="bg-uhuru-card/50 p-5 rounded-2xl border border-uhuru-border flex items-start gap-4 hover:bg-uhuru-card transition-all group">
                                <div className={`p-2.5 rounded-xl border ${act.type === 'CALL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        act.type === 'EMAIL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    }`}>
                                    {act.type === 'CALL' ? <Phone size={18} /> :
                                        act.type === 'EMAIL' ? <Mail size={18} /> :
                                            <Video size={18} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white text-sm">
                                                {act.type} with {act.contact?.name || 'Client'}
                                            </p>
                                            <p className="text-uhuru-text-dim text-xs mt-0.5">{act.notes}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full uppercase">
                                            {new Date(act.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="py-12 text-center bg-uhuru-card/20 rounded-2xl border border-dashed border-uhuru-border">
                                <MessageSquare className="mx-auto mb-3 opacity-10 text-white" size={32} />
                                <p className="text-uhuru-text-dim text-sm italic">No recent interactions logged.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Mini-Stats */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">Pipeline Summary</h3>
                    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-6 rounded-3xl border border-indigo-500/20">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-uhuru-text-muted uppercase tracking-widest mb-2">
                                    <span>Winning Rate</span>
                                    <span className="text-emerald-400 font-mono">72%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '72%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-uhuru-text-muted uppercase tracking-widest mb-2">
                                    <span>Quota Progress</span>
                                    <span className="text-indigo-400 font-mono">£45k / £100k</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-uhuru-card border border-uhuru-border rounded-2xl">
                        <p className="text-xs text-uhuru-text-dim italic font-medium">"Efficiency is doing things right; effectiveness is doing the right things."</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
