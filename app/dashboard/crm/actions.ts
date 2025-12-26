"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAIClient } from "@/lib/ai/ai-service";
import { auth } from "@/auth";
import { fetchLabeledEmails } from "@/lib/google/gmail-client";

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

// --- Smart Import ---
export async function importLeadFromText(text: string) {
    try {
        const ai = await getAIClient();
        const data = await ai.analyzeLeadImport(text);

        // Check for existing entities
        let existingContact = null;
        if (data.email) {
            existingContact = await prisma.contact.findFirst({
                where: { email: { equals: data.email, mode: 'insensitive' } },
                include: { organization: true }
            });
        }

        let existingOrg = null;
        if (data.organizationName) {
            existingOrg = await prisma.organization.findFirst({
                where: { name: { equals: data.organizationName, mode: 'insensitive' } }
            });
        }

        return {
            success: true,
            data,
            match: {
                contact: existingContact,
                organization: existingOrg
            }
        };
    } catch (error: any) {
        console.error("AI Lead Import Error:", error);
        return { success: false, error: error.message };
    }
}

export async function commitSmartLeadImport(data: any) {
    try {
        // 1. Resolve Organization (Update or Create)
        let organizationId = null;
        if (data.organizationName) {
            const org = await prisma.organization.upsert({
                where: { id: data.organizationId || `org_${data.organizationName.toLowerCase().replace(/\s+/g, '_')}` },
                update: {
                    sector: data.organizationSector || undefined,
                },
                create: {
                    name: data.organizationName,
                    sector: data.organizationSector || "Generic",
                }
            });
            organizationId = org.id;
        }

        // 2. Create or Update Contact
        if (data.contactId) {
            await prisma.contact.update({
                where: { id: data.contactId },
                data: {
                    name: data.contactName,
                    email: data.email,
                    phone: data.phone,
                    role: data.role,
                    linkedin: data.linkedin,
                    organizationId: organizationId || undefined
                }
            });
        } else {
            await prisma.contact.create({
                data: {
                    name: data.contactName,
                    email: data.email,
                    phone: data.phone,
                    role: `${data.role || 'Contact'} (BASE_AI)`,
                    linkedin: data.linkedin,
                    organizationId: organizationId
                }
            });
        }

        // 3. Create Lead (Always create a new lead for tracking the opportunity)
        await prisma.lead.create({
            data: {
                name: data.contactName,
                email: data.email,
                source: "AI_IMPORT",
                notes: `[AI Tracking] ${data.summary}`,
                status: "NEW"
            }
        });

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (error: any) {
        console.error("Commit Lead Error:", error);
        return { success: false, error: error.message };
    }
}

export async function syncGmailLeads() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const emails = await fetchLabeledEmails(session.user.id, 'UhurU-Lead');
        if (emails.length === 0) return { success: true, results: [] };

        const ai = await getAIClient();
        const results = [];

        for (const email of emails) {
            const data = await ai.analyzeLeadImport(`Subject: ${email.subject}\n\n${email.body}`);
            results.push({
                ...data,
                emailId: email.id,
                rawText: `Subject: ${email.subject}\n\n${email.body}`
            });
        }

        return { success: true, results };
    } catch (error: any) {
        console.error("Gmail Sync Error:", error);
        return { success: false, error: error.message };
    }
}
