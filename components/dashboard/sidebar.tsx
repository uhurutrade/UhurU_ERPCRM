"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Landmark,
    ShieldCheck,
    Building2,
    Settings,
    LogOut,
    FileText,
    Menu,
    X,
    BrainCircuit
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
    { href: "/dashboard/wall", label: "Uhuru Wall", icon: FileText, color: "text-pink-400" },
    { href: "/dashboard/crm", label: "CRM", icon: Users, color: "text-purple-400" },
    { href: "/dashboard/invoices", label: "Invoices", icon: Briefcase, color: "text-emerald-400" },
    { href: "/dashboard/banking", label: "General Ledger", icon: Landmark, color: "text-amber-400" },
    { href: "/dashboard/compliance", label: "Compliance (UK)", icon: ShieldCheck, color: "text-rose-400" },
    { href: "/dashboard/neural-reports", label: "Intelligence Reports", icon: BrainCircuit, color: "text-emerald-400" },
    { href: "/dashboard/doc-basket", label: "Upload Doc Basket", icon: Briefcase, color: "text-indigo-400" },
    { href: "/dashboard/company-settings", label: "Company Settings", icon: Building2, color: "text-cyan-400" },
    { href: "/dashboard/bank-settings", label: "Bank Settings", icon: Settings, color: "text-indigo-400" },
];

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadAudits, setUnreadAudits] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/neural-audits/unread-count');
            const data = await response.json();
            if (data.count !== undefined) setUnreadAudits(data.count);
        } catch (error) {
            console.error('Failed to fetch unread audits:', error);
        }
    };

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        fetchUnreadCount();
        window.addEventListener('unread-audits-updated', fetchUnreadCount);
        return () => window.removeEventListener('unread-audits-updated', fetchUnreadCount);
    }, []);

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.removeItem('crm_unlocked');
        // Redirect to home page
        router.push('/');
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 right-4 z-[60] p-3 bg-uhuru-card border border-uhuru-border rounded-xl text-white shadow-lg active:scale-95 transition-transform"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 h-screen fixed left-0 top-0 flex flex-col 
                bg-uhuru-sidebar/95 backdrop-blur-xl border-r border-uhuru-border 
                z-50 transition-transform duration-300 ease-in-out
                md:translate-x-0
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="p-8 pb-4 flex justify-between items-center">
                    <Link href="/dashboard" className="flex flex-col items-center gap-1 transition-transform hover:scale-[1.02] active:scale-95 group w-full">
                        <img
                            src="/images/uhuru-logo.png"
                            alt="UhurU Logo"
                            className="h-16 w-auto object-contain drop-shadow-glow"
                        />
                        <h1 className="text-[13px] font-normal text-white/90 tracking-[0.25em] uppercase transition-colors group-hover:text-indigo-400">
                            Management Outlook
                        </h1>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 no-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive
                                        ? "bg-uhuru-card border border-uhuru-border shadow-glow"
                                        : "hover:bg-uhuru-hover/50 hover:translate-x-1"
                                    }
                  `}
                            >
                                <div className={`
                    p-2 rounded-lg bg-opacity-20 transition-all duration-300
                    ${isActive ? `${item.color.replace('text-', 'bg-')}/20 text-white` : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"}
                  `}>
                                    <Icon size={20} />
                                </div>
                                <span className={`
                    font-medium transition-colors
                    ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}
                  `}>
                                    {item.label}
                                </span>

                                {item.href === "/dashboard/neural-reports" && unreadAudits > 0 && (
                                    <div className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse">
                                        {unreadAudits}
                                    </div>
                                )}

                                {isActive && !(item.href === "/dashboard/neural-reports" && unreadAudits > 0) && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-uhuru-border mt-auto bg-black/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {userEmail?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                            <p className="text-xs text-uhuru-text-dim">Administrator</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-uhuru-border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-uhuru-text-dim transition-all duration-300 text-sm font-medium group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
