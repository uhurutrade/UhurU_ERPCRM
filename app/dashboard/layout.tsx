import { auth, signOut } from "@/auth";

// CORRECCIÓN: Se ELIMINA la exportación 'navItems' de este archivo
// para cumplir con las restricciones del App Router de Next.js.

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth();

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 p-4 flex flex-col">
                <div className="text-xl font-bold mb-8 text-emerald-400">Management Outlook</div>

                <nav className="flex-1 space-y-2">
                    {/* Se mantienen los enlaces codificados, ya que la navegación visual no usa la variable navItems */}
                    <a href="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800">Dashboard</a>
                    <a href="/dashboard/crm" className="block px-4 py-2 rounded hover:bg-slate-800">CRM</a>
                    <a href="/dashboard/erp" className="block px-4 py-2 rounded hover:bg-slate-800">ERP</a>
                    <a href="/dashboard/banking" className="block px-4 py-2 rounded hover:bg-slate-800">Banca</a>
                    <a href="/dashboard/compliance" className="block px-4 py-2 rounded hover:bg-slate-800 text-slate-400">Cumplimiento (UK)</a>
                </nav>

                <div className="border-t border-slate-800 pt-4">
                    <div className="text-sm text-slate-400 mb-2">{session?.user?.email}</div>
                    <form action={async () => {
                        "use server"
                        await signOut();
                    }}>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded">
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
                {children}
            </main>
        </div>
    )
}
