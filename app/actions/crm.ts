'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- Organizations ---

export async function createOrganization(formData: FormData) {
    const name = formData.get('name') as string;
    const sector = formData.get('sector') as string;
    const website = formData.get('website') as string;
    const address = formData.get('address') as string;

    if (!name) return { error: 'Name is required' };

    try {
        await prisma.organization.create({
            data: { name, sector, website, address }
        });
        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create organization' };
    }
}

// --- Contacts ---

export async function createContact(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;
    const organizationId = formData.get('organizationId') as string;

    if (!name) return { error: 'Name is required' };

    try {
        await prisma.contact.create({
            data: {
                name,
                email,
                phone,
                role,
                organizationId: organizationId || null,
                isClient: true // Default to client for now
            }
        });
        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create contact' };
    }
}

// --- Deals ---

export async function createDeal(formData: FormData) {
    const title = formData.get('title') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const stage = formData.get('stage') as string;
    const organizationId = formData.get('organizationId') as string;

    if (!title || !organizationId) return { error: 'Title and Organization are required' };

    try {
        await prisma.deal.create({
            data: {
                title,
                amount: isNaN(amount) ? 0 : amount,
                stage: stage || 'PROSPECTING',
                organizationId
            }
        });
        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create deal' };
    }
}

export async function updateDealStage(dealId: string, newStage: string) {
    try {
        await prisma.deal.update({
            where: { id: dealId },
            data: { stage: newStage }
        });
        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update deal stage' };
    }
}
