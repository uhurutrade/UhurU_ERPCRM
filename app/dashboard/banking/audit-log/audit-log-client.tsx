'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AuditLogTable } from "@/components/banking/audit-log-table";
import { useConfirm } from "@/components/providers/modal-provider";
import { useRouter } from "next/navigation";

interface AuditLogClientProps {
    logs: any[];
    totalPages: number;
    currentPage: number;
}

export default function AuditLogClient({ logs, totalPages, currentPage }: AuditLogClientProps) {
    const { confirm } = useConfirm();
    const router = useRouter();
    const [isClearing, setIsClearing] = useState(false);

    const handleClearAuditLog = async () => {
        const confirmed = await confirm({
            title: 'Clear Audit Log',
            message: 'Are you sure you want to permanently delete all audit log entries? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Clear All',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        setIsClearing(true);
        try {
            const response = await fetch('/api/banking/audit-log/clear', {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                await confirm({
                    title: 'Error',
                    message: 'Failed to clear audit log. Please try again.',
                    type: 'danger',
                    confirmText: 'OK',
                    cancelText: ''
                });
            }
        } catch (error) {
            console.error('Error clearing audit log:', error);
            await confirm({
                title: 'Error',
                message: 'An error occurred while clearing the audit log.',
                type: 'danger',
                confirmText: 'OK',
                cancelText: ''
            });
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link
                        href="/dashboard/banking"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Banking
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Transaction Avoided</h1>
                            <p className="text-slate-400">
                                Audit log of all deleted financial transactions. These records are permanent and read-only.
                            </p>
                        </div>
                        <button
                            onClick={handleClearAuditLog}
                            disabled={isClearing || logs.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed"
                            title="Clear all audit log entries"
                        >
                            <Trash2 size={16} />
                            {isClearing ? 'Clearing...' : 'Clear Log'}
                        </button>
                    </div>
                </div>

                {/* Audit Table */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl">
                    <AuditLogTable
                        logs={logs}
                        totalPages={totalPages}
                        currentPage={currentPage}
                    />
                </div>
            </div>
        </div>
    );
}
