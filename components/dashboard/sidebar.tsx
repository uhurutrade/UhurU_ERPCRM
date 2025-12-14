"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Landmark,
    ShieldCheck,
    Building2,
    Settings,
    LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
    { href: "/dashboard/crm", label: "CRM", icon: Users, color: "text-purple-400" },
    { href: "/dashboard/erp", label: "ERP", icon: Briefcase, color: "text-emerald-400" },
    { href: "/dashboard/banking", label: "Banca", icon: Landmark, color: "text-amber-400" },
    { href: "/dashboard/compliance", label: "Compliance (UK)", icon: ShieldCheck, color: "text-rose-400" },
    { href: "/dashboard/company-settings", label: "Company Settings", icon: Building2, color: "text-cyan-400" },
    { href: "/dashboard/bank-settings", label: "Bank Settings", icon: Settings, color: "text-indigo-400" },
];

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
    const pathname = usePathname();

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 flex flex-col bg-uhuru-sidebar/80 backdrop-blur-xl border-r border-uhuru-border z-50">
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Management Outlook
                </h1>
                <p className="text-xs text-uhuru-text-dim mt-1 uppercase tracking-widest">
                    UhurU Trade Ltd
                </p>
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
                            {isActive && (
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
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-uhuru-border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-uhuru-text-dim transition-all duration-300 text-sm font-medium group"
                >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
