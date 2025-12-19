'use client';

import { useState } from 'react';
import { Trash2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { deleteAttachment } from '@/app/actions/invoices';
import { toast } from 'sonner';
import { useConfirm } from '@/components/providers/modal-provider';
import { useRouter } from 'next/navigation';

export function DeleteAttachmentButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { confirm } = useConfirm();
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const ok = await confirm({
            title: 'Delete Document',
            message: 'Are you sure you want to permanently delete this document?',
            type: 'danger'
        });

        if (!ok) return;

        setIsDeleting(true);
        try {
            const res = await deleteAttachment(id);
            if (res.success) {
                toast.success('Document deleted');
                router.refresh();
            } else {
                toast.error('Failed to delete: ' + res.error);
            }
        } catch (err) {
            toast.error('Error deleting');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-uhuru-text-dim hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete Document"
        >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}

export function LinkAttachmentButton({ id, hasTransaction }: { id: string, hasTransaction: boolean }) {
    if (hasTransaction) return null;

    return (
        <button
            onClick={() => window.location.href = `/dashboard/banking?action=link&attachmentId=${id}`}
            className="p-1.5 text-uhuru-text-dim hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
            title="Link to General Ledger"
        >
            <LinkIcon size={16} />
        </button>
    );
}
