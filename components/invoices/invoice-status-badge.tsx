'use client';

import { useState } from 'react';
import { updateInvoiceStatus } from '@/app/actions/invoicing';
import { Check } from 'lucide-react';

const INVOICE_STATUSES = [
    { value: 'DRAFT', label: 'Draft', color: 'bg-slate-800 text-slate-400 border-white/5' },
    { value: 'PENDING', label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'SENT', label: 'Sent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'PAID', label: 'Paid', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
];

interface InvoiceStatusBadgeProps {
    invoiceId: string;
    currentStatus: string;
}

export function InvoiceStatusBadge({ invoiceId, currentStatus }: InvoiceStatusBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const currentStatusConfig = INVOICE_STATUSES.find(s => s.value === status) || INVOICE_STATUSES[0];

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) {
            setIsOpen(false);
            return;
        }

        setIsUpdating(true);
        try {
            const result = await updateInvoiceStatus(invoiceId, newStatus);
            if (result.success) {
                setStatus(newStatus);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all hover:scale-105 ${currentStatusConfig.color} ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
                {isUpdating ? 'Updating...' : currentStatusConfig.label}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-700 bg-slate-800/50">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Change Status</p>
                        </div>
                        <div className="p-1 max-h-64 overflow-y-auto">
                            {INVOICE_STATUSES.map((statusOption) => (
                                <button
                                    key={statusOption.value}
                                    onClick={() => handleStatusChange(statusOption.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group ${status === statusOption.value
                                            ? `${statusOption.color} border`
                                            : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <span>{statusOption.label}</span>
                                    {status === statusOption.value && (
                                        <Check size={14} className="text-current" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Export the status config for use in other components
export { INVOICE_STATUSES };
