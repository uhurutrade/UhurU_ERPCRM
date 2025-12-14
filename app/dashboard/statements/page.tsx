import { prisma } from "@/lib/prisma";
import { format, addYears, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { FileText, Calendar, ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, Lock, Unlock } from "lucide-react";
import Link from "next/link";

interface FiscalYearData {
    id: string;
    year: string;
    startDate: Date;
    endDate: Date;
    isClosed: boolean;
    income: number;
    expenses: number;
    netProfit: number;
    transactionCount: number;
}

export default async function StatementsPage() {
    // 1. Fetch Company Settings to get incorporation date and YE
    // Note: We'll assume the first company found is the main one for now
    const companySettings = await prisma.companySettings.findFirst();

    if (!companySettings) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="p-4 bg-uhuru-card border border-uhuru-border rounded-full">
                    <AlertCircle className="w-12 h-12 text-uhuru-accent-orange" />
                </div>
                <h2 className="text-xl font-bold text-white">Company Settings Not Found</h2>
                <p className="text-uhuru-text-muted max-w-md">
                    To generate financial statements, we need to know your incorporation date and financial year end.
                </p>
                <Link
                    href="/dashboard/company-settings"
                    className="px-6 py-2 bg-uhuru-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Configure Company Settings
                </Link>
            </div>
        );
    }

    // 2. Calculate Fiscal Years
    const years: FiscalYearData[] = [];
    let currentStart = startOfDay(companySettings.incorporationDate);
    // Parse FYE string "DD-MM" if needed, but for simplicity, let's assume 1 year periods from incorporation
    // Or if financialYearEnd is set, adjust the first period. 
    // For MVP, consistent 12-month periods from incorporation date is a safe start, 
    // or standard UK tax year (April 6 - April 5) depending on user preference, 
    // but usually it's incorporation anniversary for Ltd companies initially.

    const today = new Date();

    // Generate years up to today
    while (isBefore(currentStart, today)) {
        const currentEnd = endOfDay(addYears(currentStart, 1)); // -1 day logically, but for query ease inclusive

        // Fetch transactions for this period
        const transactions = await prisma.bankTransaction.findMany({
            where: {
                date: {
                    gte: currentStart,
                    lt: currentEnd
                }
            }
        });

        const income = transactions
            .filter(t => Number(t.amount) > 0)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenses = transactions
            .filter(t => Number(t.amount) < 0)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        years.push({
            id: currentStart.toISOString(),
            year: `${format(currentStart, 'yyyy')} - ${format(currentEnd, 'yyyy')}`,
            startDate: currentStart,
            endDate: currentEnd,
            isClosed: isBefore(currentEnd, today),
            income,
            expenses,
            netProfit: income + expenses, // Expenses are negative
            transactionCount: transactions.length
        });

        currentStart = currentEnd;
    }

    // Reverse to show newest first
    years.reverse();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight">Financial Statements</h1>
                <p className="text-uhuru-text-muted mt-1">Historic overview of fiscal years and performance</p>
            </header>

            <div className="space-y-4">
                {years.map((fy) => (
                    <div
                        key={fy.id}
                        className="group relative bg-uhuru-card border border-uhuru-border rounded-2xl p-6 transition-all duration-300 hover:border-uhuru-accent-blue/40 hover:shadow-glow overflow-hidden"
                    >
                        {/* Status Indicator Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${fy.isClosed ? 'bg-uhuru-accent-purple' : 'bg-uhuru-accent-green'}`} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

                            {/* Header Section */}
                            <div className="min-w-[200px]">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`p-2 rounded-lg ${fy.isClosed ? 'bg-uhuru-accent-purple/10 text-uhuru-accent-purple' : 'bg-uhuru-accent-green/10 text-uhuru-accent-green'}`}>
                                        {fy.isClosed ? <Lock size={18} /> : <Unlock size={18} />}
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-uhuru-text-dim">
                                        {fy.isClosed ? 'Closed Fiscal Year' : 'Current Period'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    FY {fy.year}
                                </h3>
                                <p className="text-sm text-uhuru-text-muted mt-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {format(fy.startDate, 'MMM d, yyyy')} — {format(fy.endDate, 'MMM d, yyyy')}
                                </p>
                            </div>

                            {/* Stats Grid - Hidden on mobile, visible on lg, expandable? 
                                User asked for "hover" effect to show data. 
                                We'll make it partially visible and enhance on hover.
                            */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 opacity-80 group-hover:opacity-100 transition-opacity">

                                <div>
                                    <p className="text-xs text-uhuru-text-dim mb-1">Total Income</p>
                                    <p className="text-lg font-mono font-medium text-white flex items-center gap-1">
                                        <ArrowDownRight size={14} className="text-emerald-500" />
                                        {fy.income.toLocaleString(undefined, { style: 'currency', currency: 'GBP' })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-uhuru-text-dim mb-1">Total Expenses</p>
                                    <p className="text-lg font-mono font-medium text-white flex items-center gap-1">
                                        <ArrowUpRight size={14} className="text-rose-500" />
                                        {Math.abs(fy.expenses).toLocaleString(undefined, { style: 'currency', currency: 'GBP' })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-uhuru-text-dim mb-1">Net Profit</p>
                                    <p className={`text-lg font-mono font-bold flex items-center gap-1 ${fy.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <TrendingUp size={14} />
                                        {fy.netProfit.toLocaleString(undefined, { style: 'currency', currency: 'GBP' })}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-uhuru-text-dim mb-1">Volume</p>
                                    <p className="text-lg font-mono font-medium text-white">
                                        {fy.transactionCount} txs
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="hidden md:block">
                                <button className="p-3 bg-uhuru-base rounded-xl text-uhuru-text-muted hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-uhuru-border">
                                    <FileText size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Hover Detail Overlay (Visual flourish) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
}
