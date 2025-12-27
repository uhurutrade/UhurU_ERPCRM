'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_CATEGORIES = [
    { name: 'Loans: In (Director)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'Fees: Bank Fees', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { name: 'Sales: Amazon Sales', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Sales: Consulting Income', color: 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20' },
    { name: 'Operating: Hosting', color: 'bg-slate-600/10 text-slate-500 border-slate-600/20' },
    { name: 'FX: Exchange Gain', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { name: 'Crypto: BTC Purchases', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { name: 'System: Uncategorized', color: 'bg-slate-700/50 text-slate-400 border-slate-600/50' },
];

export async function getTransactionCategories() {
    try {
        let categories = await prisma.transactionCategory.findMany({
            orderBy: { name: 'asc' }
        });

        // Seed defaults if empty
        if (categories.length === 0) {
            await prisma.transactionCategory.createMany({
                data: DEFAULT_CATEGORIES,
                skipDuplicates: true
            });
            categories = await prisma.transactionCategory.findMany({
                orderBy: { name: 'asc' }
            });
        }

        return { success: true, categories };
    } catch (error) {
        console.error('Fetch categories error:', error);
        return { success: false, error: 'Failed to fetch categories' };
    }
}


export async function createTransactionCategory(name: string, color: string) {
    try {
        const category = await prisma.transactionCategory.create({
            data: {
                name,
                color
            }
        });
        revalidatePath('/dashboard/banking');

        // Trigger RAG Sync (Background)
        const { triggerCategorySync } = await import('@/lib/ai/auto-sync-rag');
        triggerCategorySync();

        return { success: true, category };
    } catch (error) {
        console.error('Create category error:', error);
        return { success: false, error: 'Failed to create category' };
    }
}

export async function deleteTransactionCategory(name: string) {
    try {
        // 1. Set transactions with this category to null
        await prisma.bankTransaction.updateMany({
            where: { category: name },
            data: { category: null }
        });

        // 2. Delete the category definition
        // Use deleteMany to avoid error if record doesn't exist
        await prisma.transactionCategory.deleteMany({
            where: { name: name }
        });

        revalidatePath('/dashboard/banking');

        // Trigger RAG Sync (Background)
        const { triggerCategorySync } = await import('@/lib/ai/auto-sync-rag');
        triggerCategorySync();

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete category' };
    }
}

export async function updateTransactionCategoryDefinition(oldName: string, newName: string, newColor: string) {
    try {
        // 1. Check if new name exists (if renaming)
        if (oldName !== newName) {
            const exists = await prisma.transactionCategory.findUnique({
                where: { name: newName }
            });
            if (exists) {
                return { success: false, error: 'Category with this name already exists' };
            }
        }

        // 2. Update category definition
        await prisma.transactionCategory.update({
            where: { name: oldName },
            data: {
                name: newName,
                color: newColor
            }
        });

        // 3. Update all transactions if name changed
        if (oldName !== newName) {
            await prisma.bankTransaction.updateMany({
                where: { category: oldName },
                data: { category: newName }
            });
        }

        revalidatePath('/dashboard/banking');

        // Trigger RAG Sync (Background)
        const { triggerCategorySync } = await import('@/lib/ai/auto-sync-rag');
        triggerCategorySync();

        return { success: true };
    } catch (error) {
        console.error('Update category definition error:', error);
        return { success: false, error: 'Failed to update category definition' };
    }
}

