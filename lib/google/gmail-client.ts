import { google } from 'googleapis';
import { prisma } from '../prisma';

export async function getGmailClient(userId: string) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: 'google' }
    });

    if (!account || !account.access_token) {
        console.log(`[Gmail Client] ❌ No account found in DB for userId: ${userId}`);
        throw new Error("No Google account linked or missing tokens.");
    }
    console.log(`[Gmail Client] ✅ Account found for userId: ${userId}`);

    const oauth2Client = new google.auth.OAuth2(
        process.env.AUTH_GOOGLE_ID,
        process.env.AUTH_GOOGLE_SECRET
    );

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token || undefined,
        expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    // Check if token expired and refresh if necessary
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null
                }
            });
        } else {
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    access_token: tokens.access_token,
                    expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null
                }
            });
        }
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function fetchLabeledEmails(userId: string, labelName: string = 'UhurU-Lead') {
    const gmail = await getGmailClient(userId);

    // 1. Search for threads with this label (Global: Inbox, Sent, Drafts)
    const threadsRes = await gmail.users.threads.list({
        userId: 'me',
        q: `label:${labelName}`,
    });

    const threads = threadsRes.data.threads || [];
    const fullThreads = [];

    for (const threadInfo of threads) {
        const thread = await gmail.users.threads.get({
            userId: 'me',
            id: threadInfo.id!,
            format: 'full'
        });

        let combinedBody = "";
        let subject = "";

        // Iterate through all messages in the thread to build a logical conversation context
        if (thread.data.messages) {
            for (const msg of thread.data.messages) {
                const payload = msg.payload;
                subject = subject || payload?.headers?.find(h => h.name === 'Subject')?.value || "";

                let msgBody = "";
                // Helper to extract body recursively
                const getBody = (parts: any[]): string => {
                    for (const part of parts) {
                        if (part.mimeType === 'text/plain' && part.body?.data) {
                            return part.body.data;
                        }
                        if (part.parts) {
                            const found = getBody(part.parts);
                            if (found) return found;
                        }
                    }
                    return "";
                };

                const data = payload?.parts ? getBody(payload.parts) : (payload?.body?.data || "");
                if (data) {
                    msgBody = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
                }

                const from = payload?.headers?.find(h => h.name === 'From')?.value || "Unknown";
                combinedBody += `--- Mensaje de: ${from} ---\n${msgBody}\n\n`;
            }
        }

        fullThreads.push({
            id: threadInfo.id,
            snippet: thread.data.messages?.[0]?.snippet, // Snippet from last or first message
            body: combinedBody.trim(),
            subject: subject
        });
    }

    return fullThreads;
}
