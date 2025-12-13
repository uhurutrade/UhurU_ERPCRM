'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
    const organizationId = formData.get('organizationId') as string;
    const dateStr = formData.get('date') as string;
    const dueDateStr = formData.get('dueDate') as string;
    const itemsJson = formData.get('items') as string;

    if (!organizationId) return { error: 'Customer is required' };

    try {
        const items = JSON.parse(itemsJson);
        const date = new Date(dateStr || Date.now());
        const dueDate = new Date(dueDateStr || Date.now());

        // Calculate totals
        const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
        const taxRate = 20; // Hardcoded 20% VAT for MVP
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        // Generate Invoice Number (Simple Auto-increment logic or random for MVP)
        const count = await prisma.invoice.count();
        const number = `INV-${String(count + 1).padStart(4, '0')}`;

        await prisma.invoice.create({
            data: {
                number,
                date,
                dueDate,
                status: 'DRAFT',
                organizationId,
                subtotal,
                taxRate,
                taxAmount,
                total,
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

        revalidatePath('/dashboard/erp');
        return { success: true };

    } catch (error) {
        console.error(error);
        return { error: 'Failed to create invoice' };
    }
}
