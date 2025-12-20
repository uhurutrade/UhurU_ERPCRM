"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { format } from "date-fns";
import { Search, Eye, AlertCircle, Paperclip } from "lucide-react";
import { DeletedTransaction } from "@prisma/client";

interface AuditLogTableProps {
    logs: DeletedTransaction[];
}

export function AuditLogTable({
    logs,
    totalPages = 1,
    currentPage = 1
}: {
    logs: DeletedTransaction[],
    totalPages?: number,
    currentPage?: number
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('query')?.toString() || "");
    const [selectedLog, setSelectedLog] = useState<DeletedTransaction | null>(null);

    // Sync search with URL (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchTerm) {
                params.set('query', searchTerm);
            } else {
                params.delete('query');
            }
            params.set('page', '1'); // Reset to page 1 on search
            router.replace(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, pathname, router]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search audit log..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800 text-slate-200 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Deleted At</th>
                            <th className="px-6 py-4 hidden md:table-cell">Original Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 hidden md:table-cell">Deleted By</th>
                            <th className="px-6 py-4 hidden md:table-cell">Values</th>
                            <th className="px-6 py-4 text-center hidden md:table-cell">📎</th>
                            <th className="px-6 py-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900 shadow-inner">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800 transition-colors h-[65px]">
                                <td className="px-6 py-4 whitespace-nowrap text-rose-400 font-mono">
                                    {format(new Date(log.deletedAt), "dd/MM/yyyy HH:mm")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 hidden md:table-cell">
                                    {format(new Date(log.date), "dd/MM/yyyy")}
                                </td>
                                <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                                    {log.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-white">
                                    {Number(log.amount).toLocaleString()} {log.currency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    {log.deletedBy}
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                    <div className="flex flex-col text-xs">
                                        <span className="text-emerald-400 font-bold">{log.bankName}</span>
                                        <span className="text-slate-500">{log.bankAccountName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center hidden md:table-cell">
                                    {(() => {
                                        try {
                                            const snapshot = JSON.parse(log.fullSnapshot || "{}");
                                            const hasAttachments = snapshot.attachments && snapshot.attachments.length > 0;
                                            return hasAttachments ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Paperclip size={16} className="text-emerald-400" />
                                                    <span className="text-xs text-slate-400">{snapshot.attachments.length}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            );
                                        } catch {
                                            return <span className="text-slate-600">-</span>;
                                        }
                                    })()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedLog(log)}
                                        className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-600 shadow-lg"
                                        title="View Snapshot"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {/* Dummy Rows to fill 20 slots */}
                        {Array.from({ length: Math.max(0, 20 - logs.length) }).map((_, i) => (
                            <tr key={`dummy-${i}`} className="divide-y divide-slate-800/10 h-[65px]">
                                <td className="px-6 py-4">&nbsp;</td>
                                <td className="px-6 py-4 hidden md:table-cell">&nbsp;</td>
                                <td className="px-6 py-4">
                                    {logs.length === 0 && i === 10 && (
                                        <div className="text-center text-slate-600 italic">No deleted transactions found.</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">&nbsp;</td>
                                <td className="px-6 py-4 hidden md:table-cell">&nbsp;</td>
                                <td className="px-6 py-4 hidden md:table-cell">&nbsp;</td>
                                <td className="px-6 py-4 text-center hidden md:table-cell">&nbsp;</td>
                                <td className="px-6 py-4 text-right">&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination --- */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400">
                        Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span>Go:</span>
                        <input
                            type="number"
                            min={1}
                            max={totalPages || 1}
                            defaultValue={currentPage}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = parseInt((e.target as HTMLInputElement).value);
                                    if (val >= 1 && val <= (totalPages || 1)) {
                                        handlePageChange(val);
                                    }
                                }
                            }}
                            className="w-10 bg-transparent text-white focus:outline-none text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-b border-slate-600 focus:border-emerald-500"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all border border-slate-700 w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
                        title="First Page"
                    >
                        &lt;&lt;
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all border border-slate-700 w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
                        title="Previous Page"
                    >
                        &lt;
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all border border-slate-700 w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
                        title="Next Page"
                    >
                        &gt;
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all border border-slate-700 w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
                        title="Last Page"
                    >
                        &gt;&gt;
                    </button>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertCircle className="text-rose-500" />
                                Deleted Transaction Details
                            </h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-800 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase mb-1">Deleted By</p>
                                    <p className="font-semibold text-white">{selectedLog.deletedBy}</p>
                                </div>
                                <div className="p-4 bg-slate-800 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase mb-1">Delete Reason</p>
                                    <p className="font-semibold text-white">{selectedLog.reason || "N/A"}</p>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            {(() => {
                                try {
                                    const snapshot = JSON.parse(selectedLog.fullSnapshot || "{}");
                                    const attachments = snapshot.attachments || [];

                                    if (attachments.length > 0) {
                                        return (
                                            <div className="p-4 bg-slate-800 rounded-lg">
                                                <p className="text-xs text-slate-400 uppercase mb-3 flex items-center gap-2">
                                                    <Paperclip size={14} />
                                                    Attachments ({attachments.length})
                                                </p>
                                                <div className="space-y-2">
                                                    {attachments.map((att: any, idx: number) => (
                                                        <a
                                                            key={idx}
                                                            href={`/uploads/${att.path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 p-2 bg-slate-900 rounded hover:bg-slate-700 transition-colors group"
                                                        >
                                                            <Paperclip size={14} className="text-emerald-400" />
                                                            <span className="text-sm text-slate-300 group-hover:text-white flex-1 truncate">
                                                                {att.originalName || att.path}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {att.fileType || 'file'}
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                } catch (e) {
                                    console.error("Error parsing attachments:", e);
                                }
                                return null;
                            })()}

                            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 overflow-auto max-h-60">
                                <p className="text-xs text-slate-500 mb-2 font-mono">FULL JSON SNAPSHOT</p>
                                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                                    {JSON.stringify(JSON.parse(selectedLog.fullSnapshot || "{}"), null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
