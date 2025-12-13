"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Organizations ---
export async function getOrganizations() {
    return await prisma.organization.findMany({
        include: { contacts: true, deals: true },
        orderBy: { name: 'asc' }
    });
}

export async function createOrganization(formData: FormData) {
    const name = formData.get("name") as string;
    const sector = formData.get("sector") as string;

    await prisma.organization.create({
        data: { name, sector }
    });
    revalidatePath('/dashboard/crm');
}

// --- Contacts ---
export async function getContacts() {
    return await prisma.contact.findMany({
        include: { organization: true },
        orderBy: { name: 'asc' }
    });
}

export async function createContact(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const orgId = formData.get("organizationId") as string;

    await prisma.contact.create({
        data: {
            name,
            email,
            organizationId: orgId || null
        }
    });
    revalidatePath('/dashboard/crm');
}

// --- Deals ---
export async function getDeals() {
    return await prisma.deal.findMany({
        include: { organization: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createDeal(formData: FormData) {
    const title = formData.get("title") as string;
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const stage = formData.get("stage") as string;
    const orgId = formData.get("organizationId") as string;

    if (!orgId) throw new Error("Organization Required");

    await prisma.deal.create({
        data: {
            title,
            amount,
            stage,
            organizationId: orgId
        }
    });
    revalidatePath('/dashboard/crm');
}

export async function updateDealStage(dealId: string, newStage: string) {
    await prisma.deal.update({
        where: { id: dealId },
        data: { stage: newStage }
    });
    revalidatePath('/dashboard/crm');
}
