'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTransactionCategories() {
    try {
        const categories = await prisma.transactionCategory.findMany({
            orderBy: { name: 'asc' }
        });
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
