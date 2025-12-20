"use client";

import { useEffect, useState } from "react";

interface ComplianceDeadline {
    type: string;
    description: string;
    dueDate: string;
    daysUntil: number;
    status: "upcoming" | "urgent" | "overdue";
}

export default function ComplianceOverview() {
    const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplianceData();
    }, []);

    const fetchComplianceData = async () => {
        try {
            const response = await fetch("/api/company-settings");
            if (!response.ok) throw new Error("Failed to fetch company settings");

            const settings = await response.json();
            if (!settings) {
                setLoading(false);
                return;
            }

            const calculatedDeadlines: ComplianceDeadline[] = [];
            const today = new Date();

            // Accounts filing deadline
            if (settings.accountsNextDueDate) {
                const dueDate = new Date(settings.accountsNextDueDate);
                const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                calculatedDeadlines.push({
                    type: "Companies House",
                    description: "Annual Accounts Filing",
                    dueDate: dueDate.toLocaleDateString("en-GB"),
                    daysUntil,
                    status: daysUntil < 0 ? "overdue" : daysUntil < 30 ? "urgent" : "upcoming",
                });
            }

            // Confirmation statement deadline
            if (settings.confirmationNextDueDate) {
                const dueDate = new Date(settings.confirmationNextDueDate);
                const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                calculatedDeadlines.push({
                    type: "Companies House",
                    description: "Confirmation Statement",
                    dueDate: dueDate.toLocaleDateString("en-GB"),
                    daysUntil,
                    status: daysUntil < 0 ? "overdue" : daysUntil < 14 ? "urgent" : "upcoming",
                });
            }

            // VAT return (if registered)
            if (settings.vatRegistered && settings.vatReturnFrequency) {
                // Calculate next VAT return based on frequency
                const vatDueDate = calculateNextVATReturn(settings.vatReturnFrequency, settings.vatRegistrationDate);
                if (vatDueDate) {
                    const daysUntil = Math.ceil((vatDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    calculatedDeadlines.push({
                        type: "HMRC - VAT",
                        description: `VAT Return (${settings.vatReturnFrequency})`,
                        dueDate: vatDueDate.toLocaleDateString("en-GB"),
                        daysUntil,
                        status: daysUntil < 0 ? "overdue" : daysUntil < 7 ? "urgent" : "upcoming",
                    });
                }
            }

            // Corporation Tax (9 months after year end)
            if (settings.financialYearEnd) {
                const ctDueDate = calculateCorporationTaxDeadline(settings.financialYearEnd);
                if (ctDueDate) {
                    const daysUntil = Math.ceil((ctDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    calculatedDeadlines.push({
                        type: "HMRC - Corporation Tax",
                        description: "Corporation Tax Payment",
                        dueDate: ctDueDate.toLocaleDateString("en-GB"),
                        daysUntil,
                        status: daysUntil < 0 ? "overdue" : daysUntil < 30 ? "urgent" : "upcoming",
                    });
                }
            }

            // Sort by days until due
            calculatedDeadlines.sort((a, b) => a.daysUntil - b.daysUntil);
            setDeadlines(calculatedDeadlines);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching compliance data:", error);
            setLoading(false);
        }
    };

    const calculateNextVATReturn = (frequency: string, registrationDate: string | null) => {
        const today = new Date();

        if (frequency === "Quarterly") {
            // Quarters end: Mar 31, Jun 30, Sep 30, Dec 31
            const quarters = [
                { month: 2, day: 31 }, // March
                { month: 5, day: 30 }, // June
                { month: 8, day: 30 }, // September
                { month: 11, day: 31 }, // December
            ];

            for (const quarter of quarters) {
                const quarterEnd = new Date(today.getFullYear(), quarter.month, quarter.day);
                const vatDue = new Date(quarterEnd);
                vatDue.setMonth(vatDue.getMonth() + 1);
                vatDue.setDate(7); // VAT due 1 month and 7 days after quarter end

                if (vatDue > today) {
                    return vatDue;
                }
            }

            // If no quarter found this year, return first quarter of next year
            const nextYear = new Date(today.getFullYear() + 1, 2, 31);
            nextYear.setMonth(nextYear.getMonth() + 1);
            nextYear.setDate(7);
            return nextYear;
        }

        return null;
    };

    const calculateCorporationTaxDeadline = (yearEnd: string) => {
        // yearEnd format: "DD-MM"
        const [day, month] = yearEnd.split("-").map(Number);
        const today = new Date();

        // Find the most recent year end
        let yearEndDate = new Date(today.getFullYear(), month - 1, day);
        if (yearEndDate > today) {
            yearEndDate = new Date(today.getFullYear() - 1, month - 1, day);
        }

        // Corporation tax due 9 months and 1 day after year end
        const ctDue = new Date(yearEndDate);
        ctDue.setMonth(ctDue.getMonth() + 9);
        ctDue.setDate(ctDue.getDate() + 1);

        return ctDue;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "overdue":
                return "bg-rose-900/30 border-rose-500 text-rose-300";
            case "urgent":
                return "bg-amber-900/30 border-amber-500 text-amber-300";
            default:
                return "bg-emerald-900/30 border-emerald-500 text-emerald-300";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "overdue":
                return <span className="px-2 py-1 text-xs rounded bg-rose-500 text-white">OVERDUE</span>;
            case "urgent":
                return <span className="px-2 py-1 text-xs rounded bg-amber-500 text-white">URGENT</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded bg-emerald-500 text-white">OK</span>;
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <p className="text-slate-400">Loading compliance overview...</p>
            </div>
        );
    }

    if (deadlines.length === 0) {
        return (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Compliance Overview</h2>
                <p className="text-slate-400">
                    No compliance deadlines found. Please configure your company settings first.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Upcoming Compliance Deadlines</h2>
            <div className="space-y-3">
                {deadlines.map((deadline, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getStatusColor(deadline.status)}`}
                    >
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-slate-200 truncate">{deadline.type}</p>
                                <p className="text-slate-300 text-xs sm:text-sm break-words">{deadline.description}</p>
                            </div>
                            {getStatusBadge(deadline.status)}
                        </div>
                        <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                            <span className="text-slate-400 whitespace-nowrap">Due: {deadline.dueDate}</span>
                            <span className="font-mono text-xs sm:text-sm whitespace-nowrap">
                                {deadline.daysUntil < 0
                                    ? `${Math.abs(deadline.daysUntil)} days overdue`
                                    : `${deadline.daysUntil} days remaining`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
