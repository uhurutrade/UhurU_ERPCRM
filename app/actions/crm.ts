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
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const postcode = formData.get('postcode') as string;

    if (!name) return { error: 'Name is required' };

    try {
        await prisma.organization.create({
            data: { name, sector, website, address, email, phone, city, country, postcode }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create organization' };
    }
}

export async function updateOrganization(id: string, formData: FormData) {
    const isBillable = formData.get('isBillable') === 'on';
    const taxId = formData.get('taxId') as string;
    const legalName = formData.get('legalName') as string;
    const bankName = formData.get('bankName') as string;
    const bankIban = formData.get('bankIban') as string;
    const bankSwift = formData.get('bankSwift') as string;
    const name = formData.get('name') as string;
    const sector = formData.get('sector') as string;
    const website = formData.get('website') as string;
    const address = formData.get('address') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const postcode = formData.get('postcode') as string;

    try {
        await prisma.organization.update({
            where: { id },
            data: {
                name,
                sector,
                website,
                address,
                isBillable,
                taxId,
                legalName,
                bankName,
                bankIban,
                bankSwift,
                email,
                phone,
                city,
                country,
                postcode
            }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update organization' };
    }
}

export async function deleteOrganization(id: string) {
    try {
        await prisma.organization.delete({ where: { id } });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete organization. It might have associated contacts or deals.' };
    }
}

// --- Contacts ---

export async function createContact(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;
    const linkedin = formData.get('linkedin') as string;
    const website = formData.get('website') as string;
    const organizationId = formData.get('organizationId') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const postcode = formData.get('postcode') as string;

    if (!name) return { error: 'Name is required' };

    try {
        await prisma.contact.create({
            data: {
                name,
                email,
                phone,
                role,
                linkedin,
                website,
                organizationId: organizationId || null,
                isClient: true, // Default to client for now
                address,
                city,
                country,
                postcode
            }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create contact' };
    }
}

export async function updateContact(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;
    const linkedin = formData.get('linkedin') as string;
    const website = formData.get('website') as string;
    const organizationId = formData.get('organizationId') as string;
    const isBillable = formData.get('isBillable') === 'on';
    const taxId = formData.get('taxId') as string;
    const legalName = formData.get('legalName') as string;
    const bankIban = formData.get('bankIban') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const postcode = formData.get('postcode') as string;

    try {
        await prisma.contact.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                role,
                linkedin,
                website,
                organizationId: organizationId || null,
                isBillable: Boolean(isBillable),
                taxId,
                legalName,
                bankIban,
                address,
                city,
                country,
                postcode
            }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        console.error('Update Contact Error:', error);
        return { error: 'Failed to update contact' };
    }
}

export async function deleteContact(id: string) {
    try {
        await prisma.contact.delete({ where: { id } });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete contact' };
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

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

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

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update deal stage' };
    }
}

export async function updateDeal(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const stage = formData.get('stage') as string;
    const organizationId = formData.get('organizationId') as string;

    try {
        await prisma.deal.update({
            where: { id },
            data: {
                title,
                amount: isNaN(amount) ? 0 : amount,
                stage,
                organizationId
            }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update deal' };
    }
}

export async function deleteDeal(id: string) {
    try {
        await prisma.deal.delete({ where: { id } });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete deal' };
    }
}

// --- Leads ---

export async function createLead(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const source = formData.get('source') as string;
    const notes = formData.get('notes') as string;

    if (!name) return { error: 'Name is required' };

    try {
        await prisma.lead.create({
            data: { name, email, source, notes }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create lead' };
    }
}

export async function updateLead(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const source = formData.get('source') as string;
    const notes = formData.get('notes') as string;
    const status = formData.get('status') as string;

    try {
        await prisma.lead.update({
            where: { id },
            data: { name, email, source, notes, status }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update lead' };
    }
}

export async function deleteLead(id: string) {
    try {
        await prisma.lead.delete({ where: { id } });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete lead' };
    }
}

export async function discardLeadAction(id: string) {
    try {
        await prisma.lead.update({
            where: { id },
            data: { status: 'DISCARDED' }
        });

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to discard lead' };
    }
}

export async function convertLeadToDeal(leadId: string, orgId: string) {
    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) throw new Error('Lead not found');

        // Create deal from lead
        await prisma.deal.create({
            data: {
                title: `Deal with ${lead.name}`,
                amount: 0,
                stage: 'PROSPECTING',
                organizationId: orgId
            }
        });

        // Update lead status
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: 'QUALIFIED' }
        });

        revalidatePath('/dashboard/crm');

        // Trigger RAG Sync (Background)
        const { triggerCRMSync } = await import('@/lib/ai/auto-sync-rag');
        triggerCRMSync();

        return { success: true };
    } catch (error) {
        return { error: 'Failed to convert lead to deal' };
    }
}

// --- Tasks ---

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const assignedToId = formData.get('assignedToId') as string;

    if (!title) return { error: 'Title is required' };

    try {
        await prisma.task.create({
            data: {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedToId: assignedToId || null
            }
        });

        // Trigger RAG Sync (Background)
        const { triggerTaskSync } = await import('@/lib/ai/auto-sync-rag');
        triggerTaskSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create task' };
    }
}

export async function toggleTask(id: string, completed: boolean) {
    try {
        await prisma.task.update({
            where: { id },
            data: { completed }
        });

        // Trigger RAG Sync (Background)
        const { triggerTaskSync } = await import('@/lib/ai/auto-sync-rag');
        triggerTaskSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to toggle task' };
    }
}

export async function deleteTask(id: string) {
    try {
        await prisma.task.delete({ where: { id } });

        // Trigger RAG Sync (Background)
        const { triggerTaskSync } = await import('@/lib/ai/auto-sync-rag');
        triggerTaskSync();

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete task' };
    }
}
