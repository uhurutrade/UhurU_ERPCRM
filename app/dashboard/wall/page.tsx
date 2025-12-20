import { prisma } from "@/lib/prisma";
import { format, addYears, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { FileText, Calendar, ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, Lock, Unlock, Upload } from "lucide-react";
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

export default async function UhuruWallPage() {
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

    // 2. Fetch Strategic Documents from Basket
    const strategicDocs = await prisma.complianceDocument.findMany({
        where: {
            documentType: 'BASKET',
            isSuperseded: false,
            NOT: {
                extractedData: {
                    path: ['isRelevant'],
                    equals: false
                }
            }
        } as any,
        orderBy: { uploadedAt: 'desc' },
        take: 5
    }) as any[];

    // 3. Calculate Fiscal Years
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
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-0 overflow-hidden">
            <header className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Uhuru Wall</h1>
                <p className="text-uhuru-text-muted mt-1 text-sm sm:text-base">Global strategic overview of performance and fiscal obligations</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Wall of Info */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-[10px] font-black text-uhuru-text-dim uppercase tracking-[0.2em] mb-4">Strategic Notice Wall</h2>

                    {/* Notice 1 */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                                <AlertCircle size={24} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-[10px] font-bold text-indigo-400 rounded uppercase">Urgent</span>
                                    <h3 className="font-bold text-white">Upcoming VAT Quarter End</h3>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Based on your current transaction volume in the General Ledger, your estimated VAT liability for the period ending March 31st is <strong className="text-white">£12,450.20</strong>. Ensure all invoices are linked before submission.
                                </p>
                                <div className="pt-3 flex gap-4">
                                    <div className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">Due in 12 days</div>
                                    <div className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">Source: Companies House Feed</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real Doc Basket Insights */}
                    {strategicDocs.length > 0 ? (
                        strategicDocs.map((doc) => (
                            <div key={doc.id} className="bg-uhuru-card border border-uhuru-border rounded-3xl p-4 sm:p-6 shadow-lg hover:border-emerald-500/30 transition-all overflow-hidden">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                        <FileText size={20} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-[10px] font-bold text-emerald-400 rounded uppercase">Doc Basket Insight</span>
                                            <h3 className="font-bold text-white leading-tight break-words">{doc.filename}</h3>
                                            {(doc.extractedData as any)?.vatLiability?.mustCharge && (
                                                <span className="px-2 py-0.5 bg-amber-500/10 text-[10px] font-bold text-amber-500 rounded uppercase">VAT Notice</span>
                                            )}
                                        </div>
                                        {doc.strategicInsights ? (
                                            <p className="text-sm text-slate-300 leading-relaxed mt-2 bg-slate-900/40 p-3 rounded-xl border border-white/5 break-words">
                                                {doc.strategicInsights}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-uhuru-text-dim mt-2">
                                                Uploaded on {format(doc.uploadedAt, 'MMM d, yyyy')}. Queued for AI strategic analysis.
                                            </p>
                                        )}
                                        {(doc.extractedData as any)?.vatLiability && (
                                            <p className="text-[10px] text-uhuru-text-dim mt-2 italic">
                                                VAT Context: {(doc.extractedData as any).vatLiability.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-uhuru-card border border-uhuru-border border-dashed rounded-3xl p-8 text-center">
                            <p className="text-uhuru-text-dim text-sm italic">No strategic documents in the basket yet.</p>
                        </div>
                    )}
                </div>

                {/* Side Status */}
                <div className="space-y-6">
                    <div className="bg-uhuru-card border border-uhuru-border rounded-[2rem] p-6 space-y-4">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Entity Health Score</h4>
                        <div className="flex items-center gap-4">
                            <div className="text-4xl font-black text-indigo-400">94<span className="text-lg opacity-50">/100</span></div>
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 w-[94%]" />
                            </div>
                        </div>
                        <p className="text-[10px] text-uhuru-text-dim leading-relaxed">
                            Excellent compliance data. Link the 4 unassigned expenses from Monday to reach 98%.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/doc-basket"
                        className="block bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-3xl group shadow-lg shadow-indigo-600/20 hover:scale-[1.02] transition-all overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Upload size={60} />
                        </div>
                        <h4 className="text-white font-bold mb-1">Upload to Basket</h4>
                        <p className="text-indigo-100 text-xs opacity-80">Nourish the wall with more intel</p>
                    </Link>
                </div>
            </div>

            <div className="pt-4 border-t border-uhuru-border">
                <h2 className="text-[10px] font-black text-uhuru-text-dim uppercase tracking-[0.2em] mb-6">Historic Financial Statements</h2>
            </div>
            {years.map((fy) => (
                <div
                    key={fy.id}
                    className="group relative bg-uhuru-card border border-uhuru-border rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-uhuru-accent-blue/40 hover:shadow-glow overflow-hidden"
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
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 break-all overflow-hidden">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 flex-1 opacity-80 group-hover:opacity-100 transition-opacity">

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
    );
}
