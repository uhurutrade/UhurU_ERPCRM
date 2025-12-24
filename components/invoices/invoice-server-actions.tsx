'use server';

import { deleteInvoice, restoreInvoice } from '@/app/actions/invoicing';
import { Trash2, Upload } from 'lucide-react';

export async function InvoiceDeleteButton({ id }: { id: string }) {
    return (
        <form action={async () => { 'use server'; await deleteInvoice(id); }}>
            <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Move to Trash">
                <Trash2 size={16} />
            </button>
        </form>
    );
}

export async function InvoiceRestoreButton({ id }: { id: string }) {
    return (
        <form action={async () => { 'use server'; await restoreInvoice(id); }}>
            <button className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Restore">
                <Upload className="rotate-0" size={16} />
            </button>
        </form>
    );
}
