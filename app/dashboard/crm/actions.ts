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

    // Trigger RAG Sync (Background)
    const { syncCRMOrganizations } = await import('@/lib/ai/auto-sync-rag');
    syncCRMOrganizations();

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

    // Trigger RAG Sync (Background)
    const { syncCRMContacts } = await import('@/lib/ai/auto-sync-rag');
    syncCRMContacts();

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

    // Trigger RAG Sync (Background)
    const { syncCRMDeals } = await import('@/lib/ai/auto-sync-rag');
    syncCRMDeals();

    revalidatePath('/dashboard/crm');
}

export async function updateDealStage(dealId: string, newStage: string) {
    await prisma.deal.update({
        where: { id: dealId },
        data: { stage: newStage }
    });

    // Trigger RAG Sync (Background)
    const { syncCRMDeals } = await import('@/lib/ai/auto-sync-rag');
    syncCRMDeals();

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

        // 3. Create or Update Lead
        await prisma.lead.upsert({
            where: { gmailThreadId: data.gmailThreadId || 'NO_THREAD_ID' },
            update: {
                name: data.contactName,
                email: data.email,
                notes: `[AI Tracking] ${data.summary}`,
                status: "NEW" // Could be dynamic based on stage
            },
            create: {
                name: data.contactName,
                email: data.email,
                source: data.gmailThreadId ? "GMAIL_SYNC" : "AI_IMPORT",
                notes: `[AI Tracking] ${data.summary}`,
                status: "NEW",
                gmailThreadId: data.gmailThreadId || null
            }
        });

        revalidatePath('/dashboard/crm');

        // Trigger RAG Sync (Background)
        const { syncCRMLeads, syncCRMOrganizations, syncCRMContacts } = await import('@/lib/ai/auto-sync-rag');
        syncCRMLeads();
        syncCRMOrganizations();
        syncCRMContacts();

        return { success: true };
    } catch (error: any) {
        console.error("Commit Lead Error:", error);
        return { success: false, error: error.message };
    }
}

export async function discardLead(gmailThreadId: string, name: string) {
    try {
        if (!gmailThreadId) return { success: false, error: "No Thread ID" };

        console.log(`[Gmail Sync] 🚫 Discarding thread: ${gmailThreadId}`);

        await prisma.lead.upsert({
            where: { gmailThreadId },
            update: {
                status: "DISCARDED",
                updatedAt: new Date() // Ensure timestamp is updated
            },
            create: {
                name: name || "Lead Descartado",
                status: "DISCARDED",
                gmailThreadId,
                source: "GMAIL_SYNC",
                notes: "Descartado manualmente por el usuario durante la revisión."
            }
        });

        revalidatePath('/dashboard/crm');

        // Trigger RAG Sync (Background)
        const { syncCRMLeads } = await import('@/lib/ai/auto-sync-rag');
        syncCRMLeads();

        return { success: true };
    } catch (error: any) {
        console.error("Discard Lead Error:", error);
        return { success: false, error: error.message };
    }
}

export async function syncGmailLeads() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            console.log("[Gmail Sync] ❌ Unauthorized");
            return { success: false, error: "Unauthorized" };
        }

        console.log("[Gmail Sync] 📧 Fetching emails for label: UhurU-Lead...");
        const threads = await fetchLabeledEmails(session.user.id, 'UhurU-Lead');
        console.log(`[Gmail Sync] 📥 Found ${threads.length} threads in Gmail.`);

        if (threads.length === 0) return { success: true, results: [] };

        // 1. Get all existing leads that came from Gmail
        const existingLeads = await prisma.lead.findMany({
            where: { gmailThreadId: { not: null } }
        });

        const ai = await getAIClient();
        const results = [];

        for (const thread of threads) {
            const existingLead = existingLeads.find(l => l.gmailThreadId === thread.id);

            // --- PERSISTENT DISCARD LOGIC ---
            // If it's already DISCARDED, we only re-propose it if it has significant NEW content
            // or if the user removed/re-added the label (detected by updatedAt vs last message)

            if (existingLead) {
                // If it's discarded, check if we should "resurface" it
                if (existingLead.status === "DISCARDED") {
                    // Only resurface if the thread has grown significantly since it was discarded
                    // (Assuming thread.body contains the full history, and it grows with new messages)
                    const isSignificantlyUpdated = thread.body.length > (existingLead.notes?.length || 0) + 500;

                    if (!isSignificantlyUpdated) {
                        console.log(`[Gmail Sync] ⏩ Skipping discarded thread: ${thread.id}`);
                        continue;
                    }
                    console.log(`[Gmail Sync] 🔄 Resurfacing discarded thread with new activity: ${thread.id}`);
                }

                // If it's already ACTIVE/NEW, check if there's an update worth showing
                // We use a higher threshold (300 chars) to avoid "eternal proposals" for small content changes
                const hasNewContent = thread.body.length > (existingLead.notes?.length || 0) + 300;

                if (!hasNewContent && existingLead.status !== "DISCARDED") {
                    // console.log(`[Gmail Sync] 🆗 Already processed and no major updates: ${thread.id}`);
                    continue;
                }
            }

            // If we are here, it's either BRAND NEW or has SIGNIFICANT UPDATES
            console.log(`[Gmail Sync] ✨ Analyzing thread: ${thread.id} (${thread.subject})`);
            const data = await ai.analyzeLeadImport(`Subject: ${thread.subject}\n\n${thread.body}`);

            results.push({
                ...data,
                gmailThreadId: thread.id,
                importType: !existingLead ? "NEW" : (existingLead.status === "DISCARDED" ? "RESURFACED" : "UPDATE"),
                rawText: `Subject: ${thread.subject}\n\n${thread.body}`
            });
        }

        return { success: true, results, totalFound: threads.length };
    } catch (error: any) {
        console.error("Gmail Sync Error:", error);
        return { success: false, error: error.message };
    }
}
