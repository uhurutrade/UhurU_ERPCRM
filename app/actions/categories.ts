'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_CATEGORIES = [
    { name: 'Sales', color: 'bg-slate-100/10 text-slate-200 border-slate-100/20 hover:bg-slate-100/20' },
    { name: 'Marketing', color: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/20 hover:bg-yellow-400/20' },
    { name: 'Software', color: 'bg-blue-400/10 text-blue-300 border-blue-400/20 hover:bg-blue-400/20' },
    { name: 'Travel', color: 'bg-rose-400/10 text-rose-300 border-rose-400/20 hover:bg-rose-400/20' },
    { name: 'Meals', color: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20 hover:bg-emerald-400/20' },
    { name: 'Office', color: 'bg-purple-400/10 text-purple-300 border-purple-400/20 hover:bg-purple-400/20' },
    { name: 'Payroll', color: 'bg-pink-400/10 text-pink-300 border-pink-400/20 hover:bg-pink-400/20' },
    { name: 'Taxes', color: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20 hover:bg-cyan-400/20' },
    { name: 'Utilities', color: 'bg-orange-400/10 text-orange-300 border-orange-400/20 hover:bg-orange-400/20' },
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
        return { success: true };
    } catch (error) {
        console.error('Update category definition error:', error);
        return { success: false, error: 'Failed to update category definition' };
    }
}

