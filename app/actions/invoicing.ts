'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper to get next number for a prefix
export async function getNextNumberForPrefix(prefix: string) {
    // Find last invoice with this prefix
    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            number: {
                startsWith: prefix
            }
        },
        orderBy: {
            createdAt: 'desc' // We can't strictly order by 'number' string easily if length varies, but for same prefix usually works. 
            // Better to fetch all or use a regex? 
            // For simplicity and performance, lets fetch the last created one which *should* have the highest number 
            // OR fetch all numbers with this prefix to be safe.
        }
    });

    if (!lastInvoice) return 1;

    // Try to extract number. 
    // Assuming format PREFIX + NUMBER
    const existingNumPart = lastInvoice.number.replace(prefix, '');
    const num = parseInt(existingNumPart);

    if (isNaN(num)) return 1; // Fallback

    // We strictly want the next available, but simplest is max + 1.
    // However, if we deleted the last one? 
    // User said "numerically available".
    // If we want to fill gaps it's harder. Standard is Max + 1.
    // Let's do Max + 1 of ALL existing invoices with that prefix to be safe against deletedAt (soft deleted are still in DB but marked deleted).
    // The previous findFirst included soft-deleted ones (as we didn't filter `deletedAt: null`).
    // Which is CORRECT per user request "numerically unique in the whole system".

    // To be absolutely sure of MAX, let's find the one with the highest number, not just latest created.
    // Fetching all might be heavy if thousands. 
    // Let's trust 'latest created' has highest number mostly, OR to be safe, find specifically.

    const allWithPrefix = await prisma.invoice.findMany({
        where: { number: { startsWith: prefix } },
        select: { number: true }
    });

    let max = 0;
    allWithPrefix.forEach(inv => {
        const n = parseInt(inv.number.replace(prefix, ''));
        if (!isNaN(n) && n > max) max = n;
    });

    return max + 1;
}

export async function createInvoice(formData: FormData) {
    const organizationId = formData.get('organizationId') as string;
    const isNewCustomer = formData.get('isNewCustomer') === 'true';

    // Prefix logic
    const customPrefix = (formData.get('invoicePrefix') as string || 'INV-').toUpperCase();

    // New Customer Fields
    const newCustomerName = formData.get('newCustomerName') as string;
    const newCustomerEmail = formData.get('newCustomerEmail') as string;
    const newCustomerAddress = formData.get('newCustomerAddress') as string;
    const newCustomerTaxId = formData.get('newCustomerTaxId') as string;
    const newCustomerContact = formData.get('newCustomerContact') as string;

    const dateStr = formData.get('date') as string;
    const dueDateStr = formData.get('dueDate') as string;
    const itemsJson = formData.get('items') as string;
    const notes = formData.get('notes') as string;
    const footerNote = formData.get('footerNote') as string;
    const bankAccountId = formData.get('bankAccountId') as string;
    const cryptoWalletId = formData.get('cryptoWalletId') as string;
    const currency = formData.get('currency') as string || 'GBP';

    if (!isNewCustomer && !organizationId) return { error: 'Customer is required' };
    if (isNewCustomer && !newCustomerName) return { error: 'New Customer Name is required' };

    try {
        const items = JSON.parse(itemsJson);
        const date = new Date(dateStr || Date.now());
        const dueDate = new Date(dueDateStr || Date.now());

        // Calculate totals
        const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
        // Tax logic (0 for now as requested/discussed, but prepared for future)
        const taxRate = 0;
        const taxAmount = 0;
        const total = subtotal + taxAmount;

        await prisma.$transaction(async (tx) => {
            let finalOrgId = organizationId;

            // 1. Handle New Customer Creation
            if (isNewCustomer) {
                const newOrg = await tx.organization.create({
                    data: {
                        name: newCustomerName,
                        email: newCustomerEmail,
                        address: newCustomerAddress,
                        taxId: newCustomerTaxId,
                        isBillable: true, // Auto-mark as billable
                        contacts: newCustomerContact ? {
                            create: {
                                name: newCustomerContact,
                                email: newCustomerEmail, // Fallback to company email
                                isClient: true
                            }
                        } : undefined
                    }
                });
                finalOrgId = newOrg.id;
            }

            // 2. Calculate Next Invoice Number based on Prefix
            // We do this INSIDE the transaction to minimize race conditions, 
            // though Prisma doesn't lock purely on reads unless we use raw SQL locking.
            // For this scale, a second check is usually fine.

            // Re-calculate max inside transaction to be safe
            const allWithPrefix = await tx.invoice.findMany({
                where: { number: { startsWith: customPrefix } },
                select: { number: true }
            });

            let max = 0;
            allWithPrefix.forEach(inv => {
                const n = parseInt(inv.number.replace(customPrefix, ''));
                if (!isNaN(n) && n > max) max = n;
            });
            const nextNum = max + 1;

            // Pad with zeros to at least 3 digits? User didn't strictly specify padding, but "001" implies it.
            // Let's pad to 3 chars.
            const paddedNum = nextNum.toString().padStart(3, '0');
            const number = `${customPrefix}${paddedNum}`;

            // (Optional) Update global settings if we want to track 'last used' generic counter, 
            // but since we switched to per-prefix, the global counter is less relevant 
            // unless the prefix matches the global default. 
            // Let's leave global settings alone for custom prefixes to avoid confusion.

            // 4. Create Invoice
            await tx.invoice.create({
                data: {
                    number,
                    date,
                    dueDate,
                    status: 'DRAFT',
                    organizationId: finalOrgId,
                    subtotal,
                    taxRate,
                    taxAmount,
                    total,
                    currency,
                    notes,
                    footerNote,
                    bankAccountId: bankAccountId || null,
                    cryptoWalletId: cryptoWalletId || null,
                    items: {
                        create: items.map((item: any) => ({
                            description: item.description,
                            quantity: Number(item.quantity),
                            unitPrice: Number(item.unitPrice),
                            total: Number(item.quantity) * Number(item.unitPrice)
                        }))
                    }
                }
            });
        });

        // Trigger RAG Sync (Background)
        const { triggerInvoiceSync } = await import('@/lib/ai/auto-sync-rag');
        triggerInvoiceSync();

        revalidatePath('/dashboard/invoices');
        return { success: true };

    } catch (error) {
        console.error("Invoice Creation Error:", error);
        return { error: 'Failed to create invoice' };
    }
}


export async function updateInvoice(id: string, formData: FormData) {
    const organizationId = formData.get('organizationId') as string;
    const dateStr = formData.get('date') as string;
    const dueDateStr = formData.get('dueDate') as string;
    const itemsJson = formData.get('items') as string;
    const notes = formData.get('notes') as string;
    const footerNote = formData.get('footerNote') as string;
    const bankAccountId = formData.get('bankAccountId') as string;
    const cryptoWalletId = formData.get('cryptoWalletId') as string;
    const currency = formData.get('currency') as string;
    const status = formData.get('status') as string;
    const customPrefix = formData.get('invoicePrefix') as string;

    try {
        const items = JSON.parse(itemsJson);
        const date = new Date(dateStr);
        const dueDate = new Date(dueDateStr);

        // check if deleted or not draft
        const existing = await prisma.invoice.findUnique({ where: { id } });
        if (!existing) return { error: 'Invoice not found' };
        if (existing.deletedAt) return { error: 'Cannot edit deleted invoice' };
        if (existing.status !== 'DRAFT') return { error: 'Only DRAFT invoices can be edited. Mark as PAID or SENT to change status, but use Draft for content changes.' };

        const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
        const taxRate = 0;
        const taxAmount = 0;
        const total = subtotal + taxAmount;

        await prisma.$transaction(async (tx) => {
            // Determine Number Update
            let newNumber = undefined;
            if (customPrefix && existing) {
                // Check if prefix actually changed. 
                // We use StartsWith to check. 
                // If existing is INV-001 and customPrefix is INV-, it matches.
                // But wait, if existing is INV-001 and user sends INV-, we shouldn't change it.
                // If user sends TEST-, we change.

                // Be careful: existing.number "INV-001". customPrefix "INV-". 
                // If existing.number.startsWith(customPrefix), we MIGHT keeping it or not.
                // The issue is if the user wants to FORCE a re-numbering even with same prefix? Unlikely.
                // Typically re-numbering happens only on prefix change.

                if (!existing.number.startsWith(customPrefix)) {
                    // Prefix changed, calculate new number!
                    const allWithPrefix = await tx.invoice.findMany({
                        where: { number: { startsWith: customPrefix } },
                        select: { number: true }
                    });

                    let max = 0;
                    allWithPrefix.forEach(inv => {
                        const n = parseInt(inv.number.replace(customPrefix, ''));
                        if (!isNaN(n) && n > max) max = n;
                    });
                    const nextNum = max + 1;
                    const paddedNum = nextNum.toString().padStart(3, '0');
                    newNumber = `${customPrefix}${paddedNum}`;
                }
            }

            // Delete existing items
            await tx.invoiceItem.deleteMany({
                where: { invoiceId: id }
            });

            // Update main invoice
            await tx.invoice.update({
                where: { id },
                data: {
                    number: newNumber, // Only updates if defined
                    date,
                    dueDate,
                    organizationId,
                    status: status || existing?.status,
                    subtotal,
                    taxRate,
                    taxAmount,
                    total,
                    currency,
                    notes,
                    footerNote,
                    bankAccountId: bankAccountId || null,
                    cryptoWalletId: cryptoWalletId || null,
                    items: {
                        create: items.map((item: any) => ({
                            description: item.description,
                            quantity: Number(item.quantity),
                            unitPrice: Number(item.unitPrice),
                            total: Number(item.quantity) * Number(item.unitPrice)
                        }))
                    }
                }
            });
        });

        // Trigger RAG Sync (Background)
        const { triggerInvoiceSync } = await import('@/lib/ai/auto-sync-rag');
        triggerInvoiceSync();

        revalidatePath('/dashboard/invoices');
        revalidatePath(`/invoice-pdf/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Invoice Update Error:", error);
        return { error: 'Failed to update invoice' };
    }
}

export async function updateInvoiceStatus(id: string, status: string) {
    try {
        await prisma.invoice.update({
            where: { id },
            data: { status }
        });
        revalidatePath('/dashboard/invoices');

        // Trigger RAG Sync (Background)
        const { triggerInvoiceSync } = await import('@/lib/ai/auto-sync-rag');
        triggerInvoiceSync();

        return { success: true };
    } catch (error) {
        return { error: 'Failed to update status' };
    }
}

export async function deleteInvoice(id: string) {
    try {
        // Soft delete
        await prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        revalidatePath('/dashboard/invoices');

        // Trigger RAG Sync (Background)
        const { triggerInvoiceSync } = await import('@/lib/ai/auto-sync-rag');
        triggerInvoiceSync();

        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { error: 'Failed to move invoice to trash' };
    }
}

export async function restoreInvoice(id: string) {
    try {
        await prisma.invoice.update({
            where: { id },
            data: { deletedAt: null }
        });
        revalidatePath('/dashboard/invoices');

        // Trigger RAG Sync (Background)
        const { triggerInvoiceSync } = await import('@/lib/ai/auto-sync-rag');
        triggerInvoiceSync();

        return { success: true };
    } catch (error) {
        console.error("Restore Error:", error);
        return { error: 'Failed to restore invoice' };
    }
}
export async function linkInvoiceToTransaction(invoiceId: string, transactionId: string) {
    try {
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                bankTransactionId: transactionId,
                status: 'PAID' // Automatically mark as paid if linked? User said "when marked as paid... suggest association". 
                // Alternatively, association implies paid.
            }
        });
        revalidatePath('/dashboard/invoices');
        revalidatePath('/dashboard/banking');

        // Trigger RAG Sync (Background)
        const { triggerInvoiceSync, triggerBankingSync } = await import('@/lib/ai/auto-sync-rag');
        triggerInvoiceSync();
        triggerBankingSync();

        return { success: true };
    } catch (error) {
        console.error("Link Error:", error);
        return { error: 'Failed to link invoice' };
    }
}
